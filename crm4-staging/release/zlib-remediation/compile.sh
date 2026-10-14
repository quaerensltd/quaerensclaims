#!/usr/bin/env bash
set -euo pipefail
# Validation only: compile within disposable Linux container, no cloud CLI or push.
export TZ=UTC LC_ALL=C SOURCE_DATE_EPOCH=1791936000
ulimit -c 0
cd /work
command -v cc; command -v c++; command -v make; command -v python3
node /recipe/prepare-sources.cjs /work/sources > /work/receipt.json
src=$(node -p 'require("/work/receipt.json").output')
mkdir -p /out/system /out/node /out/evidence
cp /work/receipt.json /out/evidence/patch-receipt.json
cd "$src/system"
./configure --prefix=/out/system
make -j2
make check
make install
cc -I. /recipe/gzwrite-regression.c -L/out/system/lib -Wl,-rpath,/out/system/lib -lz -ldl -o /out/evidence/system-regression
/out/evidence/system-regression
cd "$src/node"
./configure --prefix=/out/node
make -j2
# Keep the existing Node 22 version and default static bundled zlib; no --shared-zlib.
cp out/Release/node /out/node/node
cc -shared -fPIC -DNODE_ADDON -DNODE_GYP_MODULE_NAME=crm4_zlib -I src -I deps/zlib /recipe/gzwrite-regression.c -ldl -o /out/evidence/gzwrite.node
/out/node/node -e 'const assert=require("node:assert/strict");const p=require("/out/evidence/gzwrite.node").verify();assert.equal(p,process.execPath);const z=require("node:zlib");const b=Buffer.from("CRM4 synthetic compression");assert.deepEqual(z.gunzipSync(z.gzipSync(b)),b);console.log(JSON.stringify({embeddedZlib:"PASS",provider:p,versions:process.versions}));'
readelf -d /out/node/node > /out/evidence/node-dynamic.txt
# Static bundled zlib must remain present; fail if configure unexpectedly links system zlib.
if grep -q 'Shared library: \[libz.so' /out/evidence/node-dynamic.txt; then exit 1; fi
sha256sum /out/node/node /out/system/lib/libz.so.1.3.1 > /out/evidence/binary-sha256.txt
cat /out/evidence/binary-sha256.txt

node /recipe/package-metadata.cjs
