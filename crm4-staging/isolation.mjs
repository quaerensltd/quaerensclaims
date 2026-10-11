// CRM4 development boundary. No live Firebase configuration is accepted here.
export const PROJECT_ID = 'demo-quaerens-crm4';
export const WORKSPACE_ID = 'CRM4';
export const APP_NAME = 'quaerens-crm4-local';

export function assertLocalEnvironment(location) {
  if (!location || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ||
      !['http:', 'https:'].includes(location.protocol)) {
    throw new Error('CRM4 is emulator-only; production execution is disabled.');
  }
}

// Inject the normal Firebase SDK, not credentials or a pre-existing application.
// Connections are established before any Auth/Firestore/Functions/Storage service
// is returned to application code. Existing CRM2 app instances are never reused.
export function createLocalServices(sdk, location) {
  assertLocalEnvironment(location);
  if (sdk.getApps().some(app => app.name === APP_NAME)) {
    throw new Error('CRM4 services already initialised; reuse the returned services.');
  }
  const app = sdk.initializeApp({
    projectId: PROJECT_ID,
    apiKey: 'demo-emulator-only',
    authDomain: 'localhost',
    storageBucket: `${PROJECT_ID}.appspot.com`
  }, APP_NAME);
  const auth = sdk.getAuth(app);
  sdk.connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  const db = sdk.getFirestore(app);
  sdk.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const functions = sdk.getFunctions(app, 'us-central1');
  sdk.connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  const storage = sdk.getStorage(app);
  sdk.connectStorageEmulator(storage, '127.0.0.1', 9199);
  return Object.freeze({ app, auth, db, functions, storage, workspaceId: WORKSPACE_ID });
}
