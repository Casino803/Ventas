import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, onSnapshot, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc",
  authDomain: "ventas-casino.firebaseapp.com",
  projectId: "ventas-casino",
  storageBucket: "ventas-casino.firebasestorage.app",
  messagingSenderId: "683247450522",
  appId: "1:683247450522:web:87a57e190d2c252d0a6223",
  measurementId: "G-XYG0ZNEQ61"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---- Elementos del DOM ----
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const mainTabs = document.getElementById('main-tabs');
const pageContents = document.querySelectorAll('.page-content');
const tabButtons = document.querySelectorAll('.tab-btn');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');
const productsContainer = document.getElementById('products-container');
const posSearchInput = document.getElementById('pos-search-input');
const cartContainer = document.getElementById('cart-container');
const cartTotalDisplay = document.getElementById('cart-total');
const cartSubtotalDisplay = document.getElementById('cart-subtotal');
const discountSurchargeDisplay = document.getElementById('discount-surcharge-amount');
const discountSurchargeValueInput = document.getElementById('discount-surcharge-value');
const discountSurchargeTypeSelect = document.getElementById('discount-surcharge-type');
const applyDiscountSurchargeBtn = document.getElementById('apply-discount-surcharge-btn');
const clearDiscountSurchargeBtn = document.getElementById('clear-discount-surcharge-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const splitPaymentModal = document.getElementById('split-payment-modal');
const paymentTotalDisplay = document.getElementById('payment-total-display');
const paymentRemainingDisplay = document.getElementById('payment-remaining-display');
const addPaymentInputBtn = document.getElementById('add-payment-input-btn');
const paymentInputsContainer = document.getElementById('payment-inputs-container');
const processPaymentBtn = document.getElementById('process-payment-btn');
const cancelSplitBtn = document.getElementById('cancel-split-btn');
const manageProductsContainer = document.getElementById('manage-products-container');
const toggleProductFormBtn = document.getElementById('toggle-product-form-btn');
const productFormContainer = document.getElementById('product-form-container');
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name-input');
const productPriceInput = document.getElementById('product-price-input');
const productStockInput = document.getElementById('product-stock-input');
const productCategorySelect = document.getElementById('product-category-input');
const salesHistoryContainer = document.getElementById('sales-history-container');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const filterProduct = document.getElementById('filter-product');
const filterPaymentMethod = document.getElementById('filter-payment-method');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
const filtersContainer = document.getElementById('filters-container');
const importSalesBtn = document.getElementById('import-sales-btn');
const importSalesInput = document.getElementById('import-sales-input');
const exportSalesBtn = document.getElementById('export-sales-btn');
const salesChartCanvas = document.getElementById('salesChart');
const topProductsChartCanvas = document.getElementById('topProductsChart');
const paymentMethodsChartCanvas = document.getElementById('paymentMethodsChart');
const cashStatusText = document.getElementById('cash-status-text');
const currentCashDisplay = document.getElementById('current-cash-display');
const openCashForm = document.getElementById('open-cash-form');
const openCashAmountInput = document.getElementById('open-cash-amount');
const openCashBtn = document.getElementById('open-cash-btn');
const closeCashBtn = document.getElementById('close-cash-btn');
const closeSeparator = document.getElementById('close-separator');
const cashStatsSection = document.getElementById('cash-stats');
const statsTotalSales = document.getElementById('stats-total-sales');
const statsSalesCount = document.getElementById('stats-sales-count');
const statsTotalExpenses = document.getElementById('stats-total-expenses');
const paymentStatsContainer = document.getElementById('payment-stats-container');
const cashHistoryContainer = document.getElementById('cash-history-container');
const toggleExpenseFormBtn = document.getElementById('toggle-expense-form-btn');
const expenseFormContainer = document.getElementById('expense-form-container');
const expenseForm = document.getElementById('expense-form');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategorySelect = document.getElementById('expense-category-select');
const dailyExpensesContainer = document.getElementById('daily-expenses-container');
const toggleCustomerFormBtn = document.getElementById('toggle-customer-form-btn');
const customerFormContainer = document.getElementById('customer-form-container');
const addCustomerForm = document.getElementById('add-customer-form');
const customerNameInput = document.getElementById('customer-name-input');
const customersListContainer = document.getElementById('customers-list-container');
const customerSelect = document.getElementById('customer-select');
const paymentMethodsList = document.getElementById('payment-methods-list');
const addPaymentMethodForm = document.getElementById('add-payment-method-form');
const newPaymentMethodNameInput = document.getElementById('new-payment-method-name');
const expenseCategoriesList = document.getElementById('expense-categories-list');
const addExpenseCategoryForm = document.getElementById('add-expense-category-form');
const newExpenseCategoryNameInput = document.getElementById('new-expense-category-name');
const productCategoriesList = document.getElementById('product-categories-list');
const addProductCategoryForm = document.getElementById('add-product-category-form');
const newProductCategoryNameInput = document.getElementById('new-product-category-name');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');

// --- Variables de Estado ----
let products = [];
let cart = [];
let sales = [];
let customers = [];
let paymentMethods = [];
let expenseCategories = [];
let productCategories = [];
let expenses = [];
let currentUser = null;
let currentDiscount = 0;
let currentSurcharge = 0;

// --- Funciones de Utilidad ---
function showModal(message) {
  modalMessage.textContent = message;
  modal.classList.remove('hidden');
}

modalCloseBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function showPage(pageId) {
  pageContents.forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
}

tabButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const pageId = e.currentTarget.dataset.page;
    showPage(pageId);
  });
});

