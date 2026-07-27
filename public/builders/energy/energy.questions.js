(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFEnergyQuestions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const whatHappenedGroups = [
    {
      id: "switching",
      label: "Supplier switching",
      options: [
        "My switch was delayed",
        "My switch failed",
        "My switch was cancelled unexpectedly",
        "My old supplier blocked or objected to the switch",
        "I was switched without permission",
        "I was moved to the wrong supplier",
        "I was moved to the wrong tariff",
        "My supply start date is wrong",
        "My old supplier is still billing me",
        "Both suppliers are billing me",
        "My opening or closing meter reading is wrong",
        "I did not receive expected switching compensation",
        "Another switching problem"
      ]
    },
    {
      id: "billing",
      label: "Billing",
      options: [
        "My bill is incorrect",
        "My bill is based on estimated readings",
        "The supplier ignored my meter readings",
        "My opening reading is wrong",
        "My closing reading is wrong",
        "The wrong meter is linked to my account",
        "The bill covers the wrong property",
        "I am being billed for the wrong dates",
        "My tariff or unit rate is wrong",
        "My standing charge is wrong",
        "My account balance is wrong",
        "My final bill is wrong",
        "I received a large catch-up bill",
        "I believe back-billing may be relevant",
        "Another billing problem"
      ]
    },
    {
      id: "metering",
      label: "Smart meters and metering",
      options: [
        "My smart meter is not working",
        "My smart meter stopped sending readings",
        "My in-home display is not working",
        "The supplier says my meter is not smart",
        "My smart meter installation was delayed",
        "My meter was installed incorrectly",
        "My meter serial number is wrong",
        "My usage data appears incorrect",
        "My meter was replaced and the readings do not match",
        "My prepayment meter has a problem",
        "My meter is unsafe or damaged",
        "Another meter problem"
      ]
    },
    {
      id: "payments",
      label: "Payments and Direct Debits",
      options: [
        "My Direct Debit is too high",
        "My Direct Debit increased unexpectedly",
        "The supplier took the wrong amount",
        "A payment was taken after the account closed",
        "A payment was duplicated",
        "A payment is missing from my account",
        "I paid but the account was not credited",
        "A refund is overdue",
        "My credit balance has not been returned",
        "I am being asked to repay an incorrect balance",
        "I have been charged a fee I do not understand",
        "Another payment problem"
      ]
    },
    {
      id: "moving",
      label: "Moving home and account closure",
      options: [
        "I moved into a property and inherited a problem",
        "I moved out but bills continued",
        "The account was not closed",
        "A final meter reading was ignored",
        "The final bill was delayed",
        "I am being billed for another person",
        "I am being billed before I became responsible",
        "I am being billed after I stopped being responsible",
        "The supplier cannot identify the correct account holder",
        "Another moving-home problem"
      ]
    },
    {
      id: "tariff",
      label: "Tariff and contract",
      options: [
        "I was put on the wrong tariff",
        "The tariff was not explained clearly",
        "The price changed unexpectedly",
        "The fixed tariff ended incorrectly",
        "I was promised a tariff that was not applied",
        "A discount or credit was not applied",
        "Exit fees were charged",
        "A dual-fuel discount was not applied",
        "My account was split incorrectly",
        "Another tariff problem"
      ]
    },
    {
      id: "support",
      label: "Prepayment and vulnerability",
      options: [
        "My prepayment meter is not working",
        "I cannot top up",
        "Credit was not applied",
        "Emergency credit was not available",
        "Debt was added incorrectly",
        "The supplier changed me to prepayment",
        "I have a vulnerability or health-related support need",
        "Priority Services support was not provided",
        "The supplier did not communicate in an accessible way",
        "Supply was interrupted",
        "Another prepayment or support issue"
      ]
    },
    {
      id: "complaint",
      label: "Complaint handling",
      options: [
        "The supplier ignored my complaint",
        "The supplier has not resolved the complaint",
        "I received a deadlock letter",
        "The supplier's response did not address my evidence",
        "The supplier closed the complaint without agreement",
        "I want to escalate the complaint",
        "I received an Energy Ombudsman decision",
        "The supplier has not implemented an agreed remedy",
        "Another complaint-handling issue"
      ]
    },
    {
      id: "urgent",
      label: "Urgent or high-risk",
      options: [
        "My energy supply has been disconnected",
        "I have received court documents",
        "I received a Letter Before Claim",
        "Enforcement action is threatened",
        "My home may be unsafe because of the meter",
        "There is an immediate risk to a vulnerable person",
        "Another urgent issue"
      ]
    }
  ];

  const outcomes = [
    "Correct the bill",
    "Correct the account balance",
    "Use the correct meter reading",
    "Correct the meter details",
    "Complete the switch",
    "Reverse the erroneous transfer",
    "Close the old account",
    "Issue a correct final bill",
    "Refund the credit balance",
    "Refund an incorrect payment",
    "Return a duplicate payment",
    "Reduce or explain the Direct Debit",
    "Apply the correct tariff",
    "Remove an incorrect exit fee",
    "Remove charges for the wrong period",
    "Provide account records",
    "Provide the bill calculation",
    "Provide meter-reading history",
    "Provide a written explanation",
    "Pay applicable compensation",
    "Pause collection while the complaint is reviewed",
    "Correct credit reporting where relevant",
    "Provide vulnerability support",
    "Apologise",
    "Other"
  ];

  return { whatHappenedGroups, outcomes };
});
