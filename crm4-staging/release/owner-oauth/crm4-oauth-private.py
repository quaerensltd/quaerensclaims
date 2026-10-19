#!/usr/bin/env python3
"""Owner-operated CRM4 OAuth setup. Default is read-only. Never prints API errors."""
import argparse
import datetime
import getpass
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import urllib.request
import warnings

PROJECT = 'quaerens-crm4-spain-test'
NUMBER = '558324850479'
OPERATOR = 'martijnpronk76@gmail.com'
SERVICE = 'crm4-spain-test'
CLIENT = '558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com'
IMAGE = ('europe-west1-docker.pkg.dev/' + PROJECT + '/crm4-release/crm4-spain@sha256:'
         '127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb')
RESOURCE = 'projects/' + NUMBER + '/iap_web/cloud_run-europe-west1/services/' + SERVICE
RUN_RESOURCE = 'projects/' + PROJECT + '/locations/europe-west1/services/' + SERVICE
END = datetime.datetime(2026, 10, 24, 9, tzinfo=datetime.timezone.utc)
CONDITION = {'title': 'crm4_synthetic_window', 'expression':
    'request.time >= timestamp("2026-10-17T09:00:00.000Z") && request.time < timestamp("2026-10-24T09:00:00.000Z")'}
SCOPE = ['--project=' + PROJECT, '--resource-type=cloud-run',
         '--region=europe-west1', '--service=' + SERVICE]
ENV = dict(os.environ, CLOUDSDK_CORE_DISABLE_FILE_LOGGING='true',
           CLOUDSDK_CORE_LOG_HTTP='false', CLOUDSDK_CORE_VERBOSITY='none')


def require(ok):
    if not ok:
        raise RuntimeError('Guard failed')


def cli(args):
    result = subprocess.run(['gcloud', *args], env=ENV, capture_output=True,
                            text=True, timeout=120)
    require(result.returncode == 0)
    return result.stdout.strip()


def api(url, body=None):
    token = cli(['auth', 'print-access-token', '--account=' + OPERATOR])
    request = urllib.request.Request(url, data=None if body is None else
        json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json', 'x-goog-user-project': PROJECT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def validate_policies(invocation, iap):
    expected_run = [{'role': 'roles/run.invoker', 'members':
        ['serviceAccount:service-' + NUMBER + '@gcp-sa-iap.iam.gserviceaccount.com']}]
    require(invocation.get('bindings', []) == expected_run)
    bindings = json.loads(json.dumps(iap.get('bindings', [])))
    for binding in bindings:
        binding['members'] = [
            'user:brusseljeroen@gmail.com' if member.startswith('user:') and
            member[5:].lower() == 'brusseljeroen@gmail.com' else member
            for member in binding.get('members', [])]
    require(bindings == [{'role': 'roles/iap.httpsResourceAccessor',
        'members': ['user:brusseljeroen@gmail.com'], 'condition': CONDITION}])


def preflight():
    require(datetime.datetime.now(datetime.timezone.utc) < END)
    require(cli(['config', 'get-value', 'account']) == OPERATOR)
    require(not ENV.get('CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT'))
    require(cli(['config', 'get-value', 'auth/impersonate_service_account'])
            in ('', '(unset)'))
    project = api('https://cloudresourcemanager.googleapis.com/v1/projects/' + PROJECT)
    require(project.get('projectId') == PROJECT and
            project.get('projectNumber') == NUMBER and
            project.get('lifecycleState') == 'ACTIVE')
    service = api('https://run.googleapis.com/v2/' + RUN_RESOURCE)
    require(service.get('name') == RUN_RESOURCE and service.get('iapEnabled') is True
            and service.get('invokerIamDisabled') is not True)
    require(service.get('terminalCondition', {}).get('state') == 'CONDITION_SUCCEEDED')
    require(service['template']['containers'][0]['image'] == IMAGE)
    require(service['template']['serviceAccount'] ==
            'crm4-runtime@' + PROJECT + '.iam.gserviceaccount.com')
    invocation = api('https://run.googleapis.com/v2/' + RUN_RESOURCE +
                     ':getIamPolicy?options.requestedPolicyVersion=3')
    iap = api('https://iap.googleapis.com/v1/' + RESOURCE + ':getIamPolicy',
              {'options': {'requestedPolicyVersion': 3}})
    validate_policies(invocation, iap)
    settings = json.loads(cli(['iap', 'settings', 'get', *SCOPE, '--format=json']))
    # The independently verified baseline is name only. Any new setting is drift.
    require(settings == {'name': RESOURCE})
    return settings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Private owner submission')
    args = parser.parse_args()
    marker = Path.home() / '.crm4-oauth-submission-attempted.json'
    require(not marker.exists())
    settings = preflight()
    print('PREFLIGHT PASS: exact CRM4 project, service, image, operator and policies.')
    if not args.apply:
        print('READ-ONLY COMPLETE. No secret requested; no settings changed.')
        return
    require(sys.stdin.isatty() and sys.stderr.isatty())
    require(Path('/dev/shm').is_dir())
    if input('Type APPLY to attach the existing client, or press Enter to cancel: ') != 'APPLY':
        print('CANCELLED. Nothing submitted.')
        return
    warnings.simplefilter('error', getpass.GetPassWarning)
    secret = getpass.getpass('Existing replacement OAuth secret (hidden): ')
    require(bool(secret) and '\n' not in secret and '\r' not in secret)
    # Re-read state after private input; reject concurrent drift before submitting.
    require(preflight() == settings)
    settings['accessSettings'] = {'oauthSettings': {
        'clientId': CLIENT, 'clientSecret': secret}}
    with tempfile.TemporaryDirectory(prefix='crm4-oauth-', dir='/dev/shm') as directory:
        filename = Path(directory) / 'settings.json'
        fd = os.open(filename, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as output:
            json.dump(settings, output)
        # Receipt is non-secret. Prevent automatic or accidental duplicate submission.
        fd = os.open(marker, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as output:
            json.dump({'project': PROJECT, 'clientId': CLIENT,
                       'attemptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}, output)
        result = subprocess.run(['gcloud', 'iap', 'settings', 'set', str(filename),
            *SCOPE, '--account=' + OPERATOR, '--quiet', '--verbosity=none'],
            env=ENV, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    secret = None
    settings['accessSettings']['oauthSettings'].pop('clientSecret', None)
    require(result.returncode == 0)
    # Read only the public client ID. Full independent verification follows in Codex.
    public = api('https://iap.googleapis.com/v1/' + RESOURCE +
                 ':iapSettings?fields=name,accessSettings.oauthSettings.clientId')
    require(public == {'name': RESOURCE, 'accessSettings': {'oauthSettings': {'clientId': CLIENT}}})
    print('SUBMITTED: public client ID verified. Report this result for independent review.')


if __name__ == '__main__':
    try:
        main()
    except (Exception, KeyboardInterrupt):
        print('STOP: cancelled, failed or uncertain. No automatic retry. '
              'If the submission marker exists, report that fact before restarting.', file=sys.stderr)
        sys.exit(1)
