// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-2_M40uDNKFwS9U2Nv8yz8I2OQDM1ybo",
  authDomain: "web-project-11a59.firebaseapp.com",
  projectId: "web-project-11a59",
  storageBucket: "web-project-11a59.firebasestorage.app",
  messagingSenderId: "1051540308060",
  appId: "1:1051540308060:web:7beeda3b7ecedc5b38a699",
  measurementId: "G-GCS01R939H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

