"use strict";
const crypto=require("crypto"),fs=require("fs"),path=require("path");
const INFORMATION_BROCHURE=Object.freeze({id:"quaerens-client-information-brochure-en",version:"2026-08-13",filename:"Quaerens-Client-Information-Brochure.pdf",path:path.join(__dirname,"internal-assets","client-information-brochure-en-2026-08-13.pdf"),sha256:"6188112b85b08f495cf6a83485dd4e6fa44b5fe6cd38ae7509468be64351fcf6"});
function verifiedInformationBrochure(HttpsError){let bytes;try{bytes=fs.readFileSync(INFORMATION_BROCHURE.path)}catch(_){throw new HttpsError("failed-precondition","The approved Quaerens Information Brochure is unavailable. No email was sent.")}if(crypto.createHash("sha256").update(bytes).digest("hex")!==INFORMATION_BROCHURE.sha256)throw new HttpsError("failed-precondition","The approved Quaerens Information Brochure could not be verified. No email was sent.");return bytes}
module.exports={INFORMATION_BROCHURE,verifiedInformationBrochure};
