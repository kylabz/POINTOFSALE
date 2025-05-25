// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlANyhFGmHlMf2ePSpIAciNoVXjjKE7O4",
  authDomain: "possystem-765b3.firebaseapp.com",
  projectId: "possystem-765b3",
  storageBucket: "possystem-765b3.firebasestorage.app",
  messagingSenderId: "1065501675137",
  appId: "1:1065501675137:web:4a44b1617452f1c2a0c780",
  measurementId: "G-0N2L6748H5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);