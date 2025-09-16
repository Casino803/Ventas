import { auth, onAuthStateChanged } from './js/firebase.js';
import { setupRealtimeListeners } from './js/firestore.js';
import { setupNavigation, setupTabNavigation, setupCashTabNavigation, showPage } from './js/ui.js';
import { processPayment, reserveOrder } from './js/logic.js';

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupTabNavigation();
    setupCashTabNavigation();

    onAuthStateChanged(auth, user => {
        if (user) {
            setupRealtimeListeners(user.uid);
            document.getElementById('auth-modal')?.classList.add('hidden');
            showPage('pos-page');
            document.querySelector('.tab-btn[data-page="pos-page"]')?.classList.add('active');
        } else {
            document.getElementById('auth-modal')?.classList.remove('hidden');
            document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
        }
    });

    // Reasigna los listeners a las funciones del nuevo módulo
    document.getElementById('pos-search-input')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Llama a la función de renderizado de UI, que ahora maneja la lógica de filtrado
        // Es necesario importar la función desde el módulo de UI y pasarle los datos
        // Dejando esta lógica en el UI por ahora, pero podría ir a 'logic.js'
    });
    
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        // La lógica del pago está en el módulo logic.js
        processPayment();
    });

    document.getElementById('reserve-btn')?.addEventListener('click', () => {
        // La lógica de reserva está en el módulo logic.js
        reserveOrder();
    });
    
    // Y así sucesivamente con todos los demás listeners que necesites mover
    
});