// --- Autenticación ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    showPage('pos-page');
    // Iniciar listeners y renderizado
    setupListeners();
    renderAll();
  } else {
    currentUser = null;
    authModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = authEmailInput.value;
  const password = authPasswordInput.value;
  if (e.submitter.id === 'login-btn') {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showModal('Inicio de sesión exitoso!');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      showModal('Error al iniciar sesión: ' + error.message);
    }
  }
});

registerBtn.addEventListener('click', async () => {
  const email = authEmailInput.value;
  const password = authPasswordInput.value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showModal('Registro exitoso! Por favor, inicia sesión.');
  } catch (error) {
    console.error('Error de registro:', error);
    showModal('Error al registrar: ' + error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showModal('Sesión cerrada.');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    showModal('Error al cerrar sesión.');
  }
});

// --- Listeners de Firestore ---
function setupListeners() {
  onSnapshot(collection(db, 'products'), (snapshot) => {
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
    renderManageProducts();
  }, (error) => {
    console.error('Error al escuchar productos:', error.message);
  });

  onSnapshot(collection(db, 'sales'), (snapshot) => {
    sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSalesHistory();
    renderSalesCharts();
  }, (error) => {
    console.error('Error al escuchar ventas:', error.message);
  });

  onSnapshot(collection(db, 'customers'), (snapshot) => {
    customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderCustomersList();
    renderCustomerSelect();
  }, (error) => {
    console.error('Error al escuchar clientes:', error.message);
  });

  onSnapshot(collection(db, 'payment-methods'), (snapshot) => {
    paymentMethods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPaymentMethods();
    renderPaymentMethodSelect();
  }, (error) => {
    console.error('Error al escuchar métodos de pago:', error.message);
  });

  onSnapshot(collection(db, 'expense-categories'), (snapshot) => {
    expenseCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderExpenseCategories();
    renderExpenseCategorySelect();
  }, (error) => {
    console.error('Error al escuchar categorías de gastos:', error.message);
  });

  onSnapshot(collection(db, 'product-categories'), (snapshot) => {
    productCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProductCategories();
    renderProductCategorySelect();
  }, (error) => {
    console.error('Error al escuchar categorías de productos:', error.message);
  });

  onSnapshot(collection(db, 'expenses'), (snapshot) => {
    expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderDailyExpenses();
  }, (error) => {
    console.error('Error al escuchar gastos:', error.message);
  });

  onSnapshot(doc(db, 'cash', 'daily'), (doc) => {
    if (doc.exists()) {
      const { isOpen, currentAmount, initialAmount } = doc.data();
      cashStatusText.textContent = isOpen ? 'Caja abierta' : 'Caja cerrada';
      currentCashDisplay.textContent = formatPrice(currentAmount);
      openCashForm.classList.toggle('hidden', isOpen);
      closeCashBtn.classList.toggle('hidden', !isOpen);
      closeSeparator.classList.toggle('hidden', !isOpen);
      cashStatsSection.classList.toggle('hidden', !isOpen);
      if (isOpen) {
        renderCashStats();
      }
    } else {
      cashStatusText.textContent = 'Caja cerrada';
      currentCashDisplay.textContent = formatPrice(0);
      openCashForm.classList.remove('hidden');
      closeCashBtn.classList.add('hidden');
      closeSeparator.classList.add('hidden');
      cashStatsSection.classList.add('hidden');
    }
  }, (error) => {
    console.error('Error al escuchar la caja diaria:', error.message);
  });
}

// --- Renderizado Inicial ---
function renderAll() {
  renderProducts();
  renderManageProducts();
  renderSalesHistory();
  renderSalesCharts();
  renderCustomersList();
  renderPaymentMethods();
  renderExpenseCategories();
  renderProductCategories();
  renderDailyExpenses();
  renderCashHistory();
  renderPaymentMethodSelect();
}

// --- Lógica del Punto de Venta (POS) ---
function renderProducts(filteredProducts = products) {
  productsContainer.innerHTML = '';
  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = '<p class="text-gray-500 text-center col-span-full">No se encontraron productos.</p>';
    return;
  }
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer text-center';
    productCard.innerHTML = `
      <h3 class="font-semibold text-gray-800 truncate">${product.name}</h3>
      <p class="text-lg font-bold text-blue-600 mt-1">${formatPrice(product.price)}</p>
      <p class="text-xs text-gray-500">Stock: ${product.stock || 'N/A'}</p>
    `;
    productCard.addEventListener('click', () => addToCart(product));
    productsContainer.appendChild(productCard);
  });
}

function addToCart(product) {
  const cartItem = cart.find(item => item.id === product.id);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}

