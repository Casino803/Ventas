// auth.js

import { auth, showMainApp, showAuthView } from "./main.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { showModal } from "./main.js";

const authMessageEl = document.getElementById('authMessage');

export const onAuthChange = (user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        authMessageEl.classList.add('hidden');
        showMainApp();
    } else {
        console.log("Usuario no autenticado");
        showAuthView();
    }
};

export const handleRegistration = async (email, password) => {
    authMessageEl.classList.add('hidden');
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Registro exitoso");
    } catch (error) {
        console.error("Error de registro:", error);
        authMessageEl.textContent = `Error: ${error.message}`;
        authMessageEl.classList.remove('hidden');
    }
};

export const handleLogin = async (email, password) => {
    authMessageEl.classList.add('hidden');
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Inicio de sesión exitoso");
    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        authMessageEl.textContent = `Error: ${error.message}`;
        authMessageEl.classList.remove('hidden');
    }
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
        console.log("Sesión cerrada");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};
