import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs_cDiTsdB1caD6-yz9Zcxp8fpdPCYuig",
  authDomain: "tetris-multiplayer-urv.firebaseapp.com",
  databaseURL: "https://tetris-multiplayer-urv-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tetris-multiplayer-urv",
  storageBucket: "tetris-multiplayer-urv.firebasestorage.app",
  messagingSenderId: "281342732962",
  appId: "1:281342732962:web:69e2c674161895086d45fb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
export const db = getDatabase(app);
