import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp, updateDoc, query, where, getDocs, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias de la UI (variables globales)
const menuButtons = document.querySelectorAll('button[data-page]');
const pages = document.querySelectorAll('.page-content');
const homeMenu = document.getElementById('home-menu');
const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
const posSearchInput = document.getElementById('pos-search-input');
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const cartTotalSpan = document.getElementById('cart-total');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const discountSurchargeDisplay = document.getElementById('discount-surcharge-display');
const discountSurchargeAmountSpan = document.getElementById('discount-surcharge-amount');
const discountSurchargeValueInput = document.getElementById('discount-surcharge-value');
const discountSurchargeTypeSelect = document.getElementById('discount-surcharge-type');
const applyDiscountSurchargeBtn = document.getElementById('apply-discount-surcharge-btn');
const clearDiscountSurchargeBtn = document.getElementById('clear-discount-surcharge-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const productForm = document.getElementById('product-form');
const manageProductsContainer = document.getElementById('manage-products-container');
const salesHistoryContainer = document.getElementById('sales-history-container');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const filterProduct = document.getElementById('filter-product');
const filterPaymentMethod = document.getElementById('filter-payment-method');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const customersListContainer = document.getElementById('customers-list-container');
const customerSelect = document.getElementById('customer-select');
const addCustomerForm = document.getElementById('add-customer-form');
const logoutBtn = document.getElementById('logout-btn');
const toggleProductFormBtn = document.getElementById('toggle-product-form-btn');
const productFormContainer = document.getElementById('product-form-container');
const toggleExpenseFormBtn = document.getElementById('toggle-expense-form-btn');
const expenseFormContainer = document.getElementById('expense-form-container');
const toggleCustomerFormBtn = document.getElementById('toggle-customer-form-btn');
const customerFormContainer = document.getElementById('customer-form-container');
const reserveBtn = document.getElementById('reserve-btn'); // NUEVO: Botón de reservar
const reservationsListContainer = document.getElementById('reservations-list-container'); // NUEVO: Contenedor para reservaciones


// Referencias de la página de caja
const cashStatusText = document.getElementById('cash-status-text');
const currentCashDisplay = document.getElementById('current-cash-display');
const openCashForm = document.getElementById('open-cash-form');
const expenseSection = document.getElementById('expense-section');
const expenseSeparator = document.getElementById('expense-separator');
const expenseForm = document.getElementById('expense-form');
const dailyExpensesContainer = document.getElementById('daily-expenses-container');
const closeCashBtn = document.getElementById('close-cash-btn');
const closeSeparator = document.getElementById('close-separator');
const expenseCategorySelect = document.getElementById('expense-category-select');
const cashHistoryContainer = document.getElementById('cash-history-container');
const cashStatsSection = document.getElementById('cash-stats');
const statsTotalSales = document.getElementById('stats-total-sales');
const statsSalesCount = document.getElementById('stats-sales-count');
const statsTotalExpenses = document.getElementById('stats-total-expenses');
const statsCashSales = document.getElementById('stats-cash-sales');
const statsOtherSales = document.getElementById('stats-other-sales');
const paymentStatsContainer = document.getElementById('payment-stats-container');

// Referencias del modal de pago múltiple
const splitPaymentModal = document.getElementById('split-payment-modal');
const paymentTotalDisplay = document.getElementById('payment-total-display');
const paymentInputsContainer = document.getElementById('payment-inputs-container');
const addPaymentInputBtn = document.getElementById('add-payment-input-btn');
const paymentRemainingDisplay = document.getElementById('payment-remaining-display');
const cancelSplitBtn = document.getElementById('cancel-split-btn');
const processPaymentBtn = document.getElementById('process-payment-btn');

// Referencias del importador y exportador
const importSalesBtn = document.getElementById('import-sales-btn');
const importSalesInput = document.getElementById('import-sales-input');
const exportSalesBtn = document.getElementById('export-sales-btn');
const salesChartCtx = document.getElementById('salesChart')?.getContext('2d');
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
const filtersContainer = document.getElementById('filters-container');

// Referencias de la nueva página de estadísticas
const topProductsChartCtx = document.getElementById('topProductsChart')?.getContext('2d');
const paymentMethodsChartCtx = document.getElementById('paymentMethodsChart')?.getContext('2d');

// Referencias del modal de autenticación
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Referencias de la nueva página de configuración
const addPaymentMethodForm = document.getElementById('add-payment-method-form');
const newPaymentMethodName = document.getElementById('new-payment-method-name');
const paymentMethodsList = document.getElementById('payment-methods-list');
const addExpenseCategoryForm = document.getElementById('add-expense-category-form');
const newExpenseCategoryName = document.getElementById('new-expense-category-name');
const expenseCategoriesList = document.getElementById('expense-categories-list');
const tabButtons = document.querySelectorAll('.tab-btn');

// Nuevas referencias para categorías de productos
const addProductCategoryForm = document.getElementById('add-product-category-form');
const newProductCategoryName = document.getElementById('new-product-category-name');
const productCategoriesList = document.getElementById('product-categories-list');
const productCategoryInput = document.getElementById('product-category-input');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');

// NUEVAS REFERENCIAS PARA COMBOS
const showComboFormBtn = document.getElementById('show-combo-form-btn');
const addComboForm = document.getElementById('add-combo-form');
const comboNameInput = document.getElementById('combo-name-input');
const comboPriceInput = document.getElementById('combo-price-input');
const comboProductsContainer = document.getElementById('combo-products-container');
const addComboProductBtn = document.getElementById('add-combo-product-btn');
const promotionsList = document.getElementById('promotions-list');
const comboIdInput = document.getElementById('combo-id');


let salesChart;
let topProductsChart;
let paymentMethodsChart;
let userId = '';
let cart = [];
let allProducts = [];
let allSales = [];
let allReservations = []; // NUEVO: Estado global para las reservaciones
let dailyCashData = null;
let dailySalesTotal = 0;
let dailyExpensesTotal = 0;
let allCustomers = [];
let isProcessingPayment = false;
let currentDiscountSurcharge = {
    value: 0,
    type: null // 'percentage_discount', 'fixed_discount', 'percentage_surcharge', 'fixed_surcharge'
};
let currentReservationToProcess = null; // NUEVO: Para guardar la reservación a facturar


let allCombos = [];


// Ahora estas colecciones son globales
const SHARED_PRODUCTS_COLLECTION = 'products';
const SHARED_SALES_COLLECTION = 'sales';
const SHARED_CUSTOMERS_COLLECTION = 'customers';
const SHARED_PAYMENT_METHODS_COLLECTION = 'paymentMethods';
const SHARED_EXPENSE_CATEGORIES_COLLECTION = 'expenseCategories';
// NUEVAS COLECCIONES COMPARTIDAS
const SHARED_EXPENSES_COLLECTION = 'expenses';
const SHARED_CASH_COLLECTION = 'cajas';
const SHARED_CASH_HISTORY_COLLECTION = 'cajas_historico';
const SHARED_PRODUCT_CATEGORIES_COLLECTION = 'productCategories';
const SHARED_COMBOS_COLLECTION = 'combos';
const SHARED_RESERVATIONS_COLLECTION = 'reservations'; // NUEVO: Colección para pedidos reservados


const defaultPaymentMethods = ["Efectivo", "Transferencia MP"];
let userPaymentMethods = [];

const defaultExpenseCategories = ["General", "Suministros", "Servicios"];
let userExpenseCategories = [];

// Nuevo estado global para las categorías de productos
let productCategories = [];

function showModal(message) {
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        if (modal) modal.classList.add('hidden');
    });
}

function showConfirmationModal(message, onConfirm, onCancel) {
    if (confirmationModal && confirmationMessage && confirmYesBtn && confirmNoBtn) {
        confirmationMessage.textContent = message;
        confirmationModal.classList.remove('hidden');

        const handleYes = () => {
            onConfirm();
            confirmationModal.classList.add('hidden');
            confirmYesBtn.removeEventListener('click', handleYes);
            confirmNoBtn.removeEventListener('click', handleNo);
        };

        const handleNo = () => {
            onCancel();
            confirmationModal.classList.add('hidden');
            confirmYesBtn.removeEventListener('click', handleYes);
            confirmNoBtn.removeEventListener('click', handleNo);
        };

        confirmYesBtn.addEventListener('click', handleYes);
        confirmNoBtn.addEventListener('click', handleNo);
    }
}

// Hacemos que la función showPage sea global para que pueda ser llamada desde cualquier lugar
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.add('active');
    }
}

function showHomeMenu() {
    pages.forEach(page => page.classList.remove('active'));
    if (homeMenu) homeMenu.classList.add('active');
}

function setupNavigation() {
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;
            // Manejar la lógica de pestañas si el botón no es del menú principal
            if (!btn.classList.contains('tab-btn')) {
                // Desactivar la pestaña activa
                document.querySelector('.tab-btn.active')?.classList.remove('active');
                showPage(targetPageId);
            }
        });
    });

    backToMenuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showHomeMenu();
        });
    });
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;
            // Desactivar la pestaña activa
            document.querySelector('.tab-btn.active')?.classList.remove('active');
            // Activar la pestaña clicada
            btn.classList.add('active');
            // Mostrar la página correspondiente
            showPage(targetPageId);
        });
    });
}

function setupCashTabNavigation() {
    const cashTabButtons = document.querySelectorAll('.cash-tab-btn');
    const cashTabPages = document.querySelectorAll('.cash-tab-page');

    cashTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;

            cashTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cashTabPages.forEach(p => p.classList.remove('active'));
            document.getElementById(targetPageId)?.classList.add('active');
        });
    });
}


if (posSearchInput) {
    posSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
}

function renderProducts(products) {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';
    
    // Renderizar productos
    products.forEach(product => {
        renderProductCard(product);
    });
    
    // Renderizar combos
    allCombos.forEach(combo => {
        renderComboCard(combo);
    });
}

// NUEVAS FUNCIONES PARA COMBOS
function renderComboCard(combo) {
    if (!productsContainer) return;
    const card = document.createElement('div');
    card.className = "bg-orange-50 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center transition-transform hover:scale-105 duration-300 border-2 border-orange-400";
    card.innerHTML = `
        <h3 class="font-bold text-gray-800 text-lg mb-2">${combo.name}</h3>
        <p class="text-xl font-bold text-orange-600">$${combo.price.toFixed(2)}</p>
        <p class="text-xs text-gray-500 mt-1">Combo de productos</p>
        <button data-combo-id="${combo.id}" class="mt-4 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <i class="fas fa-plus-circle"></i> Añadir Combo
        </button>
    `;
    productsContainer.appendChild(card);
    card.querySelector('button').addEventListener('click', () => {
        addComboToCart(combo);
    });
}

// NUEVAS FUNCIONES PARA RESERVACIONES
function renderReservations() {
    if (!reservationsListContainer) return;
    reservationsListContainer.innerHTML = '';
    if (allReservations.length === 0) {
        reservationsListContainer.innerHTML = '<p class="text-center text-gray-500">No hay reservaciones pendientes.</p>';
        return;
    }

    allReservations.forEach(reservation => {
        const reservationDiv = document.createElement('div');
        reservationDiv.className = "bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center";

        const formattedDate = reservation.timestamp ? new Date(reservation.timestamp.seconds * 1000).toLocaleString('es-ES') : 'Fecha no disponible';
        
        let itemsHtml = reservation.items.map(item => `
            <li class="flex justify-between text-sm">
                <span class="text-gray-700">${item.name} x${item.quantity}</span>
            </li>
        `).join('');

        let adjustmentHtml = '';
        if (reservation.adjustment && reservation.adjustment.amount > 0) {
            const adjustmentText = reservation.adjustment.type.includes('discount') ? 'Descuento' : 'Recargo';
            const sign = reservation.adjustment.type.includes('discount') ? '-' : '+';
            adjustmentHtml = `<p class="text-sm text-gray-600">
                ${adjustmentText}: <span class="font-semibold">${sign}$${reservation.adjustment.amount.toFixed(2)}</span>
            </p>`;
        }
        
        reservationDiv.innerHTML = `
            <div class="flex-grow">
                <p class="font-semibold text-gray-800">Cliente: ${reservation.customerName}</p>
                <p class="text-sm text-gray-500">Fecha de reserva: ${formattedDate}</p>
                <p class="text-lg font-bold text-blue-600 mt-2">Total: $${reservation.total.toFixed(2)}</p>
                <div class="mt-2 text-sm">
                    <p class="font-semibold text-gray-700">Productos:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4">
                        ${itemsHtml}
                    </ul>
                </div>
                ${adjustmentHtml}
            </div>
            <div class="flex space-x-2 mt-4 md:mt-0">
                <button data-id="${reservation.id}" class="process-reservation-btn px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300">
                    <i class="fas fa-check-circle"></i> Facturar
                </button>
                <button data-id="${reservation.id}" class="delete-reservation-btn px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </div>
        `;

        reservationsListContainer.appendChild(reservationDiv);
    });

    // Eventos para facturar y eliminar
    document.querySelectorAll('.process-reservation-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reservationId = e.target.dataset.id;
            const reservationToProcess = allReservations.find(r => r.id === reservationId);
            if (reservationToProcess) {
                showPaymentModalForReservation(reservationToProcess);
            }
        });
    });

    document.querySelectorAll('.delete-reservation-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reservationId = e.target.dataset.id;
            deleteReservedOrder(reservationId);
        });
    });
}