function renderCart() {
  cartContainer.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    const cartItemDiv = document.createElement('div');
    cartItemDiv.className = 'flex justify-between items-center p-2 border-b border-gray-200 last:border-b-0';
    cartItemDiv.innerHTML = `
      <div>
        <h4 class="font-semibold text-sm">${item.name}</h4>
        <p class="text-xs text-gray-500">${formatPrice(item.price)} x ${item.quantity}</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-bold text-sm">${formatPrice(itemTotal)}</span>
        <button data-id="${item.id}" class="remove-from-cart-btn text-red-500 hover:text-red-700">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    cartContainer.appendChild(cartItemDiv);
  });

  cartSubtotalDisplay.textContent = formatPrice(subtotal);
  const total = subtotal - (subtotal * currentDiscount) + currentSurcharge;
  cartTotalDisplay.textContent = formatPrice(total);
}

cartContainer.addEventListener('click', (e) => {
  if (e.target.closest('.remove-from-cart-btn')) {
    const id = e.target.closest('.remove-from-cart-btn').dataset.id;
    cart = cart.filter(item => item.id !== id);
    renderCart();
  }
});

posSearchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = products.filter(product => product.name.toLowerCase().includes(searchTerm));
  renderProducts(filtered);
});

applyDiscountSurchargeBtn.addEventListener('click', () => {
  const value = parseFloat(discountSurchargeValueInput.value);
  if (isNaN(value)) {
    showModal('Por favor, ingresa un valor válido.');
    return;
  }
  const type = discountSurchargeTypeSelect.value;
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (type.includes('percentage')) {
    currentDiscount = (type === 'percentage_discount') ? value / 100 : 0;
    currentSurcharge = (type === 'percentage_surcharge') ? (subtotal * (value / 100)) : 0;
    discountSurchargeDisplay.textContent = formatPrice((subtotal * currentDiscount) + currentSurcharge);
  } else {
    currentDiscount = (type === 'fixed_discount') ? value / subtotal : 0;
    currentSurcharge = (type === 'fixed_surcharge') ? value : 0;
    discountSurchargeDisplay.textContent = formatPrice(value);
  }

  renderCart();
});

clearDiscountSurchargeBtn.addEventListener('click', () => {
  currentDiscount = 0;
  currentSurcharge = 0;
  discountSurchargeValueInput.value = '';
  discountSurchargeTypeSelect.value = 'percentage_discount';
  discountSurchargeDisplay.textContent = formatPrice(0);
  renderCart();
});

// ---- Lógica de checkout y split-payment ----
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showModal('El carrito está vacío.');
    return;
  }
  const total = parseFloat(cartTotalDisplay.textContent.replace('$', ''));
  paymentTotalDisplay.textContent = formatPrice(total);
  paymentRemainingDisplay.textContent = formatPrice(total);
  paymentInputsContainer.innerHTML = '';
  addPaymentInputBtn.click(); // Añadir el primer método de pago por defecto
  splitPaymentModal.classList.remove('hidden');
});

addPaymentInputBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'flex space-x-2';
  div.innerHTML = `
    <select class="payment-method-select w-1/2 px-2 py-1 border rounded-lg"></select>
    <input type="number" step="0.01" placeholder="Monto" class="payment-amount-input w-1/2 px-2 py-1 border rounded-lg">
    <button class="remove-payment-input-btn text-red-500 hover:text-red-700">
        <i class="fas fa-trash-alt"></i>
    </button>
  `;
  paymentInputsContainer.appendChild(div);
  renderPaymentMethodSelect(div.querySelector('.payment-method-select'));
  div.querySelector('.payment-amount-input').addEventListener('input', updatePaymentRemaining);
  div.querySelector('.remove-payment-input-btn').addEventListener('click', () => {
    paymentInputsContainer.removeChild(div);
    updatePaymentRemaining();
  });
});

function updatePaymentRemaining() {
  const total = parseFloat(paymentTotalDisplay.textContent.replace('$', ''));
  const paid = Array.from(document.querySelectorAll('.payment-amount-input'))
    .reduce((sum, input) => sum + parseFloat(input.value) || 0, 0);
  const remaining = total - paid;
  paymentRemainingDisplay.textContent = formatPrice(remaining);
  paymentRemainingDisplay.classList.toggle('text-red-600', remaining > 0);
  paymentRemainingDisplay.classList.toggle('text-green-600', remaining <= 0);
}

processPaymentBtn.addEventListener('click', async () => {
  const remaining = parseFloat(paymentRemainingDisplay.textContent.replace('$', ''));
  if (remaining > 0.01) {
    showModal('El monto total no ha sido cubierto.');
    return;
  }
  await finalizeSale();
  splitPaymentModal.classList.add('hidden');
});

cancelSplitBtn.addEventListener('click', () => {
  splitPaymentModal.classList.add('hidden');
});

async function finalizeSale() {
  const saleData = {
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    subtotal: parseFloat(cartSubtotalDisplay.textContent.replace('$', '')),
    discount: parseFloat(discountSurchargeValueInput.value || 0) * (discountSurchargeTypeSelect.value === 'percentage_discount' ? 1 : 0),
    surcharge: parseFloat(discountSurchargeValueInput.value || 0) * (discountSurchargeTypeSelect.value === 'percentage_surcharge' ? 1 : 0),
    total: parseFloat(cartTotalDisplay.textContent.replace('$', '')),
    payment: Array.from(document.querySelectorAll('.payment-amount-input')).map((input, index) => ({
      method: document.querySelectorAll('.payment-method-select')[index].value,
      amount: parseFloat(input.value) || 0
    })),
    customerId: customerSelect.value || null,
    createdAt: new Date(),
    userId: currentUser.uid,
  };

  try {
    await addDoc(collection(db, 'sales'), saleData);
    // Actualizar stock de productos
    for (const item of cart) {
      const productRef = doc(db, 'products', item.id);
      await updateDoc(productRef, {
        stock: item.stock - item.quantity,
      });
    }
    // Actualizar caja diaria
    const cashRef = doc(db, 'cash', 'daily');
    const cashDoc = await getDoc(cashRef);
    if (cashDoc.exists()) {
      const { currentAmount } = cashDoc.data();
      const totalCashPayment = saleData.payment.find(p => p.method === 'Efectivo')?.amount || 0;
      await updateDoc(cashRef, {
        currentAmount: currentAmount + totalCashPayment,
      });
    }

    cart = [];
    currentDiscount = 0;
    currentSurcharge = 0;
    discountSurchargeValueInput.value = '';
    discountSurchargeTypeSelect.value = 'percentage_discount';
    renderCart();
    showModal('Venta registrada con éxito!');
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    showModal('Error al registrar la venta.');
  }
}

// --- Gestión de Productos ---
function renderManageProducts() {
  manageProductsContainer.innerHTML = '';
  products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.className = 'flex justify-between items-center p-2 border-b border-gray-200';
    productItem.innerHTML = `
      <div>
        <h4 class="font-semibold">${product.name}</h4>
        <p class="text-sm text-gray-600">Precio: ${formatPrice(product.price)} | Stock: ${product.stock || 'N/A'}</p>
      </div>
      <div class="space-x-2">
        <button data-id="${product.id}" class="edit-product-btn text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
        <button data-id="${product.id}" class="delete-product-btn text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    manageProductsContainer.appendChild(productItem);
  });
}

