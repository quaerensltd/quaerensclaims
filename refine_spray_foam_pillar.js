const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'foam-insulation.html');
let html = fs.readFileSync(file, 'utf8');
const originalTitle = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
const originalDescription = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';

const title = 'Spray Foam Problems, Mortgage Refusal & Removal Support | Quaerens';
const description = 'Concerned about spray foam insulation, mortgage refusal, poor installation or removal costs? Quaerens can assess your documents, evidence, financial loss and possible complaint routes.';

html = html
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${description}" />`)
  .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
  .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
  .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`)
  .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${description}" />`);

html = html
  .replace(/<img src="images\/logo-foaminsullations\.png" alt="Quaerens spray foam insulation support logo" class="h-16 md:h-20 w-auto" \/>/, '<img src="images/logo-foaminsullations.png" alt="Quaerens spray foam insulation support logo" class="h-16 md:h-20 w-auto" width="340" height="132" decoding="async" />')
  .replace(/<img src="images\/homebutton\.png" alt="Return to Quaerens home" class="h-10 w-auto hover:opacity-80 transition" \/>/, '<img src="images/homebutton.png" alt="Return to Quaerens home" class="h-10 w-auto hover:opacity-80 transition" width="92" height="40" decoding="async" />')
  .replace(/>\s*Check Your Case\s*<\/a>/, '>Request My Free Initial Assessment</a>');

