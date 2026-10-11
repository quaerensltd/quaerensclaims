(() => {
    if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
    const original = firebase.initializeApp.bind(firebase);
    firebase.initializeApp = () => {
      const app = original({projectId:'demo-quaerens-crm4',apiKey:'demo-emulator-only',authDomain:'localhost',storageBucket:'demo-quaerens-crm4.appspot.com'});
      app.auth().useEmulator('http://127.0.0.1:9099');
      app.functions('us-central1').useEmulator('127.0.0.1',5001);
      app.storage().useEmulator('127.0.0.1',9199);
      return app;
    };
    if (firebase.apps.length) throw new Error('CRM4 compat must connect before application initialisation');
  })();
