import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
} from "firebase/auth";
// Optionally import the services that you want to useimport {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC26UrDW16v4lioyrK6MkmFRrbwYVgdaKk",
  authDomain: "chat-ramue.firebaseapp.com",
  databaseURL: "https://chat-ramue.firebaseio.com",
  projectId: "chat-ramue",
  storageBucket: "chat-ramue.appspot.com",
  messagingSenderId: "1069201209353",
  appId: "1:1069201209353:web:3d052da12496e9ce99a0d8",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