const pillarContent = String.raw`
  <section class="hero-section">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-inner">
        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
          <span>&#10003;</span>
          <span>Free initial spray foam assessment</span>
        </div>

        <h1>Spray Foam Insulation Problems?</h1>
        <p>Mortgage refused? Unable to release equity? Trying to sell your home? Concerned about poor installation, condensation, hidden roof timbers or removal costs?</p>
        <p>Quaerens provides a preliminary assessment of your documents and circumstances to help identify the relevant evidence, apparent financial loss and possible complaint or escalation routes.</p>

        <div class="hero-checklist">
          <span>&#10003; <strong>Mortgage, remortgage or equity release concerns</strong> linked to spray foam insulation</span>
          <span>&#10003; <strong>Surveyor or valuer comments</strong> about timber visibility, ventilation or roof condition</span>
          <span>&#10003; <strong>Removal, roof repair or reinstatement quotes</strong> that need organising</span>
          <span>&#10003; <strong>Finance, sales promise or installer paperwork</strong> that may support a complaint route</span>
        </div>

        <div class="flex flex-wrap items-center gap-4 mt-8">
          <a href="#request-callback" class="cta-button cta-primary" data-scroll-target="request-callback">Request My Free Initial Assessment</a>
          <a href="#evidence-checklist" class="cta-button cta-secondary">See What Evidence I Need</a>
        </div>

        <div class="quick-panel">
          <p class="font-extrabold text-lg" style="color:#0f172a !important;">Free initial assessment</p>
          <ul>
            <li>&#10003; No obligation to proceed after the first review</li>
            <li>&#10003; Clear document, evidence and chronology review</li>
            <li>&#10003; Help identifying evidence gaps and possible complaint routes</li>
            <li>&#10003; Outcome depends on the documents, timing and facts of the case</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section-wrap -mt-10 relative z-10">
    <div class="info-box soft-blue fade-up">
      <div class="trust-strip">
        <div class="trust-pill"><div class="text-2xl mb-2">&#127969;</div><p class="font-semibold text-blue-900 mb-1">Mortgage issues</p><p class="text-sm text-gray-600">Organise lender, broker, valuation and survey comments where spray foam affects lending.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#128203;</div><p class="font-semibold text-blue-900 mb-1">Evidence review</p><p class="text-sm text-gray-600">Bring together sales paperwork, product documents, photos, reports and complaint replies.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#128176;</div><p class="font-semibold text-blue-900 mb-1">Financial loss</p><p class="text-sm text-gray-600">Separate documented costs from general dissatisfaction before choosing the next route.</p></div>
        <div class="trust-pill"><div class="text-2xl mb-2">&#128221;</div><p class="font-semibold text-blue-900 mb-1">Complaint support</p><p class="text-sm text-gray-600">Prepare clearer complaint material and escalation packs where the evidence supports it.</p></div>
      </div>
    </div>
    <div class="soft-contact-strip" aria-label="Contact Quaerens about spray foam">
      <div class="soft-contact-copy">
        <span class="soft-contact-icon" aria-hidden="true"><img src="/images/ptsts.png" alt="" loading="lazy" decoding="async" width="116" height="72"></span>
        <div>
          <strong>Prefer to speak to someone? Call or WhatsApp: +44 (0)20 8050 0725</strong>
          <span>Talk to our intake team before choosing the right spray foam review route.</span>
        </div>
      </div>
      <div class="soft-contact-actions">
        <a class="soft-contact-call" href="tel:+442080500725">Call Quaerens</a>
        <a class="soft-contact-secondary" href="#request-callback" data-scroll-target="request-callback">Request a callback</a>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Common problems</p>
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Common Problems Caused by Spray Foam Insulation</h2>
      <p class="text-gray-700 mb-6">Many homeowners only discover the issue when a sale, remortgage, equity release application or survey creates a practical problem. These are the main concerns Quaerens sees in spray foam enquiries.</p>
      <div class="card-grid">
        <a href="/spray-foam-mortgage-refused.html" class="feature-card block hover:border-blue-300 transition"><h3>Mortgage or remortgage refused</h3><p>Review lender, valuer and broker comments where a mortgage or remortgage has been refused, delayed or restricted.</p><span class="guidance-card-action">Read about spray foam mortgage refusal</span></a>
        <a href="/equity-release.html" class="feature-card block hover:border-blue-300 transition"><h3>Equity release difficulties</h3><p>Check whether spray foam has affected an equity release valuation, lender condition or application route.</p><span class="guidance-card-action">Review equity release concerns</span></a>
        <a href="/knowledge-spray-foam-unsuitable-mortgages.html" class="feature-card block hover:border-blue-300 transition"><h3>Problems selling the property</h3><p>Understand why buyers, surveyors or lenders may raise questions before a sale can complete.</p><span class="guidance-card-action">Understand spray foam sale concerns</span></a>
        <a href="/guidance-spray-foam-surveyor-concerns.html" class="feature-card block hover:border-blue-300 transition"><h3>Poor installation and ventilation concerns</h3><p>Collect evidence about ventilation, condensation, damp, timber condition and how the foam was installed.</p><span class="guidance-card-action">See surveyor concern evidence</span></a>
        <a href="/knowledge-why-lenders-worry-about-spray-foam.html" class="feature-card block hover:border-blue-300 transition"><h3>Roof inspection and timber visibility</h3><p>Learn why restricted inspection of rafters, timbers, felt or membranes can matter to valuers and lenders.</p><span class="guidance-card-action">Learn why lenders worry</span></a>
        <a href="/spray-foam-removal-costs.html" class="feature-card block hover:border-blue-300 transition"><h3>Removal and reinstatement costs</h3><p>Organise removal quotes, roof repair comments, scaffolding costs and replacement insulation estimates.</p><span class="guidance-card-action">Understand spray foam removal costs</span></a>
        <a href="/section75support.html" class="feature-card block hover:border-blue-300 transition"><h3>Finance agreement concerns</h3><p>Check whether finance, credit card or linked payment evidence may point to a separate complaint route.</p><span class="guidance-card-action">Review finance and Section 75 routes</span></a>
        <a href="/property-disputes-hub.html" class="feature-card block hover:border-blue-300 transition"><h3>Roof repair concerns</h3><p>Connect spray foam evidence with wider property, survey, repair and contractor dispute support.</p><span class="guidance-card-action">Visit the property disputes hub</span></a>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Why Some Mortgage Lenders Are Cautious About Spray Foam</h2>
      <p class="text-gray-700 mb-6">Lender and valuer policies vary. One lender may ask for documents, another may require inspection evidence, and another may decide not to proceed. Requirements can also change over time, so the most useful evidence is the written response on your property.</p>
      <div class="card-grid">
        <div class="feature-card"><h3>Restricted inspection of roof timbers</h3><p>If foam covers rafters, felt or junctions, a surveyor may be unable to comment confidently on timber condition or hidden defects.</p></div>
        <div class="feature-card"><h3>Moisture and condensation concerns</h3><p>Questions can arise about airflow, ventilation routes, trapped moisture, roof membrane condition and signs of damp.</p></div>
        <div class="feature-card"><h3>Installation records and certification</h3><p>Guarantees, product sheets, installer paperwork and certificates can help, but certification alone does not guarantee mortgage acceptance.</p></div>
        <div class="feature-card"><h3>Open-cell and closed-cell differences</h3><p>Different products can raise different practical questions about density, vapour movement, inspection and removal difficulty.</p></div>
      </div>
      <p class="mt-6 text-gray-700">Some cases may require a suitably qualified surveyor, roofing professional or other relevant expert. Quaerens cannot determine whether a lender will approve a mortgage, but we can help organise the evidence and possible complaint route.</p>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Open-Cell and Closed-Cell Spray Foam</h2>
      <p class="text-gray-700 mb-6">The product label is only one part of the review. Installation method, roof type, ventilation, paperwork, photographs and the actual lender or surveyor comments all matter.</p>
      <div class="card-grid">
        <div class="feature-card"><h3>Open-cell spray foam</h3><p>Open-cell foam is generally less dense and more flexible. The review may consider where it was applied, whether ventilation was preserved and whether timbers remain inspectable.</p></div>
        <div class="feature-card"><h3>Closed-cell spray foam</h3><p>Closed-cell foam is generally denser and can be harder to remove. The review may consider whether it restricts inspection or raises concerns about moisture movement.</p></div>
        <div class="feature-card"><h3>Why the installation method matters</h3><p>Foam applied directly to felt, membranes or timbers can create different concerns from foam installed with clear ventilation and proper records.</p></div>
        <div class="feature-card"><h3>Why certification may not settle it</h3><p>Product certification may be useful evidence, but it may not answer every lender, valuer or buyer concern about a specific property.</p></div>
      </div>
    </div>
  </section>

  <section class="section-wrap py-4">
    <figure class="authority-visual fade-up">
      <img src="/images/cred-foam3.jpg" alt="Spray foam mortgage concerns including hidden roof timbers, ventilation, moisture risk and inspection access" loading="lazy" decoding="async" width="900" height="675" style="max-width:100%; height:auto;" />
      <figcaption class="authority-visual-caption">A practical summary of why lenders and surveyors may ask for more evidence before accepting a property with spray foam insulation.</figcaption>
    </figure>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">How Much Does Spray Foam Removal Cost?</h2>
      <p class="text-gray-700 mb-6">Removal-cost searches are common because quotes can vary substantially. A careful review should look at why removal is being recommended, what work is included and whether the cost links to the original sale, installation or finance route.</p>
      <div class="card-grid">
        <div class="feature-card"><h3>Factors that affect removal cost</h3><p>Loft size, foam thickness, open-cell or closed-cell product, access, waste removal and labour time can all affect the quote.</p></div>
        <div class="feature-card"><h3>Roof access and scaffolding</h3><p>Some projects may require difficult access, protection measures, scaffolding or roof covering disturbance.</p></div>
        <div class="feature-card"><h3>Damage discovered after removal</h3><p>Quotes may change if timber, felt, membrane, damp or ventilation problems become visible only after foam is removed.</p></div>
        <div class="feature-card"><h3>Reinstatement and replacement insulation</h3><p>Making good, replacement insulation, certification or inspection after works may add to the documented cost.</p></div>
      </div>
      <p class="mt-6 text-gray-700">Quaerens does not publish a single fixed average removal cost because the evidence varies from property to property. Removal quotes should be treated as case-specific and supported by photographs, inspection notes and scope of works.</p>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">What Financial Loss Could Be Relevant?</h2>
      <p class="text-gray-700 mb-6">The financial impact of a spray foam dispute depends on the evidence and the route available. Relevant amounts may include:</p>
      <div class="card-grid">
        <div class="feature-card"><h3>Installation price</h3><p>The original amount paid for the product, installation, survey, guarantee or related package.</p></div>
        <div class="feature-card"><h3>Finance interest and charges</h3><p>Interest, fees or charges under a connected finance agreement or other payment arrangement.</p></div>
        <div class="feature-card"><h3>Survey and valuation costs</h3><p>Surveyor, valuation, roof inspection or specialist report fees caused by the issue.</p></div>
        <div class="feature-card"><h3>Removal costs</h3><p>Removal, disposal, scaffolding, access and making-good quotes where properly documented.</p></div>
        <div class="feature-card"><h3>Roof repair or replacement costs</h3><p>Timber, felt, membrane, ventilation, roof covering or reinstatement works identified by inspection.</p></div>
        <div class="feature-card"><h3>Increased mortgage costs</h3><p>Additional borrowing, remortgage delay or alternative product costs where evidenced.</p></div>
        <div class="feature-card"><h3>Lost sale or reduced property value</h3><p>Evidence of a failed sale, delayed transaction, reduced offer or valuation impact.</p></div>
        <div class="feature-card"><h3>Other evidenced consequential losses</h3><p>Other documented expenditure caused by the issue, assessed cautiously against the available route.</p></div>
      </div>
      <div class="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-5">
        <p class="font-bold text-blue-900 mb-2">Important</p>
        <p class="text-gray-700">Not every cost will be recoverable. The purpose of the preliminary assessment is to distinguish documented financial loss from general dissatisfaction and to identify which complaint routes may be relevant.</p>
      </div>
    </div>
  </section>

  <section id="evidence-checklist" class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">What Evidence Should You Gather?</h2>
      <p class="text-gray-700 mb-6">A stronger review usually starts with a clear file. Gather whatever you have and do not worry if some documents are missing; gaps can be identified during the assessment.</p>
      <div class="grid md:grid-cols-2 gap-4 text-gray-700">
        <ul class="space-y-2">
          <li>&bull; Sales contract and invoice</li>
          <li>&bull; Finance agreement or credit-card statements</li>
          <li>&bull; Product guarantee and certification supplied at sale</li>
          <li>&bull; Survey, valuation or roof inspection report</li>
          <li>&bull; Lender, broker or equity-release refusal</li>
          <li>&bull; Installation photographs and current loft photographs</li>
          <li>&bull; Ventilation details and roof-space notes</li>
          <li>&bull; Installer sales material and correspondence</li>
        </ul>
        <ul class="space-y-2">
          <li>&bull; Complaint correspondence and final replies</li>
          <li>&bull; Removal quotations and scope of works</li>
          <li>&bull; Roof repair or replacement quotations</li>
          <li>&bull; Evidence of sale delay, failed transaction or reduced offer</li>
          <li>&bull; Notes of sales promises about value, mortgages or government backing</li>
          <li>&bull; Details if the installer has ceased trading</li>
          <li>&bull; Chronology of events from sale to current issue</li>
          <li>&bull; Any expert or professional comments already received</li>
        </ul>
      </div>
      <a href="/guidance-spray-foam-mortgage-problems.html" class="inline-block mt-6 px-6 py-3 bg-blue-700 text-white rounded-full font-semibold hover:bg-blue-800 transition">Download or View the Spray Foam Evidence Checklist</a>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">How the Quaerens Assessment Works</h2>
      <div class="card-grid">
        <div class="feature-card"><h3>1. Initial information review</h3><p>We look at the issue affecting your mortgage, sale, survey, finance, installation or removal position.</p></div>
        <div class="feature-card"><h3>2. Document and evidence assessment</h3><p>We review the paperwork you provide and identify missing documents that could help clarify the route.</p></div>
        <div class="feature-card"><h3>3. Chronology preparation</h3><p>We organise what happened, when it happened, what was promised and when the problem was discovered.</p></div>
        <div class="feature-card"><h3>4. Representations and losses</h3><p>We identify apparent sales representations, installation concerns and documented financial loss.</p></div>
        <div class="feature-card"><h3>5. Complaint route review</h3><p>We consider possible routes involving the installer, finance provider, card provider, warranty route or escalation body.</p></div>
        <div class="feature-card"><h3>6. Complaint material support</h3><p>Where appropriate, we help organise complaint wording, evidence bundles and escalation material.</p></div>
      </div>
      <p class="mt-6 text-gray-700">Where technical inspection, litigation or regulated financial advice may be required, the client may need to instruct an appropriately qualified professional. Quaerens focuses on practical document, evidence and complaint support.</p>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Example Spray Foam Situations</h2>
      <p class="text-gray-700 mb-6">These anonymised examples show the type of fact pattern that may be reviewed. They do not describe guaranteed outcomes.</p>
      <div class="card-grid">
        <div class="feature-card"><h3>Example 1: sale delayed after survey comments</h3><p>A homeowner preparing to sell received survey comments about restricted timber visibility and lender concern. The evidence reviewed included the installation invoice, product documents, survey notes, buyer correspondence and removal quotation. The assessment focused on what was said at sale, whether risks were explained and what financial loss was documented.</p></div>
        <div class="feature-card"><h3>Example 2: finance and removal-cost concern</h3><p>A homeowner paid for spray foam through finance after being told it would improve the property. Later, a remortgage route became difficult and removal quotes were obtained. The review considered the finance paperwork, sales representations, lender comments, roof photographs and whether a finance-provider complaint route might be relevant.</p></div>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Complaint and Escalation Routes</h2>
      <p class="text-gray-700 mb-6">The route depends on who sold the product, how it was paid for, what paperwork exists and what problem has now arisen.</p>
      <div class="card-grid">
        <a href="/mis-sold-spray-foam-insulation.html" class="feature-card block hover:border-blue-300 transition"><h3>Installer or sales company complaint</h3><p>Review sales claims, suitability discussions, guarantees, paperwork and risk warnings.</p><span class="guidance-card-action">Review mis-sold spray foam support</span></a>
        <a href="/section75support.html" class="feature-card block hover:border-blue-300 transition"><h3>Finance provider or Section 75 route</h3><p>Where payment was made by finance or credit card, separate complaint routes may need assessment.</p><span class="guidance-card-action">Understand Section 75 support</span></a>
        <a href="/consumer-complaint-letters.html" class="feature-card block hover:border-blue-300 transition"><h3>Complaint preparation</h3><p>Use clearer wording, chronology and evidence references when raising or escalating a complaint.</p><span class="guidance-card-action">Prepare a stronger complaint</span></a>
        <a href="/guidance-spray-foam-removal-costs.html" class="feature-card block hover:border-blue-300 transition"><h3>Removal-cost evidence</h3><p>Bring together quotes, roof notes, photographs and making-good costs before relying on removal figures.</p><span class="guidance-card-action">See removal-cost evidence guidance</span></a>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6" data-internal-links="true">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Spray Foam Installers and Sales Companies Mentioned in Consumer Enquiries</h2>
      <p class="text-gray-700 mb-6">Where Quaerens has a legitimate factual page, we link to it neutrally. A named company page does not mean every customer has a valid complaint.</p>
      <div class="card-grid">
        <a href="/spray-foam-mortgage-refused.html" class="feature-card block hover:border-blue-300 transition"><h3>Mortgage refusal enquiries</h3><p>Common evidence patterns where the issue arises during a mortgage, remortgage or sale.</p><span class="guidance-card-action">Review spray foam mortgage refusal support</span></a>
        <a href="/spray-foam-removal-costs.html" class="feature-card block hover:border-blue-300 transition"><h3>Removal-cost enquiries</h3><p>Pages focused on removal quotes, reinstatement and the documents that help explain costs.</p><span class="guidance-card-action">Review spray foam removal cost support</span></a>
        <a href="/spray-foam-survey-problems.html" class="feature-card block hover:border-blue-300 transition"><h3>Survey problem enquiries</h3><p>Pages focused on surveyor concerns, roof inspection and property-sale evidence.</p><span class="guidance-card-action">Review spray foam survey problem support</span></a>
      </div>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Official and Authoritative References</h2>
      <p class="text-gray-700 mb-6">These references can help homeowners understand the wider context. They do not decide the outcome of any individual complaint.</p>
      <ul class="space-y-3 text-gray-700">
        <li><a href="https://www.rics.org/content/dam/ricsglobal/documents/press-releases/Spray%20foam%20insulation%20consumer%20guide_March2023_updated.pdf" target="_blank" rel="noopener" class="text-blue-700 font-bold">RICS consumer guide to spray foam insulation</a></li>
        <li><a href="https://www.financial-ombudsman.org.uk/consumers/how-to-complain" target="_blank" rel="noopener" class="text-blue-700 font-bold">Financial Ombudsman Service: how to complain</a></li>
        <li><a href="https://www.financial-ombudsman.org.uk/data-insight/our-insight/common-myths-about-section-75" target="_blank" rel="noopener" class="text-blue-700 font-bold">Financial Ombudsman Service: common myths about Section 75</a></li>
        <li><a href="https://www.fca.org.uk/consumers/how-complain" target="_blank" rel="noopener" class="text-blue-700 font-bold">Financial Conduct Authority: how to complain</a></li>
        <li><a href="https://www.legislation.gov.uk/ukpga/1974/39/section/75" target="_blank" rel="noopener" class="text-blue-700 font-bold">Consumer Credit Act 1974, Section 75</a></li>
      </ul>
    </div>
  </section>

  <section class="section-wrap py-6">
    <div class="info-box soft-blue fade-up">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-6">Spray Foam Frequently Asked Questions</h2>
      <div class="faq-list">
        <div class="faq-item"><button class="faq-question" type="button">Can I sell a house with spray foam insulation?</button><div class="faq-content">Sometimes, but it depends on the buyer, surveyor, lender, product, installation records and roof condition. Written survey and lender comments are important evidence.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Can spray foam cause a mortgage to be refused?</button><div class="faq-content">It can. Some lenders or valuers may raise concerns if spray foam restricts inspection, affects ventilation or creates uncertainty about the roof. Policies vary and the written reason should be reviewed.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Do all mortgage lenders reject spray foam?</button><div class="faq-content">No. Lender policies vary and can change. Some may ask for more documents, some may require inspection evidence and some may decide not to proceed.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Does it matter whether the foam is open-cell or closed-cell?</button><div class="faq-content">Yes, it can matter because density, structure, inspection access, ventilation and removal difficulty can differ. The installation method and roof condition may matter as much as the label.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Is a BBA certificate enough for a mortgage lender?</button><div class="faq-content">A certificate may help, but it does not guarantee lender acceptance. A lender or valuer may still want property-specific evidence about installation, ventilation and roof condition.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Should spray foam always be removed?</button><div class="faq-content">Not always. Removal should usually be considered against the lender or surveyor concern, technical inspection evidence, cost, disruption and the route you are trying to resolve.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">How much can spray foam removal cost?</button><div class="faq-content">Costs vary substantially depending on loft size, foam type, thickness, access, scaffolding, waste removal, roof damage and reinstatement. A quote should be reviewed with its scope of works.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Can removal damage the roof?</button><div class="faq-content">Removal can be disruptive and may reveal or create additional repair issues. Homeowners should keep inspection notes, photographs, removal quotes and any making-good costs.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Who should inspect spray foam insulation?</button><div class="faq-content">A suitably qualified surveyor, roofing professional or other relevant expert may be needed where technical inspection, roof condition or removal scope is disputed.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Can I complain about poor spray foam installation?</button><div class="faq-content">You may be able to complain if the documents, photographs, expert comments or survey evidence suggest poor installation, unsuitable advice or risks that were not properly explained.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Can I complain to the finance provider?</button><div class="faq-content">Possibly. If spray foam was paid for using finance or a credit card, the finance provider or card provider may be a relevant route depending on the agreement, payment method and evidence.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Could Section 75 apply?</button><div class="faq-content">Section 75 may be relevant in some credit-card or linked-credit situations, but it depends on the payment structure, supplier relationship, amount paid and the complaint evidence.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What documents do I need?</button><div class="faq-content">Useful documents include the contract, invoice, finance agreement, guarantee, certification, survey report, lender refusal, photographs, complaint replies and removal or roof repair quotes.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What if the installer has ceased trading?</button><div class="faq-content">The review may still look at finance, card, warranty, insurer or other complaint routes if the evidence supports them. The company status and payment route both matter.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Is there a time limit for complaining?</button><div class="faq-content">Time limits can depend on the complaint route, when the product was sold, when the issue was discovered and when you complained. Gather dates and correspondence as early as possible.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">Can I claim for roof replacement costs?</button><div class="faq-content">Roof replacement or repair costs may be relevant if they are evidenced and linked to the issue, but not every cost will be recoverable. Quotes and inspection reports are important.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What if the salesperson said the product was government-backed?</button><div class="faq-content">Keep any brochure, email, grant wording or sales note. Claims about approval, grants or backing should be checked against the documents and the actual scheme referred to.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What if I was told it would increase the property value?</button><div class="faq-content">That may be relevant if there is evidence of the promise and later evidence of reduced value, buyer concern, survey comments or sale difficulty.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What if I was told it would not affect a mortgage?</button><div class="faq-content">Keep any written or recorded sales material and compare it with later lender, broker or surveyor comments. The assessment looks at what was promised and what later happened.</div></div>
        <div class="faq-item"><button class="faq-question" type="button">What does Quaerens actually do?</button><div class="faq-content">Quaerens reviews documents, organises evidence, prepares a chronology, identifies apparent financial loss and helps clarify possible complaint or escalation routes.</div></div>
      </div>
    </div>
  </section>

  <section id="request-callback" class="section-wrap py-6 quaerens-site-callback" data-callback-page="foam-insulation.html">
    <div class="grid lg:grid-cols-2 gap-6 items-start">
      <div class="info-box soft-blue fade-up h-full">
        <img src="images/callback-office-team.jpg" alt="Quaerens client support team reviewing spray foam enquiry documents" class="w-full h-40 md:h-44 object-cover object-top rounded-2xl shadow-sm border border-blue-100 mb-6" loading="lazy" decoding="async" width="900" height="506" />
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-3">Request your free initial assessment</p>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Request Your Free Initial Assessment</h2>
        <p class="text-gray-700 mb-5">Send a short summary of the spray foam issue, what has happened with your mortgage, sale, survey, finance or removal quote, and what documents you already have.</p>
        <div class="rounded-2xl bg-white border border-blue-100 p-5">
          <p class="font-bold text-blue-900 mb-3">Before the form</p>
          <ul class="space-y-2 text-gray-700">
            <li>&#10003; Free initial assessment</li>
            <li>&#10003; No obligation to proceed</li>
            <li>&#10003; Clear explanation of evidence gaps</li>
            <li>&#10003; Secure document handling</li>
            <li>&#10003; No guaranteed outcome</li>
            <li>&#10003; Clear route boundaries if specialist or regulated support may be needed</li>
          </ul>
        </div>
      </div>
      <div class="info-box fade-up h-full">
        <form class="quaerens-callback-form bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4" data-callback-issue="Spray Foam Initial Assessment" data-callback-page="foam-insulation.html">
          <input type="hidden" name="issue" value="Spray Foam Initial Assessment">
          <div><label for="foamName" class="block text-sm font-bold text-blue-900 mb-2">Name</label><input id="foamName" name="name" required type="text" placeholder="Your name" class="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
          <div><label for="foamPhone" class="block text-sm font-bold text-blue-900 mb-2">Phone</label><input id="foamPhone" name="phone" required type="tel" placeholder="Best contact number" class="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
          <div><label for="foamEmail" class="block text-sm font-bold text-blue-900 mb-2">Email</label><input id="foamEmail" name="email" type="email" placeholder="you@example.com" class="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></div>
          <div><label for="foamIssue" class="block text-sm font-bold text-blue-900 mb-2">Main issue</label><select id="foamIssue" name="issueType" class="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"><option>Mortgage or remortgage refused</option><option>Equity release refused</option><option>Sale or survey problem</option><option>Removal or roof repair cost</option><option>Finance or Section 75 concern</option><option>Poor installation or ventilation concern</option></select></div>
          <div><label for="foamSummary" class="block text-sm font-bold text-blue-900 mb-2">Short summary</label><textarea id="foamSummary" name="message" rows="4" placeholder="Tell us what happened and what documents you have." class="w-full border border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea></div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition">Request My Free Initial Assessment</button>
          <p class="quaerens-callback-message hidden text-sm font-semibold mt-3"></p>
        </form>
      </div>
    </div>
  </section>

  <section id="start-spray-foam-review" class="section-wrap py-6">
    <div class="rounded-3xl bg-blue-800 text-white text-center py-12 px-6 shadow-xl fade-up">
      <p class="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-3">Final check</p>
      <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Ready to Review Your Spray Foam Situation?</h2>
      <p class="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">If spray foam is affecting your mortgage, sale, survey, finance or removal costs, request a free initial assessment and find out what evidence matters most.</p>
      <a href="#request-callback" data-scroll-target="request-callback" class="inline-block px-8 py-4 bg-white text-blue-800 font-bold rounded-full shadow-md hover:bg-gray-100 transition">Request My Free Initial Assessment</a>
    </div>
  </section>
`;