function showPaymentModalForReservation(reservation) {
    if (!paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer || !splitPaymentModal || !customerSelect) {
        showModal("Error: Faltan elementos de la interfaz de usuario para el modal de pago.");
        return;
    }

    currentReservationToProcess = reservation;
    cart = reservation.items;
    
    // Limpiar y configurar la UI del modal de pago para la reservación
    paymentTotalDisplay.textContent = `$${reservation.total.toFixed(2)}`;
    paymentRemainingDisplay.textContent = `$${reservation.total.toFixed(2)}`;
    paymentInputsContainer.innerHTML = '';
    addPaymentInput(reservation.total);
    customerSelect.value = reservation.customerId;
    
    splitPaymentModal.classList.remove('hidden');
}


// NUEVO: Función para procesar una reservación
async function processReservedOrder(reservation, payments) {
    if (!dailyCashData || dailyCashData.cerrada) {
        showModal("La caja no está abierta. Por favor, abre la caja para facturar ventas.");
        return;
    }

    const cashId = new Date().toLocaleDateString('en-CA');
    
    showConfirmationModal(`¿Estás seguro de que quieres facturar este pedido de ${reservation.customerName}?`, async () => {
        try {
            // Mover la reservación a la colección de ventas
            await addDoc(collection(db, SHARED_SALES_COLLECTION), {
                items: reservation.items,
                subtotal: reservation.subtotal,
                ...(reservation.adjustment && reservation.adjustment.amount > 0 && { adjustment: reservation.adjustment }),
                total: reservation.total,
                payments: payments, 
                customerId: reservation.customerId,
                customerName: reservation.customerName,
                timestamp: serverTimestamp(),
                cashId: cashId
            });
            
            // Eliminar la reservación de la colección de reservaciones
            const reservationDocRef = doc(db, SHARED_RESERVATIONS_COLLECTION, reservation.id);
            await deleteDoc(reservationDocRef);
            
            showModal("Pedido facturado con éxito y eliminado de las reservaciones.");
            
        } catch (error) {
            console.error("Error al facturar el pedido reservado:", error);
            showModal("Hubo un error al facturar el pedido. Intenta de nuevo.");
        }
    }, () => {});
}

// NUEVO: Función para eliminar una reservación
async function deleteReservedOrder(reservationId) {
    showConfirmationModal(`¿Estás seguro de que quieres eliminar esta reservación? Esta acción no se puede deshacer.`, async () => {
        try {
            const reservationDocRef = doc(db, SHARED_RESERVATIONS_COLLECTION, reservationId);
            await deleteDoc(reservationDocRef);
            showModal("Reservación eliminada con éxito.");
        } catch (error) {
            console.error("Error al eliminar la reservación:", error);
            showModal("Hubo un error al eliminar la reservación. Intenta de nuevo.");
        }
    }, () => {});
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        setupRealtimeListeners();
        if (authModal) authModal.classList.add('hidden');
        showPage('pos-page'); // Inicia en la página del POS
    } else {
        if (authModal) authModal.classList.remove('hidden');
        pages.forEach(page => page.classList.remove('active'));
    }
});

function setupRealtimeListeners() {
    if (!userId) {
        console.error("UserID no disponible, no se pueden configurar los oyentes.");
        return;
    }

    // Colecciones compartidas
    const productsCollection = collection(db, SHARED_PRODUCTS_COLLECTION);
    onSnapshot(productsCollection, (snapshot) => {
        allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderProducts(allProducts);
        if(manageProductsContainer) manageProductsContainer.innerHTML = '';
        allProducts.forEach(product => {
            renderManageProduct(product);
        });
        // Llama a esta función para asegurar que el select de categorías de producto se actualiza
        renderProductCategoriesInput();
    }, (error) => {
        console.error("Error al escuchar productos:", error);
        showModal("Error al cargar productos. Por favor, recarga la página.");
    });

    const salesCollection = collection(db, SHARED_SALES_COLLECTION);
    onSnapshot(salesCollection, (snapshot) => {
        allSales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSalesHistory(allSales);
        updateDailyTotals();
        if (salesChartCtx) renderSalesChart(allSales);
        if (topProductsChartCtx) renderTopProductsChart(allSales);
        if (paymentMethodsChartCtx) renderPaymentMethodsChart(allSales);
    }, (error) => {
        console.error("Error al escuchar ventas:", error);
        showModal("Error al cargar el historial de ventas.");
    });

    const customersCollection = collection(db, SHARED_CUSTOMERS_COLLECTION);
    onSnapshot(customersCollection, (snapshot) => {
        allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCustomersList(allCustomers);
        renderCustomerSelect(allCustomers);
    }, (error) => {
        console.error("Error al escuchar clientes:", error);
        showModal("Error al cargar clientes.");
    });

    const paymentMethodsCollection = collection(db, SHARED_PAYMENT_METHODS_COLLECTION);
    onSnapshot(paymentMethodsCollection, (snapshot) => {
        userPaymentMethods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(filterPaymentMethod) renderPaymentMethodFilters();
        if(paymentMethodsList) renderPaymentMethodsList();
    }, (error) => {
        console.error("Error al escuchar métodos de pago:", error);
        showModal("Error al cargar los métodos de pago.");
    });

    const expenseCategoriesCollection = collection(db, SHARED_EXPENSE_CATEGORIES_COLLECTION);
    onSnapshot(expenseCategoriesCollection, (snapshot) => {
        userExpenseCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(expenseCategorySelect) renderExpenseCategories();
        if(expenseCategoriesList) renderExpenseCategoriesList();
    }, (error) => {
        console.error("Error al escuchar categorías de gastos:", error);
        showModal("Error al cargar las categorías de gastos.");
    });

    const productCategoriesCollection = collection(db, SHARED_PRODUCT_CATEGORIES_COLLECTION);
    onSnapshot(productCategoriesCollection, (snapshot) => {
        productCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (productCategoriesList) renderProductCategoriesList();
        if (productCategoryInput) renderProductCategoriesInput();
    }, (error) => {
        console.error("Error al escuchar categorías de productos:", error);
        showModal("Error al cargar las categorías de productos.");
    });
    
    const combosCollection = collection(db, SHARED_COMBOS_COLLECTION);
    onSnapshot(combosCollection, (snapshot) => {
      allCombos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderProducts(allProducts);
      if(promotionsList) renderManageCombos();
    }, (error) => {
      console.error("Error al escuchar combos:", error);
      showModal("Error al cargar los combos.");
    });

    const expensesCollection = collection(db, SHARED_EXPENSES_COLLECTION);
    onSnapshot(expensesCollection, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(dailyExpensesContainer) renderDailyExpenses(expenses);
        updateDailyTotals();
    }, (error) => {
        console.error("Error al escuchar gastos:", error);
        showModal("Error al cargar los gastos.");
    });

    const today = new Date().toLocaleDateString('en-CA');
    const cashDocRef = doc(db, SHARED_CASH_COLLECTION, today);
    onSnapshot(cashDocRef, (doc) => {
        if (doc.exists()) {
            dailyCashData = doc.data();
            renderCashStatus();
        } else {
            dailyCashData = null;
            renderCashStatus();
        }
    }, (error) => {
        console.error("Error al escuchar la caja diaria:", error);
    });

    const cashHistoryCollection = collection(db, SHARED_CASH_HISTORY_COLLECTION);
    onSnapshot(cashHistoryCollection, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (cashHistoryContainer) renderCashHistory(history);
    }, (error) => {
        console.error("Error al escuchar el historial de cajas:", error);
    });

    const reservationsCollection = collection(db, SHARED_RESERVATIONS_COLLECTION);
    onSnapshot(reservationsCollection, (snapshot) => {
        allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(reservationsListContainer) renderReservations();
    }, (error) => {
        console.error("Error al escuchar reservaciones:", error);
        showModal("Error al cargar las reservaciones.");
    });
}

function renderPaymentMethodsList() {
    if (!paymentMethodsList) return;
    paymentMethodsList.innerHTML = '';
    const allMethods = [...defaultPaymentMethods.map(name => ({name: name, id: null})), ...userPaymentMethods];
    allMethods.forEach(method => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
        itemDiv.innerHTML = `
        <span>${method.name}</span>
        <div class="flex space-x-2">
            <button data-id="${method.id}" class="delete-payment-method-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        paymentMethodsList.appendChild(itemDiv);

        const deleteButton = itemDiv.querySelector('.delete-payment-method-btn');
        if (method.id) {
            deleteButton.addEventListener('click', async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar la forma de pago '${method.name}'?`)) {
                    try {
                        const methodDocRef = doc(db, SHARED_PAYMENT_METHODS_COLLECTION, method.id);
                        await deleteDoc(methodDocRef);
                        showModal("Forma de pago eliminada con éxito.");
                    } catch (error) {
                        console.error("Error al eliminar la forma de pago:", error);
                        showModal("Error al eliminar la forma de pago.");
                    }
                }
            });
        } else {
            deleteButton.disabled = true;
            deleteButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

function renderExpenseCategoriesList() {
    if (!expenseCategoriesList) return;
    expenseCategoriesList.innerHTML = '';
    const allCategories = [...defaultExpenseCategories.map(name => ({name: name, id: null})), ...userExpenseCategories];
    allCategories.forEach(category => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
        itemDiv.innerHTML = `
        <span>${category.name}</span>
        <div class="flex space-x-2">
            <button data-id="${category.id}" class="delete-expense-category-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        expenseCategoriesList.appendChild(itemDiv);

        const deleteButton = itemDiv.querySelector('.delete-expense-category-btn');
        if (category.id) {
            deleteButton.addEventListener('click', async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar la categoría de gasto '${category.name}'?`)) {
                    try {
                        const categoryDocRef = doc(db, SHARED_EXPENSE_CATEGORIES_COLLECTION, category.id);
                        await deleteDoc(categoryDocRef);
                        showModal("Categoría de gasto eliminada con éxito.");
                    } catch (error) {
                        console.error("Error al eliminar la categoría de gasto:", error);
                        showModal("Error al eliminar la categoría de gasto.");
                    }
                }
            });
        } else {
            deleteButton.disabled = true;
            deleteButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

function renderProductCategoriesList() {
    if (!productCategoriesList) return;
    productCategoriesList.innerHTML = '';
    productCategories.forEach(category => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
        itemDiv.innerHTML = `
        <span>${category.name}</span>
        <div class="flex space-x-2">
            <button data-id="${category.id}" class="delete-product-category-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        productCategoriesList.appendChild(itemDiv);

        const deleteButton = itemDiv.querySelector('.delete-product-category-btn');
        deleteButton.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de que quieres eliminar la categoría de producto '${category.name}'?`)) {
                try {
                    const categoryDocRef = doc(db, SHARED_PRODUCT_CATEGORIES_COLLECTION, category.id);
                    await deleteDoc(categoryDocRef);
                    showModal("Categoría de producto eliminada con éxito.");
                } catch (error) {
                    console.error("Error al eliminar la categoría de producto:", error);
                    showModal("Error al eliminar la categoría de producto.");
                }
            }
        });
    });
}

