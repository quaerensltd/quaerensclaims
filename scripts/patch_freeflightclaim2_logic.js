const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'freeflightclaim2.html');
let html = fs.readFileSync(file, 'utf8');

function replaceBetween(source, start, end, replacement) {
  const s = source.indexOf(start);
  if (s === -1) throw new Error(`Start marker not found: ${start}`);
  const e = source.indexOf(end, s);
  if (e === -1) throw new Error(`End marker not found: ${end}`);
  return source.slice(0, s) + replacement + source.slice(e);
}

html = html.replace(
  "const state = { step: 1, docs: {}, activeDoc: 'summary', activePreview: 'summary', expenses: [] };",
  "const state = { step: 1, docs: {}, activeDoc: 'summary', activePreview: 'summary', expenses: [], selectedRecords: {}, expenseSort: 'date' };"
);

html = replaceBetween(
  html,
  "    const countries = [",
  "    const qs = id => document.getElementById(id);",
`    const sharedData = {
      countries: [],
      airlines: [],
      airports: [],
      currencies: [],
      disruptionReasons: [],
      complaintRoutes: [],
      officialResources: []
    };
    const fallbackComboData = {
      countries: ['United Kingdom','Ireland','Spain','France','Germany','Italy','Netherlands','Belgium','Portugal','Greece','Poland','Sweden','Norway','Denmark','Finland'].map(country => ({ label: country, value: country, meta: 'Country', search: country, record: { type: 'country', name: country } })),
      airlines: [{ label: 'Airline not listed / enter manually', value: 'Airline not listed / enter manually', meta: 'Manual entry', search: 'airline not listed manual enter', record: { type: 'airline', manual: true } }],
      airports: [{ label: 'Airport not listed / enter manually', value: 'Airport not listed / enter manually', meta: 'Manual entry', search: 'airport not listed manual enter', record: { type: 'airport', manual: true } }]
    };
    let comboData = fallbackComboData;
    let airlineProfiles = {};
    function normalizeSearch(s){ return String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
    function airportOption(r){
      const iata = r.iata || r.code || '';
      const icao = r.icao || '';
      const city = r.city || r.municipality || '';
      const country = r.country || r.countryName || '';
      const name = r.name || [city, 'Airport'].filter(Boolean).join(' ') || iata || 'Airport';
      const value = iata ? name + ' (' + iata + ')' : name;
      const meta = [city && country ? city + ', ' + country : country || city, [iata, icao].filter(Boolean).join(' · ')].filter(Boolean).join(' / ');
      return { label: name, value, meta, search: [name, city, country, iata, icao, ...(r.aliases || [])].join(' '), record: Object.assign({ type: 'airport' }, r) };
    }
    function airlineOption(r){
      const code = r.iata || r.icao || r.code || '';
      const name = r.name || r.tradingName || r.legalName || '';
      const legal = r.legalName || r.legal_entity || '';
      const country = r.country || r.baseCountry || '';
      return { label: name, value: name, meta: [code, country, legal && legal !== name ? legal : ''].filter(Boolean).join(' / '), search: [name, legal, code, country, ...(r.aliases || [])].join(' '), record: Object.assign({ type: 'airline' }, r) };
    }
    function countryOption(r){
      const name = typeof r === 'string' ? r : (r.name || r.country || r.label || '');
      const code = typeof r === 'string' ? '' : (r.code || r.iso2 || '');
      return { label: name, value: name, meta: code ? 'Country / ' + code : 'Country', search: [name, code].join(' '), record: { type: 'country', name, code } };
    }
    function buildComboData(){
      const countries = (sharedData.countries.length ? sharedData.countries : fallbackComboData.countries.map(x => x.record.name)).map(countryOption);
      const airlines = (sharedData.airlines.length ? sharedData.airlines.map(airlineOption) : fallbackComboData.airlines).concat(fallbackComboData.airlines);
      const airports = (sharedData.airports.length ? sharedData.airports.map(airportOption) : fallbackComboData.airports).concat(fallbackComboData.airports);
      return { countries, airlines, airports };
    }
    function buildAirlineProfiles(){
      const map = {};
      sharedData.airlines.forEach(r => {
        const opt = airlineOption(r);
        if(!opt.value) return;
        map[normalizeSearch(opt.value)] = {
          entity: r.legalName || r.legal_entity || opt.value,
          country: r.country || r.baseCountry || 'Not listed',
          route: r.complaintRoute || r.route || 'Official airline customer service or complaints route',
          url: r.complaintUrl || r.customerServiceUrl || r.website || '',
          adr: r.adr || r.adrBody || ''
        };
      });
      return map;
    }
    async function loadJson(url, fallback){
      try{
        const res = await fetch(url, { cache: 'no-store' });
        if(!res.ok) throw new Error(url + ' ' + res.status);
        const data = await res.json();
        return Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : fallback);
      }catch(e){
        console.warn('Builder data fallback:', url, e.message);
        return fallback;
      }
    }
    async function loadSharedData(){
      const [airports, airlines, countries, currencies, disruptionReasons, complaintRoutes, officialResources] = await Promise.all([
        loadJson('/data/airports.json', []),
        loadJson('/data/airlines.json', []),
        loadJson('/data/countries.json', []),
        loadJson('/data/currencies.json', []),
        loadJson('/data/disruption-reasons.json', []),
        loadJson('/data/complaint-routes.json', []),
        loadJson('/data/official-resources.json', [])
      ]);
      Object.assign(sharedData, { airports, airlines, countries, currencies, disruptionReasons, complaintRoutes, officialResources });
      comboData = buildComboData();
      airlineProfiles = buildAirlineProfiles();
      return sharedData;
    }
    const qs = id => document.getElementById(id);`
);