const start = html.indexOf('<section class="hero-section">');
const end = html.indexOf('<footer', start);
if (start === -1 || end === -1) {
  throw new Error('Could not locate main spray foam content boundaries.');
}
html = html.slice(0, start) + pillarContent + html.slice(end);

const faqItems = [
  ['Can I sell a house with spray foam insulation?', 'Sometimes, but it depends on the buyer, surveyor, lender, product, installation records and roof condition. Written survey and lender comments are important evidence.'],
  ['Can spray foam cause a mortgage to be refused?', 'It can. Some lenders or valuers may raise concerns if spray foam restricts inspection, affects ventilation or creates uncertainty about the roof. Policies vary and the written reason should be reviewed.'],
  ['Do all mortgage lenders reject spray foam?', 'No. Lender policies vary and can change. Some may ask for more documents, some may require inspection evidence and some may decide not to proceed.'],
  ['Does it matter whether the foam is open-cell or closed-cell?', 'Yes, it can matter because density, structure, inspection access, ventilation and removal difficulty can differ. The installation method and roof condition may matter as much as the label.'],
  ['Is a BBA certificate enough for a mortgage lender?', 'A certificate may help, but it does not guarantee lender acceptance. A lender or valuer may still want property-specific evidence about installation, ventilation and roof condition.'],
  ['Should spray foam always be removed?', 'Not always. Removal should usually be considered against the lender or surveyor concern, technical inspection evidence, cost, disruption and the route you are trying to resolve.'],
  ['How much can spray foam removal cost?', 'Costs vary substantially depending on loft size, foam type, thickness, access, scaffolding, waste removal, roof damage and reinstatement. A quote should be reviewed with its scope of works.'],
  ['Can removal damage the roof?', 'Removal can be disruptive and may reveal or create additional repair issues. Homeowners should keep inspection notes, photographs, removal quotes and any making-good costs.'],
  ['Who should inspect spray foam insulation?', 'A suitably qualified surveyor, roofing professional or other relevant expert may be needed where technical inspection, roof condition or removal scope is disputed.'],
  ['Can I complain about poor spray foam installation?', 'You may be able to complain if the documents, photographs, expert comments or survey evidence suggest poor installation, unsuitable advice or risks that were not properly explained.'],
  ['Can I complain to the finance provider?', 'Possibly. If spray foam was paid for using finance or a credit card, the finance provider or card provider may be a relevant route depending on the agreement, payment method and evidence.'],
  ['Could Section 75 apply?', 'Section 75 may be relevant in some credit-card or linked-credit situations, but it depends on the payment structure, supplier relationship, amount paid and the complaint evidence.'],
  ['What documents do I need?', 'Useful documents include the contract, invoice, finance agreement, guarantee, certification, survey report, lender refusal, photographs, complaint replies and removal or roof repair quotes.'],
  ['What if the installer has ceased trading?', 'The review may still look at finance, card, warranty, insurer or other complaint routes if the evidence supports them. The company status and payment route both matter.'],
  ['Is there a time limit for complaining?', 'Time limits can depend on the complaint route, when the product was sold, when the issue was discovered and when you complained. Gather dates and correspondence as early as possible.'],
  ['Can I claim for roof replacement costs?', 'Roof replacement or repair costs may be relevant if they are evidenced and linked to the issue, but not every cost will be recoverable. Quotes and inspection reports are important.'],
  ['What if the salesperson said the product was government-backed?', 'Keep any brochure, email, grant wording or sales note. Claims about approval, grants or backing should be checked against the documents and the actual scheme referred to.'],
  ['What if I was told it would increase the property value?', 'That may be relevant if there is evidence of the promise and later evidence of reduced value, buyer concern, survey comments or sale difficulty.'],
  ['What if I was told it would not affect a mortgage?', 'Keep any written or recorded sales material and compare it with later lender, broker or surveyor comments. The assessment looks at what was promised and what later happened.'],
  ['What does Quaerens actually do?', 'Quaerens reviews documents, organises evidence, prepares a chronology, identifies apparent financial loss and helps clarify possible complaint or escalation routes.']
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(([name, text]) => ({
    '@type': 'Question',
    name,
    acceptedAnswer: { '@type': 'Answer', text }
  }))
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Spray Foam Insulation Document and Evidence Assessment',
  serviceType: 'Preliminary spray foam insulation dispute assessment',
  provider: { '@type': 'Organization', name: 'Quaerens Ltd.', url: 'https://www.quaerens.co.uk/' },
  areaServed: { '@type': 'Country', name: 'United Kingdom' },
  url: 'https://www.quaerens.co.uk/foam-insulation.html',
  description
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.quaerens.co.uk/' },
    { '@type': 'ListItem', position: 2, name: 'Property Disputes', item: 'https://www.quaerens.co.uk/property-disputes-hub.html' },
    { '@type': 'ListItem', position: 3, name: 'Spray Foam Insulation Problems', item: 'https://www.quaerens.co.uk/foam-insulation.html' }
  ]
};