function renderProductCategoriesInput() {
    if (!productCategoryInput) return;
    productCategoryInput.innerHTML = '<option value="">Sin Categoría</option>';
    productCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        productCategoryInput.appendChild(option);
    });
}

if(addProductCategoryForm) {
    addProductCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const newCategoryNameInput = document.getElementById('new-product-category-name');
        const newCategory = newCategoryNameInput?.value.trim();
        if (newCategory && !productCategories.map(c => c.name).includes(newCategory)) {
            try {
                await addDoc(collection(db, SHARED_PRODUCT_CATEGORIES_COLLECTION), { name: newCategory });
                if(newCategoryNameInput) newCategoryNameInput.value = '';
                showModal("Categoría de producto añadida con éxito.");
            } catch (error) {
                console.error("Error al añadir categoría de producto:", error);
                showModal("Error al añadir categoría de producto.");
            }
        } else {
            showModal("Esa categoría de producto ya existe o no es válida.");
        }
    });
}


if(addPaymentMethodForm) {
    addPaymentMethodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPaymentNameInput = document.getElementById('new-payment-method-name');
        const newMethod = newPaymentNameInput?.value.trim();
        if (newMethod && !userPaymentMethods.map(m => m.name).includes(newMethod) && !defaultPaymentMethods.includes(newMethod)) {
            try {
                await addDoc(collection(db, SHARED_PAYMENT_METHODS_COLLECTION), { name: newMethod });
                if(newPaymentNameInput) newPaymentNameInput.value = '';
                showModal("Forma de pago añadida con éxito.");
            } catch (error) {
                console.error("Error al añadir forma de pago:", error);
                showModal("Error al añadir forma de pago.");
            }
        } else {
            showModal("Esa forma de pago ya existe o no es válida.");
        }
    });
}

if(addExpenseCategoryForm) {
    addExpenseCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newExpenseNameInput = document.getElementById('new-expense-category-name');
        const newCategory = newExpenseNameInput?.value.trim();
        if (newCategory && !userExpenseCategories.map(c => c.name).includes(newCategory) && !defaultExpenseCategories.includes(newCategory)) {
            try {
                await addDoc(collection(db, SHARED_EXPENSE_CATEGORIES_COLLECTION), { name: newCategory });
                if(newExpenseNameInput) newExpenseNameInput.value = '';
                showModal("Categoría de gasto añadida con éxito.");
            } catch (error) {
                console.error("Error al añadir categoría de gasto:", error);
                showModal("Error al añadir categoría de gasto.");
            }
        } else {
            showModal("Esa categoría de gasto ya existe o no es válida.");
        }
    });
}

function renderPaymentMethodFilters() {
    if(!filterPaymentMethod) return;
    const selectFilter = document.getElementById('filter-payment-method');
    selectFilter.innerHTML = '<option value="">Todas</option>';
    
    // Generar opciones para todos los métodos de pago disponibles (predeterminados + agregados por el usuario)
    const allMethods = [...new Set([...defaultPaymentMethods, ...userPaymentMethods.map(m => m.name)])];
    allMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        selectFilter.appendChild(option);
    });
}

function renderExpenseCategories() {
    if(!expenseCategorySelect) return;
    expenseCategorySelect.innerHTML = '';
    const allCategories = [...new Set([...defaultExpenseCategories, ...userExpenseCategories.map(c => c.name)])];
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        expenseCategorySelect.appendChild(option);
    });
}

function renderProductCard(product) {
    if (!productsContainer) return;
    const card = document.createElement('div');
    card.className = "bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center transition-transform hover:scale-105 duration-300";

    let stockHtml = '';
    if (product.stock !== undefined) {
        stockHtml = `<p class="text-sm text-gray-500">Stock: ${product.stock}</p>`;
        if (product.stock <= 5) {
            stockHtml = `<p class="text-sm font-bold text-red-500">Stock Bajo: ${product.stock}</p>`;
        }
    }
    
    let categoryHtml = '';
    if (product.categoryId) {
        const category = productCategories.find(c => c.id === product.categoryId);
        if (category) {
            categoryHtml = `<p class="text-xs text-gray-400 mt-1">Categoría: ${category.name}</p>`;
        }
    }

    card.innerHTML = `
    <h3 class="font-bold text-gray-800 text-lg mb-2">${product.name}</h3>
    <p class="text-xl font-bold text-green-600">$${product.price.toFixed(2)}</p>
    ${stockHtml}
    ${categoryHtml}
    <button data-product-id="${product.id}"
        class="mt-4 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        <i class="fas fa-plus-circle"></i> Añadir al Carrito
    </button>
    `;
    productsContainer.appendChild(card);

    card.querySelector('button').addEventListener('click', () => {
        addProductToCart(product);
    });
}

function renderManageProduct(product) {
    if (!manageProductsContainer) return;
    const itemDiv = document.createElement('div');
    itemDiv.className = "bg-gray-100 p-3 rounded-lg flex items-center justify-between";

    let stockDisplay = '';
    if (product.stock !== undefined) {
        stockDisplay = `<span class="text-sm text-gray-500"> (Stock: ${product.stock})</span>`;
    }

    let categoryDisplay = '';
    if (product.categoryId) {
        const category = productCategories.find(c => c.id === product.categoryId);
        if (category) {
            categoryDisplay = `<span class="text-gray-400 text-sm"> (${category.name})</span>`;
        }
    }

    itemDiv.innerHTML = `
    <div class="flex-grow">
        <span class="font-semibold">${product.name}</span>
        <span class="text-gray-500"> - $${product.price.toFixed(2)}</span>
        ${stockDisplay}
        ${categoryDisplay}
    </div>
    <div class="flex space-x-2">
        <button data-product-id="${product.id}"
            class="edit-product-btn px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors">
            <i class="fas fa-edit"></i>
        </button>
        <button data-product-id="${product.id}"
            class="delete-product-btn px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
            <i class="fas fa-trash-alt"></i>
        </button>
    </div>
    `;
    manageProductsContainer.appendChild(itemDiv);

    const editButton = itemDiv.querySelector('.edit-product-btn');
    if(editButton) {
        editButton.addEventListener('click', () => {
            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name-input');
            const productPriceInput = document.getElementById('product-price-input');
            const productStockInput = document.getElementById('product-stock-input');
            const productCategoryInput = document.getElementById('product-category-input');

            if (productIdInput) productIdInput.value = product.id;
            if (productNameInput) productNameInput.value = product.name;
            if (productPriceInput) productPriceInput.value = product.price;
            if (productStockInput) productStockInput.value = product.stock !== undefined ? product.stock : '';
            if (productCategoryInput) productCategoryInput.value = product.categoryId || '';

            if (productFormContainer) {
                productFormContainer.classList.remove('hidden');
            }
        });
    }

    const deleteButton = itemDiv.querySelector('.delete-product-btn');
    if(deleteButton) {
        deleteButton.addEventListener('click', async () => {
            showConfirmationModal('¿Estás seguro de que quieres eliminar este producto?', async () => {
                try {
                    const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, product.id);
                    await deleteDoc(productRef);
                    showModal("Producto eliminado con éxito.");
                } catch (error) {
                    console.error("Error al eliminar el producto:", error);
                    showModal("Error al eliminar el producto. Por favor, intenta de nuevo.");
                }
            }, () => {});
        });
    }
}

function renderSalesHistory(sales) {
    if (!salesHistoryContainer) return;
    salesHistoryContainer.innerHTML = '';
    
    const filteredSales = applyFilters(sales);
    
    // Nuevo cálculo para el total de la vista filtrada
    let filteredTotal = 0;
    const paymentMethodFilter = filterPaymentMethod?.value;

    const salesByDay = filteredSales.reduce((acc, sale) => {
        const timestamp = sale.timestamp;
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) {
                acc[date] = { total: 0, sales: [] };
            }

            let amountToAdd = 0;
            if (paymentMethodFilter && paymentMethodFilter !== 'Todas') {
                const filteredPayment = sale.payments.find(p => p.method === paymentMethodFilter);
                if (filteredPayment) {
                    amountToAdd = filteredPayment.amount;
                }
            } else {
                amountToAdd = sale.total;
            }

            acc[date].total += amountToAdd;
            filteredTotal += amountToAdd;
            acc[date].sales.push(sale);
        }
        return acc;
    }, {});

    const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(b) - new Date(a));
    
    // Mostrar el total general de la vista filtrada
    if (sortedDates.length > 0) {
        const totalHeader = document.createElement('div');
        totalHeader.className = "bg-blue-600 text-white p-4 rounded-lg mb-4 text-center";
        totalHeader.innerHTML = `
            <h3 class="font-bold text-xl">Total Filtrado: $${filteredTotal.toFixed(2)}</h3>
        `;
        salesHistoryContainer.appendChild(totalHeader);
    }

    sortedDates.forEach(dateString => {
        const dailySales = salesByDay[dateString];

        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        dayDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300">
            <h3 class="font-bold text-lg">${dateString}</h3>
            <span class="font-bold text-green-600 text-xl">Total del día: $${dailySales.total.toFixed(2)}</span>
        </div>
        `;

        dailySales.sales.forEach(sale => {
            const saleDiv = document.createElement('div');
            saleDiv.className = "bg-white p-3 rounded-lg shadow-sm my-2";
            const formattedTime = new Date(sale.timestamp.seconds * 1000).toLocaleTimeString('es-ES');

            let itemsHtml = sale.items.map(item => `
            <li class="flex justify-between text-sm">
                <span class="text-gray-700">${item.name} x${item.quantity}</span>
                <span class="text-gray-700">$${(item.price * item.quantity).toFixed(2)}</span>
            </li>
            `).join('');

            let adjustmentHtml = '';
            if (sale.adjustment && sale.adjustment.amount > 0) {
                const adjustmentText = sale.adjustment.type.includes('discount') ? 'Descuento' : 'Recargo';
                const sign = sale.adjustment.type.includes('discount') ? '-' : '+';
                adjustmentHtml = `<p class="text-sm text-gray-600">
                    ${adjustmentText}: <span class="font-semibold">${sign}$${sale.adjustment.amount.toFixed(2)}</span>
                </p>`;
            }

            let paymentsHtml = '';
            if (sale.payments && sale.payments.length > 0) {
                paymentsHtml = '<p class="mt-2 text-sm text-gray-600">Pagos:</p><ul class="space-y-1">';
                paymentsHtml += sale.payments.map(p => `
                <li class="flex justify-between text-sm">
                    <span class="text-gray-700">${p.method}</span>
                    <span class="text-gray-700">$${p.amount.toFixed(2)}</span>
                </li>
                `).join('');
                paymentsHtml += '</ul>';
            }

            let customerHtml = sale.customerId ? `<p class="mt-2 text-sm text-gray-600">Cliente: <span class="font-semibold">${sale.customerName}</span></p>` : '';

            // Lógica para mostrar solo el monto del pago filtrado
            let displayAmount = sale.total;
            if (paymentMethodFilter && paymentMethodFilter !== 'Todas') {
                const filteredPayment = sale.payments.find(p => p.method === paymentMethodFilter);
                displayAmount = filteredPayment ? filteredPayment.amount : 0;
            }
            
            saleDiv.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h4 class="font-semibold text-gray-800">Venta a las ${formattedTime}</h4>
                <span class="font-bold text-gray-800">$${displayAmount.toFixed(2)}</span>
            </div>
            <ul class="space-y-1">
                ${itemsHtml}
            </ul>
            ${adjustmentHtml}
            ${paymentsHtml}
            ${customerHtml}
            <div class="flex justify-end">
                <button class="print-receipt-btn px-3 py-1 mt-2 bg-blue-500 text-white rounded-lg text-sm" data-sale-id="${sale.id}">
                    <i class="fas fa-print"></i> Recibo
                </button>
            </div>
            `;
            dayDiv.appendChild(saleDiv);
        });
        salesHistoryContainer.appendChild(dayDiv);
    });
    // Attach print events
    document.querySelectorAll('.print-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const saleId = e.target.dataset.saleId;
            const saleToPrint = allSales.find(s => s.id === saleId);
            if (saleToPrint) {
                printReceipt(saleToPrint);
            }
        });
    });
}

