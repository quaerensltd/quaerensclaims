"use strict";
const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const car=path.join(root,"public/car-finance.html");
let html=fs.readFileSync(car,"utf8");
html=html.replace(/\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf[^>]+><\/script>/i,"");
html=html.replace(/\s*<script>\s*\/\/ Time-sensitive configuration[\s\S]*?<\/script>/i,"");
fs.writeFileSync(car,html);
