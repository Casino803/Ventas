import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, setDoc, deleteDoc, onSnapshot, collection, serverTimestamp, updateDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// Referencias de la UI
const menuButtons = document.querySelectorAll('button[data-page]');
const pages = document.querySelectorAll('.page-content');
const homeMenu = document.getElementById('home-menu');
const backToMenuBtns = document.querySelectorAll('.back-to-menu-btn');
const posSearchInput = document.getElementById('pos-search-input');
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const productForm = document.getElementById('product-form');
const manageProductsContainer = document.getElementById('manage-products-container');
const salesHistoryContainer = document.getElementById('sales-history-container');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');
const addPaymentMethodBtn = document.getElementById('add-payment-method-btn');
const paymentModal = document.getElementById('payment-modal');
const addPaymentForm = document.getElementById('add-payment-form');
const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
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

const cashTabContent = document.getElementById('cash-tab-content');
const expensesTabContent = document.getElementById('expenses-tab-content');
const cashTabButtons = document.querySelectorAll('.cash-tab-btn');


let salesChart;
let userId = '';
let cart = [];
let allProducts = [];
let allSales = [];
let dailyCashData = null;
let dailySalesTotal = 0;
let dailyExpensesTotal = 0;
let allCustomers = [];

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
    if(!cashTabButtons || !cashTabContent || !expensesTabContent) return;

    cashTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;

            cashTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (targetPageId === 'cash-tab-content') {
                cashTabContent.classList.add('active');
                expensesTabContent.classList.remove('active');
            } else if (targetPageId === 'expenses-tab-content') {
                expensesTabContent.classList.add('active');
                cashTabContent.classList.remove('active');
            }
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

// Corregido: Usar itemDiv para encontrar los botones
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

const salesByDay = filteredSales.reduce((acc, sale) => {
const timestamp = sale.timestamp;
if (timestamp && timestamp.seconds) {
const date = new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
if (!acc[date]) {
acc[date] = { total: 0, sales: [] };
}
acc[date].total += sale.total;
acc[date].sales.push(sale);
}
return acc;
}, {});

const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(b) - new Date(a));