function applyFilters(sales) {
    const startDate = filterStartDate?.value ? new Date(filterStartDate.value) : null;
    const endDate = filterEndDate?.value ? new Date(filterEndDate.value) : null;
    const productName = filterProduct?.value.toLowerCase() || '';
    const paymentMethod = filterPaymentMethod?.value || '';

    return sales.filter(sale => {
        const saleDate = sale.timestamp ? new Date(sale.timestamp.seconds * 1000) : null;

        if (startDate && (!saleDate || saleDate < startDate)) return false;
        if (endDate && (!saleDate || saleDate > endDate)) return false;

        if (productName && !sale.items.some(item => item.name.toLowerCase().includes(productName))) {
            return false;
        }
        
        // Lógica de filtro para las formas de pago configuradas
        if (paymentMethod && paymentMethod !== 'Todas') {
            return sale.payments.some(p => p.method === paymentMethod);
        }

        return true;
    });
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
        renderSalesHistory(allSales);
    });
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        if (filterStartDate) filterStartDate.value = '';
        if (filterEndDate) filterEndDate.value = '';
        if (filterProduct) filterProduct.value = '';
        if (filterPaymentMethod) filterPaymentMethod.value = '';
        renderSalesHistory(allSales);
    });
}

function renderDailyExpenses(expenses) {
    if (!dailyExpensesContainer) return;
    dailyExpensesContainer.innerHTML = '';

    // Agrupar gastos por día
    const expensesByDay = expenses.reduce((acc, expense) => {
        const timestamp = expense.timestamp;
        if (timestamp && timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            if (!acc[date]) {
                acc[date] = { total: 0, expenses: [] };
            }
            acc[date].total += expense.amount;
            acc[date].expenses.push(expense);
        }
        return acc;
    }, {});

    const sortedDates = Object.keys(expensesByDay).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(dateString => {
        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        
        const dayData = expensesByDay[dateString];

        dayDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300">
            <h3 class="font-bold text-lg">${dateString}</h3>
            <span class="font-bold text-red-600 text-xl">Total: -$${dayData.total.toFixed(2)}</span>
        </div>
        `;

        dayData.expenses.forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = "bg-white p-3 rounded-lg shadow-sm flex justify-between items-center my-2";
            const formattedTime = new Date(expense.timestamp.seconds * 1000).toLocaleTimeString('es-ES');
            expenseDiv.innerHTML = `
            <div>
                <span class="font-semibold">${expense.description}</span>
                <span class="text-gray-500 text-sm"> (${expense.category})</span>
                <span class="text-gray-500 text-sm block"> - a las ${formattedTime}</span>
            </div>
            <span class="text-red-600 font-bold">-$${expense.amount.toFixed(2)}</span>
            `;
            dayDiv.appendChild(expenseDiv);
        });
        dailyExpensesContainer.appendChild(dayDiv);
    });
}

function renderCashHistory(history) {
    if(!cashHistoryContainer) return;
    cashHistoryContainer.innerHTML = '';

    const historyByDay = history.reduce((acc, entry) => {
        const date = new Date(entry.fecha.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
    }, {});

    const sortedDates = Object.keys(historyByDay).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(dateString => {
        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";

        let totalSalesDay = 0;
        let totalExpensesDay = 0;

        const entriesHtml = historyByDay[dateString].map(entry => {
            totalSalesDay += entry.ventasTotales;
            totalExpensesDay += entry.gastosTotales;
            const entryDate = new Date(entry.fecha.seconds * 1000).toLocaleTimeString('es-ES');
            return `
            <div class="bg-white p-3 rounded-lg shadow-sm my-2">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-gray-800">Caja cerrada a las ${entryDate}</span>
                </div>
                <div class="text-sm">Apertura: <span class="font-semibold">$${entry.abertura.toFixed(2)}</span></div>
                <div class="text-sm">Ventas Totales: <span class="font-semibold text-green-600">$${entry.ventasTotales.toFixed(2)}</span></div>
                <div class="text-sm">Gastos Totales: <span class="font-semibold text-red-600">$${entry.gastosTotales.toFixed(2)}</span></div>
                <div class="text-lg font-bold mt-2">Cierre: <span class="text-blue-600">$${entry.cierre.toFixed(2)}</span></div>
            </div>
            `;
        }).join('');

        dayDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300">
            <h3 class="font-bold text-lg">${dateString}</h3>
        </div>
        ${entriesHtml}
        `;
        cashHistoryContainer.appendChild(dayDiv);
    });
}


async function updateDailyTotals() {
    if (!dailyCashData) {
        if(currentCashDisplay) currentCashDisplay.textContent = `$0.00`;
        if (cashStatsSection) cashStatsSection.classList.add('hidden');
        return;
    }

    if (cashStatsSection) cashStatsSection.classList.remove('hidden');

    const today = new Date().toLocaleDateString('en-CA');

    // Obtener ventas asociadas a la caja de hoy
    const salesQuery = query(collection(db, SHARED_SALES_COLLECTION), where("cashId", "==", today));
    const salesSnapshot = await getDocs(salesQuery);
    let salesCount = 0;
    let paymentMethodTotals = {};

    // Obtener todos los métodos de pago disponibles
    const allPaymentMethods = [...defaultPaymentMethods, ...userPaymentMethods.map(m => m.name)];
    allPaymentMethods.forEach(method => {
        paymentMethodTotals[method] = 0;
    });

    dailySalesTotal = salesSnapshot.docs.reduce((sum, doc) => {
        const sale = doc.data();
        if (sale.total && !isNaN(sale.total)) {
            salesCount++;
            if (sale.payments) {
                sale.payments.forEach(payment => {
                    if (paymentMethodTotals.hasOwnProperty(payment.method)) {
                        paymentMethodTotals[payment.method] += payment.amount;
                    }
                });
            }
            return sum + sale.total;
        }
        return sum;
    }, 0);

    // Obtener gastos asociados a la caja de hoy
    const expensesQuery = query(collection(db, SHARED_EXPENSES_COLLECTION), where("cashId", "==", today));
    const expensesSnapshot = await getDocs(expensesQuery);
    dailyExpensesTotal = expensesSnapshot.docs.reduce((sum, doc) => {
        const expense = doc.data();
        if (expense.amount && !isNaN(expense.amount)) {
            return sum + expense.amount;
        }
        return sum;
    }, 0);

    const currentCash = dailyCashData.abertura + paymentMethodTotals['Efectivo'] - dailyExpensesTotal;
    if (currentCashDisplay) currentCashDisplay.textContent = `$${currentCash.toFixed(2)}`;

    // Actualizar las estadísticas
    if (statsTotalSales) statsTotalSales.textContent = `$${dailySalesTotal.toFixed(2)}`;
    if (statsSalesCount) statsSalesCount.textContent = salesCount;
    if (statsTotalExpenses) statsTotalExpenses.textContent = `$${dailyExpensesTotal.toFixed(2)}`;

    // Renderizar dinámicamente los totales de pago
    renderPaymentStats(paymentMethodTotals);
}

function renderPaymentStats(paymentMethodTotals) {
    if (!paymentStatsContainer) return;

    // Limpiar el contenedor antes de renderizar
    paymentStatsContainer.innerHTML = '';
    
    // Convertir el objeto a un array de pares [clave, valor]
    const paymentMethodsArray = Object.entries(paymentMethodTotals);

    // Renderizar cada forma de pago
    paymentMethodsArray.forEach(([method, total]) => {
        const div = document.createElement('div');
        let totalSalesText = '';
        let textColor = 'text-green-600';

        if(method === 'Efectivo') {
            totalSalesText = `Total en ${method}`;
        } else {
            totalSalesText = `Total en ${method}`;
        }
        div.innerHTML = `
            <span class="block font-bold ${textColor} text-xl">$${total.toFixed(2)}</span>
            <span class="text-sm text-gray-500">${totalSalesText}</span>
        `;
        paymentStatsContainer.appendChild(div);
    });
}

function renderCashStatus() {
    if (dailyCashData && !dailyCashData.cerrada) {
        if (cashStatusText) cashStatusText.textContent = `Caja abierta: $${dailyCashData.abertura.toFixed(2)}`;
        if (openCashForm) openCashForm.classList.add('hidden');
        if (expenseSection) expenseSection.classList.remove('hidden');
        if (expenseSeparator) expenseSeparator.classList.remove('hidden');
        if (closeCashBtn) closeCashBtn.classList.remove('hidden');
        if (closeSeparator) closeSeparator.classList.remove('hidden');
        if (cashStatsSection) cashStatsSection.classList.remove('hidden');
    } else {
        if (cashStatusText) cashStatusText.textContent = "Caja cerrada";
        if (currentCashDisplay) currentCashDisplay.textContent = "$0.00";
        if (openCashForm) openCashForm.classList.remove('hidden');
        if (expenseSection) expenseSection.classList.add('hidden');
        if (expenseSeparator) expenseSeparator.classList.add('hidden');
        if (closeCashBtn) closeCashBtn.classList.add('hidden');
        if (closeSeparator) closeSeparator.classList.add('hidden');
        if (cashStatsSection) cashStatsSection.classList.add('hidden');
    }
}

if (openCashForm) {
    openCashForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('open-cash-amount').value);
        if (isNaN(amount) || amount < 0) {
            showModal("El monto debe ser un número positivo.");
            return;
        }

        const today = new Date().toLocaleDateString('en-CA');
        const cashDocRef = doc(db, SHARED_CASH_COLLECTION, today);

        try {
            await setDoc(cashDocRef, {
                abertura: amount,
                fecha: new Date(),
                cerrada: false,
                ventasTotales: 0,
                gastosTotales: 0
            });
            openCashForm.reset();
            showModal("Caja abierta con éxito.");
        } catch (error) {
            console.error("Error al abrir la caja:", error);
            showModal("Hubo un error al abrir la caja. Intenta de nuevo.");
        }
    });
}

if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = expenseCategorySelect?.value;

        if (isNaN(amount) || amount <= 0) {
            showModal("El monto debe ser un número positivo.");
            return;
        }
        const cashId = new Date().toLocaleDateString('en-CA');
        try {
            const expensesCollection = collection(db, SHARED_EXPENSES_COLLECTION);
            await addDoc(expensesCollection, {
                description: description,
                amount: amount,
                category: category,
                timestamp: serverTimestamp(),
                cashId: cashId
            });
            expenseForm.reset();
            showModal("Gasto registrado con éxito.");
            
            // Ocultar el formulario después de guardar
            if (expenseFormContainer) expenseFormContainer.classList.add('hidden');
            
        } catch (error) {
            console.error("Error al registrar el gasto:", error);
            showModal("Hubo un error al registrar el gasto. Intenta de nuevo.");
        }
    });
}

if (closeCashBtn) {
    closeCashBtn.addEventListener('click', async () => {
        if (!dailyCashData || dailyCashData.cerrada) {
            showModal("La caja no está abierta o ya ha sido cerrada.");
            return;
        }

        const totalFinal = dailyCashData.abertura + dailySalesTotal - dailyExpensesTotal;
        const today = new Date().toLocaleDateString('en-CA');
        const cashDocRef = doc(db, SHARED_CASH_COLLECTION, today);

        showConfirmationModal(`¿Estás seguro de que quieres cerrar la caja? El saldo final será de $${totalFinal.toFixed(2)}.`, async () => {
            try {
                await setDoc(cashDocRef, {
                    cierre: totalFinal,
                    cerrada: true,
                    ventasTotales: dailySalesTotal,
                    gastosTotales: dailyExpensesTotal
                }, { merge: true });

                const cashHistoryCollection = collection(db, SHARED_CASH_HISTORY_COLLECTION);
                await addDoc(cashHistoryCollection, {
                    abertura: dailyCashData.abertura,
                    cierre: totalFinal,
                    ventasTotales: dailySalesTotal,
                    gastosTotales: dailyExpensesTotal,
                    fecha: dailyCashData.fecha,
                    cierreTimestamp: serverTimestamp()
                });

                showModal(`Caja cerrada. El saldo final es $${totalFinal.toFixed(2)}.`);
                
            } catch (error) {
                console.error("Error al cerrar la caja:", error);
                showModal("Hubo un error al cerrar la caja. Intenta de nuevo.");
            }
        }, () => {});
    });
}