html = html.replace(
  /function normalizeSearch\(s\)\{ return String\(s\|\|''\)\.normalize\('NFD'\)\.replace\(\/\\\[\\u0300-\\u036f\\\]\/g,''\)\.toLowerCase\(\); \}\s*/m,
  ''
);

html = html.replace(
  /function collect\(\)\{[\s\S]*?a\.delayText = delayText\(a\.delayMinutes\); return a; \}/,
`function collect(){ const a = {}; fields.forEach(id => a[id]=val(id)); a.passengerAddress = [a.passengerStreet,a.passengerPostcode,a.passengerCity,a.passengerCountry].filter(Boolean).join(', '); a.issues = selected('issues'); a.careProvided = selected('careProvided'); a.expenseSort = state.expenseSort || val('expenseSort') || 'date'; a.selectedRecords = state.selectedRecords; a.expenses = sortExpenses(state.expenses.map((_,i)=>({date:val('expenseDate'+i),location:val('expenseLocation'+i),type:val('expenseType'+i),expense:val('expenseDesc'+i),reason:val('expenseReason'+i),amount:val('expenseAmount'+i),currency:val('expenseCurrency'+i),receipt:val('expenseReceipt'+i),evidence:val('expenseEvidence'+i)})).filter(e=>e.expense||e.amount||e.reason||e.location||e.type)); a.delayMinutes = minutesBetween(a.scheduledArrival,a.actualArrival); a.delayText = delayText(a.delayMinutes); return a; }`
);