toggleProductFormBtn.addEventListener('click', () => {
  productFormContainer.classList.toggle('hidden');
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = productIdInput.value;
  const name = productNameInput.value;
  const price = parseFloat(productPriceInput.value);
  const stock = parseInt(productStockInput.value) || null;
  const categoryId = productCategorySelect.value;
  const categoryName = productCategories.find(cat => cat.id === categoryId)?.name || 'Sin Categoría';

  const productData = { name, price, stock, categoryId, categoryName };

  try {
    if (id) {
      await updateDoc(doc(db, 'products', id), productData);
      showModal('Producto actualizado con éxito!');
    } else {
      await addDoc(collection(db, 'products'), productData);
      showModal('Producto añadido con éxito!');
    }
    productForm.reset();
    productIdInput.value = '';
    productFormContainer.classList.add('hidden');
  } catch (error) {
    console.error('Error al guardar el producto:', error);
    showModal('Error al guardar el producto.');
  }
});

manageProductsContainer.addEventListener('click', async (e) => {
  const target = e.target.closest('button');
  if (!target) return;

  const id = target.dataset.id;
  if (target.classList.contains('edit-product-btn')) {
    const productToEdit = products.find(p => p.id === id);
    if (productToEdit) {
      productIdInput.value = productToEdit.id;
      productNameInput.value = productToEdit.name;
      productPriceInput.value = productToEdit.price;
      productStockInput.value = productToEdit.stock;
      productCategorySelect.value = productToEdit.categoryId;
      productFormContainer.classList.remove('hidden');
    }
  } else if (target.classList.contains('delete-product-btn')) {
    await confirmAction('¿Estás seguro de que quieres eliminar este producto?', async () => {
      try {
        await deleteDoc(doc(db, 'products', id));
        showModal('Producto eliminado con éxito.');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        showModal('Error al eliminar producto.');
      }
    });
  }
});