sortedDates.forEach(dateString => {
const dailySales = salesByDay[dateString];

const dayDiv = document.createElement('div');
dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
dayDiv.innerHTML = `
<div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300">
<h3 class="font-bold text-lg">${dateString}</h3>
<span class="font-bold text-green-600 text-xl">Total: $${dailySales.total.toFixed(2)}</span>
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


saleDiv.innerHTML = `
<div class="flex justify-between items-center mb-2">
<h4 class="font-semibold text-gray-800">Venta a las ${formattedTime}</h4>
<span class="font-bold text-gray-800">$${sale.total.toFixed(2)}</span>
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

if (paymentMethod && !sale.payments.some(p => p.method === paymentMethod)) {
return false;
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
  dailySalesTotal = salesSnapshot.docs.reduce((sum, doc) => {
    const sale = doc.data();
    if (sale.total && !isNaN(sale.total)) {
      salesCount++;
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

  const currentCash = dailyCashData.abertura + dailySalesTotal - dailyExpensesTotal;
  if (currentCashDisplay) currentCashDisplay.textContent = `$${currentCash.toFixed(2)}`;

  // Actualizar las estadísticas
  if (statsTotalSales) statsTotalSales.textContent = `$${dailySalesTotal.toFixed(2)}`;
  if (statsSalesCount) statsSalesCount.textContent = salesCount;
  if (statsTotalExpenses) statsTotalExpenses.textContent = `$${dailyExpensesTotal.toFixed(2)}`;
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

function renderCart() {
if (!cartContainer) return;
cartContainer.innerHTML = '';
let total = 0;
cart.forEach(item => {
const itemDiv = document.createElement('div');
itemDiv.className = "bg-gray-200 p-3 rounded-lg flex justify-between items-center";
total += item.price * item.quantity;
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
if (cartTotalSpan) cartTotalSpan.textContent = `$${total.toFixed(2)}`;
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

    const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
    if (paymentTotalDisplay) paymentTotalDisplay.textContent = `$${total.toFixed(2)}`;
    if (paymentRemainingDisplay) paymentRemainingDisplay.textContent = `$${total.toFixed(2)}`;

    if (paymentInputsContainer) paymentInputsContainer.innerHTML = '';
    addPaymentInput(total);

    if (splitPaymentModal) splitPaymentModal.classList.remove('hidden');
  });
}

if (addPaymentMethodBtn) {
  addPaymentMethodBtn.addEventListener('click', () => {
    if (paymentModal) paymentModal.classList.remove('hidden');
  });
}

if (cancelPaymentBtn) {
  cancelPaymentBtn.addEventListener('click', () => {
    if (paymentModal) paymentModal.classList.add('hidden');
  });
}

if (addPaymentForm) {
  addPaymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPaymentNameInput = document.getElementById('new-payment-name');
    const newMethodName = newPaymentNameInput?.value.trim();

    if (newMethodName && !userPaymentMethods.map(m => m.name).includes(newMethodName) && !defaultPaymentMethods.includes(newMethodName)) {
    try {
    const paymentMethodsCollection = collection(db, SHARED_PAYMENT_METHODS_COLLECTION);
    await addDoc(paymentMethodsCollection, { name: newMethodName });
    if(addPaymentForm) addPaymentForm.reset();
    if(paymentModal) paymentModal.classList.add('hidden');
    showModal("Forma de pago añadida con éxito.");
    } catch (error) {
    console.error("Error al añadir la forma de pago:", error);
    showModal("Error al añadir la forma de pago.");
    }
    } else {
    showModal("Esa forma de pago ya existe o no es válida.");
    }
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

input.addEventListener('input', updateRemainingAmount);
select.addEventListener('change', () => {
if (cartTotalSpan && paymentInputsContainer.children.length === 1) {
input.value = parseFloat(cartTotalSpan.textContent.replace('$', '')).toFixed(2);
}
updateRemainingAmount();
});

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

if (processPaymentBtn) {
  processPaymentBtn.addEventListener('click', async () => {
    if (!cartTotalSpan || !paymentInputsContainer || !customerSelect || !splitPaymentModal) {
    console.error("Faltan elementos del DOM para procesar el pago.");
    return;
    }
    const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
    const paymentInputs = paymentInputsContainer.querySelectorAll('input[type="number"]');
    const paymentSelects = paymentInputsContainer.querySelectorAll('select');

    let sum = 0;
    const payments = [];

    for (let i = 0; i < paymentInputs.length; i++) {
    const amount = parseFloat(paymentInputs[i].value);
    const method = paymentSelects[i].value;
    if (isNaN(amount) || amount <= 0) {
    showModal("Todos los montos deben ser números positivos.");
    return;
    }
    sum += amount;
    payments.push({ method: method, amount: amount });
    }

    if (Math.abs(sum - total) > 0.01) {
    showModal("La suma de los pagos no coincide con el total.");
    return;
    }
    const cashId = new Date().toLocaleDateString('en-CA');
    try {
    const productUpdates = cart.map(item => {
    const productDocRef = doc(db, SHARED_PRODUCTS_COLLECTION, item.id);
    return updateDoc(productDocRef, {
    stock: item.stock - item.quantity
    });
    });
    await Promise.all(productUpdates);

    const customerId = customerSelect.value;
    const customerName = customerSelect.options[customerSelect.selectedIndex].text;

    const salesCollection = collection(db, SHARED_SALES_COLLECTION);
    const newSaleRef = await addDoc(salesCollection, {
    items: cart,
    total: total,
    payments: payments,
    customerId: customerId || null,
    customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
    timestamp: serverTimestamp(),
    cashId: cashId
    });

    showModal("Venta finalizada con éxito. El carrito se ha vaciado.");

    printReceipt({
    id: newSaleRef.id,
    items: cart,
    total: total,
    payments: payments,
    customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
    timestamp: new Date()
    });

    cart = [];
    renderCart();
    if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
    if(customerSelect) customerSelect.value = "";

    } catch (error) {
    console.error("Error al finalizar la venta:", error);
    showModal("Hubo un error al registrar la venta. Por favor, intenta de nuevo.");
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

function exportSalesToCsv(sales) {
const headers = ["ID", "Fecha", "Total", "Pagos", "Cliente", "Items"];
const rows = sales.map(sale => {
const date = sale.timestamp ? new Date(sale.timestamp.seconds * 1000).toLocaleString('es-ES') : '';
const payments = JSON.stringify(sale.payments);
const items = JSON.stringify(sale.items);
const customer = sale.customerName || '';
return `"${sale.id}","${date}",${sale.total.toFixed(2)},"${payments}","${customer}","${items}"`;
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

// Lógica de gráficos de ventas
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

// Impresión de recibos
function printReceipt(sale) {
const printWindow = window.open('', '_blank');
const paymentsHtml = sale.payments.map(p => `
<p class="payment-row">Pagado con ${p.method}: $${p.amount.toFixed(2)}</p>
`).join('');
const content = `
<!DOCTYPE html>
<html>
<head>
<title>Recibo de Venta</title>
<style>
body { font-family: 'Inter', sans-serif; padding: 20px; }
.receipt-header { text-align: center; margin-bottom: 20px; }
.receipt-body { margin-bottom: 20px; }
.receipt-footer { text-align: center; border-top: 1px dashed black; padding-top: 10px; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 5px 0; border-bottom: 1px solid #ccc; }
.total-row td { font-weight: bold; font-size: 1.2em; border-top: 2px solid black; }
.payment-row { margin-top: 10px; }
</style>
</head>
<body>
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
</body>
</html>
`;
printWindow.document.write(content);
printWindow.document.close();
printWindow.focus();
printWindow.print();
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
    
        if (!cartTotalSpan || !paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer || !splitPaymentModal) {
            console.error("Faltan elementos del DOM para el checkout.");
            return;
        }

        const total = parseFloat(cartTotalSpan.textContent.replace('$', ''));
        paymentTotalDisplay.textContent = `$${total.toFixed(2)}`;
        paymentRemainingDisplay.textContent = `$${total.toFixed(2)}`;

        paymentInputsContainer.innerHTML = '';
        addPaymentInput(total);

        splitPaymentModal.classList.remove('hidden');
      });
    }
    
    if (addPaymentMethodBtn) {
      addPaymentMethodBtn.addEventListener('click', () => {
        if (paymentModal) paymentModal.classList.remove('hidden');
      });
    }
    
    if (cancelPaymentBtn) {
      cancelPaymentBtn.addEventListener('click', () => {
        if (paymentModal) paymentModal.classList.add('hidden');
      });
    }

    if (addPaymentForm) {
      addPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPaymentNameInput = document.getElementById('new-payment-name');
        const newMethodName = newPaymentNameInput?.value.trim();
    
        if (newMethodName && !userPaymentMethods.map(m => m.name).includes(newMethodName) && !defaultPaymentMethods.includes(newMethodName)) {
          try {
            const paymentMethodsCollection = collection(db, SHARED_PAYMENT_METHODS_COLLECTION);
            await addDoc(paymentMethodsCollection, { name: newMethodName });
            if(addPaymentForm) addPaymentForm.reset();
            if(paymentModal) paymentModal.classList.add('hidden');
            showModal("Forma de pago añadida con éxito.");
          } catch (error) {
            console.error("Error al añadir la forma de pago:", error);
            showModal("Error al añadir la forma de pago.");
          }
        } else {
          showModal("Esa forma de pago ya existe o no es válida.");
        }
      });
    }
    
    if (addPaymentInputBtn) {
      addPaymentInputBtn.addEventListener('click', () =>
