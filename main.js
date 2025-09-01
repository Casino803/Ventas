import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp, updateDoc, query, where, getDocs, writeBatch, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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


let salesChart;
let topProductsChart;
let paymentMethodsChart;
let userId = '';
let cart = [];
let allProducts = [];
let allSales = [];
let dailyCashData = null;
let dailySalesTotal = 0;
let dailyExpensesTotal = 0;
let allCustomers = [];
let isProcessingPayment = false;
let currentDiscountSurcharge = {
    value: 0,
    type: null // 'percentage_discount', 'fixed_discount', 'percentage_surcharge', 'fixed_surcharge'
};

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


const defaultPaymentMethods = ["Efectivo", "Transferencia MP"];
let userPaymentMethods = [];

const defaultExpenseCategories = ["General", "Suministros", "Servicios"];
let userExpenseCategories = [];

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
    products.forEach(product => {
        renderProductCard(product);
    });
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


    // Colecciones ahora compartidas
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
}

// Funciones de renderizado de configuración
function renderPaymentMethodsList() {
    if (!paymentMethodsList) return; // Validación agregada
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
    if (!expenseCategoriesList) return; // Validación agregada
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

    card.innerHTML = `
    <h3 class="font-bold text-gray-800 text-lg mb-2">${product.name}</h3>
    <p class="text-xl font-bold text-green-600">$${product.price.toFixed(2)}</p>
    ${stockHtml}
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

    itemDiv.innerHTML = `
    <div class="flex-grow">
        <span class="font-semibold">${product.name}</span>
        <span class="text-gray-500"> - $${product.price.toFixed(2)}</span>
        ${stockDisplay}
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
            const newName = prompt(`Editar nombre de cliente:`, product.name);
            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name-input');
            const productPriceInput = document.getElementById('product-price-input');
            const productStockInput = document.getElementById('product-stock-input');

            if (productIdInput) productIdInput.value = product.id;
            if (productNameInput) productNameInput.value = product.name;
            if (productPriceInput) productPriceInput.value = product.price;
            if (productStockInput) productStockInput.value = product.stock;
        });
    }

    const deleteButton = itemDiv.querySelector('.delete-product-btn');
    if(deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                try {
                    const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, product.id);
                    await deleteDoc(productRef);
                    showModal("Producto eliminado con éxito.");
                } catch (error) {
                    console.error("Error al eliminar el producto:", error);
                    showModal("Error al eliminar el producto. Por favor, intenta de nuevo.");
                }
            }
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
        const dailyExpenses = expensesByDay[dateString];

        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        dayDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300">
            <h3 class="font-bold text-lg">${dateString}</h3>
            <span class="font-bold text-red-600 text-xl">Total: -$${dailyExpenses.total.toFixed(2)}</span>
        </div>
        `;

        dailyExpenses.expenses.forEach(expense => {
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
    });
}

function calculateTotal() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let total = subtotal;
    let adjustmentAmount = 0;

    if (currentDiscountSurcharge.value > 0) {
        if (currentDiscountSurcharge.type === 'percentage_discount') {
            adjustmentAmount = subtotal * (currentDiscountSurcharge.value / 100);
            total -= adjustmentAmount;
        } else if (currentDiscountSurcharge.type === 'fixed_discount') {
            adjustmentAmount = currentDiscountSurcharge.value;
            total -= adjustmentAmount;
        } else if (currentDiscountSurcharge.type === 'percentage_surcharge') {
            adjustmentAmount = subtotal * (currentDiscountSurcharge.value / 100);
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
        itemDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <span class="font-semibold">${item.name}</span>
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
        const stock = parseInt(document.getElementById('product-stock-input')?.value, 10);

        if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
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
                await addDoc(productsCollection, { name, price, stock });
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

        if (!paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer || !splitPaymentModal) {
            console.error("Faltan elementos del DOM para el checkout.");
            return;
        }
        
        const { total } = calculateTotal();

        paymentTotalDisplay.textContent = `$${total.toFixed(2)}`;
        paymentRemainingDisplay.textContent = `$${total.toFixed(2)}`;

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

    if (cartTotalSpan) {
        if (paymentInputsContainer.children.length === 0) {
            input.value = parseFloat(cartTotalSpan.textContent.replace('$', '')).toFixed(2);
        } else {
            input.value = amount.toFixed(2);
        }
    }

    if (input && select) {
        input.addEventListener('input', updateRemainingAmount);
        select.addEventListener('change', () => {
            if (cartTotalSpan && paymentInputsContainer.children.length === 1) {
                input.value = parseFloat(cartTotalSpan.textContent.replace('$', '')).toFixed(2);
            }
            updateRemainingAmount();
        });
    }

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `<i class="fas fa-times-circle"></i>`;
    removeBtn.className = "px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600";
    removeBtn.addEventListener('click', () => {
        row.remove();
        if (cartTotalSpan && paymentInputsContainer.children.length === 0) {
            addPaymentInput(parseFloat(cartTotalSpan.textContent.replace('$', '')));
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
    });
}

function updateRemainingAmount() {
    if (!cartTotalSpan || !paymentRemainingDisplay || !paymentInputsContainer) return;
    const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
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

if (processPaymentBtn) {
    processPaymentBtn.addEventListener('click', async () => {
        if (isProcessingPayment) return;
        isProcessingPayment = true;

        const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
        const paymentInputs = document.querySelectorAll('#payment-inputs-container input');
        const paymentSelects = document.querySelectorAll('#payment-inputs-container select');

        let totalPaid = 0;
        let payments = [];
        let errors = [];

        paymentInputs.forEach((input, index) => {
            const amount = parseFloat(input.value);
            const method = paymentSelects[index].value;
            if (isNaN(amount) || amount <= 0) {
                errors.push(`Monto de pago inválido para la forma de pago ${method}.`);
            }
            payments.push({ method, amount });
            totalPaid += amount;
        });

        if (Math.abs(totalPaid - total) > 0.01) {
            errors.push("El total pagado no coincide con el total de la venta.");
        }

        if (errors.length > 0) {
            showModal(errors.join('\n'));
            isProcessingPayment = false;
            return;
        }

        const customerId = customerSelect.value || null;
        const customerName = customerId ? customerSelect.options[customerSelect.selectedIndex].text : null;
        const cashId = new Date().toLocaleDateString('en-CA');
        const { subtotal, adjustmentAmount, total: finalTotal } = calculateTotal();

        try {
            await addDoc(collection(db, SHARED_SALES_COLLECTION), {
                items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
                subtotal: subtotal,
                total: finalTotal,
                adjustment: { amount: adjustmentAmount, type: currentDiscountSurcharge.type },
                payments: payments,
                timestamp: serverTimestamp(),
                customerId: customerId,
                customerName: customerName,
                cashId: cashId
            });

            const batch = writeBatch(db);
            for (const item of cart) {
                const productRef = doc(db, SHARED_PRODUCTS_COLLECTION, item.id);
                batch.update(productRef, { stock: increment(-item.quantity) });
            }
            await batch.commit();

            showModal("Venta registrada con éxito.");
            cart = [];
            renderCart();
            if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
        } catch (error) {
            console.error("Error al procesar la venta:", error);
            showModal("Hubo un error al procesar la venta. Por favor, intenta de nuevo.");
        } finally {
            isProcessingPayment = false;
        }
    });
}

if (importSalesBtn) {
    importSalesBtn.addEventListener('click', () => {
        importSalesInput.click();
    });
}

if (importSalesInput) {
    importSalesInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvData = event.target.result;

                let results;
                if (file.name.includes('VENTAS.csv')) {
                    results = await importDataFromCsv(csvData, 'sales', mapVentasToFirebase);
                } else if (file.name.includes('ARTICULOS.csv')) {
                    results = await importDataFromCsv(csvData, 'products', mapArticulosToFirebase);
                } else if (file.name.includes('CLIENTES.csv')) {
                    results = await importDataFromCsv(csvData, 'customers', mapClientesToFirebase);
                } else {
                    showModal('Tipo de archivo no reconocido.');
                    return;
                }

                let message = `Importación de ${file.name} completada. Se importaron ${results.importedCount} registros.`;
                if (results.errors.length > 0) {
                    message += ` Hubo ${results.errors.length} errores:\n${results.errors.join('\n')}`;
                }
                showModal(message);
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

// Lógica de importación de CSV
async function importDataFromCsv(csvContent, collectionName, mappingFunction) {
    const rows = csvContent.split(/\r?\n/).filter(row => row.trim() !== '');
    if (rows.length < 2) {
        showModal(`El archivo CSV para ${collectionName} no contiene datos.`);
        return { importedCount: 0, errors: [`Archivo para ${collectionName} no contiene datos.`] };
    }

    const headers = rows[0].split(',').map(h => h.trim().replace(/\ufeff/g, ''));
    const dataRows = rows.slice(1);
    let importedCount = 0;
    let errors = [];

    // Regex mejorada para manejar comas dentro de comillas
    const csvRegex = /(?:^|,)(?:"([^"]*(?:"")?)*"|([^,]*))(?:,|$)/g;

    for (const row of dataRows) {
        const values = [];
        let match;
        while ((match = csvRegex.exec(row)) !== null) {
            let value = match[1] || match[2] || '';
            value = value.replace(/""/g, '"').trim();
            values.push(value);
        }

        if (values.length !== headers.length) {
            errors.push(`Fila con formato incorrecto. Esperado ${headers.length} campos, encontrado ${values.length}: ${row}`);
            continue;
        }

        const item = mappingFunction(headers, values);
        if (item) {
            try {
                await addDoc(collection(db, collectionName), item);
                importedCount++;
            } catch (error) {
                errors.push(`Error al guardar en Firebase para la fila: ${row}. Error: ${error}`);
            }
        }
    }

    return { importedCount, errors };
}


function mapVentasToFirebase(headers, values) {
    const data = {};
    headers.forEach((header, index) => {
        data[header] = values[index];
    });

    const price = data.PRECIO ? parseFloat(data.PRECIO.replace(/[^0-9.-]+/g, "")) || 0 : 0;
    const quantity = data.UNIDADES ? parseInt(data.UNIDADES) || 0 : 0;
    const total = data.TOTAL ? parseFloat(data.TOTAL.replace(/[^0-9.-]+/g, "")) || 0 : 0;
    const items = [{
        name: data.ITEM,
        price: price,
        quantity: quantity
    }];

    const date = data.FECHA ? new Date(data.FECHA) : null;

    const payments = [{
        method: 'EFECTIVO',
        amount: total
    }];

    return {
        items: items,
        subtotal: total,
        total: total,
        payments: payments,
        timestamp: date,
        customerId: null,
        customerName: null,
        cashId: data.ID_Caja_FK || null
    };
}

function mapArticulosToFirebase(headers, values) {
    const data = {};
    headers.forEach((header, index) => {
        data[header] = values[index];
    });
    return {
        name: data.NOMBRE,
        price: data.PRECIO ? parseFloat(data.PRECIO.replace(/[^0-9.-]+/g,"")) || 0 : 0,
        stock: data.CANTIDAD ? parseInt(data.CANTIDAD) || 0 : 0
    };
}

function mapClientesToFirebase(headers, values) {
    const data = {};
    headers.forEach((header, index) => {
        data[header] = values[index];
    });
    return {
        name: data.CLIENTES
    };
}
