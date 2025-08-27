// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc",
    authDomain: "ventas-casino.firebaseapp.com",
    projectId: "ventas-casino",
    storageBucket: "ventas-casino.firebasestorage.app",
    messagingSenderId: "683247450522",
    appId: "1:683247450522:web:87a57e190d2c252d0a6223",
    measurementId: "G-XYG0ZNEQ61"
};

const appId = firebaseConfig.appId;
const initialAuthToken = null; // No es necesario para GitHub Pages

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar los objetos para que puedan ser usados en otros archivos
export { app, auth, db, appId, initialAuthToken };
