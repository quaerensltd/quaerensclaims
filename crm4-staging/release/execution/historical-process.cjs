'use strict';
// Read-only historical-session verification. Never terminates a process.
const path=require('node:path'),io=require('../managed-rehearsal/watcher-io.cjs');
function fail(code){const e=Error('Historical process evidence rejected');e.code=code;throw e;}
function classify(receipt,record,alive){
 if(!receipt||!Number.isInteger(receipt.pid)||receipt.pid<=0||!Number.isFinite(receipt.started)||!Number.isFinite(receipt.heartbeat)||receipt.heartbeat<receipt.started||!['FAIL_CLOSED','TIMEOUT_NO_PASS'].includes(receipt.state))fail('RECEIPT_UNCERTAIN');
 if(!record||record.pid!==receipt.pid||typeof record.present!=='boolean')fail('PROCESS_EVIDENCE_MISSING');
 if(!record.present){if(alive!==false)fail('PROCESS_EVIDENCE_CONFLICT');return {pid:receipt.pid,result:'ABSENT'};}
 if(alive!==true||record.identityAvailable!==true||!record.name||!Number.isFinite(record.createdMs)||typeof record.watcher!=='boolean')fail('PROCESS_IDENTITY_UNCERTAIN');
 if(record.watcher)fail('WATCHER_SURVIVES');
 // Legacy receipts lack OS birth time. A different process born strictly after
 // the terminal receipt heartbeat proves PID reuse; earlier/ambiguous stays FAIL.
 if(record.createdMs<=receipt.heartbeat)fail('PROCESS_BIRTH_UNCERTAIN');
 return {pid:receipt.pid,result:'UNRELATED_PID_REUSE',name:record.name,createdUtc:new Date(record.createdMs).toISOString(),receiptHeartbeatUtc:new Date(receipt.heartbeat).toISOString()};
}
async function inspect(pid){
 if(!Number.isInteger(pid)||pid<=0)fail('PID_INVALID');
 const script=`$ErrorActionPreference='Stop'; $p=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'; if($null -eq $p){[pscustomobject]@{pid=${pid};present=$false}|ConvertTo-Json -Compress}else{ $ok=($null -ne $p.CreationDate -and -not [string]::IsNullOrWhiteSpace($p.Name) -and -not [string]::IsNullOrWhiteSpace($p.ExecutablePath) -and -not [string]::IsNullOrWhiteSpace($p.CommandLine) -and [IO.Path]::GetFileName($p.ExecutablePath) -ieq $p.Name); [pscustomobject]@{pid=[int]$p.ProcessId;present=$true;identityAvailable=$ok;name=$p.Name;createdMs=if($p.CreationDate){([DateTimeOffset]$p.CreationDate.ToUniversalTime()).ToUnixTimeMilliseconds()}else{$null};watcher=([string]$p.CommandLine -match 'credentials\\.cjs' -and [string]$p.CommandLine -match 'watch-bootstrap')}|ConvertTo-Json -Compress }`;
 const executable=path.join(require('node:os').homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','native','powershell','pwsh.exe');
 try{return JSON.parse(await io.cli(executable,['-NoProfile','-NonInteractive','-Command',script],{shell:false}));}catch{fail('PROCESS_READ_UNCERTAIN');}
}
async function verify(receipt,{read=inspect,isAlive=pid=>{try{process.kill(pid,0);return true;}catch(e){if(e.code==='ESRCH')return false;fail('PROCESS_ACCESS_UNCERTAIN');}}}={}){
 const first=await read(receipt.pid),second=await read(receipt.pid);
 if(JSON.stringify(first)!==JSON.stringify(second))fail('PROCESS_CHANGED_DURING_READ');
 return classify(receipt,second,isAlive(receipt.pid));
}
module.exports={classify,verify,inspect};
