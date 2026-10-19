#!/usr/bin/env python3
"""Owner-private, read-only CRM4 comparison. No credential persistence."""
import datetime
import getpass
import hashlib
import hmac
import json
import os
import re
import resource
import subprocess
import sys
import urllib.request
import warnings

PROJECT = 'quaerens-crm4-spain-test'
NUMBER = '558324850479'
OPERATOR = 'martijnpronk76@gmail.com'
CLIENT = '558324850479-brnmdsdg9brs2frq0hb3ha0suhugn64k.apps.googleusercontent.com'
SERVICE = 'projects/' + PROJECT + '/locations/europe-west1/services/crm4-spain-test'
IAP = 'projects/' + NUMBER + '/iap_web/cloud_run-europe-west1/services/crm4-spain-test'
IMAGE = 'europe-west1-docker.pkg.dev/' + PROJECT + '/crm4-release/crm4-spain@sha256:127600049240e507c8ad7ebc93125173ebdca4d094e9839764314e102bd47ceb'
END = datetime.datetime(2026, 10, 24, 9, tzinfo=datetime.timezone.utc)
ENV = dict(os.environ, CLOUDSDK_CORE_DISABLE_FILE_LOGGING='true', CLOUDSDK_CORE_LOG_HTTP='false', CLOUDSDK_CORE_VERBOSITY='none')


def require(ok):
    if not ok:
        raise ValueError('Guard failed')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Redirect refused')


def cli(args):
    result = subprocess.run(['gcloud', *args], env=ENV, capture_output=True, text=True, timeout=60)
    require(result.returncode == 0)
    return result.stdout.strip()


def read(url):
    token = cli(['auth', 'print-access-token', '--account=' + OPERATOR])
    request = urllib.request.Request(url, method='GET', headers={
        'Authorization': 'Bearer ' + token, 'x-goog-user-project': PROJECT})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    with opener.open(request, timeout=30) as response:
        return json.load(response)


def preflight():
    require(datetime.datetime.now(datetime.timezone.utc) < END)
    require(cli(['config', 'get-value', 'account']) == OPERATOR)
    require(cli(['config', 'get-value', 'project']) == PROJECT)
    require(not ENV.get('CLOUDSDK_AUTH_IMPERSONATE_SERVICE_ACCOUNT'))
    require(cli(['config', 'get-value', 'auth/impersonate_service_account']) in ('', '(unset)'))
    project = read('https://cloudresourcemanager.googleapis.com/v1/projects/' + PROJECT + '?fields=projectId,projectNumber,lifecycleState')
    require(project == {'projectId': PROJECT, 'projectNumber': NUMBER, 'lifecycleState': 'ACTIVE'})
    service = read('https://run.googleapis.com/v2/' + SERVICE + '?fields=name,iapEnabled,invokerIamDisabled,template.containers.image')
    require(service.get('name') == SERVICE and service.get('iapEnabled') is True and service.get('invokerIamDisabled') is not True)
    require(service.get('template', {}).get('containers') == [{'image': IMAGE}])
    settings = read('https://iap.googleapis.com/v1/' + IAP + ':iapSettings?fields=name,accessSettings.oauthSettings.clientId,accessSettings.oauthSettings.clientSecretSha256')
    require(settings.get('name') == IAP)
    oauth = settings.get('accessSettings', {}).get('oauthSettings', {})
    require(set(oauth) == {'clientId', 'clientSecretSha256'} and oauth['clientId'] == CLIENT)
    stored = oauth['clientSecretSha256']
    # Never guess a digest encoding or silently normalise unsupported API output.
    require(isinstance(stored, str) and re.fullmatch(r'[0-9a-fA-F]{64}', stored) is not None)
    return stored.lower()


def compare(before, after, secret):
    require(hmac.compare_digest(before, after))
    require(bool(secret) and '\n' not in secret and '\r' not in secret)
    actual = hashlib.sha256(secret.encode('utf-8')).hexdigest()
    return 'MATCH' if hmac.compare_digest(actual, after) else 'MISMATCH'


def run():
    require(len(sys.argv) == 1)
    require(sys.stdin.isatty() and sys.stderr.isatty() and sys.stdout.isatty())
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    warnings.simplefilter('error', getpass.GetPassWarning)
    before = preflight()
    secret = getpass.getpass('Existing replacement OAuth secret (hidden; no quotes): ')
    try:
        after = preflight()
        return compare(before, after, secret)
    finally:
        secret = None  # Python cannot guarantee wiping all copies from process memory.
        before = None


def entry():
    try:
        result = run()
    except (Exception, KeyboardInterrupt):
        result = 'INCONCLUSIVE'
    print(result)
    return 0 if result == 'MATCH' else 1


if __name__ == '__main__':
    sys.exit(entry())
