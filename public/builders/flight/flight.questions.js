"use strict";

module.exports = {
  multiValueFields: ["issues", "careProvided"],
  requiredFields: ["passengerName", "passengerCount", "airline", "flightNumber", "flightDate", "departureAirport", "finalDestination"],
  autocompleteFields: ["airline", "operatingAirline", "departureAirport", "finalDestination", "connectingAirport", "countryDeparture", "countryDestination"]
};
