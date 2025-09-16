import { db } from './firebase.js';
import { onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { renderProducts, renderManageProduct, renderSalesHistory, renderDailyExpenses, renderCashHistory, renderCustomersList, renderCustomerSelect, renderReservations, renderManageCombos } from './ui.js';
import { updateDailyTotals } from './logic.js';
import { renderSalesChart, renderTopProductsChart, renderPaymentMethodsChart } from './charts.js';

// Colecciones compartidas
export const SHARED_PRODUCTS_COLLECTION = 'products';
export const SHARED_SALES_COLLECTION = 'sales';
export const SHARED_CUSTOMERS_COLLECTION = 'customers';
export const SHARED_PAYMENT_METHODS_COLLECTION = 'paymentMethods';
export const SHARED_EXPENSE_CATEGORIES_COLLECTION = 'expenseCategories';
export const SHARED_EXPENSES_COLLECTION = 'expenses';
export const SHARED_CASH_COLLECTION = 'cajas';
export const SHARED_CASH_HISTORY_COLLECTION = 'cajas_historico';
export const SHARED_PRODUCT_CATEGORIES_COLLECTION = 'productCategories';
export const SHARED_COMBOS_COLLECTION = 'combos';
export const SHARED_RESERVATIONS_COLLECTION = 'reservations';

// Estado global
export let allProducts = [];
export let allSales = [];
export let allReservations = [];
export let allCustomers = [];
export let userPaymentMethods = [];
export let userExpenseCategories = [];
export let productCategories = [];
export let allCombos = [];
export let dailyCashData = null;

export function setupRealtimeListeners(userId) {
    if (!userId) {
        console.error("UserID no disponible, no se pueden configurar los oyentes.");
        return;
    }

    onSnapshot(collection(db, SHARED_PRODUCTS_COLLECTION), (snapshot) => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts(allProducts, allCombos);
        renderManageProduct(allProducts);
    });

    onSnapshot(collection(db, SHARED_SALES_COLLECTION), (snapshot) => {
        allSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSalesHistory(allSales);
        updateDailyTotals();
        renderSalesChart(allSales);
        renderTopProductsChart(allSales);
        renderPaymentMethodsChart(allSales);
    });

    onSnapshot(collection(db, SHARED_CUSTOMERS_COLLECTION), (snapshot) => {
        allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCustomersList(allCustomers);
        renderCustomerSelect(allCustomers);
    });

    onSnapshot(collection(db, SHARED_PAYMENT_METHODS_COLLECTION), (snapshot) => {
        userPaymentMethods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Lógica de renderizado en ui.js
    });

    onSnapshot(collection(db, SHARED_EXPENSE_CATEGORIES_COLLECTION), (snapshot) => {
        userExpenseCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Lógica de renderizado en ui.js
    });

    onSnapshot(collection(db, SHARED_PRODUCT_CATEGORIES_COLLECTION), (snapshot) => {
        productCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Lógica de renderizado en ui.js
    });
    
    onSnapshot(collection(db, SHARED_COMBOS_COLLECTION), (snapshot) => {
        allCombos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts(allProducts, allCombos);
        renderManageCombos(allCombos, allProducts);
    });

    onSnapshot(collection(db, SHARED_EXPENSES_COLLECTION), (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderDailyExpenses(expenses);
        updateDailyTotals();
    });

    const today = new Date().toLocaleDateString('en-CA');
    onSnapshot(doc(db, SHARED_CASH_COLLECTION, today), (doc) => {
        if (doc.exists()) {
            dailyCashData = doc.data();
        } else {
            dailyCashData = null;
        }
    });

    onSnapshot(collection(db, SHARED_CASH_HISTORY_COLLECTION), (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCashHistory(history);
    });

    onSnapshot(collection(db, SHARED_RESERVATIONS_COLLECTION), (snapshot) => {
        allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderReservations(allReservations);
    });
}
