"use strict";
const quantification=require("./financialQuantification");
const AUTHORITY=Object.freeze({GOVERNED_QUANTIFICATION_V1:"GOVERNED_QUANTIFICATION_V1",SAFETY_COMPARATOR_FAILURE:"SAFETY_COMPARATOR_FAILURE"});
const CATEGORY_ENV=Object.freeze({solar:"QUAERENS_CORE_UK_SOLAR_MODE","nl-solar":"QUAERENS_CORE_NL_SOLAR_MODE","spray-foam":"QUAERENS_CORE_SPRAY_FOAM_MODE"});
const CATEGORY_STATE_COLLECTION="quaerensCoreAuthorityCategoryState";
// Compatibility surface only: no environment setting may disable quantification.
function configuredMode(){return AUTHORITY.GOVERNED_QUANTIFICATION_V1;}
function validateRange(range,category){
 if(!range){const e=Error("Financial authority result is required");e.code=AUTHORITY.SAFETY_COMPARATOR_FAILURE;throw e;}
 const decision=quantification.validateStored(range.quantification);
 if(category&&decision.category!==category)throw Error("FINANCIAL_QUANTIFICATION: Category mismatch");
 if(range.lower?.amount!==(decision.scenarios[0]?.amount??null)||range.upper?.amount!==(decision.scenarios[1]?.amount??null))throw Error("FINANCIAL_QUANTIFICATION: Endpoint override rejected");
 return range;
}
function coreToCanonicalRange(){throw Error("FINANCIAL_QUANTIFICATION: Arithmetic-only Core conversion is not a governed scenario");}
async function selectFinancialRangeAuthority({category,legacyResult}){
 validateRange(legacyResult,category);
 // No comparator fallback, remote access or database write can restore an
 // unsupported purchase/finance/arithmetic endpoint.
 return Object.freeze({canonicalResult:legacyResult,authorityCode:AUTHORITY.GOVERNED_QUANTIFICATION_V1,recordPromise:Promise.resolve()});
}
function applyFinancialRangeAuthority(projection,selection){
 if(!projection||!selection)throw Error("Financial authority requires a projection and selection");
 return Object.freeze({...projection,financial_assessment_range:validateRange(selection.canonicalResult)});
}
module.exports={AUTHORITY,CATEGORY_ENV,CATEGORY_STATE_COLLECTION,configuredMode,coreToCanonicalRange,selectFinancialRangeAuthority,applyFinancialRangeAuthority};
