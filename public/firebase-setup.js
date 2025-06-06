// ✅ firebase-setup.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOo_Sa242sUuGyZD8jO8kk12V1aBX7wMA",
  authDomain: "quaerensclaims.firebaseapp.com",
  projectId: "quaerensclaims",
  storageBucket: "quaerensclaims.appspot.com",
  messagingSenderId: "57715464932",
  appId: "1:57715464932:web:a69a4949f36c2ad214eaf1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

window.db = db;
window.storage = storage;
window.firebaseUtils = {
  collection,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};
