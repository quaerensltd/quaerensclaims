'use strict';
// Volatile capture storage: no Cloud Storage SDK, bucket or credentials.
function createLocalStorage() {
  const objects = new Map();
  return { objects, bucket: () => ({ file(name) {
    if (!/^professional-assessments\/[\w-]+\/versions\/[\w-]+\/(report\.pdf|internal\.docx)$/.test(name)) throw Error('Unapproved synthetic document path');
    return {
      async save(bytes) { objects.set(name, Buffer.from(bytes)); },
      async download() { if (!objects.has(name)) throw Error('Local document missing'); return [Buffer.from(objects.get(name))]; }
    };
  } }) };
}
module.exports = { createLocalStorage };