html = html.replace(
  /function buildExpenseSchedule\(a\)\{[\s\S]*?return 'Expense Schedule\\n\\n' \+ lines\.join\('\\n'\) \+ '\\n\\nTotals by currency\\n' \+ totals \+ '\\n\\nNo currency conversion is applied\. Expense inclusion does not confirm reimbursement entitlement\.'; \}/,
`function buildExpenseSchedule(a){ const rows=sortExpenses(a.expenses||[]); if(!rows.length) return ''; const lines=rows.map((e,i)=>[i+1,e.date||'Date not added',e.location||'Airport not added',e.type||'Expense',e.expense||'Details not added',e.reason||'Reason not added',(e.amount||'Amount not added')+' '+(e.currency||'GBP'),'Receipt: '+(e.receipt||'Not known'),'Reference: '+(e.evidence||'Not added')].join(' | ')); const totalsObj={}; rows.forEach(e=>{ const c=e.currency||'GBP'; const n=parseFloat(e.amount); if(!isNaN(n)) totalsObj[c]=(totalsObj[c]||0)+n; }); const totals=Object.keys(totalsObj).length?Object.entries(totalsObj).map(([c,t])=>c+' '+t.toFixed(2)).join('\\n'):'No numeric totals added'; return 'Expense Schedule\\n\\n' + lines.join('\\n') + '\\n\\nTotals by currency\\n' + totals + '\\n\\nNo currency conversion is applied. Expense inclusion does not confirm reimbursement entitlement.'; }`
);

html = html.replace(
  /function buildSubmissionChecklist\(\)\{[\s\S]*?return 'Before You Send Checklist\\n\\n' \+ checks\.map\(c=>'- ' \+ c\)\.join\('\\n'\); \}/,
`function buildSubmissionChecklist(){ const checks=['Check that every passenger name, flight number, airport and date is accurate','Review the airline legal/trading name and complaint route before sending','Attach booking confirmation and boarding passes where available','Attach airline messages, screenshots, delay/cancellation notices and complaint responses','Attach receipts for each expense item and make sure amounts match your schedule','Remove anything that does not accurately reflect your journey','Keep copies of everything sent and note the submission date','Follow the airline official complaint route before escalating','Check current official guidance if you are unsure about rules or deadlines']; return 'Before You Send Checklist\\n\\n' + checks.map(c=>'- ' + c).join('\\n'); }`
);

