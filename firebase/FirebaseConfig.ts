import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyASWBjoavxtHrdkNB58mP8yMOHSzUsLQzE",
  authDomain: "fastfood-a12f3.firebaseapp.com",
  projectId: "fastfood-a12f3",
  storageBucket: "fastfood-a12f3.appspot.com",
  messagingSenderId: "279702711035",
  appId: "1:279702711035:web:226fba659dd2611c8f1e5e",
  measurementId: "G-23G81DBTTB"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

export { app, db, storage, auth };