function calculateTotal() {
    let subtotal = 0;
    let total = 0;
    
    cart.forEach(item => {
        if (item.isCombo) {
            subtotal += item.basePrice * item.quantity;
            total += item.price * item.quantity;
        } else {
            const itemPrice = item.price * item.quantity;
            subtotal += itemPrice;
            total += itemPrice;
        }
    });

    let adjustmentAmount = 0;
    if (currentDiscountSurcharge.value > 0) {
        if (currentDiscountSurcharge.type === 'percentage_discount') {
            adjustmentAmount = total * (currentDiscountSurcharge.value / 100);
            total -= adjustmentAmount;
        } else if (currentDiscountSurcharge.type === 'fixed_discount') {
            adjustmentAmount = currentDiscountSurcharge.value;
            total -= adjustmentAmount;
        } else if (currentDiscountSurcharge.type === 'percentage_surcharge') {
            adjustmentAmount = total * (currentDiscountSurcharge.value / 100);
            total += adjustmentAmount;
        } else if (currentDiscountSurcharge.type === 'fixed_surcharge') {
            adjustmentAmount = currentDiscountSurcharge.value;
            total += adjustmentAmount;
        }
    }

    return {
        subtotal: subtotal,
        total: total,
        adjustmentAmount: adjustmentAmount
    };
}


function renderCart() {
    if (!cartContainer || !cartSubtotalSpan || !cartTotalSpan || !discountSurchargeDisplay) return;

    cartContainer.innerHTML = '';
    const { subtotal, total, adjustmentAmount } = calculateTotal();

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-200 p-3 rounded-lg flex justify-between items-center";
        
        let itemName = item.name;
        if(item.isCombo) {
            itemName = `${item.name} (Combo)`;
        }

        itemDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="font-semibold">${itemName}</span>
            <span>x${item.quantity}</span>
        </div>
        <div class="flex items-center space-x-2">
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <button data-id="${item.id}" class="text-red-500 hover:text-red-700 font-bold">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
        `;
        cartContainer.appendChild(itemDiv);

        itemDiv.querySelector('button').addEventListener('click', (e) => {
            const button = e.target.closest('button[data-id]');
            if (button) {
                const idToRemove = button.dataset.id;
                removeProductFromCart(idToRemove);
            }
        });
    });

    cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;

    // Mostrar el descuento/recargo aplicado
    if (adjustmentAmount !== 0) {
        let text = currentDiscountSurcharge.type.includes('discount') ? 'Descuento' : 'Recargo';
        let sign = currentDiscountSurcharge.type.includes('discount') ? '-' : '+';
        discountSurchargeAmountSpan.textContent = `${sign}$${adjustmentAmount.toFixed(2)}`;
        discountSurchargeDisplay.classList.remove('hidden');
    } else {
        discountSurchargeDisplay.classList.add('hidden');
    }
}

function addProductToCart(product) {
    if (product.stock !== undefined && product.stock <= 0) {
        showModal(`No hay stock disponible para ${product.name}.`);
        return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        if (product.stock !== undefined && existingItem.quantity >= product.stock) {
            showModal(`El stock de ${product.name} es de ${product.stock} unidades.`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, stock: product.stock });
    }
    renderCart();
}

function addComboToCart(combo) {
    const existingCombo = cart.find(item => item.isCombo && item.comboId === combo.id);
    if (existingCombo) {
        existingCombo.quantity += 1;
    } else {
        const comboItem = {
            id: `combo-${combo.id}`,
            name: combo.name,
            price: combo.price,
            quantity: 1,
            isCombo: true,
            comboId: combo.id,
            items: combo.items,
            basePrice: combo.items.reduce((sum, item) => {
                const product = allProducts.find(p => p.id === item.productId);
                return sum + (product ? product.price * item.quantity : 0);
            }, 0)
        };
        cart.push(comboItem);
    }
    renderCart();
}

function removeProductFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id')?.value;
        const name = document.getElementById('product-name-input')?.value;
        const price = parseFloat(document.getElementById('product-price-input')?.value);
        const stockInput = document.getElementById('product-stock-input')?.value;
        const stock = stockInput !== '' ? parseInt(stockInput, 10) : undefined;
        const categoryId = productCategoryInput?.value || null;

        if (isNaN(price) || price <= 0 || (stock !== undefined && (isNaN(stock) || stock < 0))) {
            showModal("El precio debe ser un número positivo y el stock debe ser un número entero no negativo.");
            return;
        }
        
        const productData = { name, price };
        if (stock !== undefined) {
            productData.stock = stock;
        }
        if (categoryId) {
            productData.categoryId = categoryId;
        }

        try {
            if (id) {
                const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, id);
                await setDoc(productRef, productData, { merge: true });
                showModal("Producto editado con éxito.");
                
                // NUEVO: Lógica para actualizar combos si el precio del producto cambia
                const oldProduct = allProducts.find(p => p.id === id);
                if (oldProduct && oldProduct.price !== price) {
                    const priceDifference = price - oldProduct.price;
                    const combosWithProduct = allCombos.filter(combo => combo.items.some(item => item.productId === id));
                    
                    for (const combo of combosWithProduct) {
                        const productItem = combo.items.find(item => item.productId === id);
                        const priceChange = priceDifference * productItem.quantity;
                        const newComboPrice = combo.price + priceChange;

                        const comboRef = doc(db, SHARED_COMBOS_COLLECTION, combo.id);
                        await setDoc(comboRef, { price: newComboPrice }, { merge: true });
                    }
                }
            } else {
                const productsCollection = collection(db, SHARED_PRODUCTS_COLLECTION);
                await addDoc(productsCollection, productData);
                showModal("Producto añadido con éxito.");
            }
            if (productForm) productForm.reset();
            const productIdInput = document.getElementById('product-id');
            if (productIdInput) productIdInput.value = '';
            
            // Ocultar el formulario después de guardar
            if (productFormContainer) productFormContainer.classList.add('hidden');
            
        } catch (error) {
            console.error("Error al guardar el producto:", error);
            showModal("Error al guardar el producto. Por favor, intenta de nuevo.");
        }
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showModal("El carrito está vacío. Añade productos para finalizar la venta.");
            return;
        }
        if (!dailyCashData || dailyCashData.cerrada) {
            showModal("La caja no está abierta. Por favor, abre la caja para registrar ventas.");
            return;
        }
        currentReservationToProcess = null;
        const { total } = calculateTotal();
        if (paymentTotalDisplay) paymentTotalDisplay.textContent = `$${total.toFixed(2)}`;
        if (paymentRemainingDisplay) paymentRemainingDisplay.textContent = `$${total.toFixed(2)}`;

        if (paymentInputsContainer) paymentInputsContainer.innerHTML = '';
        addPaymentInput(total);

        if (splitPaymentModal) splitPaymentModal.classList.remove('hidden');
    });
}

if (applyDiscountSurchargeBtn) {
    applyDiscountSurchargeBtn.addEventListener('click', () => {
        const value = parseFloat(discountSurchargeValueInput?.value);
        const type = discountSurchargeTypeSelect?.value;

        if (isNaN(value) || value <= 0) {
            showModal("El valor del descuento/recargo debe ser un número positivo.");
            return;
        }

        currentDiscountSurcharge.value = value;
        currentDiscountSurcharge.type = type;

        renderCart();
    });
}

if (clearDiscountSurchargeBtn) {
    clearDiscountSurchargeBtn.addEventListener('click', () => {
        currentDiscountSurcharge.value = 0;
        currentDiscountSurcharge.type = null;
        discountSurchargeValueInput.value = '';
        renderCart();
    });
}


function addPaymentInput(amount = 0) {
    if (!paymentInputsContainer) return;
    const row = document.createElement('div');
    row.className = "flex space-x-2";

    const select = document.createElement('select');
    select.className = "flex-grow px-4 py-2 border border-gray-300 rounded-lg";
    const allMethods = [...new Set([...defaultPaymentMethods, ...userPaymentMethods.map(m => m.name)])];
    allMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        select.appendChild(option);
    });

    const input = document.createElement('input');
    input.type = "number";
    input.placeholder = "Monto";
    input.step = "0.01";
    input.className = "w-full px-4 py-2 border border-gray-300 rounded-lg";

    if (paymentInputsContainer.children.length === 0) {
        input.value = parseFloat(paymentTotalDisplay.textContent.replace('$', '')).toFixed(2);
    } else {
        input.value = amount.toFixed(2);
    }
    
    if (input && select) {
        input.addEventListener('input', updateRemainingAmount);
        select.addEventListener('change', updateRemainingAmount);
    }

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `<i class="fas fa-times-circle"></i>`;
    removeBtn.className = "px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600";
    removeBtn.addEventListener('click', () => {
        row.remove();
        if (paymentInputsContainer.children.length === 0) {
            addPaymentInput(parseFloat(paymentTotalDisplay.textContent.replace('$', '')));
        }
        updateRemainingAmount();
    });

    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    paymentInputsContainer.appendChild(row);

    if (paymentInputsContainer.children.length >= 1) {
        if (addPaymentInputBtn) addPaymentInputBtn.classList.remove('hidden');
    } else {
        if (addPaymentInputBtn) addPaymentInputBtn.classList.add('hidden');
    }
    updateRemainingAmount();
}

if (addPaymentInputBtn) {
    addPaymentInputBtn.addEventListener('click', () => {
        addPaymentInput(0);
    });
}

if (cancelSplitBtn) {
    cancelSplitBtn.addEventListener('click', () => {
        if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
        cart = [];
        renderCart();
        currentReservationToProcess = null;
    });
}

function updateRemainingAmount() {
    if (!paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer) return;
    const total = parseFloat(paymentTotalDisplay.textContent.replace('$', ''));
    const paymentInputs = paymentInputsContainer.querySelectorAll('input[type="number"]');
    let sum = 0;
    paymentInputs.forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    const remaining = total - sum;
    paymentRemainingDisplay.textContent = `$${remaining.toFixed(2)}`;
    paymentRemainingDisplay.style.color = remaining < 0 ? '#ef4444' : '#f59e0b';
    if (remaining === 0) {
        paymentRemainingDisplay.style.color = '#10b981';
    }
}


if (importSalesBtn) {
    importSalesBtn.addEventListener('click', () => {
        if (importSalesInput) importSalesInput.click();
    });
}

if (importSalesInput) {
    importSalesInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvData = event.target.result;
                await processImportedSales(csvData);
            };
            reader.readAsText(file);
        }
    });
}

if (exportSalesBtn) {
        exportSalesBtn.addEventListener('click', () => {
            exportSalesToCsv(allSales);
        });
    }

function exportSalesToCsv(sales) {
    const headers = ["ID", "Fecha", "Subtotal", "Ajuste", "Total", "Pagos", "Cliente", "Items"];
    const rows = sales.map(sale => {
        const date = sale.timestamp ? new Date(sale.timestamp.seconds * 1000).toLocaleString('es-ES') : '';
        const subtotal = sale.subtotal ? sale.subtotal.toFixed(2) : '';
        const adjustment = sale.adjustment ? `${sale.adjustment.amount.toFixed(2)} (${sale.adjustment.type})` : '';
        const payments = JSON.stringify(sale.payments);
        const items = JSON.stringify(sale.items);
        const customer = sale.customerName || '';
        return `"${sale.id}","${date}","${subtotal}","${adjustment}",${sale.total.toFixed(2)},"${payments}","${customer}","${items}"`;
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'ventas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function processImportedSales(csvData) {
    const rows = csvData.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) {
        showModal("El archivo CSV debe contener al menos una fila de datos después del encabezado.");
        return;
    }

    const salesCollection = collection(db, SHARED_SALES_COLLECTION);
    let importedCount = 0;
    const errors = [];

    const headers = rows[0].split(',').map(header => header.trim());

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',').map(cell => cell.trim());
        if (row.length !== 3) {
            errors.push(`Fila ${i + 1}: Formato de fila incorrecto.`);
            continue;
        }

        const dateString = row[0];
        const total = parseFloat(row[1]);
        const paymentMethod = row[2];

        if (isNaN(total) || total <= 0) {
            errors.push(`Fila ${i + 1}: El total no es un número válido.`);
            continue;
        }

        try {
            await addDoc(salesCollection, {
                items: [],
                total: total,
                payments: [{ method: paymentMethod, amount: total }],
                timestamp: new Date(dateString)
            });
            importedCount++;
        } catch (error) {
            console.error(`Error al importar la fila ${i + 1}:`, error);
            errors.push(`Fila ${i + 1}: Error al guardar en la base de datos.`);
        }
    }

    let message = `Importación completada. Se importaron ${importedCount} ventas.`;
    if (errors.length > 0) {
        message += ` Hubo ${errors.length} errores:\n${errors.join('\n')}`;
    }
    showModal(message);
}

// Lógica de clientes
if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name-input')?.value.trim();
        if (!name) {
            showModal("El nombre del cliente no puede estar vacío.");
            return;
        }
        try {
            const customersCollection = collection(db, SHARED_CUSTOMERS_COLLECTION);
            await addDoc(customersCollection, { name });
            if(addCustomerForm) addCustomerForm.reset();
            showModal(`Cliente '${name}' añadido con éxito.`);
            
            // Ocultar el formulario después de guardar
            if (customerFormContainer) customerFormContainer.classList.add('hidden');
            
        } catch (error) {
            console.error("Error al añadir cliente:", error);
            showModal("Error al añadir cliente. Intenta de nuevo.");
        }
    });
}

function renderCustomersList(customers) {
    if (!customersListContainer) return;
    customersListContainer.innerHTML = '';
    customers.forEach(customer => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
        itemDiv.innerHTML = `
        <span>${customer.name}</span>
        <div class="flex space-x-2">
            <button data-id="${customer.id}" class="edit-customer-btn px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm">
                <i class="fas fa-edit"></i>
            </button>
            <button data-id="${customer.id}" class="delete-customer-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        customersListContainer.appendChild(itemDiv);

        const editButton = itemDiv.querySelector('.edit-customer-btn');
        if(editButton) {
            editButton.addEventListener('click', () => {
                const newName = prompt(`Editar nombre de cliente:`, customer.name);
                if (newName && newName.trim()) {
                    const customerDocRef = doc(db, SHARED_CUSTOMERS_COLLECTION, customer.id);
                    setDoc(customerDocRef, { name: newName.trim() }, { merge: true });
                }
            });
        }

        const deleteButton = itemDiv.querySelector('.delete-customer-btn');
        if(deleteButton) {
            deleteButton.addEventListener('click', async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar a ${customer.name}?`)) {
                    const customerDocRef = doc(db, SHARED_CUSTOMERS_COLLECTION, customer.id);
                    await deleteDoc(customerDocRef);
                    showModal("Cliente eliminado.");
                }
            });
        }
    });
}

function renderCustomerSelect(customers) {
    if (!customerSelect) return;
    customerSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
}

function renderSalesChart(sales) {
    if (!salesChartCtx) return;

    const salesByDay = sales.reduce((acc, sale) => {
        if (sale.timestamp && sale.timestamp.seconds) {
            const date = new Date(sale.timestamp.seconds * 1000).toLocaleDateString('es-ES');
            acc[date] = (acc[date] || 0) + sale.total;
        }
        return acc;
    }, {});

    const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(a) - new Date(b));
    const salesData = sortedDates.map(date => salesByDay[date]);

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(salesChartCtx, {
        type: 'bar',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Ventas Diarias',
                data: salesData,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ventas Totales ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            }
        }
    });
}

function renderTopProductsChart(sales) {
    if (!topProductsChartCtx) return;

    const productSales = sales.flatMap(sale => sale.items).reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
    }, {});

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([, quantity]) => quantity);

    if (topProductsChart) {
        topProductsChart.destroy();
    }

    topProductsChart = new Chart(topProductsChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad Vendida',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Producto'
                    }
                }
            }
        }
    });
}

function renderPaymentMethodsChart(sales) {
    if (!paymentMethodsChartCtx) return;

    const paymentTotals = sales.reduce((acc, sale) => {
        sale.payments.forEach(payment => {
            acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        });
        return acc;
    }, {});

    const labels = Object.keys(paymentTotals);
    const data = Object.values(paymentTotals);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

    if (paymentMethodsChart) {
        paymentMethodsChart.destroy();
    }

    paymentMethodsChart = new Chart(paymentMethodsChartCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += `$${context.parsed.toFixed(2)}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Impresión de recibos
function printReceipt(sale) {
    const paymentsHtml = sale.payments.map(p => `
        <p class="payment-row">Pagado con ${p.method}: $${p.amount.toFixed(2)}</p>
    `).join('');

    const content = `
    <div id="print-area">
        <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-body { margin-bottom: 20px; }
            .receipt-footer { text-align: center; border-top: 1px dashed black; padding-top: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { text-align: left; padding: 5px 0; border-bottom: 1px solid #ccc; }
            .total-row td { font-weight: bold; font-size: 1.2em; border-top: 2px solid black; }
            .payment-row { margin-top: 10px; }
            @media print {
                body > *:not(#print-area) {
                    display: none;
                }
                #print-area {
                    display: block !important;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    z-index: 9999;
                }
            }
        </style>
        <div class="receipt-header">
            <h2>Recibo de Venta</h2>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            ${sale.customerName ? `<p>Cliente: ${sale.customerName}</p>` : ''}
        </div>
        <div class="receipt-body">
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="text-align: right; margin-top: 20px;">
                <p><strong>Total: $${sale.total.toFixed(2)}</strong></p>
                ${paymentsHtml}
            </div>
        </div>
        <div class="receipt-footer">
            <p>¡Gracias por tu compra!</p>
        </div>
    </div>
    `;

    // 1. Crea un contenedor temporal
    const printArea = document.createElement('div');
    printArea.innerHTML = content;
    document.body.appendChild(printArea);

    // 2. Espera a que el DOM se actualice y luego imprime
    setTimeout(() => {
        window.print();
        // 3. Elimina el contenedor temporal después de la impresión
        document.body.removeChild(printArea);
    }, 500);
}

// Lógica de autenticación
if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = authEmail?.value;
        const password = authPassword?.value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showModal("Inicio de sesión exitoso.");
            if (authModal) authModal.classList.add('hidden');
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            showModal("Error al iniciar sesión. Verifica tus credenciales.");
        }
    });
}

