(function () {
  "use strict";
  const freeze = (value) => Object.freeze(value);
  const categories = {
    airbnb: {
      id: "airbnb", metricsId: "airbnb", storageKey: "quaerens-airbnb-complaint-pack-v3",
      product: "Airbnb Complaint Pack", subject: "Airbnb booking", audience: "Airbnb guest",
      baseAmount: "bookingPrice", refundAmount: "refundReceived", outstandingAmount: "refundOutstanding",
      timeline: ["Booking", "Host communication", "Airbnb communication", "Property issue", "Payment", "Refund", "Other"],
      evidence: [["booking","Booking confirmation","Airbnb reservation details and payment confirmation"],["listing","Listing screenshots","Photos, description, amenities, location and cancellation terms"],["host","Host messages","The complete dated conversation with the host"],["airbnb","Airbnb support replies","Case references, decisions and escalation replies"],["photos","Dated photos or videos","Condition, safety, access or missing-facility evidence"],["receipts","Receipts for additional costs","Alternative stay, travel or other evidenced losses"],["payment","Payment or refund records","Card statement, refund receipt or transaction evidence"]]
    },
    section75: {
      id: "section75", metricsId: "section75", storageKey: "quaerens-section75-complaint-pack-v1",
      product: "Free Section 75 Complaint Pack", subject: "Section 75 purchase", audience: "cardholder",
      baseAmount: "purchasePrice", refundAmount: "refundReceived", outstandingAmount: "outstandingAmount",
      timeline: ["Purchase", "Supplier communication", "Card provider communication", "Problem discovered", "Complaint", "Final response", "Financial loss", "Other"],
      evidence: [["statement","Credit card statement","The statement showing the card payment to the supplier"],["invoice","Purchase invoice","The supplier invoice identifying the goods or services and cash price"],["receipt","Receipt or order confirmation","The purchase receipt, order confirmation or deposit record"],["contract","Contract","The signed agreement or contract governing the purchase"],["terms","Terms and Conditions","The terms supplied at the time of purchase"],["correspondence","Supplier correspondence","Emails, letters or messages showing what was promised and what happened"],["complaint","Complaint correspondence","The complaint sent to the supplier or card provider and any acknowledgements"],["final","Final response","The card provider's final response, rejection or other substantive decision"],["expert","Expert reports","Independent technical findings where the condition or performance is disputed"],["photos","Photographs","Dated images showing faults, damage, non-conformity or incomplete work"],["quotes","Independent quotations","Repair or replacement quotations supporting the financial schedule"]]
    },
    holiday: {
      id: "holiday", metricsId: "holiday-compensation", storageKey: "quaerens-holiday-complaint-pack-v1",
      product: "Free Holiday Compensation Complaint Pack", subject: "holiday booking", audience: "holiday customer",
      baseAmount: "holidayPrice", refundAmount: "refundReceived", outstandingAmount: "outstandingAmount",
      timeline: ["Booking", "Pre-travel change", "Accommodation", "Flight", "Transfer", "Excursion", "Illness", "Supplier communication", "Complaint", "Refund", "Financial loss", "Other"],
      evidence: [["booking","Booking confirmation","The booking confirmation showing the organiser, dates, travellers and services"],["invoice","Invoice","The invoice and payment schedule for the holiday"],["atol","ATOL certificate","The ATOL certificate where one was issued"],["abta","ABTA booking record","ABTA membership or booking details where relevant"],["brochure","Holiday brochure or listing","The brochure, listing or description showing what was promised"],["screenshots","Website screenshots","Dated screenshots of facilities, room type, itinerary or refund terms"],["photos","Photographs","Dated photographs showing accommodation, cleanliness, safety or missing facilities"],["videos","Videos","Dated video evidence showing the reported problem"],["medical","Medical records","Medical evidence where illness, injury or food poisoning is relevant"],["receipts","Receipts","Receipts for alternative accommodation, travel, food, medical or other costs"],["alternative","Alternative accommodation records","Confirmation and payment evidence for replacement accommodation"],["transfers","Transfer receipts","Receipts and booking records for replacement or disrupted transfers"],["correspondence","Correspondence","Emails, messages and complaint records with the organiser or supplier"],["refund","Refund requests","Dated refund requests and proof of submission"],["responses","Supplier responses","Acknowledgements, decisions, offers and final responses"],["independent","Independent reports","Independent inspection, witness or specialist reports where relevant"]]
    },
    flight: {
      id: "flight", metricsId: "flight-claim", storageKey: "quaerens-flight-complaint-pack-v1",
      product: "Free Flight Claim Complaint Pack", subject: "flight disruption", audience: "passenger",
      baseAmount: "possibleCompensation", refundAmount: "refundReceived", outstandingAmount: "", deductRefund: false,
      timeline: ["Booking", "Departure", "Delay", "Cancellation", "Denied boarding", "Missed connection", "Airline communication", "Expense", "Complaint", "Response", "Other"],
      evidence: [["boarding","Boarding pass","Boarding pass or mobile boarding credential"],["booking","Booking confirmation","Booking confirmation showing passenger, route and flight number"],["delay","Flight delay notice","Airline or airport notice confirming disruption"],["cancellation","Cancellation notice","Dated cancellation notice and reason provided"],["emails","Airline emails","Messages, app notifications and complaint correspondence"],["screens","Airport screens","Dated photographs or screenshots of airport information"],["photos","Photographs","Relevant photographs documenting the disruption"],["receipts","Receipts","Receipts for reasonable meals, transport and communications"],["alternative","Alternative travel","Replacement flight, rail or other travel records"],["hotel","Hotel costs","Hotel invoice and payment evidence"],["meals","Meals","Itemised meal and refreshment receipts"],["transport","Transport","Taxi, transfer or public-transport receipts"],["correspondence","Correspondence","Complaint, acknowledgement, decision and ADR correspondence"]]
    },
    baggage: {
      id: "baggage", metricsId: "lost-luggage", storageKey: "quaerens-lost-luggage-complaint-pack-v1",
      product: "Free Lost Luggage Compensation Complaint Pack", subject: "baggage disruption", audience: "passenger",
      baseAmount: "amountRequested", refundAmount: "paymentsReceived", outstandingAmount: "outstandingAmount", deductRefund: true,
      timeline: ["Booking", "Check-in", "Arrival", "Airport report", "Baggage tracing", "Airline communication", "Delivery", "Expense", "Insurance", "Complaint", "Response", "Other"],
      evidence: [["booking","Booking confirmation","Booking confirmation showing passenger, route and flight details"],["boarding","Boarding pass","Boarding pass or other proof that the passenger travelled"],["bagTag","Baggage tag","Checked-baggage tag or bag receipt"],["pir","Property Irregularity Report","PIR or written airport baggage report and reference"],["tracking","Baggage tracing record","WorldTracer or airline tracking reference and updates"],["photos","Photographs or video","Dated images of the bag, damage, tampering or affected contents"],["receipts","Receipts and proof of value","Essential purchases, repairs, replacements and proof of ownership or value"],["messages","Airline correspondence","Complaint, acknowledgement, tracing updates, offers and decisions"],["delivery","Delivery confirmation","Baggage return date, delivery record and condition on return"],["insurance","Travel insurance records","Policy, claim, payment, excess and insurer correspondence"],["police","Police report","Report where theft or missing contents made this appropriate"],["mobility","Mobility or medical evidence","Records supporting accessibility, mobility or medical impact"]]
    }
  };
  Object.values(categories).forEach((category) => { freeze(category.timeline); freeze(category.evidence); freeze(category); });
  window.QCBFrameworkACategories = freeze({ version: "1.5", categories: freeze(categories), get(id) { return categories[id] || null; } });
}());
