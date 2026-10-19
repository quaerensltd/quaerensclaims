#!/usr/bin/env python3
"""Owner-private single-attempt CRM4 secret correction. Requires explicit --apply."""
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
from pathlib import Path

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


BASELINE = json.loads("{\"iap\":{\"version\":3,\"etag\":\"BwZeHX17+FY=\",\"bindings\":[{\"role\":\"roles/iap.httpsResourceAccessor\",\"members\":[\"user:Brusseljeroen@gmail.com\"],\"condition\":{\"expression\":\"request.time >= timestamp(\\\"2026-10-17T09:00:00.000Z\\\") && request.time < timestamp(\\\"2026-10-24T09:00:00.000Z\\\")\",\"title\":\"crm4_synthetic_window\"}}]},\"invoker\":{\"version\":1,\"etag\":\"BwZeHXmejpw=\",\"bindings\":[{\"role\":\"roles/run.invoker\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-iap.iam.gserviceaccount.com\"]}]},\"project\":{\"version\":1,\"etag\":\"BwZeG1OhkmI=\",\"bindings\":[{\"role\":\"roles/artifactregistry.serviceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-artifactregistry.iam.gserviceaccount.com\"]},{\"role\":\"roles/cloudbuild.builds.builder\",\"members\":[\"serviceAccount:558324850479@cloudbuild.gserviceaccount.com\"]},{\"role\":\"roles/cloudbuild.serviceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-cloudbuild.iam.gserviceaccount.com\"]},{\"role\":\"roles/containerregistry.ServiceAgent\",\"members\":[\"serviceAccount:service-558324850479@containerregistry.iam.gserviceaccount.com\"]},{\"role\":\"roles/datastore.user\",\"members\":[\"serviceAccount:crm4-runtime@quaerens-crm4-spain-test.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebase.managementServiceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-firebase.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebase.sdkAdminServiceAgent\",\"members\":[\"serviceAccount:firebase-adminsdk-fbsvc@quaerens-crm4-spain-test.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebaseauth.admin\",\"members\":[\"serviceAccount:crm4-runtime@quaerens-crm4-spain-test.iam.gserviceaccount.com\",\"serviceAccount:firebase-adminsdk-fbsvc@quaerens-crm4-spain-test.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebaserules.firestoreServiceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-firebasestorage.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebaserules.system\",\"members\":[\"serviceAccount:service-558324850479@firebase-rules.iam.gserviceaccount.com\"]},{\"role\":\"roles/firebasestorage.serviceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-firebasestorage.iam.gserviceaccount.com\"]},{\"role\":\"roles/firestore.serviceAgent\",\"members\":[\"serviceAccount:service-558324850479@gcp-sa-firestore.iam.gserviceaccount.com\"]},{\"role\":\"roles/iam.serviceAccountTokenCreator\",\"members\":[\"serviceAccount:firebase-adminsdk-fbsvc@quaerens-crm4-spain-test.iam.gserviceaccount.com\"]},{\"role\":\"roles/logging.logWriter\",\"members\":[\"serviceAccount:crm4-build@quaerens-crm4-spain-test.iam.gserviceaccount.com\"]},{\"role\":\"roles/owner\",\"members\":[\"user:martijnpronk76@gmail.com\"]},{\"role\":\"roles/run.serviceAgent\",\"members\":[\"serviceAccount:service-558324850479@serverless-robot-prod.iam.gserviceaccount.com\"]}],\"auditConfigs\":[{\"service\":\"iap.googleapis.com\",\"auditLogConfigs\":[{\"logType\":\"ADMIN_READ\"},{\"logType\":\"DATA_READ\"},{\"logType\":\"DATA_WRITE\"}]},{\"service\":\"datastore.googleapis.com\",\"auditLogConfigs\":[{\"logType\":\"DATA_READ\"},{\"logType\":\"DATA_WRITE\"}]},{\"service\":\"storage.googleapis.com\",\"auditLogConfigs\":[{\"logType\":\"DATA_READ\"},{\"logType\":\"DATA_WRITE\"}]}]}}")
MASK = 'iapSettings.accessSettings.oauthSettings.clientSecret'
PATCH_URL = 'https://iap.googleapis.com/v1/' + IAP + ':iapSettings?updateMask=' + MASK + '&fields=name,accessSettings.oauthSettings.clientId'
CONDITION = {'title': 'crm4_synthetic_window', 'expression': 'request.time >= timestamp("2026-10-17T09:00:00.000Z") && request.time < timestamp("2026-10-24T09:00:00.000Z")'}


def api(url, body, method='POST'):
    # Only these read-only POSTs and one precisely scoped PATCH are permitted.
    allowed_reads = {
        'https://iap.googleapis.com/v1/' + IAP + ':getIamPolicy',
        'https://cloudresourcemanager.googleapis.com/v1/projects/' + PROJECT + ':getIamPolicy'}
    require((method == 'POST' and url in allowed_reads) or (method == 'PATCH' and url == PATCH_URL))
    token = cli(['auth', 'print-access-token', '--account=' + OPERATOR])
    request = urllib.request.Request(url, data=json.dumps(body).encode(), method=method,
        headers={'Authorization':'Bearer ' + token, 'Content-Type':'application/json', 'x-goog-user-project':PROJECT})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    with opener.open(request, timeout=45) as response:
        if method == 'PATCH':
            response.read()  # Never use a write response as verification; never log payloads.
            return None
        return json.load(response)


