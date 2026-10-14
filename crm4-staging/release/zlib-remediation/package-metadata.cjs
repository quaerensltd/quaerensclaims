'use strict';
const fs=require('fs'),cp=require('child_process'),crypto=require('crypto');const lock=require('./inputs.lock.json');
const root='/out/package',lib=root+'/usr/lib/x86_64-linux-gnu';fs.mkdirSync(lib,{recursive:true});fs.mkdirSync(root+'/DEBIAN');
fs.copyFileSync('/out/system/lib/libz.so.1.3.1',lib+'/libz.so.1.3.1');fs.symlinkSync('libz.so.1.3.1',lib+'/libz.so.1');
const original=fs.readFileSync('/recipe/original-package-control.txt','utf8');
const control=original.replace(/^Source:.*$/m,'Source: zlib ('+lock.systemPackageVersion+')').replace(/^Version:.*$/m,'Version: '+lock.systemPackageVersion).replace(/^Maintainer:.*$/m,'Maintainer: Quaerens CRM4 local security backport <info@quaerens.co.uk>').replace(/^Installed-Size:.*\n/m,'');
const sum=crypto.createHash('md5').update(fs.readFileSync(lib+'/libz.so.1.3.1')).digest('hex')+'  usr/lib/x86_64-linux-gnu/libz.so.1.3.1\n';
fs.writeFileSync(root+'/DEBIAN/control',control);fs.writeFileSync(root+'/DEBIAN/md5sums',sum);
cp.execFileSync('dpkg-deb',['--root-owner-group','--build',root,'/out/evidence/zlib1g-crm4.deb'],{stdio:'inherit'});
fs.mkdirSync('/out/status',{recursive:true});fs.writeFileSync('/out/status/zlib1g',control);fs.writeFileSync('/out/status/zlib1g.md5sums',sum);
fs.copyFileSync('/recipe/inputs.lock.json','/out/evidence/inputs.lock.json');

const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');fs.writeFileSync('/out/evidence/runtime-hashes.json',JSON.stringify({node:sha('/out/node/node'),systemZlib:sha(lib+'/libz.so.1.3.1'),customPackageVersion:lock.systemPackageVersion},null,2)+'\n');
