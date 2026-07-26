(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFCruiseExcursions = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function review(data) {
    const bookedBy = data.excursionBookedBy || "Not recorded";
    return {
      bookedBy,
      routeNote: /cruise line|package|agent/i.test(bookedBy)
        ? "The excursion may need to be reviewed alongside the cruise line, package organiser or travel agent paperwork."
        : "Independently booked excursions may follow a different complaint route from the cruise booking.",
      caution: "Do not assume liability from the excursion label alone. The booking route, provider terms, safety information and evidence matter."
    };
  }

  return { review };
});

