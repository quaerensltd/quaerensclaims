import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOo_Sa242sUuGyZD8jO8kk12V1aBX7wMA",
  authDomain: "quaerensclaims.firebaseapp.com",
  projectId: "quaerensclaims",
  storageBucket: "quaerensclaims.appspot.com",
  messagingSenderId: "57715464932",
  appId: "1:57715464932:web:a69a4949f36c2ad214eaf1",
  measurementId: "G-GRT3XKF4KS"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);

window.firestore = firestore;
window.storage = storage;
window.firebaseUtils = {
  collection,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};