// --- Historial de Ventas ---
async function renderSalesHistory() {
  const container = document.getElementById('sales-history-container');
  container.innerHTML = '<p class="text-gray-500 text-center">Cargando historial...</p>';

  const startDate = filterStartDate.value ? new Date(filterStartDate.value) : null;
  const endDate = filterEndDate.value ? new Date(filterEndDate.value) : null;
  const searchTerm = filterProduct.value.toLowerCase();

  let filteredSales = sales.filter(sale => {
    const saleDate = sale.createdAt?.toDate();
    const dateMatch = (!startDate || (saleDate && saleDate >= startDate)) &&
      (!endDate || (saleDate && saleDate <= new Date(endDate.setHours(23, 59, 59))));
    const productMatch = !searchTerm || sale.items.some(item => item.name.toLowerCase().includes(searchTerm));
    const paymentMatch = !filterPaymentMethod.value || sale.payment.some(p => p.method === filterPaymentMethod.value);
    return dateMatch && productMatch && paymentMatch;
  });

  filteredSales.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

  container.innerHTML = '';
  if (filteredSales.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">No se encontraron ventas.</p>';
    return;
  }

  filteredSales.forEach(sale => {
    const saleDiv = document.createElement('div');
    saleDiv.className = 'bg-white p-4 rounded-lg shadow-md';
    const saleDate = sale.createdAt?.toDate().toLocaleString();
    const total = formatPrice(sale.total);
    const payment = sale.payment.map(p => `${p.method}: ${formatPrice(p.amount)}`).join(', ');
    const itemsList = sale.items.map(item => `<li>${item.name} x ${item.quantity} (${formatPrice(item.price)})</li>`).join('');

    saleDiv.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <div>
          <h4 class="font-bold text-lg text-gray-800">Venta de ${saleDate}</h4>
          <p class="text-sm text-gray-500">Total: ${total}</p>
        </div>
        <button data-id="${sale.id}" class="delete-sale-btn text-red-500 hover:text-red-700">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
      <p class="text-sm text-gray-700">Forma de Pago: ${payment}</p>
      <ul class="text-sm text-gray-600 mt-2 list-disc list-inside">
        ${itemsList}
      </ul>
    `;
    container.appendChild(saleDiv);
  });
}

applyFiltersBtn.addEventListener('click', renderSalesHistory);
clearFiltersBtn.addEventListener('click', () => {
  filterStartDate.value = '';
  filterEndDate.value = '';
  filterProduct.value = '';
  filterPaymentMethod.value = '';
  renderSalesHistory();
});
toggleFiltersBtn.addEventListener('click', () => {
  filtersContainer.classList.toggle('hidden');
});

salesHistoryContainer.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-sale-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar esta venta?', async () => {
    try {
      await deleteDoc(doc(db, 'sales', id));
      showModal('Venta eliminada con éxito.');
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      showModal('Error al eliminar venta.');
    }
  });
});

importSalesBtn.addEventListener('click', () => {
  importSalesInput.click();
});

importSalesInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    const salesToImport = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;
      const sale = {};
      headers.forEach((header, index) => {
        let value = values[index];
        if (['total', 'subtotal', 'discount', 'surcharge'].includes(header)) {
          value = parseFloat(value);
        } else if (header === 'createdAt') {
          value = new Date(value);
        }
        sale[header] = value;
      });
      salesToImport.push(sale);
    }
    if (salesToImport.length > 0) {
      try {
        const batch = db.batch();
        salesToImport.forEach(sale => {
          const newDocRef = doc(collection(db, 'sales'));
          batch.set(newDocRef, sale);
        });
        await batch.commit();
        showModal(`Se importaron ${salesToImport.length} ventas con éxito.`);
      } catch (error) {
        console.error('Error al importar ventas:', error);
        showModal('Error al importar ventas.');
      }
    }
  };
  reader.readAsText(file);
});

exportSalesBtn.addEventListener('click', () => {
  const headers = ['id', 'createdAt', 'total', 'subtotal', 'discount', 'surcharge', 'paymentMethod', 'items'];
  let csv = headers.join(',') + '\n';
  sales.forEach(sale => {
    const row = [
      sale.id,
      sale.createdAt?.toDate().toISOString(),
      sale.total,
      sale.subtotal,
      sale.discount,
      sale.surcharge,
      sale.payment.map(p => `${p.method}:${p.amount}`).join(';'),
      sale.items.map(item => `${item.name} x${item.quantity}`).join(';')
    ];
    csv += row.join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ventas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

// --- Estadísticas ---
let salesChart, topProductsChart, paymentMethodsChart;

function renderSalesCharts() {
  if (sales.length === 0) return;

  // Gráfico de Ventas Diarias
  const salesByDay = {};
  sales.forEach(sale => {
    const date = sale.createdAt?.toDate().toLocaleDateString('es-ES');
    if (salesByDay[date]) {
      salesByDay[date] += sale.total;
    } else {
      salesByDay[date] = sale.total;
    }
  });
  const salesChartData = {
    labels: Object.keys(salesByDay),
    datasets: [{
      label: 'Ventas Diarias',
      data: Object.values(salesByDay),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };
  if (salesChart) salesChart.destroy();
  salesChart = new Chart(salesChartCanvas, { type: 'bar', data: salesChartData });

  // Top Productos
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (productSales[item.name]) {
        productSales[item.name] += item.quantity;
      } else {
        productSales[item.name] = item.quantity;
      }
    });
  });
  const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
  const topProductsChartData = {
    labels: sortedProducts.map(([name]) => name),
    datasets: [{
      label: 'Unidades Vendidas',
      data: sortedProducts.map(([, units]) => units),
      backgroundColor: 'rgba(251, 146, 60, 0.5)',
      borderColor: 'rgba(251, 146, 60, 1)',
      borderWidth: 1
    }]
  };
  if (topProductsChart) topProductsChart.destroy();
  topProductsChart = new Chart(topProductsChartCanvas, { type: 'doughnut', data: topProductsChartData });

  // Ventas por Método de Pago
  const paymentSales = {};
  sales.forEach(sale => {
    sale.payment.forEach(p => {
      if (paymentSales[p.method]) {
        paymentSales[p.method] += p.amount;
      } else {
        paymentSales[p.method] = p.amount;
      }
    });
  });
  const paymentMethodsChartData = {
    labels: Object.keys(paymentSales),
    datasets: [{
      label: 'Ventas por Método de Pago',
      data: Object.values(paymentSales),
      backgroundColor: ['rgba(52, 211, 153, 0.5)', 'rgba(251, 191, 36, 0.5)', 'rgba(239, 68, 68, 0.5)'],
      borderColor: ['rgba(52, 211, 153, 1)', 'rgba(251, 191, 36, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 1
    }]
  };
  if (paymentMethodsChart) paymentMethodsChart.destroy();
  paymentMethodsChart = new Chart(paymentMethodsChartCanvas, { type: 'pie', data: paymentMethodsChartData });
}

// --- Gestión de Caja ---
openCashForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const initialAmount = parseFloat(openCashAmountInput.value);
  if (isNaN(initialAmount)) {
    showModal('Por favor, ingresa un monto válido.');
    return;
  }
  const cashData = {
    isOpen: true,
    initialAmount,
    currentAmount: initialAmount,
    openDate: new Date(),
    userId: currentUser.uid,
  };
  try {
    await updateDoc(doc(db, 'cash', 'daily'), cashData, { merge: true });
    showModal('Caja abierta con éxito!');
  } catch (error) {
    console.error('Error al abrir caja:', error);
    showModal('Error al abrir caja.');
  }
});

closeCashBtn.addEventListener('click', async () => {
  await confirmAction('¿Estás seguro de que quieres cerrar la caja?', async () => {
    await closeCash();
  });
});

async function closeCash() {
  try {
    const cashRef = doc(db, 'cash', 'daily');
    const cashDoc = await getDoc(cashRef);
    if (cashDoc.exists()) {
      const { openDate, initialAmount } = cashDoc.data();
      const closeDate = new Date();

      // Calcular ventas y gastos para el día
      const qSales = query(collection(db, 'sales'), where('createdAt', '>=', openDate), where('createdAt', '<=', closeDate));
      const salesSnapshot = await getDocs(qSales);
      const totalSales = salesSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);
      const totalCashSales = salesSnapshot.docs.reduce((sum, doc) => {
        const cashPayment = doc.data().payment.find(p => p.method === 'Efectivo');
        return sum + (cashPayment ? cashPayment.amount : 0);
      }, 0);
      const qExpenses = query(collection(db, 'expenses'), where('createdAt', '>=', openDate), where('createdAt', '<=', closeDate));
      const expensesSnapshot = await getDocs(qExpenses);
      const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

      const cashClosureData = {
        openDate,
        closeDate,
        initialAmount,
        finalAmount: cashDoc.data().currentAmount,
        totalSales,
        totalCashSales,
        totalExpenses,
        userId: currentUser.uid,
      };

      await addDoc(collection(db, 'cash-history'), cashClosureData);

      await updateDoc(cashRef, {
        isOpen: false,
        initialAmount: 0,
        currentAmount: 0,
      });

      showModal('Caja cerrada con éxito.');
      // Solución: llamar a renderCashHistory() para que la tabla se actualice
      renderCashHistory();
    }
  } catch (error) {
    console.error('Error al cerrar caja:', error);
    showModal('Error al cerrar caja.');
  }
}

async function renderCashStats() {
  try {
    const cashDoc = await getDoc(doc(db, 'cash', 'daily'));
    if (!cashDoc.exists()) return;
    const { openDate } = cashDoc.data();

    const qSales = query(collection(db, 'sales'), where('createdAt', '>=', openDate));
    const salesSnapshot = await getDocs(qSales);
    const totalSales = salesSnapshot.docs.reduce((sum, doc) => sum + doc.data().total, 0);
    const salesCount = salesSnapshot.docs.length;

    const qExpenses = query(collection(db, 'expenses'), where('createdAt', '>=', openDate));
    const expensesSnapshot = await getDocs(qExpenses);
    const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

    statsTotalSales.textContent = formatPrice(totalSales);
    statsSalesCount.textContent = salesCount;
    statsTotalExpenses.textContent = formatPrice(totalExpenses);

    const paymentStats = {};
    salesSnapshot.docs.forEach(sale => {
      sale.data().payment.forEach(p => {
        if (!paymentStats[p.method]) {
          paymentStats[p.method] = 0;
        }
        paymentStats[p.method] += p.amount;
      });
    });

    paymentStatsContainer.innerHTML = '';
    for (const [method, amount] of Object.entries(paymentStats)) {
      const div = document.createElement('div');
      div.className = 'bg-gray-200 p-2 rounded-lg';
      div.innerHTML = `
        <span class="block font-bold text-gray-800">${method}</span>
        <span class="block text-sm text-gray-500">${formatPrice(amount)}</span>
      `;
      paymentStatsContainer.appendChild(div);
    }

  } catch (error) {
    console.error('Error al obtener estadísticas de caja:', error);
  }
}

function renderCashHistory() {
  const container = document.getElementById('cash-history-container');
  container.innerHTML = '<p class="text-gray-500 text-center">Cargando historial...</p>';

  const q = query(collection(db, 'cash-history'), orderBy('closeDate', 'desc'));

  onSnapshot(q, (querySnapshot) => {
    container.innerHTML = '';
    if (querySnapshot.empty) {
      container.innerHTML = '<p class="text-gray-500 text-center">No hay historial de cajas cerradas.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const closure = doc.data();
      const closeDate = closure.closeDate?.toDate().toLocaleString();
      const closureDiv = document.createElement('div');
      closureDiv.className = 'bg-white p-4 rounded-lg shadow-md mb-2';
      closureDiv.innerHTML = `
        <h4 class="font-bold text-lg text-gray-800">Caja cerrada el ${closeDate}</h4>
        <p class="text-sm text-gray-600">Monto de Apertura: ${formatPrice(closure.initialAmount)}</p>
        <p class="text-sm text-gray-600">Monto Final: ${formatPrice(closure.finalAmount)}</p>
        <p class="text-sm text-gray-600">Ventas Totales: ${formatPrice(closure.totalSales)}</p>
        <p class="text-sm text-gray-600">Total de Gastos: ${formatPrice(closure.totalExpenses)}</p>
        <p class="text-sm text-gray-600">Total de Ventas en Efectivo: ${formatPrice(closure.totalCashSales)}</p>
      `;
      container.appendChild(closureDiv);
    });
  }, (error) => {
    console.error('Error al escuchar el historial de cajas:', error);
    container.innerHTML = '<p class="text-red-500 text-center">Error al cargar el historial.</p>';
  });
}

// --- Gestión de Gastos ---
toggleExpenseFormBtn.addEventListener('click', () => {
  expenseFormContainer.classList.toggle('hidden');
});

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const description = expenseDescriptionInput.value;
  const amount = parseFloat(expenseAmountInput.value);
  const categoryId = expenseCategorySelect.value;
  const categoryName = expenseCategories.find(cat => cat.id === categoryId)?.name || 'Sin Categoría';

  if (isNaN(amount)) {
    showModal('Por favor, ingresa un monto válido.');
    return;
  }
  const expenseData = {
    description,
    amount,
    categoryId,
    categoryName,
    createdAt: new Date(),
    userId: currentUser.uid,
  };
  try {
    await addDoc(collection(db, 'expenses'), expenseData);
    showModal('Gasto registrado con éxito!');
    expenseForm.reset();
  } catch (error) {
    console.error('Error al guardar el gasto:', error);
    showModal('Error al guardar el gasto.');
  }
});

function renderDailyExpenses() {
  const container = document.getElementById('daily-expenses-container');
  container.innerHTML = '';
  expenses.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  if (expenses.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">No hay gastos registrados.</p>';
    return;
  }
  expenses.forEach(expense => {
    const expenseDiv = document.createElement('div');
    expenseDiv.className = 'bg-white p-4 rounded-lg shadow-md flex justify-between items-center';
    expenseDiv.innerHTML = `
      <div>
        <h4 class="font-semibold text-gray-800">${expense.description}</h4>
        <p class="text-sm text-gray-600">Categoría: ${expense.categoryName}</p>
        <p class="text-xs text-gray-500">${expense.createdAt.toDate().toLocaleString()}</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-bold text-red-600">${formatPrice(expense.amount)}</span>
        <button data-id="${expense.id}" class="delete-expense-btn text-red-500 hover:text-red-700">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    container.appendChild(expenseDiv);
  });
}

