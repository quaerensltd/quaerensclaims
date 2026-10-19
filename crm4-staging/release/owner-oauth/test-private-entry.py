import importlib.util
import pathlib
import sys
import unittest
from unittest.mock import patch
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('oauth', pathlib.Path(__file__).with_name('crm4-oauth-private.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class SafetyTests(unittest.TestCase):
    def policies(self):
        return ({'bindings': [{'role': 'roles/run.invoker', 'members': ['serviceAccount:service-' + m.NUMBER + '@gcp-sa-iap.iam.gserviceaccount.com']}]}, {'bindings': [{'role':'roles/iap.httpsResourceAccessor','members':['user:Brusseljeroen@gmail.com'],'condition':dict(reversed(list(m.CONDITION.items())))}]})
    def test_exact_policies(self):
        m.validate_policies(*self.policies())
    def test_extra_principal_rejected(self):
        a,b=self.policies(); b['bindings'][0]['members'].append('allUsers')
        with self.assertRaises(RuntimeError): m.validate_policies(a,b)
    def test_changed_expiry_rejected(self):
        a,b=self.policies(); b['bindings'][0]['condition']['expression']='true'
        with self.assertRaises(RuntimeError): m.validate_policies(a,b)
    def test_default_never_requests_secret_or_submits(self):
        with patch.object(sys,'argv',['script']), patch.object(m.Path,'exists',return_value=False), patch.object(m,'preflight',return_value={'name':m.RESOURCE}), patch.object(m.getpass,'getpass') as secret, patch.object(m.subprocess,'run') as run:
            m.main(); secret.assert_not_called(); run.assert_not_called()
    def test_marker_blocks_duplicate(self):
        with patch.object(sys,'argv',['script','--apply']), patch.object(m.Path,'exists',return_value=True), patch.object(m,'preflight') as preflight:
            with self.assertRaises(RuntimeError): m.main()
            preflight.assert_not_called()
    def test_cancel_before_secret(self):
        with patch.object(sys,'argv',['script','--apply']), patch.object(m.Path,'exists',return_value=False), patch.object(m.Path,'is_dir',return_value=True), patch.object(m,'preflight',return_value={'name':m.RESOURCE}), patch.object(sys.stdin,'isatty',return_value=True), patch.object(sys.stderr,'isatty',return_value=True), patch('builtins.input',return_value=''), patch.object(m.getpass,'getpass') as secret, patch.object(m.subprocess,'run') as run:
            m.main(); secret.assert_not_called(); run.assert_not_called()
    def test_interruption_before_submission(self):
        with patch.object(sys,'argv',['script','--apply']), patch.object(m.Path,'exists',return_value=False), patch.object(m.Path,'is_dir',return_value=True), patch.object(m,'preflight',return_value={'name':m.RESOURCE}), patch.object(sys.stdin,'isatty',return_value=True), patch.object(sys.stderr,'isatty',return_value=True), patch('builtins.input',return_value='APPLY'), patch.object(m.getpass,'getpass',side_effect=KeyboardInterrupt), patch.object(m.subprocess,'run') as run:
            with self.assertRaises(KeyboardInterrupt): m.main()
            run.assert_not_called()

if __name__=='__main__': unittest.main()
