'use strict';
// Pure evidence predicates; input comes from read-only Cloud Run/Logging API
// responses collected by the approved operator, never fabricated probe outcomes.
const c=require('./core.cjs');
function audit(entries,expected){c.check(Array.isArray(entries)&&Array.isArray(expected)&&expected.length>0);return expected.every(x=>entries.some(e=>e.protoPayload?.serviceName===x.service&&e.protoPayload?.resourceName?.includes(x.resource)&&Date.parse(e.timestamp)>=x.afterUtcMs&&e.insertId));}
function restart(service,logs,endUtc){const deadline=Date.parse(endUtc);return service.template?.containers?.[0]?.image===c.IMAGE&&logs.some(e=>Date.parse(e.timestamp)>=deadline&&e.resource?.labels?.service_name==='crm4-spain-test'&&e.textPayload==='CRM4 sealed startup rejected');}
function listener({canaryWriteSucceeded,canaryWriteTime,deadline,listenerReady,receivedPostExpiry,observationEnd}){return canaryWriteSucceeded===true&&canaryWriteTime>=deadline&&listenerReady===true&&receivedPostExpiry===false&&observationEnd>=canaryWriteTime+10000;}
module.exports={audit,restart,listener};