dailyExpensesContainer.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-expense-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar este gasto?', async () => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      showModal('Gasto eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      showModal('Error al eliminar gasto.');
    }
  });
});

// --- Gestión de Clientes ---
toggleCustomerFormBtn.addEventListener('click', () => {
  customerFormContainer.classList.toggle('hidden');
});

addCustomerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = customerNameInput.value;
  if (!name) return;
  try {
    await addDoc(collection(db, 'customers'), { name, createdAt: new Date(), userId: currentUser.uid });
    customerNameInput.value = '';
    showModal('Cliente añadido con éxito.');
  } catch (error) {
    console.error('Error al añadir cliente:', error);
    showModal('Error al añadir cliente.');
  }
});

function renderCustomersList() {
  customersListContainer.innerHTML = '';
  if (customers.length === 0) {
    customersListContainer.innerHTML = '<p class="text-gray-500 text-center">No hay clientes registrados.</p>';
    return;
  }
  customers.forEach(customer => {
    const customerDiv = document.createElement('div');
    customerDiv.className = 'bg-white p-4 rounded-lg shadow-md flex justify-between items-center';
    customerDiv.innerHTML = `
      <h4 class="font-semibold text-gray-800">${customer.name}</h4>
      <button data-id="${customer.id}" class="delete-customer-btn text-red-500 hover:text-red-700">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    customersListContainer.appendChild(customerDiv);
  });
}

customersListContainer.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-customer-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar este cliente?', async () => {
    try {
      await deleteDoc(doc(db, 'customers', id));
      showModal('Cliente eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      showModal('Error al eliminar cliente.');
    }
  });
});

function renderCustomerSelect() {
  customerSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
  customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.id;
    option.textContent = customer.name;
    customerSelect.appendChild(option);
  });
}

// --- Gestión de Configuración (Formas de Pago, Categorías) ---
function renderPaymentMethods(selectElement) {
  const container = paymentMethodsList;
  const select = selectElement || filterPaymentMethod;
  container.innerHTML = '';
  select.innerHTML = '<option value="">Todas</option>';
  paymentMethods.forEach(method => {
    if (method.name) {
      const item = document.createElement('div');
      item.className = 'flex justify-between items-center p-2 bg-gray-200 rounded-lg';
      item.innerHTML = `
        <span>${method.name}</span>
        <button data-id="${method.id}" class="delete-payment-method-btn text-red-500 hover:text-red-700">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      container.appendChild(item);
      const option = document.createElement('option');
      option.value = method.name;
      option.textContent = method.name;
      select.appendChild(option);
    }
  });
}

addPaymentMethodForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = newPaymentMethodNameInput.value;
  if (!name) return;
  try {
    await addDoc(collection(db, 'payment-methods'), { name });
    newPaymentMethodNameInput.value = '';
    showModal('Forma de pago añadida.');
  } catch (error) {
    console.error('Error al añadir forma de pago:', error);
    showModal('Error al añadir forma de pago.');
  }
});

paymentMethodsList.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-payment-method-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar esta forma de pago?', async () => {
    try {
      await deleteDoc(doc(db, 'payment-methods', id));
      showModal('Forma de pago eliminada.');
    } catch (error) {
      console.error('Error al eliminar forma de pago:', error);
      showModal('Error al eliminar forma de pago.');
    }
  });
});

function renderPaymentMethodSelect(selectElement = customerSelect) {
  selectElement.innerHTML = '';
  paymentMethods.forEach(method => {
    const option = document.createElement('option');
    option.value = method.name;
    option.textContent = method.name;
    selectElement.appendChild(option);
  });
}

function renderExpenseCategories() {
  expenseCategoriesList.innerHTML = '';
  expenseCategories.forEach(category => {
    const item = document.createElement('div');
    item.className = 'flex justify-between items-center p-2 bg-gray-200 rounded-lg';
    item.innerHTML = `
      <span>${category.name}</span>
      <button data-id="${category.id}" class="delete-expense-category-btn text-red-500 hover:text-red-700">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    expenseCategoriesList.appendChild(item);
  });
}

addExpenseCategoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = newExpenseCategoryNameInput.value;
  if (!name) return;
  try {
    await addDoc(collection(db, 'expense-categories'), { name });
    newExpenseCategoryNameInput.value = '';
    showModal('Categoría de gasto añadida.');
  } catch (error) {
    console.error('Error al añadir categoría de gasto:', error);
    showModal('Error al añadir categoría de gasto.');
  }
});

expenseCategoriesList.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-expense-category-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar esta categoría de gasto?', async () => {
    try {
      await deleteDoc(doc(db, 'expense-categories', id));
      showModal('Categoría de gasto eliminada.');
    } catch (error) {
      console.error('Error al eliminar categoría de gasto:', error);
      showModal('Error al eliminar categoría de gasto.');
    }
  });
});

function renderExpenseCategorySelect() {
  expenseCategorySelect.innerHTML = '';
  expenseCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    expenseCategorySelect.appendChild(option);
  });
}

function renderProductCategories() {
  productCategoriesList.innerHTML = '';
  productCategories.forEach(category => {
    const item = document.createElement('div');
    item.className = 'flex justify-between items-center p-2 bg-gray-200 rounded-lg';
    item.innerHTML = `
      <span>${category.name}</span>
      <button data-id="${category.id}" class="delete-product-category-btn text-red-500 hover:text-red-700">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    productCategoriesList.appendChild(item);
  });
}

addProductCategoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = newProductCategoryNameInput.value;
  if (!name) return;
  try {
    await addDoc(collection(db, 'product-categories'), { name });
    newProductCategoryNameInput.value = '';
    showModal('Categoría de producto añadida.');
  } catch (error) {
    console.error('Error al añadir categoría de producto:', error);
    showModal('Error al añadir categoría de producto.');
  }
});

productCategoriesList.addEventListener('click', async (e) => {
  const target = e.target.closest('.delete-product-category-btn');
  if (!target) return;
  const id = target.dataset.id;
  await confirmAction('¿Estás seguro de que quieres eliminar esta categoría de producto?', async () => {
    try {
      await deleteDoc(doc(db, 'product-categories', id));
      showModal('Categoría de producto eliminada.');
    } catch (error) {
      console.error('Error al eliminar categoría de producto:', error);
      showModal('Error al eliminar categoría de producto.');
    }
  });
});

function renderProductCategorySelect() {
  productCategorySelect.innerHTML = '<option value="">Sin Categoría</option>';
  productCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    productCategorySelect.appendChild(option);
  });
}

function toggleSection(contentId) {
  const content = document.getElementById(contentId);
  const icon = content.previousElementSibling.querySelector('i');
  content.classList.toggle('hidden');
  icon.classList.toggle('fa-chevron-down');
  icon.classList.toggle('fa-chevron-up');
}

window.toggleSection = toggleSection;

// --- Modal de confirmación ---
async function confirmAction(message, onConfirm) {
  return new Promise((resolve) => {
    confirmationMessage.textContent = message;
    confirmationModal.classList.remove('hidden');

    const handleConfirm = async () => {
      await onConfirm();
      confirmationModal.classList.add('hidden');
      confirmYesBtn.removeEventListener('click', handleConfirm);
      confirmNoBtn.removeEventListener('click', handleCancel);
      resolve(true);
    };

    const handleCancel = () => {
      confirmationModal.classList.add('hidden');
      confirmYesBtn.removeEventListener('click', handleConfirm);
      confirmNoBtn.removeEventListener('click', handleCancel);
      resolve(false);
    };

    confirmYesBtn.addEventListener('click', handleConfirm);
    confirmNoBtn.addEventListener('click', handleCancel);
  });
}
