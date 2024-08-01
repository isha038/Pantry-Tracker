// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {getFirestore} from 'firebase/firestore';
import { getStorage } from "firebase/storage";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqqygo-0SHgUa-gkXoKyw9fWhOuTEu7uI",
  authDomain: "pantryapp-9ee45.firebaseapp.com",
  projectId: "pantryapp-9ee45",
  storageBucket: "pantryapp-9ee45.appspot.com",
  messagingSenderId: "33776115813",
  appId: "1:33776115813:web:9805466b359c593a54268c",
  measurementId: "G-456BWWJRH4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {app, firestore, storage}