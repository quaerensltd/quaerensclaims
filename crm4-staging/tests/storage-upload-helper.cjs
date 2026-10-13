'use strict';
// Firebase SDK-compatible multipart metadata; raw media uploads in the installed
// Storage emulator do not propagate Content-Type into request.resource metadata.
async function uploadSynthetic(base, token, name, contentType = 'text/plain') {
  const boundary = 'crm4-' + require('node:crypto').randomUUID();
  const body = '--' + boundary + '\r\nContent-Type: application/json; charset=utf-8\r\n\r\n' + JSON.stringify({name, contentType}) + '\r\n--' + boundary + '\r\nContent-Type: ' + contentType + '\r\n\r\nSynthetic evidence\r\n--' + boundary + '--\r\n';
  return fetch(base + '?name=' + encodeURIComponent(name), {method:'POST', headers:{Authorization:'Firebase ' + token, 'X-Goog-Upload-Protocol':'multipart', 'Content-Type':'multipart/related; boundary=' + boundary}, body});
}
module.exports = {uploadSynthetic};
