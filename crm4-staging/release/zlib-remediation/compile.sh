#!/usr/bin/env bash
set -euo pipefail
# Validation only: compile within disposable Linux container, no cloud CLI or push.
export TZ=UTC LC_ALL=C SOURCE_DATE_EPOCH=1791936000
ulimit -c 0
cd /work
mkdir -p /out/evidence
source /recipe/diagnostics.sh
phase sources node /recipe/prepare-sources.cjs /work/sources
cp /out/evidence/sources.log /work/receipt.json
command -v cc; command -v c++; command -v make; command -v python3
src=$(node -p 'require("/work/receipt.json").output')
mkdir -p /out/system /out/node /out/evidence
cp /work/receipt.json /out/evidence/patch-receipt.json
cd "$src/system"
phase system-configure ./configure --prefix=/out/system
phase system-compile make -s -j4
phase system-check make check
phase system-install make install
cc -I. /recipe/gzwrite-regression.c -L/out/system/lib -Wl,-rpath,/out/system/lib -lz -ldl -o /out/evidence/system-regression
/out/evidence/system-regression
cd "$src/node"
phase node-configure ./configure --prefix=/out/node
phase node-compile make -s -j4
# Keep the existing Node 22 version and default static bundled zlib; no --shared-zlib.
test -x out/Release/node
cp out/Release/node /out/node/node
cc -shared -fPIC -DNODE_ADDON -DNODE_GYP_MODULE_NAME=crm4_zlib -I src -I deps/zlib /recipe/gzwrite-regression.c -ldl -o /out/evidence/gzwrite.node
/out/node/node -e 'const assert=require("node:assert/strict");const p=require("/out/evidence/gzwrite.node").verify();assert.equal(p,process.execPath);const z=require("node:zlib");const b=Buffer.from("CRM4 synthetic compression");assert.deepEqual(z.gunzipSync(z.gzipSync(b)),b);console.log(JSON.stringify({embeddedZlib:"PASS",provider:p,versions:process.versions}));'
readelf -d /out/node/node > /out/evidence/node-dynamic.txt
# Static bundled zlib must remain present; fail if configure unexpectedly links system zlib.
if grep -q 'Shared library: \[libz.so' /out/evidence/node-dynamic.txt; then exit 1; fi
sha256sum /out/node/node /out/system/lib/libz.so.1.3.1 > /out/evidence/binary-sha256.txt
cat /out/evidence/binary-sha256.txt

node /recipe/package-metadata.cjs

printf "PASS\n" > /out/evidence/native-success
