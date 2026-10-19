import contextlib
import hashlib
import importlib.util
import io
from pathlib import Path
import sys
import types
import unittest
from unittest.mock import patch

if sys.platform == 'win32':
    sys.modules['resource'] = types.SimpleNamespace(RLIMIT_CORE=0, setrlimit=lambda *args: None)
spec = importlib.util.spec_from_file_location('compare_tool', Path(__file__).with_name('crm4-oauth-compare.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
FAKE = 'fictional-test-input-only'
DIGEST = hashlib.sha256(FAKE.encode()).hexdigest()

class Checks(unittest.TestCase):
    def test_match(self):
        self.assertEqual(m.compare(DIGEST, DIGEST, FAKE), 'MATCH')
    def test_mismatch(self):
        self.assertEqual(m.compare(DIGEST, DIGEST, 'different-fictional-input'), 'MISMATCH')
    def test_spaces_not_silently_removed(self):
        self.assertEqual(m.compare(DIGEST, DIGEST, FAKE + ' '), 'MISMATCH')
    def test_drift_fails_closed(self):
        with self.assertRaises(ValueError): m.compare(DIGEST, '0' * 64, FAKE)
    def test_invalid_input(self):
        for value in ('', '\n', 'abc\r'):
            with self.assertRaises(ValueError): m.compare(DIGEST, DIGEST, value)
    def test_errors_never_print_payloads(self):
        for exc in (ValueError(FAKE + DIGEST), KeyboardInterrupt()):
            out = io.StringIO()
            with patch.object(m, 'run', side_effect=exc), contextlib.redirect_stdout(out):
                self.assertEqual(m.entry(), 1)
            self.assertEqual(out.getvalue(), 'INCONCLUSIVE\n')
    def test_results_only(self):
        for value in ('MATCH', 'MISMATCH'):
            out = io.StringIO()
            with patch.object(m, 'run', return_value=value), contextlib.redirect_stdout(out): m.entry()
            self.assertEqual(out.getvalue(), value + '\n')
    def test_redirect_refused(self):
        with self.assertRaises(ValueError): m.NoRedirect().redirect_request(None,None,302,None,None,'https://example.test')
    def test_preflight(self):
        project = {'projectId':m.PROJECT, 'projectNumber':m.NUMBER, 'lifecycleState':'ACTIVE'}
        service = {'name':m.SERVICE, 'iapEnabled':True, 'template':{'containers':[{'image':m.IMAGE}]}}
        settings = {'name':m.IAP, 'accessSettings':{'oauthSettings':{'clientId':m.CLIENT, 'clientSecretSha256':DIGEST}}}
        def cli(args):
            return {'account':m.OPERATOR,'project':m.PROJECT,'auth/impersonate_service_account':'(unset)'}[args[-1]]
        for problem in ('none','client','hash','service','project','public'):
            import copy
            values=copy.deepcopy([project,service,settings])
            if problem=='client': values[2]['accessSettings']['oauthSettings']['clientId']='wrong'
            if problem=='hash': values[2]['accessSettings']['oauthSettings']['clientSecretSha256']='unknown-encoding'
            if problem=='service': values[1]['name']='wrong'
            if problem=='project': values[0]['projectNumber']='wrong'
            if problem=='public': values[1]['invokerIamDisabled']=True
            with patch.object(m,'cli',side_effect=cli), patch.object(m,'read',side_effect=values), patch.object(m,'ENV',{}):
                if problem=='none': self.assertEqual(m.preflight(),DIGEST)
                else:
                    with self.assertRaises(ValueError): m.preflight()
    def test_read_is_get_and_filtered(self):
        source=Path(m.__file__).read_text()
        self.assertIn("method='GET'",source)
        self.assertNotIn("'clientSecret':",source)
        self.assertNotIn('settings set',source)

if __name__ == '__main__': unittest.main()