html = html.replace(
  /function buildResources\(\)\{[\s\S]*?Rules, airline procedures and escalation routes can change\. Check the latest official guidance before sending or escalating a complaint\.'; \}/,
`function buildResources(){ const fallback=[['UK Civil Aviation Authority - Flight delays and cancellations','https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/'],['UK Civil Aviation Authority - How to make a complaint','https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/how-to-make-a-complaint/'],['UK Civil Aviation Authority - Alternative dispute resolution','https://www.caa.co.uk/air-passengers/travel-problems-and-rights/travel-complaints/alternative-dispute-resolution/'],['Your Europe - Air passenger rights','https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm'],['European Commission - Air passenger rights','https://transport.ec.europa.eu/transport-themes/passenger-rights/air_en']]; const resources=(sharedData.officialResources.length?sharedData.officialResources.map(r=>[r.title||r.name||'Official resource',r.url||r.href||'']):fallback); return 'Official Resources\\n\\n' + resources.map(([title,url])=>title+'\\n'+url).join('\\n\\n') + '\\n\\nRules, airline procedures and escalation routes can change. Check the latest official guidance before sending or escalating a complaint.'; }`
);

html = html.replace(
  /function renderAirlineInfo\(a\)\{[\s\S]*?\<span class="small"\>The airline selected does not by itself determine which passenger-rights rules apply\. External links are provided for convenience only\. Quaerens is not affiliated with the airline or dispute-resolution body unless expressly stated\.\<\/span>';\s*\}/,
`function renderAirlineInfo(a){ const box=qs('airlineSelectedInfo'); if(!box) return; const name=a.operatingAirline || a.airline; const profile=airlineProfiles[normalizeSearch(name)]; if(!name){ box.innerHTML='Start typing an airline to show complaint-route guidance. External links are provided for convenience only. Quaerens is not affiliated with the airline or dispute-resolution body unless expressly stated.'; return; } if(!profile){ box.innerHTML='<strong>'+escapeHtml(name)+'</strong><br>Airline-specific route not verified in this local list. Use the airline official website or current CAA guidance before sending personal information. The airline selected does not by itself determine which passenger-rights rules apply.'; return; } const link=profile.url ? '<a href="'+escapeHtml(profile.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(profile.route)+'</a>' : escapeHtml(profile.route); box.innerHTML='<strong>Selected Airline: '+escapeHtml(name)+'</strong><br>Trading name: '+escapeHtml(name)+'. Operating airline/legal entity where known: '+escapeHtml(profile.entity)+'. Country: '+escapeHtml(profile.country)+'.<br>Official complaint route: '+link+'<br>ADR availability: '+escapeHtml(profile.adr || 'check the current CAA ADR list before relying on an escalation route')+'.<br>Customer relations: use the airline official complaint or customer relations page before sending personal data.<br><span class="small">The airline selected does not by itself determine which passenger-rights rules apply. External links are provided for convenience only. Quaerens is not affiliated with the airline or dispute-resolution body unless expressly stated.</span>'; }`
);

html = html.replace(
  /function setupCombo\(input\)\{[\s\S]*?\n    \}\n    function renderConditionals/,
`function setupCombo(input){
      const type = input.dataset.combo;
      const results = qs(input.id + 'Results');
      const items = comboData[type] || [];
      if(!results || !items.length) return;
      let activeIndex = -1;
      let currentMatches = [];
      const status = document.createElement('div');
      status.className = 'small combo-status';
      results.insertAdjacentElement('afterend', status);
      input.setAttribute('autocomplete','off');
      input.setAttribute('role','combobox');
      input.setAttribute('aria-autocomplete','list');
      input.setAttribute('aria-controls',results.id);
      input.setAttribute('aria-expanded','false');
      function score(item, query){
        const q=normalizeSearch(query), hay=normalizeSearch(item.search || item.label);
        const code=normalizeSearch((item.record?.iata || item.record?.icao || item.record?.code || ''));
        if(!q) return 10;
        if(code === q) return 100;
        if(normalizeSearch(item.label).startsWith(q)) return 90;
        if(hay.split(' ').some(part=>part.startsWith(q))) return 75;
        if(hay.includes(q)) return 50;
        return 0;
      }
      function select(item){
        input.value = item.value;
        state.selectedRecords[input.id] = item.record || { type, manual: true, label: item.value };
        hide();
        renderPreview();
        saveDraftMaybe();
      }
      function hide(){ results.classList.add('hidden'); input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); activeIndex=-1; status.textContent=''; }
      function show(){
        const query = input.value.trim();
        if(query.length < 1){ hide(); return; }
        currentMatches = items.map(item=>({item,score:score(item,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.item.label.localeCompare(b.item.label)).slice(0,14).map(x=>x.item);
        if(!currentMatches.length){ hide(); status.textContent='No stored match yet. You can still type the details manually.'; state.selectedRecords[input.id]={ type, manual: true, label: input.value }; return; }
        results.innerHTML = currentMatches.map((item,i)=>'<button id="'+input.id+'Option'+i+'" type="button" class="combo-option" role="option" data-index="'+i+'" aria-selected="'+(i===activeIndex?'true':'false')+'"><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.meta||'')+'</span></button>').join('');
        results.classList.remove('hidden');
        input.setAttribute('aria-expanded','true');
        status.textContent = currentMatches.length + ' matching option' + (currentMatches.length===1?'':'s') + '. Use arrow keys and Enter to select, or keep typing manually.';
      }
      input.addEventListener('input',()=>{ state.selectedRecords[input.id]={ type, manual: true, label: input.value }; show(); });
      input.addEventListener('focus', show);
      input.addEventListener('keydown', e => {
        if(e.key === 'Escape'){ hide(); return; }
        if(e.key === 'ArrowDown'){ e.preventDefault(); if(results.classList.contains('hidden')) show(); activeIndex=Math.min(currentMatches.length-1,activeIndex+1); show(); input.setAttribute('aria-activedescendant',input.id+'Option'+activeIndex); }
        if(e.key === 'ArrowUp'){ e.preventDefault(); activeIndex=Math.max(0,activeIndex-1); show(); input.setAttribute('aria-activedescendant',input.id+'Option'+activeIndex); }
        if(e.key === 'Enter' && !results.classList.contains('hidden')){ e.preventDefault(); select(currentMatches[Math.max(0,activeIndex)] || currentMatches[0]); }
      });
      results.addEventListener('mousedown', e => {
        const option = e.target.closest('.combo-option');
        if(!option) return;
        e.preventDefault();
        select(currentMatches[Number(option.dataset.index)]);
      });
      input.addEventListener('blur',()=>setTimeout(hide,120));
    }
    function renderConditionals`
);

html = html.replace(
  /function renderStep\(\)\{[\s\S]*?saveDraftMaybe\(\); \}/,
`function renderStep(){ document.querySelectorAll('.wizard-step').forEach(el=>el.classList.toggle('active', Number(el.dataset.step)===state.step)); const active=document.querySelector('.wizard-step.active'); const title=active?.dataset.title||''; qs('stepLabel').textContent='Step '+state.step+' of '+totalSteps+' - '+title; qs('progressBar').style.width=(state.step/totalSteps*100)+'%'; qs('backBtn').disabled=state.step===1; qs('nextBtn').classList.toggle('hidden', state.step===totalSteps); const nextTitle=document.querySelector('.wizard-step[data-step="'+(state.step+1)+'"]')?.dataset.title || 'Next Step'; qs('nextBtn').textContent = state.step===1 ? 'Continue to Flight Details' : 'Continue to ' + nextTitle; renderSummary(); renderConditionals(); saveDraftMaybe(); }`
);

html = html.replace(
  /function addExpense\(data=\{\}\)\{[\s\S]*?renderPreview\(\); \}/,
`function currencyOptions(selected='GBP'){ const list=(sharedData.currencies.length?sharedData.currencies:[{code:'GBP',name:'Pound sterling'},{code:'EUR',name:'Euro'},{code:'USD',name:'US dollar'}]); return list.map(c=>{ const code=c.code||c.currency||c.label||c; const name=c.name||c.label||code; return '<option value="'+escapeHtml(code)+'" '+(code===selected?'selected':'')+'>'+escapeHtml(code+' - '+name)+'</option>'; }).join(''); }
    function sortExpenses(expenses){ const mode=state.expenseSort || val('expenseSort') || 'date'; const rows=(expenses||[]).filter(Boolean).slice(); const cmp=(a,b)=>String(a||'').localeCompare(String(b||'')); rows.sort((a,b)=>{ if(mode==='location') return cmp(a.location,b.location) || cmp(a.date,b.date); if(mode==='currency') return cmp(a.currency,b.currency) || cmp(a.date,b.date); if(mode==='amount') return (parseFloat(b.amount)||0)-(parseFloat(a.amount)||0); return cmp(a.date,b.date) || cmp(a.location,b.location); }); return rows; }
    function addExpense(data={}){ const i=state.expenses.length; state.expenses.push(data); const row=document.createElement('div'); row.className='expense-row'; row.dataset.expenseIndex=i; row.innerHTML='<div class="field"><label for="expenseDate'+i+'">Date</label><input id="expenseDate'+i+'" type="date" value="'+escapeHtml(data.date||'')+'"></div><div class="field"><label for="expenseLocation'+i+'">Airport</label><input id="expenseLocation'+i+'" value="'+escapeHtml(data.location||'')+'" placeholder="e.g. Madrid airport"></div><div class="field"><label for="expenseType'+i+'">Expense</label><select id="expenseType'+i+'"><option>Meals</option><option>Refreshments</option><option>Hotel</option><option>Airport Transport</option><option>Taxi</option><option>Train</option><option>Replacement Flight</option><option>Telephone/Internet</option><option>Other</option></select></div><div class="field"><label for="expenseDesc'+i+'">Expense details</label><input id="expenseDesc'+i+'" value="'+escapeHtml(data.expense||'')+'"></div><div class="field"><label for="expenseReason'+i+'">Reason</label><input id="expenseReason'+i+'" value="'+escapeHtml(data.reason||'')+'"></div><div class="field"><label for="expenseAmount'+i+'">Amount</label><input id="expenseAmount'+i+'" inputmode="decimal" value="'+escapeHtml(data.amount||'')+'"></div><div class="field"><label for="expenseCurrency'+i+'">Currency</label><select id="expenseCurrency'+i+'">'+currencyOptions(data.currency||'GBP')+'</select></div><div class="field"><label for="expenseReceipt'+i+'">Receipt available</label><select id="expenseReceipt'+i+'"><option>Not known</option><option>Yes</option><option>No</option></select></div><div class="field"><label for="expenseEvidence'+i+'">Evidence reference</label><input id="expenseEvidence'+i+'" value="'+escapeHtml(data.evidence||'')+'" placeholder="e.g. Receipt 1"></div><div class="expense-actions"><button type="button" class="btn btn-outline" data-expense-action="duplicate">Duplicate</button><button type="button" class="btn btn-outline" data-expense-action="delete">Delete</button></div>'; qs('expenseRows').appendChild(row); if(data.type) qs('expenseType'+i).value=data.type; if(data.receipt) qs('expenseReceipt'+i).value=data.receipt; row.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{renderPreview();saveDraftMaybe();})); row.addEventListener('click',e=>{ const b=e.target.closest('[data-expense-action]'); if(!b)return; if(b.dataset.expenseAction==='delete'){ state.expenses[i]={}; row.remove(); renderPreview(); saveDraftMaybe(); } if(b.dataset.expenseAction==='duplicate'){ addExpense({date:val('expenseDate'+i),location:val('expenseLocation'+i),type:val('expenseType'+i),expense:val('expenseDesc'+i),reason:val('expenseReason'+i),amount:val('expenseAmount'+i),currency:val('expenseCurrency'+i),receipt:val('expenseReceipt'+i),evidence:val('expenseEvidence'+i)}); saveDraftMaybe(); } }); renderPreview(); }`
);

html = html.replace(
  "function renderDocs(){ const labels=docLabels(); qs('documentChecklist').innerHTML=Object.keys(state.docs).map(k=>'<span>'+escapeHtml(labels[k]||k)+'</span>').join(''); qs('docTabs').innerHTML=Object.keys(state.docs).map(k=>'<button type=\"button\" class=\"doc-tab '+(k===state.activeDoc?'active':'')+'\" data-doc=\"'+k+'\">'+escapeHtml(labels[k]||k)+'</button>').join(''); qs('docEditor').value=state.docs[state.activeDoc]||''; }",
  "function renderDocs(){ const labels=docLabels(); qs('documentChecklist').innerHTML=Object.keys(state.docs).map(k=>'<span>'+escapeHtml(labels[k]||k)+'</span>').join(''); qs('docTabs').innerHTML=Object.keys(state.docs).map(k=>'<button type=\"button\" class=\"doc-tab '+(k===state.activeDoc?'active':'')+'\" data-doc=\"'+k+'\">'+escapeHtml(labels[k]||k)+'</button>').join(''); qs('docEditor').value=state.docs[state.activeDoc]||''; }"
);

html = html.replace(
  /function generatePack\(\)\{[\s\S]*?scrollIntoView\(\{behavior:'smooth'\}\); \}/,
`function renderCompletionSummary(a){ const box=qs('completionSummary'); if(!box) return; const rows=[['Passenger',fallback(a.passengerName)],['Airline',fallback(a.airline)],['Flight',flightLine(a)],['Route',routeLine(a)],['Disruption',a.issues.length?a.issues.map(issueLabel).join(', '):'Not selected'],['Reported delay',a.delayText],['Expenses',a.expenses.length?a.expenses.length+' item(s)':'None recorded'],['Complaint route',primaryRoute(a)]]; box.innerHTML=rows.map(x=>'<div class="summary-card"><strong>'+escapeHtml(x[0])+'</strong>'+escapeHtml(x[1])+'</div>').join(''); }
    function generatePack(){ const a=collect(); state.docs=buildDocs(a); state.activeDoc='summary'; renderCompletionSummary(a); renderDocs(); qs('packReady').classList.remove('hidden'); qs('packReady').scrollIntoView({behavior:'smooth'}); }`
);

html = html.replace(
  /function saveDraftMaybe\(\)\{[\s\S]*?qs\('saveStatus'\)\.textContent='Progress saved on this device\.'; \}/,
`function saveDraftMaybe(){ if(!qs('saveOnDevice').checked) return; const data={step:state.step,answers:collect(),expenses:state.expenses,selectedRecords:state.selectedRecords,expenseSort:state.expenseSort,checks:{issues:selected('issues'),careProvided:selected('careProvided')}}; localStorage.setItem(storageKey,JSON.stringify(data)); qs('saveStatus').textContent='Progress saved on this device.'; }`
);

html = html.replace(
  /function loadDraft\(\)\{[\s\S]*?catch\(e\)\{\} \}/,
`function loadDraft(){ try{ const raw=localStorage.getItem(storageKey); if(!raw)return; const data=JSON.parse(raw); Object.entries(data.answers||{}).forEach(([k,v])=>{ if(qs(k)) qs(k).value=v; }); state.selectedRecords=data.selectedRecords||{}; state.expenseSort=data.expenseSort||'date'; if(qs('expenseSort')) qs('expenseSort').value=state.expenseSort; (data.checks?.issues||[]).forEach(v=>{ const el=Array.from(document.querySelectorAll('input[name="issues"]')).find(input=>input.value===v); if(el)el.checked=true; }); (data.checks?.careProvided||[]).forEach(v=>{ const el=Array.from(document.querySelectorAll('input[name="careProvided"]')).find(input=>input.value===v); if(el)el.checked=true; }); qs('saveOnDevice').checked=true; state.step=Math.min(Math.max(Number(data.step)||1,1),totalSteps); (data.expenses||[]).forEach(addExpense); qs('saveStatus').textContent='Saved complaint restored from this browser.'; }catch(e){} }`
);

html = html.replace(
  "    qs('addExpenseBtn').addEventListener('click',()=>addExpense());",
  "    qs('addExpenseBtn').addEventListener('click',()=>addExpense());\n    if(qs('expenseSort')) qs('expenseSort').addEventListener('change',()=>{ state.expenseSort=val('expenseSort')||'date'; renderPreview(); saveDraftMaybe(); });"
);

html = html.replace(
  /const reusableBuilderComponents = [\s\S]*?loadDraft\(\); renderStep\(\); renderPreview\(\);/,
`const reusableBuilderComponents = { questionnaireEngine:{collect,renderStep}, complaintGenerator:{buildDocs,buildLetter}, pdfGenerator:{downloadPdf}, timelineComponent:{buildTimeline,renderJourneyFlow}, evidenceChecklist:{buildEvidenceChecklist}, expenseSchedule:{buildExpenseSchedule,sortExpenses,addExpense}, followUpTracker:{buildTracker}, officialResources:{buildResources}, disclaimer:{buildDisclaimer} };
    window.quaerensBuilderPlatform = { sharedData, comboData:()=>comboData, loadSharedData, normalizeSearch };
    window.quaerensFlightBuilderComponents = reusableBuilderComponents;
    loadSharedData().finally(()=>{ document.querySelectorAll('[data-combo]').forEach(setupCombo); loadDraft(); renderStep(); renderPreview(); });`
);

fs.writeFileSync(file, html);
console.log('Patched freeflightclaim2 builder logic');
