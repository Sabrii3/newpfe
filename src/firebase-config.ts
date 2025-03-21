// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAZn0_c-vPZMzUOgpp0gjA1ufdqgAys5sw",
  authDomain: "test-96320.firebaseapp.com",
  databaseURL: "https://test-96320-default-rtdb.firebaseio.com",
  projectId: "test-96320",
  storageBucket: "test-96320.firebasestorage.app",
  messagingSenderId: "586217875645",
  appId: "1:586217875645:web:ad348ec3e7a2b481b52fd4",
  measurementId: "G-QQ9ZE30NHH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const apiUrl = "http://localhost:1010/";
export {app,apiUrl};