def snapshot():
    fingerprint = preflight()
    service = read('https://run.googleapis.com/v2/' + SERVICE)
    require(service['template']['serviceAccount'] == 'crm4-runtime@' + PROJECT + '.iam.gserviceaccount.com')
    require(service.get('terminalCondition', {}).get('state') == 'CONDITION_SUCCEEDED')
    invoker = read('https://run.googleapis.com/v2/' + SERVICE + ':getIamPolicy?options.requestedPolicyVersion=3')
    iap = api('https://iap.googleapis.com/v1/' + IAP + ':getIamPolicy', {'options':{'requestedPolicyVersion':3}})
    project = api('https://cloudresourcemanager.googleapis.com/v1/projects/' + PROJECT + ':getIamPolicy', {'options':{'requestedPolicyVersion':3}})
    require(invoker == BASELINE['invoker'] and iap == BASELINE['iap'] and project == BASELINE['project'])
    users = read('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT + '/accounts:batchGet?maxResults=1&fields=users(localId),nextPageToken')
    require(not users.get('users') and not users.get('nextPageToken'))
    rules = []
    for release, expected, digest in [
        ('cloud.firestore','39ff1981-2cf6-4a32-abbc-f44e485d8059','35b340ca1778e5d3d3aa0d8cd9a98eee4e44d3541cca35e767e56891d6853dc1'),
        ('firebase.storage/' + PROJECT + '.firebasestorage.app','3e4de41f-f3c0-40b0-a3e9-d9cc23e52c32','cdd2d592f098f56ba7c39a861559a75fca86f8bb58e66e2e54bf357dd1b43d3f')]:
        released = read('https://firebaserules.googleapis.com/v1/projects/' + PROJECT + '/releases/' + release)
        require(released.get('rulesetName') == 'projects/' + PROJECT + '/rulesets/' + expected)
        ruleset = read('https://firebaserules.googleapis.com/v1/' + released['rulesetName'])
        files = ruleset.get('source', {}).get('files', [])
        require(len(files) == 1 and hashlib.sha256(files[0]['content'].encode()).hexdigest() == digest)
        rules.append(released)
    # clientSecret is documented input-only. Read the public settings and output hash,
    # keep both solely in memory, and reject any unexpected returned secret field.
    settings = read('https://iap.googleapis.com/v1/' + IAP + ':iapSettings')
    oauth = settings.get('accessSettings', {}).get('oauthSettings', {})
    require('clientSecret' not in oauth and oauth.get('clientId') == CLIENT)
    require(oauth.pop('clientSecretSha256', '').lower() == fingerprint)
    require(settings == {'name':IAP, 'accessSettings':{'oauthSettings':{'clientId':CLIENT}}})
    return fingerprint, {'service':service,'invoker':invoker,'iap':iap,'project':project,'rules':rules,'settings':settings}


def validate_input(first, second):
    require(bool(first) and hmac.compare_digest(first.encode(), second.encode()))
    require(first == first.strip() and all(ord(c) >= 32 and ord(c) != 127 for c in first))
    require(first[0] not in '\"\'' and first[-1] not in '\"\'')


def transact(secret, before, marker):
    current = snapshot()
    require(current == before)
    wanted = hashlib.sha256(secret.encode()).hexdigest()
    if hmac.compare_digest(wanted, current[0]):
        return 'ALREADY_MATCH'
    fd = os.open(marker, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as receipt:
        json.dump({'project':PROJECT, 'resource':IAP, 'clientId':CLIENT,
                   'attemptedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}, receipt)
    api(PATCH_URL, {'name':IAP, 'accessSettings':{'oauthSettings':{'clientSecret':secret}}}, 'PATCH')
    after = snapshot()  # Independent HTTP reads, not the write response.
    require(after[1] == before[1])
    require(hmac.compare_digest(after[0], wanted))
    return 'MATCH_SETTINGS_UNCHANGED'


def run():
    require(sys.argv[1:] in ([], ['--apply']))
    require(sys.stdin.isatty() and sys.stdout.isatty() and sys.stderr.isatty())
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    warnings.simplefilter('error', getpass.GetPassWarning)
    marker = Path.home() / '.crm4-oauth-secret-correction-attempted.json'
    require(not marker.exists())
    before = snapshot()
    if not sys.argv[1:]:
        return 'PREFLIGHT_PASS_NO_CHANGE'
    require(input('Confirm this is the ENABLED replacement for the approved CRM4 client; type ENABLED: ') == 'ENABLED')
    first = getpass.getpass('Existing enabled replacement secret (hidden): ')
    second = getpass.getpass('Repeat the same secret (hidden): ')
    try:
        validate_input(first, second)
        require(input('Type APPLY-SECRET-ONLY to submit once: ') == 'APPLY-SECRET-ONLY')
        return transact(first, before, marker)
    finally:
        first = second = before = None


def entry():
    try:
        result = run()
    except (Exception, KeyboardInterrupt):
        result = 'STOP_INCONCLUSIVE_NO_AUTOMATIC_RETRY'
    print(result)
    return 0 if result in ('PREFLIGHT_PASS_NO_CHANGE','ALREADY_MATCH','MATCH_SETTINGS_UNCHANGED') else 1


if __name__ == '__main__':
    sys.exit(entry())