if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = authEmail?.value;
        const password = authPassword?.value;
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            showModal("Registro exitoso. Ahora puedes iniciar sesión.");
        } catch (error) {
            console.error("Error al registrar:", error);
            if (error.code === 'auth/email-already-in-use') {
                showModal("El correo electrónico ya está en uso.");
            } else {
                showModal("Error al registrarse. Intenta de nuevo.");
            }
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            showModal("Sesión cerrada correctamente.");
            cart = [];
            renderCart();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            showModal("Hubo un error al cerrar la sesión.");
        }
    });
}

function toggleFilters() {
    if (filtersContainer) {
        filtersContainer.classList.toggle('hidden');
    }
}

if (toggleFiltersBtn) {
    toggleFiltersBtn.addEventListener('click', toggleFilters);
}

// Se hace global para poder llamarla desde el HTML con onclick
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('hidden');
        const icon = section.previousElementSibling?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
}

// FUNCIÓN PARA AÑADIR UN CAMPO DE PRODUCTO AL FORMULARIO DEL COMBO
function addComboProductInput(product = null, quantity = 1) {
    if (!comboProductsContainer) return;

    const div = document.createElement('div');
    div.className = "flex space-x-2 items-center mb-2";
    div.innerHTML = `
        <select class="combo-product-select w-full px-2 py-1 border rounded-lg"></select>
        <input type="number" class="combo-product-quantity w-24 px-2 py-1 border rounded-lg text-center" value="${quantity}" min="1">
        <button type="button" class="remove-combo-product-btn text-red-500 hover:text-red-700">
            <i class="fas fa-times-circle"></i>
        </button>
    `;

    const select = div.querySelector('.combo-product-select');
    const removeBtn = div.querySelector('.remove-combo-product-btn');

    // Poblar el select con la lista de productos
    allProducts.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = prod.name;
        select.appendChild(option);
    });

    if (product) {
        select.value = product.id;
    }

    // Añadir el listener para el botón de remover
    removeBtn.addEventListener('click', () => {
        div.remove();
    });

    comboProductsContainer.appendChild(div);
}

// FUNCIÓN PARA GUARDAR EL COMBO
if (addComboForm) {
    addComboForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const comboId = comboIdInput?.value;
        const comboName = comboNameInput?.value;
        const comboPrice = parseFloat(comboPriceInput?.value);

        if (!comboName || isNaN(comboPrice) || comboPrice <= 0) {
            showModal("Por favor, ingresa un nombre y un precio válido para el combo.");
            return;
        }

        const comboProducts = [];
        const productInputs = comboProductsContainer?.querySelectorAll('.combo-product-select');
        const quantityInputs = comboProductsContainer?.querySelectorAll('.combo-product-quantity');

        if (productInputs?.length === 0) {
            showModal("Un combo debe tener al menos un producto.");
            return;
        }

        for (let i = 0; i < productInputs.length; i++) {
            const productId = productInputs[i].value;
            const quantity = parseInt(quantityInputs[i].value, 10);
            comboProducts.push({ productId, quantity });
        }
        
        const comboData = {
            name: comboName,
            price: comboPrice,
            items: comboProducts,
            timestamp: serverTimestamp()
        };

        try {
            if (comboId) {
                // Editar combo existente
                const comboRef = doc(db, SHARED_COMBOS_COLLECTION, comboId);
                await setDoc(comboRef, comboData, { merge: true });
                showModal("Combo editado con éxito.");
            } else {
                // Añadir nuevo combo
                await addDoc(collection(db, SHARED_COMBOS_COLLECTION), comboData);
                showModal("Combo guardado con éxito.");
            }
            addComboForm.reset();
            comboProductsContainer.innerHTML = ''; // Limpiar los inputs del combo
            addComboForm.classList.add('hidden'); // Ocultar el formulario
        } catch (error) {
            console.error("Error al guardar el combo:", error);
            showModal("Hubo un error al guardar el combo. Intenta de nuevo.");
        }
    });
}

