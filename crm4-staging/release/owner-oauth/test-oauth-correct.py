import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import types
import unittest
from unittest.mock import patch
if sys.platform == 'win32':
    sys.modules['resource'] = types.SimpleNamespace(RLIMIT_CORE=0, setrlimit=lambda *args: None)
spec = importlib.util.spec_from_file_location('correct_tool', Path(__file__).with_name('crm4-oauth-correct.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
FAKE = 'fictional-correction-input-only'
DIGEST = hashlib.sha256(FAKE.encode()).hexdigest()
BEFORE = ('0' * 64, {'settings': 'fictional-baseline'})

class Tests(unittest.TestCase):
    def transact(self, snapshots, api_error=None, preexisting=False):
        with tempfile.TemporaryDirectory() as directory:
            marker = Path(directory) / 'attempt.json'
            if preexisting: marker.write_text('{}')
            with patch.object(m,'snapshot',side_effect=snapshots), patch.object(m,'api',side_effect=api_error) as api:
                try:
                    result = m.transact(FAKE, BEFORE, marker)
                finally:
                    self.calls = api.call_args_list
                    self.receipt = marker.read_text() if marker.exists() else None
            return result
    def test_success_requires_readback(self):
        self.assertEqual(self.transact([BEFORE,(DIGEST,BEFORE[1])]),'MATCH_SETTINGS_UNCHANGED')
        self.assertEqual(len(self.calls),1)
        args=self.calls[0].args
        self.assertEqual(args[0],m.PATCH_URL)
        self.assertEqual(args[2],'PATCH')
        self.assertEqual(args[1],{'name':m.IAP,'accessSettings':{'oauthSettings':{'clientSecret':FAKE}}})
        self.assertNotIn(FAKE,self.receipt)
        self.assertNotIn(DIGEST,self.receipt)
    def test_drift_blocks_write(self):
        with self.assertRaises(ValueError): self.transact([('1'*64,BEFORE[1])])
        self.assertFalse(self.calls)
        self.assertIsNone(self.receipt)
    def test_duplicate_blocks_write(self):
        with self.assertRaises(FileExistsError): self.transact([BEFORE],preexisting=True)
        self.assertFalse(self.calls)
    def test_timeout_not_retried(self):
        with self.assertRaises(TimeoutError): self.transact([BEFORE],TimeoutError('fictional'))
        self.assertEqual(len(self.calls),1)
        self.assertIsNotNone(self.receipt)
    def test_bad_readback_not_success(self):
        for after in [BEFORE,(DIGEST,{'changed':True})]:
            with self.assertRaises(ValueError): self.transact([BEFORE,after])
            self.assertEqual(len(self.calls),1)
    def test_failed_readback_not_success(self):
        with self.assertRaises(PermissionError): self.transact([BEFORE,PermissionError('fictional')])
        self.assertEqual(len(self.calls),1)
    def test_already_match_no_write(self):
        with tempfile.TemporaryDirectory() as d, patch.object(m,'snapshot',return_value=(DIGEST,BEFORE[1])), patch.object(m,'api') as api:
            self.assertEqual(m.transact(FAKE,(DIGEST,BEFORE[1]),Path(d)/'attempt'),'ALREADY_MATCH')
            api.assert_not_called()
    def test_double_entry(self):
        m.validate_input(FAKE,FAKE)
        for a,b in [(FAKE,'different'),('',''),(' '+FAKE,' '+FAKE),(FAKE+' ',FAKE+' '),('"abc"','"abc"'),('a\nb','a\nb')]:
            with self.assertRaises(ValueError): m.validate_input(a,b)
    def test_output_redacted_on_failure(self):
        for exc in [ValueError(FAKE+DIGEST), KeyboardInterrupt()]:
            out=io.StringIO()
            with patch.object(m,'run',side_effect=exc),contextlib.redirect_stdout(out):
                self.assertEqual(m.entry(),1)
            self.assertEqual(out.getvalue(),'STOP_INCONCLUSIVE_NO_AUTOMATIC_RETRY\n')
    def test_api_rejects_other_mutations(self):
        for url,method in [(m.PATCH_URL,'POST'),('https://example.test','PATCH'),(m.PATCH_URL,'PUT')]:
            with self.assertRaises(ValueError):m.api(url,{},method)
    def test_interruption_at_enabled_never_reaches_secret_or_transaction(self):
        with tempfile.TemporaryDirectory() as d, patch.object(m.Path,'home',return_value=Path(d)), patch.object(m.sys,'argv',['tool','--apply']), patch.object(m.sys.stdin,'isatty',return_value=True),patch.object(m.sys.stdout,'isatty',return_value=True),patch.object(m.sys.stderr,'isatty',return_value=True),patch.object(m,'snapshot',return_value=BEFORE),patch('builtins.input',side_effect=KeyboardInterrupt()),patch.object(m.getpass,'getpass') as gp,patch.object(m,'transact') as tx:
            with self.assertRaises(KeyboardInterrupt): m.run()
            gp.assert_not_called()
            tx.assert_not_called()
            self.assertFalse((Path(d)/'.crm4-oauth-secret-correction-attempted.json').exists())
    def test_mask_only_secret(self):
        self.assertEqual(m.MASK,'iapSettings.accessSettings.oauthSettings.clientSecret')
        self.assertNotIn('clientId,',m.PATCH_URL)
    def test_default_mode_never_prompts_or_writes(self):
        with tempfile.TemporaryDirectory() as d, patch.object(m.Path,'home',return_value=Path(d)), patch.object(m.sys,'argv',['tool']), patch.object(m.sys.stdin,'isatty',return_value=True),patch.object(m.sys.stdout,'isatty',return_value=True),patch.object(m.sys.stderr,'isatty',return_value=True),patch.object(m,'snapshot',return_value=BEFORE),patch.object(m.getpass,'getpass') as gp,patch.object(m,'transact') as tx:
            self.assertEqual(m.run(),'PREFLIGHT_PASS_NO_CHANGE')
            gp.assert_not_called();tx.assert_not_called()

if __name__ == '__main__':unittest.main()