html = html.replace(/\n?<script type="application\/ld\+json" data-seo-faq="true">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script type="application\/ld\+json" data-seo-howto="true">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script type="application\/ld\+json" data-spray-foam-service="true">[\s\S]*?<\/script>/g, '');
html = html.replace(/\n?<script type="application\/ld\+json" data-spray-foam-breadcrumb="true">[\s\S]*?<\/script>/g, '');

const schemaBlock = `
<script type="application/ld+json" data-spray-foam-service="true">${JSON.stringify(serviceSchema)}</script>
<script type="application/ld+json" data-spray-foam-breadcrumb="true">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json" data-seo-faq="true">${JSON.stringify(faqSchema)}</script>
`;
html = html.replace('<script type="application/ld+json" data-site-organization="true">', `${schemaBlock}\n<script type="application/ld+json" data-site-organization="true">`);

html = html.replace(
  "      if (window.location.hash === '#request-callback') {\n        window.setTimeout(scrollToCallbackForm, 250);\n      }\n\n      nextBtn.addEventListener('click', () => {",
  "      if (window.location.hash === '#request-callback') {\n        window.setTimeout(scrollToCallbackForm, 250);\n      }\n\n      if (!nextBtn || !backBtn || !step1 || !step2 || !calculateBtn || !resultDiv || !resultAmount || !resultMessage) return;\n\n      nextBtn.addEventListener('click', () => {"
);

html = html
  .replace(/Start Free Case Check/g, 'Request My Free Initial Assessment')
  .replace(/Start Free Foam Assessment/g, 'Request My Free Initial Assessment')
  .replace(/Check Case Potential/g, 'See What Evidence I Need')
  .replace(/Request Call Back/g, 'Request My Free Initial Assessment')
  .replace(/Spray Foam Compensation Review/g, 'Spray Foam Initial Assessment')
  .replace(/compensation appears realistic/g, 'possible routes appear relevant')
  .replace(/realistic compensation routes/g, 'possible complaint routes')
  .replace(/guaranteed compensation figure/g, 'guaranteed outcome');

fs.writeFileSync(file, html, 'utf8');
console.log('Refined foam-insulation.html as spray foam pillar page.');
console.log(`Old title: ${originalTitle}`);
console.log(`New title: ${title}`);
console.log(`Old description: ${originalDescription}`);
console.log(`New description: ${description}`);
