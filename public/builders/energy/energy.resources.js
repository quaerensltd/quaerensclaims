(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFEnergyResources = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const verifiedOn = "2026-07-28";

  const sources = [
    {
      title: "Complain about your energy supplier",
      organisation: "Ofgem",
      officialUrl: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/complain-about-your-energy-supplier",
      publicationOrUpdateDate: "Current consumer guidance page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "complaints",
      lastVerified: verifiedOn,
      limitations: "Ofgem explains routes and rights but does not investigate individual supplier complaints."
    },
    {
      title: "Find your energy supplier or network operator",
      organisation: "Ofgem",
      officialUrl: "https://www.ofgem.gov.uk/finding-your-energy-supplier-or-network-operator",
      publicationOrUpdateDate: "Current consumer guidance page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "supplier identification",
      lastVerified: verifiedOn,
      limitations: "Use this where the correct supplier or network operator is unclear."
    },
    {
      title: "What to do if you get a back bill",
      organisation: "Ofgem",
      officialUrl: "https://www.ofgem.gov.uk/check-energy-back-billing-rules",
      publicationOrUpdateDate: "Current consumer guidance page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "back billing",
      lastVerified: verifiedOn,
      limitations: "Back-billing rules depend on accurate billing history and whether the consumer acted unreasonably."
    },
    {
      title: "Get compensation for problems switching energy suppliers",
      organisation: "Ofgem",
      officialUrl: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/get-compensation-problems-switching-energy-suppliers",
      publicationOrUpdateDate: "Current consumer guidance page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "switching compensation",
      lastVerified: verifiedOn,
      limitations: "The builder does not calculate official switching-standard payments; check the official page before relying on a figure."
    },
    {
      title: "Join your supplier's Priority Services Register",
      organisation: "Ofgem",
      officialUrl: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/join-your-suppliers-priority-services-register",
      publicationOrUpdateDate: "Current consumer guidance page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "priority services",
      lastVerified: verifiedOn,
      limitations: "Priority Services Register support is arranged by the relevant supplier or network operator."
    },
    {
      title: "Energy complaints",
      organisation: "Energy Ombudsman",
      officialUrl: "https://www.energyombudsman.org/",
      publicationOrUpdateDate: "Current official service page, verified 2026-07-28",
      jurisdiction: "Great Britain",
      topic: "ombudsman escalation",
      lastVerified: verifiedOn,
      limitations: "Eligibility, time limits and scope must be checked before escalation."
    },
    {
      title: "Direct Debit Guarantee",
      organisation: "Pay.UK",
      officialUrl: "https://www.directdebit.co.uk/direct-debit-guarantee/",
      publicationOrUpdateDate: "Current official scheme page, verified 2026-07-28",
      jurisdiction: "United Kingdom",
      topic: "direct debit",
      lastVerified: verifiedOn,
      limitations: "Bank refund routes and supplier complaint routes may both need separate review."
    },
    {
      title: "Direct debits and standing orders",
      organisation: "Financial Ombudsman Service",
      officialUrl: "https://www.financial-ombudsman.org.uk/businesses/resolving-complaint/complaints-deal/banking-and-payments/direct-debits",
      publicationOrUpdateDate: "Current FOS guidance page, verified 2026-07-28",
      jurisdiction: "United Kingdom",
      topic: "payment provider complaints",
      lastVerified: verifiedOn,
      limitations: "Relevant where the complaint is about the bank or payment provider, not only the energy supplier."
    }
  ];

  const suppliers = [
    ["British Gas", "British Gas Trading Limited", "https://www.britishgas.co.uk/", "https://www.britishgas.co.uk/help-and-support/contact-us/complaints.html", "https://www.britishgas.co.uk/help-and-support/contact-us.html", "https://www.britishgas.co.uk/help-and-support/priority-services-register.html"],
    ["EDF", "EDF Energy Customers Limited", "https://www.edfenergy.com/", "https://www.edfenergy.com/for-home/help-support/making-a-complaint", "https://www.edfenergy.com/for-home/help-support/contact-us", "https://www.edfenergy.com/for-home/help-support/priority-services"],
    ["E.ON Next", "E.ON Next Energy Limited", "https://www.eonnext.com/", "https://www.eonnext.com/contact/complaints", "https://www.eonnext.com/contact", "https://www.eonnext.com/help/extra-help"],
    ["Octopus Energy", "Octopus Energy Limited", "https://octopus.energy/", "https://octopus.energy/policies/complaints/", "https://octopus.energy/contact/", "https://octopus.energy/help-and-faqs/articles/priority-services-register/"],
    ["OVO Energy", "OVO Energy Limited", "https://www.ovoenergy.com/", "https://www.ovoenergy.com/feedback", "https://www.ovoenergy.com/help", "https://www.ovoenergy.com/help/priority-services-register"],
    ["ScottishPower", "ScottishPower Energy Retail Limited", "https://www.scottishpower.co.uk/", "https://www.scottishpower.co.uk/support-centre/complaints", "https://www.scottishpower.co.uk/support-centre/contact-us", "https://www.scottishpower.co.uk/support-centre/priority-services"],
    ["Utilita", "Utilita Energy Limited", "https://utilita.co.uk/", "https://utilita.co.uk/help/complaints", "https://utilita.co.uk/help/contact", "https://utilita.co.uk/help/priority-services-register"],
    ["Utility Warehouse", "Utility Warehouse Limited", "https://uw.co.uk/", "https://uw.co.uk/help/contact-us/complaints", "https://uw.co.uk/help/contact-us", "https://uw.co.uk/help/energy/priority-services-register"],
    ["Good Energy", "Good Energy Limited", "https://www.goodenergy.co.uk/", "https://www.goodenergy.co.uk/help-centre/complaints/", "https://www.goodenergy.co.uk/help-centre/contact-us/", "https://www.goodenergy.co.uk/help-centre/priority-services-register/"],
    ["Ecotricity", "Ecotricity Group Limited", "https://www.ecotricity.co.uk/", "https://www.ecotricity.co.uk/customer-service/complaints", "https://www.ecotricity.co.uk/customer-service/contact-us", "https://www.ecotricity.co.uk/customer-service/priority-services-register"],
    ["Outfox the Market", "Foxglove Energy Supply Limited", "https://www.outfoxthemarket.co.uk/", "https://www.outfoxthemarket.co.uk/help-centre/complaints/", "https://www.outfoxthemarket.co.uk/contact/", "https://www.outfoxthemarket.co.uk/help-centre/priority-services-register/"],
    ["So Energy", "So Energy Trading Limited", "https://www.so.energy/", "https://www.so.energy/complaints", "https://www.so.energy/contact", "https://www.so.energy/priority-services-register"],
    ["Tomato Energy", "Tomato Energy Limited", "https://www.tomato.energy/", "https://www.tomato.energy/contact-us", "https://www.tomato.energy/contact-us", "https://www.tomato.energy/priority-services-register"],
    ["Shell Energy", "Shell Energy Retail Limited (historic domestic supply brand)", "https://www.shellenergy.co.uk/", "https://www.shellenergy.co.uk/contact-us/complaints", "https://www.shellenergy.co.uk/contact-us", "", "Historic domestic energy customers may have been transferred; confirm the current route before submitting."],
    ["SSE", "SSE Energy Services Group Limited (historic domestic supply brand)", "https://sse.co.uk/", "https://sse.co.uk/help/contact-us/complaints", "https://sse.co.uk/help/contact-us", "", "Historic SSE domestic supply accounts may now be handled through OVO/SSE routes; confirm before submitting."]
  ].map(([supplier, legalEntity, officialWebsite, complaintPage, contactPage, priorityServicesPage, extraLimit]) => ({
    supplier,
    legalEntity,
    officialWebsite,
    complaintPage,
    contactPage,
    postalAddress: "",
    priorityServicesPage,
    lastVerified: verifiedOn,
    officialSource: complaintPage || contactPage || officialWebsite,
    limitations: extraLimit || "Postal addresses and specialist team routes should be checked on the supplier's official complaint page before posting documents."
  }));

  function normalise(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function findSupplier(name) {
    const needle = normalise(name);
    if (!needle) return null;
    return suppliers.find((entry) => normalise(entry.supplier) === needle || normalise(entry.supplier).includes(needle) || needle.includes(normalise(entry.supplier))) || null;
  }

  function sourceByTopic(topic) {
    const needle = normalise(topic);
    return sources.filter((source) => normalise(source.topic).includes(needle) || normalise(source.title).includes(needle));
  }

  function routeFor(data) {
    const supplier = findSupplier(data && data.supplierName);
    const routes = [];
    if (supplier) {
      routes.push({
        organisation: supplier.supplier,
        role: "First complaint route",
        status: "Verified",
        officialUrl: supplier.complaintPage,
        limitation: supplier.limitations
      });
    } else {
      routes.push({
        organisation: "Relevant energy supplier",
        role: "First complaint route",
        status: "Requires Verification",
        officialUrl: sourceByTopic("supplier identification")[0].officialUrl,
        limitation: "Use Ofgem's supplier finder if the correct supplier is unclear."
      });
    }
    const t = [
      data && data.issueSummary,
      data && data.problemSummary,
      data && data.energyType,
      data && data.currentStage,
      data && data.whatHappened,
      data && data.issueGroups
    ].flat().filter(Boolean).join(" ").toLowerCase();
    if (/switch|erroneous|transfer/.test(t)) routes.push({ organisation: "Ofgem", role: "Switching and official standards guidance", status: "Reference Only", officialUrl: sourceByTopic("switching compensation")[0].officialUrl, limitation: "Use official guidance to check current switching-standard conditions." });
    if (/back.?bill|historical|catch.?up/.test(t)) routes.push({ organisation: "Ofgem", role: "Back-billing rules guidance", status: "Reference Only", officialUrl: sourceByTopic("back billing")[0].officialUrl, limitation: "Back-billing depends on billing history and consumer conduct." });
    if (/priority|vulnerable|medical|disabled|pension|pregnant|child/.test(t)) routes.push({ organisation: "Supplier or network operator", role: "Priority Services Register", status: supplier && supplier.priorityServicesPage ? "Verified" : "Requires Verification", officialUrl: supplier && supplier.priorityServicesPage ? supplier.priorityServicesPage : sourceByTopic("priority services")[0].officialUrl, limitation: "Priority support should be arranged directly with the relevant supplier or network operator." });
    if (/direct debit|payment|bank/.test(t)) routes.push({ organisation: "Pay.UK / bank", role: "Direct Debit Guarantee or payment-provider route", status: "Reference Only", officialUrl: sourceByTopic("direct debit")[0].officialUrl, limitation: "A bank or payment-provider complaint may be separate from the supplier complaint." });
    if (/deadlock|eight weeks|8 weeks|ombudsman|final response/.test(t)) routes.push({ organisation: "Energy Ombudsman", role: "Possible escalation route", status: "Requires Eligibility Check", officialUrl: sourceByTopic("ombudsman escalation")[0].officialUrl, limitation: "Check deadlock, time limits, scope and eligibility before using this route." });
    return routes;
  }

  const faqs = [
    ["Who should I complain to about an energy problem?", "Usually start with the supplier responsible for the account, bill, switch or payment. If the correct supplier is unclear, use Ofgem's supplier finder or check your bill before submitting."],
    ["Can Quaerens submit my energy complaint for me?", "No. This free Complaint Pack helps you organise the facts and wording, but Quaerens does not automatically submit complaints."],
    ["What if I do not know my current supplier?", "Use Ofgem's supplier or network operator guidance, check a recent bill or online account, and record why the supplier is uncertain in your pack."],
    ["What is an erroneous transfer?", "It usually means your supply was switched without your agreement or to the wrong supplier. The old and new supplier roles, dates and correspondence are important evidence."],
    ["Can a delayed switch be complained about?", "Yes, delayed switching can be raised with the relevant supplier. Official guaranteed-standard rules should be checked before relying on any compensation figure."],
    ["What evidence helps with a failed switch?", "Switch confirmations, emails, opening and closing readings, old and new supplier messages, account screenshots and final bills can all help."],
    ["Can I complain about an estimated bill?", "Yes, if the estimate appears unreasonable or was not corrected after you supplied readings. Meter readings, photos and bill history are useful."],
    ["What if my bill is wrong?", "Record the disputed amount, the bill date, meter readings, tariff information and any supplier explanation you have received."],
    ["Can back-billing rules help me?", "They may be relevant where a supplier bills for historic usage. Ofgem's current back-billing guidance should be checked against the facts."],
    ["What if my smart meter is not working?", "Keep meter photos, app screenshots, supplier messages and any engineer notes. The complaint may involve billing, readings or meter performance."],
    ["What if the meter belongs to the wrong property?", "Record the meter serial number, supply address, photos and any supplier or network operator checks. This can be a technical evidence issue."],
    ["Can I challenge a Direct Debit increase?", "You can ask the supplier to explain the calculation. Bill history, usage, tariff, payments and account balance are relevant."],
    ["What if a Direct Debit was taken incorrectly?", "A supplier complaint and a bank or Direct Debit Guarantee route may both need review, depending on what happened."],
    ["Can I complain about a missing credit refund?", "Yes. Keep the final bill, account balance, refund request, payment history and supplier replies."],
    ["What if I have moved home?", "Provide tenancy, completion or moving dates, opening and closing readings, forwarding address records and final bill correspondence."],
    ["What if the supplier has passed the account to debt collection?", "Keep debt letters, bills, payment history and dispute correspondence. Court or enforcement threats may require urgent specialist help."],
    ["Can I use this pack for prepayment meter issues?", "Yes, where the issue is about billing, payments, top-ups, supplier conduct or evidence. Safety and disconnection risks should be handled urgently."],
    ["What is the Priority Services Register?", "It is extra support arranged by suppliers or network operators for eligible customers. Check official Ofgem and supplier guidance."],
    ["When can I go to the Energy Ombudsman?", "Usually after a deadlock letter or if the issue has not been resolved within the relevant period. Eligibility and time limits must be checked."],
    ["Does Ofgem decide my individual complaint?", "Ofgem provides rules and guidance, but individual consumer complaints normally go through the supplier and, where eligible, the Energy Ombudsman."],
    ["What if my supplier has gone bust?", "Ofgem has supplier-of-last-resort guidance. Confirm who now handles your account before sending a complaint."],
    ["Can I include financial loss?", "You can record documented losses, payments, disputed charges and refund requests. Not every amount will be recoverable."],
    ["Should I include emotional distress?", "You can mention inconvenience or impact, but keep the complaint evidence-led and avoid relying only on general dissatisfaction."],
    ["What if I only have screenshots?", "Screenshots can still help. Include dates, account references, message threads and any supporting bills or readings if available."],
    ["Do I need every document before using the builder?", "No. The builder helps identify gaps and missing evidence so you can decide what to gather next."],
    ["Can this help with business energy?", "This page is mainly for consumer-facing issues. Microbusiness or commercial disputes may need separate checks."],
    ["Does the pack guarantee a refund or compensation?", "No. The pack organises information and routes. Outcomes depend on the facts, evidence, rules and supplier or ombudsman response."],
    ["Can I edit the complaint letter?", "Yes. The generated wording is designed to be reviewed and amended before submission."],
    ["Is my complaint sent to Quaerens?", "No automatic submission is made by this free builder. You control what you download, copy, print and send."],
    ["What should I do before submitting?", "Check the supplier, account details, dates, amounts, evidence attachments and official complaint route before sending."]
  ];

  return { verifiedOn, sources, suppliers, findSupplier, sourceByTopic, routeFor, faqs };
});