function renderManageCombos() {
    if (!promotionsList) return;
    promotionsList.innerHTML = '';

    // Renderizar combos
    allCombos.forEach(combo => {
        const comboDiv = document.createElement('div');
        comboDiv.className = "bg-gray-100 p-3 rounded-lg flex items-center justify-between";
        
        let productsHtml = combo.items.map(item => {
            const product = allProducts.find(p => p.id === item.productId);
            return product ? `${product.name} (x${item.quantity})` : 'Producto no encontrado';
        }).join(', ');

        const totalComponentPrice = combo.items.reduce((total, item) => {
            const product = allProducts.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);

        comboDiv.innerHTML = `
            <div class="flex-grow">
                <span class="font-semibold">${combo.name}</span>
                <span class="text-gray-500"> - Precio Combo: $${combo.price.toFixed(2)}</span>
                <p class="text-sm text-gray-400">Precio de los componentes: $${totalComponentPrice.toFixed(2)}</p>
                <p class="text-sm text-gray-400">Productos: ${productsHtml}</p>
            </div>
            <div class="flex space-x-2">
                <button data-combo-id="${combo.id}" class="edit-combo-btn px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors">
                    <i class="fas fa-edit"></i>
                </button>
                <button data-combo-id="${combo.id}" class="delete-combo-btn px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        promotionsList.appendChild(comboDiv);

        // Añadir listeners a los botones de editar y eliminar
        comboDiv.querySelector('.edit-combo-btn').addEventListener('click', () => {
            const selectedCombo = allCombos.find(c => c.id === combo.id);
            if (selectedCombo) {
                // Muestra el formulario y rellena los campos
                if (addComboForm) addComboForm.classList.remove('hidden');
                if (comboIdInput) comboIdInput.value = selectedCombo.id;
                if (comboNameInput) comboNameInput.value = selectedCombo.name;
                if (comboPriceInput) comboPriceInput.value = selectedCombo.price;
                if (comboProductsContainer) comboProductsContainer.innerHTML = '';
                selectedCombo.items.forEach(item => {
                    const product = allProducts.find(p => p.id === item.productId);
                    if (product) {
                        addComboProductInput(product, item.quantity);
                    }
                });
            }
        });

        comboDiv.querySelector('.delete-combo-btn').addEventListener('click', () => {
            showConfirmationModal(`¿Estás seguro de que quieres eliminar el combo '${combo.name}'?`, async () => {
                try {
                    const comboRef = doc(db, SHARED_COMBOS_COLLECTION, combo.id);
                    await deleteDoc(comboRef);
                    showModal("Combo eliminado con éxito.");
                } catch (error) {
                    console.error("Error al eliminar el combo:", error);
                    showModal("Error al eliminar el combo. Por favor, intenta de nuevo.");
                }
            }, () => {});
        });
    });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {

    // Configurar la navegación principal del menú
    setupNavigation();

    // Configurar la navegación de pestañas
    setupTabNavigation();

    // Configurar la navegación de pestañas de Caja y Gastos
    setupCashTabNavigation();

    // Reasignar el evento de clic a los botones de navegación superior
    const topNavButtons = document.querySelectorAll('.fixed button[data-page]');
    topNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;
            showPage(targetPageId);
            // Si el menú principal está oculto, deseleccionar cualquier pestaña
            if(targetPageId !== 'home-menu') {
                document.querySelector('.tab-btn.active')?.classList.remove('active');
            }
        });
    });

    // Manejar el estado de autenticación al cargar la página
    onAuthStateChanged(auth, user => {
        if (user) {
            userId = user.uid;
            setupRealtimeListeners();
            if (authModal) authModal.classList.add('hidden');
            // Al iniciar sesión, mostrar el POS y activar su pestaña
            showPage('pos-page');
            const posTab = document.querySelector('.tab-btn[data-page="pos-page"]');
            if(posTab) {
                posTab.classList.add('active');
            }
        } else {
            if (authModal) authModal.classList.remove('hidden');
            pages.forEach(page => page.classList.remove('active'));
        }
    });

    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('customer-name-input')?.value.trim();
            if (!name) {
                showModal("El nombre del cliente no puede estar vacío.");
                return;
            }
            try {
                const customersCollection = collection(db, SHARED_CUSTOMERS_COLLECTION);
                await addDoc(customersCollection, { name });
                if(addCustomerForm) addCustomerForm.reset();
                showModal(`Cliente '${name}' añadido con éxito.`);
            } catch (error) {
                console.error("Error al añadir cliente:", error);
                showModal("Error al añadir cliente. Intenta de nuevo.");
            }
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('product-id')?.value;
            const name = document.getElementById('product-name-input')?.value;
            const price = parseFloat(document.getElementById('product-price-input')?.value);
            const stockInput = document.getElementById('product-stock-input')?.value;
            const stock = stockInput !== '' ? parseInt(stockInput, 10) : undefined;
            const categoryId = productCategoryInput?.value || null;

            if (isNaN(price) || price <= 0 || (stock !== undefined && (isNaN(stock) || stock < 0))) {
                showModal("El precio debe ser un número positivo y el stock debe ser un número entero no negativo.");
                return;
            }

            try {
                if (id) {
                    const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, id);
                    await setDoc(productRef, { name, price, stock }, { merge: true });
                    showModal("Producto editado con éxito.");
                } else {
                    const productsCollection = collection(db, SHARED_PRODUCTS_COLLECTION);
                    await addDoc(productsCollection, productData);
                    showModal("Producto añadido con éxito.");
                }
                if (productForm) productForm.reset();
                const productIdInput = document.getElementById('product-id');
                if (productIdInput) productIdInput.value = '';
            } catch (error) {
                console.error("Error al guardar el producto:", error);
                showModal("Error al guardar el producto. Por favor, intenta de nuevo.");
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showModal("El carrito está vacío. Añade productos para finalizar la venta.");
                return;
            }
            if (!dailyCashData || dailyCashData.cerrada) {
                showModal("La caja no está abierta. Por favor, abre la caja para registrar ventas.");
                return;
            }

            const { total } = calculateTotal();
            if (paymentTotalDisplay) paymentTotalDisplay.textContent = `$${total.toFixed(2)}`;
            if (paymentRemainingDisplay) paymentRemainingDisplay.textContent = `$${total.toFixed(2)}`;

            if (paymentInputsContainer) paymentInputsContainer.innerHTML = '';
            addPaymentInput(total);

            if (splitPaymentModal) splitPaymentModal.classList.remove('hidden');
        });
    }

    if (applyDiscountSurchargeBtn) {
        applyDiscountSurchargeBtn.addEventListener('click', () => {
            const value = parseFloat(discountSurchargeValueInput?.value);
            const type = discountSurchargeTypeSelect?.value;

            if (isNaN(value) || value <= 0) {
                showModal("El valor del descuento/recargo debe ser un número positivo.");
                return;
            }

            currentDiscountSurcharge.value = value;
            currentDiscountSurcharge.type = type;

            renderCart();
        });
    }

    if (clearDiscountSurchargeBtn) {
        clearDiscountSurchargeBtn.addEventListener('click', () => {
            currentDiscountSurcharge.value = 0;
            currentDiscountSurcharge.type = null;
            discountSurchargeValueInput.value = '';
            renderCart();
        });
    }


    if (addPaymentInputBtn) {
        addPaymentInputBtn.addEventListener('click', () => {
            addPaymentInput(0);
        });
    }

    if (cancelSplitBtn) {
        cancelSplitBtn.addEventListener('click', () => {
            if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
        });
    }
    
    // Mover este bloque fuera de setupRealtimeListeners
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', async () => {
            if (isProcessingPayment) {
                return;
            }
            isProcessingPayment = true;
            processPaymentBtn.disabled = true;

            if (!paymentInputsContainer || !customerSelect || !splitPaymentModal) {
                console.error("Faltan elementos del DOM para procesar el pago.");
                processPaymentBtn.disabled = false;
                isProcessingPayment = false;
                return;
            }
            
            const { subtotal, total, adjustmentAmount } = calculateTotal();
            const paymentInputs = paymentInputsContainer.querySelectorAll('input[type="number"]');
            const paymentSelects = paymentInputsContainer.querySelectorAll('select');

            let sum = 0;
            const payments = [];

            for (let i = 0; i < paymentInputs.length; i++) {
                const amount = parseFloat(paymentInputs[i].value);
                const method = paymentSelects[i].value;
                if (isNaN(amount) || amount <= 0) {
                    showModal("Todos los montos deben ser números positivos.");
                    processPaymentBtn.disabled = false;
                    isProcessingPayment = false;
                    return;
                }
                sum += amount;
                payments.push({ method: method, amount: amount });
            }

            if (Math.abs(sum - total) > 0.01) {
                showModal("La suma de los pagos no coincide con el total.");
                processPaymentBtn.disabled = false;
                isProcessingPayment = false;
                return;
            }
            const cashId = new Date().toLocaleDateString('en-CA');
            try {
                const productUpdates = cart.map(item => {
                    if (item.stock !== undefined) {
                        const productDocRef = doc(db, SHARED_PRODUCTS_COLLECTION, item.id);
                        return updateDoc(productDocRef, {
                            stock: increment(-item.quantity)
                        });
                    }
                }).filter(Boolean);

                await Promise.all(productUpdates);

                if (currentReservationToProcess) {
                    // Procesando un pedido reservado
                    const newSaleRef = await addDoc(collection(db, SHARED_SALES_COLLECTION), {
                        ...currentReservationToProcess,
                        payments: payments,
                        total: total,
                        timestamp: serverTimestamp(),
                        cashId: cashId
                    });

                    const reservationDocRef = doc(db, SHARED_RESERVATIONS_COLLECTION, currentReservationToProcess.id);
                    await deleteDoc(reservationDocRef);

                    showModal("Pedido reservado facturado con éxito y eliminado de las reservaciones.");
                    if (confirm("¿Deseas imprimir el recibo de la venta?")) {
                        printReceipt({
                            ...currentReservationToProcess,
                            id: newSaleRef.id,
                            payments: payments,
                            total: total,
                            timestamp: new Date()
                        });
                    }
                } else {
                    // Procesando una venta nueva
                    const customerId = customerSelect.value;
                    const customerName = customerSelect.options[customerSelect.selectedIndex].text;

                    const salesCollection = collection(db, SHARED_SALES_COLLECTION);
                    const newSaleRef = await addDoc(salesCollection, {
                        items: cart,
                        subtotal: subtotal,
                        adjustment: {
                            amount: adjustmentAmount,
                            type: currentDiscountSurcharge.type
                        },
                        total: total,
                        payments: payments,
                        customerId: customerId || null,
                        customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
                        timestamp: serverTimestamp(),
                        cashId: cashId
                    });

                    showModal("Venta finalizada con éxito. El carrito se ha vaciado.");

                    if (confirm("¿Deseas imprimir el recibo de la venta?")) {
                        printReceipt({
                            id: newSaleRef.id,
                            items: cart,
                            subtotal: subtotal,
                            adjustment: {
                                amount: adjustmentAmount,
                                type: currentDiscountSurcharge.type
                            },
                            total: total,
                            payments: payments,
                            customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
                            timestamp: new Date()
                        });
                    }
                }

                cart = [];
                currentDiscountSurcharge = { value: 0, type: null };
                currentReservationToProcess = null;
                renderCart();
                if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
                if (customerSelect) customerSelect.value = "";

            } catch (error) {
                console.error("Error al finalizar la venta:", error);
                showModal("Hubo un error al registrar la venta. Por favor, intenta de nuevo.");
            } finally {
                isProcessingPayment = false;
                processPaymentBtn.disabled = false;
            }
        });
    }

    if (importSalesBtn) {
        importSalesBtn.addEventListener('click', () => {
            if (importSalesInput) importSalesInput.click();
        });
    }

    if (importSalesInput) {
        importSalesInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const csvData = event.target.result;
                    await processImportedSales(csvData);
                };
                reader.readAsText(file);
            }
        });
    }

    if (exportSalesBtn) {
        exportSalesBtn.addEventListener('click', () => {
            exportSalesToCsv(allSales);
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            renderSalesHistory(allSales);
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (filterStartDate) filterStartDate.value = '';
            if (filterEndDate) filterEndDate.value = '';
            if (filterProduct) filterProduct.value = '';
            if (filterPaymentMethod) filterPaymentMethod.value = '';
            renderSalesHistory(allSales);
        });
    }

    if (addPaymentMethodForm) {
        addPaymentMethodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPaymentNameInput = document.getElementById('new-payment-method-name');
            const newMethod = newPaymentNameInput?.value.trim();
            if (newMethod && !userPaymentMethods.map(m => m.name).includes(newMethod) && !defaultPaymentMethods.includes(newMethod)) {
                try {
                    await addDoc(collection(db, SHARED_PAYMENT_METHODS_COLLECTION), { name: newMethod });
                    if(newPaymentNameInput) newPaymentNameInput.value = '';
                    showModal("Forma de pago añadida con éxito.");
                } catch (error) {
                    console.error("Error al añadir forma de pago:", error);
                    showModal("Error al añadir forma de pago.");
                }
            } else {
                showModal("Esa forma de pago ya existe o no es válida.");
            }
        });
    }

    if (addExpenseCategoryForm) {
        addExpenseCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newExpenseNameInput = document.getElementById('new-expense-category-name');
            const newCategory = newExpenseNameInput?.value.trim();
            if (newCategory && !userExpenseCategories.map(c => c.name).includes(newCategory) && !defaultExpenseCategories.includes(newCategory)) {
                try {
                    await addDoc(collection(db, SHARED_EXPENSE_CATEGORIES_COLLECTION), { name: newCategory });
                    if(newExpenseNameInput) newExpenseNameInput.value = '';
                    showModal("Categoría de gasto añadida con éxito.");
                } catch (error) {
                    console.error("Error al añadir categoría de gasto:", error);
                    showModal("Error al añadir categoría de gasto.");
                }
            } else {
                showModal("Esa categoría de gasto ya existe o no es válida.");
            }
        });
    }
    
    // NUEVO: Listeners para los botones de combos
    if (showComboFormBtn) {
        showComboFormBtn.addEventListener('click', () => {
            if (addComboForm) addComboForm.classList.remove('hidden');
            // Limpiar el formulario y el campo ID al cambiar a "Crear Combo"
            addComboForm.reset();
            if (comboIdInput) comboIdInput.value = '';
            if (comboProductsContainer) comboProductsContainer.innerHTML = '';
        });
    }

    if (addComboProductBtn) {
        addComboProductBtn.addEventListener('click', () => {
            addComboProductInput();
        });
    }
    
    const topSettingsButton = document.querySelector('button[data-page="settings-page"]');
    if (topSettingsButton) {
        topSettingsButton.addEventListener('click', () => {
            showPage('settings-page');
            document.querySelector('.tab-btn.active')?.classList.remove('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showModal("Sesión cerrada correctamente.");
                cart = [];
                renderCart();
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                showModal("Hubo un error al cerrar la sesión.");
            }
        });
    }
    
    // Toggle forms visibility
    if (toggleProductFormBtn) {
        toggleProductFormBtn.addEventListener('click', () => {
            if (productFormContainer) {
                productFormContainer.classList.toggle('hidden');
                if (expenseFormContainer && !expenseFormContainer.classList.contains('hidden')) {
                    expenseFormContainer.classList.add('hidden');
                }
                if (customerFormContainer && !customerFormContainer.classList.contains('hidden')) {
                    customerFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    if (toggleExpenseFormBtn) {
        toggleExpenseFormBtn.addEventListener('click', () => {
            if (expenseFormContainer) {
                expenseFormContainer.classList.toggle('hidden');
                if (productFormContainer && !productFormContainer.classList.contains('hidden')) {
                    productFormContainer.classList.add('hidden');
                }
                if (customerFormContainer && !customerFormContainer.classList.contains('hidden')) {
                    customerFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    if (toggleCustomerFormBtn) {
        toggleCustomerFormBtn.addEventListener('click', () => {
            if (customerFormContainer) {
                customerFormContainer.classList.toggle('hidden');
                if (productFormContainer && !productFormContainer.classList.contains('hidden')) {
                    productFormContainer.classList.add('hidden');
                }
                if (expenseFormContainer && !expenseFormContainer.classList.contains('hidden')) {
                    expenseFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    // NUEVO: Manejador para el botón de reservar
    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            reserveOrder();
        });
    }

    async function reserveOrder() {
        if (cart.length === 0) {
            showModal("El carrito está vacío. Añade productos para reservar el pedido.");
            return;
        }

        const customerId = customerSelect.value;
        const customerName = customerSelect.options[customerSelect.selectedIndex].text;

        if (!customerId) {
            showModal("Por favor, selecciona un cliente para reservar el pedido.");
            return;
        }

        const {
            subtotal,
            total,
            adjustmentAmount
        } = calculateTotal();

        try {
            await addDoc(collection(db, SHARED_RESERVATIONS_COLLECTION), {
                items: cart,
                subtotal: subtotal,
                adjustment: {
                    amount: adjustmentAmount,
                    type: currentDiscountSurcharge.type
                },
                total: total,
                customerId: customerId,
                customerName: customerName,
                timestamp: serverTimestamp()
            });

            cart = [];
            currentDiscountSurcharge = {
                value: 0,
                type: null
            };
            renderCart();
            customerSelect.value = "";
            showModal("Pedido reservado con éxito.");
        } catch (error) {
            console.error("Error al reservar el pedido:", error);
            showModal("Hubo un error al reservar el pedido. Intenta de nuevo.");
        }
    }
    
    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', async () => {
            if (isProcessingPayment) {
                return;
            }
            isProcessingPayment = true;
            processPaymentBtn.disabled = true;

            if (!paymentInputsContainer || !customerSelect || !splitPaymentModal) {
                console.error("Faltan elementos del DOM para procesar el pago.");
                processPaymentBtn.disabled = false;
                isProcessingPayment = false;
                return;
            }
            
            const { subtotal, total, adjustmentAmount } = calculateTotal();
            const paymentInputs = paymentInputsContainer.querySelectorAll('input[type="number"]');
            const paymentSelects = paymentInputsContainer.querySelectorAll('select');

            let sum = 0;
            const payments = [];

            for (let i = 0; i < paymentInputs.length; i++) {
                const amount = parseFloat(paymentInputs[i].value);
                const method = paymentSelects[i].value;
                if (isNaN(amount) || amount <= 0) {
                    showModal("Todos los montos deben ser números positivos.");
                    processPaymentBtn.disabled = false;
                    isProcessingPayment = false;
                    return;
                }
                sum += amount;
                payments.push({ method: method, amount: amount });
            }

            if (Math.abs(sum - total) > 0.01) {
                showModal("La suma de los pagos no coincide con el total.");
                processPaymentBtn.disabled = false;
                isProcessingPayment = false;
                return;
            }
            const cashId = new Date().toLocaleDateString('en-CA');
            try {
                const productUpdates = cart.map(item => {
                    if (item.stock !== undefined) {
                        const productDocRef = doc(db, SHARED_PRODUCTS_COLLECTION, item.id);
                        return updateDoc(productDocRef, {
                            stock: increment(-item.quantity)
                        });
                    }
                }).filter(Boolean);

                await Promise.all(productUpdates);

                if (currentReservationToProcess) {
                    // Procesando un pedido reservado
                    const newSaleRef = await addDoc(collection(db, SHARED_SALES_COLLECTION), {
                        ...currentReservationToProcess,
                        payments: payments,
                        total: total,
                        timestamp: serverTimestamp(),
                        cashId: cashId
                    });

                    const reservationDocRef = doc(db, SHARED_RESERVATIONS_COLLECTION, currentReservationToProcess.id);
                    await deleteDoc(reservationDocRef);

                    showModal("Pedido reservado facturado con éxito y eliminado de las reservaciones.");
                    if (confirm("¿Deseas imprimir el recibo de la venta?")) {
                        printReceipt({
                            ...currentReservationToProcess,
                            id: newSaleRef.id,
                            payments: payments,
                            total: total,
                            timestamp: new Date()
                        });
                    }
                } else {
                    // Procesando una venta nueva
                    const customerId = customerSelect.value;
                    const customerName = customerSelect.options[customerSelect.selectedIndex].text;

                    const salesCollection = collection(db, SHARED_SALES_COLLECTION);
                    const newSaleRef = await addDoc(salesCollection, {
                        items: cart,
                        subtotal: subtotal,
                        adjustment: {
                            amount: adjustmentAmount,
                            type: currentDiscountSurcharge.type
                        },
                        total: total,
                        payments: payments,
                        customerId: customerId || null,
                        customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
                        timestamp: serverTimestamp(),
                        cashId: cashId
                    });

                    showModal("Venta finalizada con éxito. El carrito se ha vaciado.");

                    if (confirm("¿Deseas imprimir el recibo de la venta?")) {
                        printReceipt({
                            id: newSaleRef.id,
                            items: cart,
                            subtotal: subtotal,
                            adjustment: {
                                amount: adjustmentAmount,
                                type: currentDiscountSurcharge.type
                            },
                            total: total,
                            payments: payments,
                            customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
                            timestamp: new Date()
                        });
                    }
                }

                cart = [];
                currentDiscountSurcharge = { value: 0, type: null };
                currentReservationToProcess = null;
                renderCart();
                if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
                if (customerSelect) customerSelect.value = "";

            } catch (error) {
                console.error("Error al finalizar la venta:", error);
                showModal("Hubo un error al registrar la venta. Por favor, intenta de nuevo.");
            } finally {
                isProcessingPayment = false;
                processPaymentBtn.disabled = false;
            }
        });
    }

    if (importSalesBtn) {
        importSalesBtn.addEventListener('click', () => {
            if (importSalesInput) importSalesInput.click();
        });
    }

    if (importSalesInput) {
        importSalesInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const csvData = event.target.result;
                    await processImportedSales(csvData);
                };
                reader.readAsText(file);
            }
        });
    }

    if (exportSalesBtn) {
        exportSalesBtn.addEventListener('click', () => {
            exportSalesToCsv(allSales);
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            renderSalesHistory(allSales);
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (filterStartDate) filterStartDate.value = '';
            if (filterEndDate) filterEndDate.value = '';
            if (filterProduct) filterProduct.value = '';
            if (filterPaymentMethod) filterPaymentMethod.value = '';
            renderSalesHistory(allSales);
        });
    }

    if (addPaymentMethodForm) {
        addPaymentMethodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPaymentNameInput = document.getElementById('new-payment-method-name');
            const newMethod = newPaymentNameInput?.value.trim();
            if (newMethod && !userPaymentMethods.map(m => m.name).includes(newMethod) && !defaultPaymentMethods.includes(newMethod)) {
                try {
                    await addDoc(collection(db, SHARED_PAYMENT_METHODS_COLLECTION), { name: newMethod });
                    if(newPaymentNameInput) newPaymentNameInput.value = '';
                    showModal("Forma de pago añadida con éxito.");
                } catch (error) {
                    console.error("Error al añadir forma de pago:", error);
                    showModal("Error al añadir forma de pago.");
                }
            } else {
                showModal("Esa forma de pago ya existe o no es válida.");
            }
        });
    }

    if (addExpenseCategoryForm) {
        addExpenseCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newExpenseNameInput = document.getElementById('new-expense-category-name');
            const newCategory = newExpenseNameInput?.value.trim();
            if (newCategory && !userExpenseCategories.map(c => c.name).includes(newCategory) && !defaultExpenseCategories.includes(newCategory)) {
                try {
                    await addDoc(collection(db, SHARED_EXPENSE_CATEGORIES_COLLECTION), { name: newCategory });
                    if(newExpenseNameInput) newExpenseNameInput.value = '';
                    showModal("Categoría de gasto añadida con éxito.");
                } catch (error) {
                    console.error("Error al añadir categoría de gasto:", error);
                    showModal("Error al añadir categoría de gasto.");
                }
            } else {
                showModal("Esa categoría de gasto ya existe o no es válida.");
            }
        });
    }
    
    // NUEVO: Listeners para los botones de combos
    if (showComboFormBtn) {
        showComboFormBtn.addEventListener('click', () => {
            if (addComboForm) addComboForm.classList.remove('hidden');
            // Limpiar el formulario y el campo ID al cambiar a "Crear Combo"
            addComboForm.reset();
            if (comboIdInput) comboIdInput.value = '';
            if (comboProductsContainer) comboProductsContainer.innerHTML = '';
        });
    }

    if (addComboProductBtn) {
        addComboProductBtn.addEventListener('click', () => {
            addComboProductInput();
        });
    }
    
    const topSettingsButton = document.querySelector('button[data-page="settings-page"]');
    if (topSettingsButton) {
        topSettingsButton.addEventListener('click', () => {
            showPage('settings-page');
            document.querySelector('.tab-btn.active')?.classList.remove('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showModal("Sesión cerrada correctamente.");
                cart = [];
                renderCart();
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
                showModal("Hubo un error al cerrar la sesión.");
            }
        });
    }
    
    // Toggle forms visibility
    if (toggleProductFormBtn) {
        toggleProductFormBtn.addEventListener('click', () => {
            if (productFormContainer) {
                productFormContainer.classList.toggle('hidden');
                if (expenseFormContainer && !expenseFormContainer.classList.contains('hidden')) {
                    expenseFormContainer.classList.add('hidden');
                }
                if (customerFormContainer && !customerFormContainer.classList.contains('hidden')) {
                    customerFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    if (toggleExpenseFormBtn) {
        toggleExpenseFormBtn.addEventListener('click', () => {
            if (expenseFormContainer) {
                expenseFormContainer.classList.toggle('hidden');
                if (productFormContainer && !productFormContainer.classList.contains('hidden')) {
                    productFormContainer.classList.add('hidden');
                }
                if (customerFormContainer && !customerFormContainer.classList.contains('hidden')) {
                    customerFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    if (toggleCustomerFormBtn) {
        toggleCustomerFormBtn.addEventListener('click', () => {
            if (customerFormContainer) {
                customerFormContainer.classList.toggle('hidden');
                if (productFormContainer && !productFormContainer.classList.contains('hidden')) {
                    productFormContainer.classList.add('hidden');
                }
                if (expenseFormContainer && !expenseFormContainer.classList.contains('hidden')) {
                    expenseFormContainer.classList.add('hidden');
                }
            }
        });
    }
});
