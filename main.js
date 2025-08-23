// main.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { handleLogin, handleLogout, onAuthChange } from "./auth.js";
import { checkCashierStatus, openCashier, closeCashier, confirmCloseCashier, renderMenu, renderCart, placeOrder, listenForOrders, renderProducts, saveProduct, listenForProducts, deleteItem, listenForExpenses, addExpense, loadStats } from "./firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc",
    authDomain: "ventas-casino.firebaseapp.com",
    projectId: "ventas-casino",
    storageBucket: "ventas-casino.firebasestorage.app",
    messagingSenderId: "683247450522",
    appId: "1:683247450522:web:87a57e190d2c252d0a6223",
    measurementId: "G-XYG0ZNEQ61"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = firebaseConfig.projectId;

// Elementos de la UI
const loginView = document.getElementById('authView');
const mainAppView = document.getElementById('mainAppView');
const navBtns = {
    pos: document.getElementById('posNavBtn'),
    products: document.getElementById('productsNavBtn'),
    expenses: document.getElementById('expensesNavBtn'),
    stats: document.getElementById('statsNavBtn')
};
const logoutBtn = document.getElementById('logoutBtn');
const authBtn = document.getElementById('authBtn');
const toggleAuthBtn = document.getElementById('toggleAuthBtn');
const openCashierBtn = document.getElementById('openCashierBtn');
const closeCashierBtn = document.getElementById('closeCashierBtn');
const confirmCloseBtn = document.getElementById('confirmCloseBtn');
const cancelCloseBtn = document.getElementById('cancelCloseBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

let isRegistering = false;

// Manejador del estado de autenticación
onAuthStateChanged(auth, user => {
    onAuthChange(user);
});

// Cambiar entre vistas de Login y Registro
toggleAuthBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    const authTitle = document.getElementById('authTitle');
    authTitle.textContent = isRegistering ? 'Registrarse' : 'Iniciar Sesión';
    toggleAuthBtn.textContent = isRegistering ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes una cuenta? Regístrate';
    authBtn.textContent = isRegistering ? 'Registrarse' : 'Iniciar Sesión';
});

// Asignar eventos de la UI
authBtn.addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    if (isRegistering) {
        handleRegistration(email, password);
    } else {
        handleLogin(email, password);
    }
});

logoutBtn.addEventListener('click', handleLogout);
navBtns.pos.addEventListener('click', () => showView('pos'));
navBtns.products.addEventListener('click', () => showView('products'));
navBtns.expenses.addEventListener('click', () => showView('expenses'));
navBtns.stats.addEventListener('click', () => showView('stats'));
openCashierBtn.addEventListener('click', openCashier);
closeCashierBtn.addEventListener('click', closeCashier);
confirmCloseBtn.addEventListener('click', confirmCloseCashier);
cancelCloseBtn.addEventListener('click', () => hideModal(document.getElementById('closeCashierModal')));
checkoutBtn.addEventListener('click', placeOrder);
closeModalBtn.addEventListener('click', () => hideModal(document.getElementById('confirmationModal')));
saveProductBtn.addEventListener('click', saveProduct);
addExpenseBtn.addEventListener('click', addExpense);
confirmDeleteBtn.addEventListener('click', deleteItem);
cancelDeleteBtn.addEventListener('click', () => hideModal(document.getElementById('deleteModal')));

// Funciones de la UI
export const showView = (viewName) => {
    const views = {
        pos: document.getElementById('posView'),
        products: document.getElementById('productsView'),
        expenses: document.getElementById('expensesView'),
        stats: document.getElementById('statsView')
    };
    Object.keys(views).forEach(key => {
        views[key].style.display = 'none';
        navBtns[key].classList.remove('bg-gray-200');
        navBtns[key].classList.add('bg-white', 'hover:bg-gray-100');
    });
    views[viewName].style.display = 'block';
    navBtns[viewName].classList.remove('bg-white', 'hover:bg-gray-100');
    navBtns[viewName].classList.add('bg-gray-200');

    // Cargar datos específicos de la vista
    if (viewName === 'pos') {
        checkCashierStatus();
    } else if (viewName === 'products') {
        listenForProducts();
    } else if (viewName === 'expenses') {
        listenForExpenses();
    } else if (viewName === 'stats') {
        loadStats();
    }
};

export const showMainApp = () => {
    loginView.style.display = 'none';
    mainAppView.style.display = 'flex';
    showView('pos');
};

export const showAuthView = () => {
    loginView.style.display = 'flex';
    mainAppView.style.display = 'none';
};

export const showModal = (modal, message) => {
    document.getElementById('modalMessage').textContent = message;
    modal.classList.remove('hidden');
};

export const hideModal = (modal) => {
    modal.classList.add('hidden');
};
