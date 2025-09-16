import { allProducts, allCombos, allSales, allReservations, allCustomers, userPaymentMethods, userExpenseCategories, productCategories, dailyCashData, SHARED_PRODUCTS_COLLECTION, SHARED_SALES_COLLECTION, SHARED_CUSTOMERS_COLLECTION, SHARED_PAYMENT_METHODS_COLLECTION, SHARED_EXPENSE_CATEGORIES_COLLECTION, SHARED_PRODUCT_CATEGORIES_COLLECTION, SHARED_COMBOS_COLLECTION, SHARED_RESERVATIONS_COLLECTION, SHARED_EXPENSES_COLLECTION, SHARED_CASH_COLLECTION, SHARED_CASH_HISTORY_COLLECTION } from './firestore.js';
import { db, auth, signOut } from './firebase.js';
import { addProductToCart, addComboToCart, calculateTotal, currentDiscountSurcharge, updateRemainingAmount, cart, currentReservationToProcess, isProcessingPayment } from './logic.js';
import { renderSalesChart, renderTopProductsChart, renderPaymentMethodsChart } from './charts.js';
import { doc, addDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Referencias de la UI
const menuButtons = document.querySelectorAll('button[data-page]');
const pages = document.querySelectorAll('.page-content');
const posSearchInput = document.getElementById('pos-search-input');
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const cartTotalSpan = document.getElementById('cart-total');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const discountSurchargeDisplay = document.getElementById('discount-surcharge-display');
const discountSurchargeAmountSpan = document.getElementById('discount-surcharge-amount');
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
const reserveBtn = document.getElementById('reserve-btn');
const reservationsListContainer = document.getElementById('reservations-list-container');
const cashStatusText = document.getElementById('cash-status-text');
const currentCashDisplay = document.getElementById('current-cash-display');
const openCashForm = document.getElementById('open-cash-form');
const expenseForm = document.getElementById('expense-form');
const dailyExpensesContainer = document.getElementById('daily-expenses-container');
const closeCashBtn = document.getElementById('close-cash-btn');
const cashHistoryContainer = document.getElementById('cash-history-container');
const cashStatsSection = document.getElementById('cash-stats');
const statsTotalSales = document.getElementById('stats-total-sales');
const statsSalesCount = document.getElementById('stats-sales-count');
const statsTotalExpenses = document.getElementById('stats-total-expenses');
const paymentStatsContainer = document.getElementById('payment-stats-container');
const splitPaymentModal = document.getElementById('split-payment-modal');
const paymentTotalDisplay = document.getElementById('payment-total-display');
const paymentInputsContainer = document.getElementById('payment-inputs-container');
const addPaymentInputBtn = document.getElementById('add-payment-input-btn');
const paymentRemainingDisplay = document.getElementById('payment-remaining-display');
const cancelSplitBtn = document.getElementById('cancel-split-btn');
const processPaymentBtn = document.getElementById('process-payment-btn');
const importSalesBtn = document.getElementById('import-sales-btn');
const exportSalesBtn = document.getElementById('export-sales-btn');
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
const filtersContainer = document.getElementById('filters-container');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const addPaymentMethodForm = document.getElementById('add-payment-method-form');
const newPaymentMethodName = document.getElementById('new-payment-method-name');
const paymentMethodsList = document.getElementById('payment-methods-list');
const addExpenseCategoryForm = document.getElementById('add-expense-category-form');
const newExpenseCategoryName = document.getElementById('new-expense-category-name');
const expenseCategoriesList = document.getElementById('expense-categories-list');
const addProductCategoryForm = document.getElementById('add-product-category-form');
const newProductCategoryName = document.getElementById('new-product-category-name');
const productCategoriesList = document.getElementById('product-categories-list');
const productCategoryInput = document.getElementById('product-category-input');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationMessage = document.getElementById('confirmation-message');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');
const showComboFormBtn = document.getElementById('show-combo-form-btn');
const addComboForm = document.getElementById('add-combo-form');
const comboIdInput = document.getElementById('combo-id');
const comboNameInput = document.getElementById('combo-name-input');
const comboPriceInput = document.getElementById('combo-price-input');
const comboProductsContainer = document.getElementById('combo-products-container');
const addComboProductBtn = document.getElementById('add-combo-product-btn');
const promotionsList = document.getElementById('promotions-list');
const productStockInput = document.getElementById('product-stock-input');
const defaultPaymentMethods = ["Efectivo", "Transferencia MP"];
const defaultExpenseCategories = ["General", "Suministros", "Servicios"];

export function showModal(message) {
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }
}

export function showConfirmationModal(message, onConfirm, onCancel) {
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

export function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.add('active');
    }
}

export function setupNavigation() {
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;
            if (!btn.classList.contains('tab-btn')) {
                document.querySelector('.tab-btn.active')?.classList.remove('active');
                showPage(targetPageId);
            }
        });
    });
}

export function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPageId = btn.dataset.page;
            document.querySelector('.tab-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            showPage(targetPageId);
        });
    });
}

export function setupCashTabNavigation() {
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

export function renderProducts(products, combos) {
    if (!productsContainer) return;
    productsContainer.innerHTML = '';
    products.forEach(product => renderProductCard(product));
    combos.forEach(combo => renderComboCard(combo));
}

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = "bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col justify-between items-center text-center transition-transform hover:scale-105 duration-300";

    const stockHtml = product.stock !== undefined ? `<p class="text-sm font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-500'}">Stock: ${product.stock}</p>` : '';
    const category = productCategories.find(c => c.id === product.categoryId);
    const categoryHtml = category ? `<p class="text-xs text-gray-400 mt-1">Categoría: ${category.name}</p>` : '';

    card.innerHTML = `
    <h3 class="font-bold text-gray-800 text-lg mb-2">${product.name}</h3>
    <p class="text-xl font-bold text-green-600">$${product.price.toFixed(2)}</p>
    ${stockHtml}
    ${categoryHtml}
    <button data-product-id="${product.id}" class="mt-4 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
        <i class="fas fa-plus-circle"></i> Añadir al Carrito
    </button>
    `;
    productsContainer.appendChild(card);
    card.querySelector('button').addEventListener('click', () => addProductToCart(product));
}

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
    card.querySelector('button').addEventListener('click', () => addComboToCart(combo));
}

export function renderCart() {
    if (!cartContainer || !cartSubtotalSpan || !cartTotalSpan || !discountSurchargeDisplay) return;
    cartContainer.innerHTML = '';
    const { subtotal, total, adjustmentAmount } = calculateTotal();

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-200 p-3 rounded-lg flex justify-between items-center";
        const itemName = item.isCombo ? `${item.name} (Combo)` : item.name;
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
            const idToRemove = e.target.closest('button[data-id]').dataset.id;
            removeProductFromCart(idToRemove);
        });
    });

    cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalSpan.textContent = `$${total.toFixed(2)}`;

    if (adjustmentAmount !== 0) {
        const text = currentDiscountSurcharge.type.includes('discount') ? 'Descuento' : 'Recargo';
        const sign = currentDiscountSurcharge.type.includes('discount') ? '-' : '+';
        discountSurchargeAmountSpan.textContent = `${sign}$${adjustmentAmount.toFixed(2)}`;
        discountSurchargeDisplay.classList.remove('hidden');
    } else {
        discountSurchargeDisplay.classList.add('hidden');
    }
}

export function renderReservations() {
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
        
        let itemsHtml = reservation.items.map(item => `<li class="flex justify-between text-sm"><span class="text-gray-700">${item.name} x${item.quantity}</span></li>`).join('');
        let adjustmentHtml = '';
        if (reservation.adjustment && reservation.adjustment.amount > 0) {
            const adjustmentText = reservation.adjustment.type.includes('discount') ? 'Descuento' : 'Recargo';
            const sign = reservation.adjustment.type.includes('discount') ? '-' : '+';
            adjustmentHtml = `<p class="text-sm text-gray-600">${adjustmentText}: <span class="font-semibold">${sign}$${reservation.adjustment.amount.toFixed(2)}</span></p>`;
        }
        
        reservationDiv.innerHTML = `
            <div class="flex-grow">
                <p class="font-semibold text-gray-800">Cliente: ${reservation.customerName}</p>
                <p class="text-sm text-gray-500">Fecha de reserva: ${formattedDate}</p>
                <p class="text-lg font-bold text-blue-600 mt-2">Total: $${reservation.total.toFixed(2)}</p>
                <div class="mt-2 text-sm">
                    <p class="font-semibold text-gray-700">Productos:</p>
                    <ul class="list-disc list-inside space-y-1 ml-4">${itemsHtml}</ul>
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

export function showPaymentModalForReservation(reservation) {
    if (!paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer || !splitPaymentModal || !customerSelect) {
        showModal("Error: Faltan elementos de la interfaz de usuario para el modal de pago.");
        return;
    }
    currentReservationToProcess = reservation;
    cart.length = 0;
    cart.push(...reservation.items);
    showPage('pos-page');
    const posTab = document.querySelector('.tab-btn[data-page="pos-page"]');
    if (posTab) {
        document.querySelector('.tab-btn.active')?.classList.remove('active');
        posTab.classList.add('active');
    }
    renderCart();
    paymentTotalDisplay.textContent = `$${reservation.total.toFixed(2)}`;
    paymentRemainingDisplay.textContent = `$${reservation.total.toFixed(2)}`;
    paymentInputsContainer.innerHTML = '';
    addPaymentInput(reservation.total);
    customerSelect.value = reservation.customerId;
    splitPaymentModal.classList.remove('hidden');
}

export function renderManageProduct() {
    if (!manageProductsContainer) return;
    manageProductsContainer.innerHTML = '';
    allProducts.forEach(product => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex items-center justify-between";
        const stockDisplay = product.stock !== undefined ? `<span class="text-sm text-gray-500"> (Stock: ${product.stock})</span>` : '';
        const category = productCategories.find(c => c.id === product.categoryId);
        const categoryDisplay = category ? `<span class="text-gray-400 text-sm"> (${category.name})</span>` : '';
        itemDiv.innerHTML = `
        <div class="flex-grow">
            <span class="font-semibold">${product.name}</span>
            <span class="text-gray-500"> - $${product.price.toFixed(2)}</span>
            ${stockDisplay}
            ${categoryDisplay}
        </div>
        <div class="flex space-x-2">
            <button data-product-id="${product.id}" class="edit-product-btn px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors">
                <i class="fas fa-edit"></i>
            </button>
            <button data-product-id="${product.id}" class="delete-product-btn px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        `;
        manageProductsContainer.appendChild(itemDiv);

        itemDiv.querySelector('.edit-product-btn').addEventListener('click', () => {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name-input').value = product.name;
            document.getElementById('product-price-input').value = product.price;
            if (productStockInput) productStockInput.value = product.stock !== undefined ? product.stock : '';
            document.getElementById('product-category-input').value = product.categoryId || '';
            productFormContainer.classList.remove('hidden');
        });

        itemDiv.querySelector('.delete-product-btn').addEventListener('click', async () => {
            showConfirmationModal('¿Estás seguro de que quieres eliminar este producto?', async () => {
                try {
                    await deleteDoc(doc(db, SHARED_PRODUCTS_COLLECTION, product.id));
                    showModal("Producto eliminado con éxito.");
                } catch (error) {
                    showModal("Error al eliminar el producto. Por favor, intenta de nuevo.");
                }
            });
        });
    });
}

export function renderSalesHistory(sales) {
    if (!salesHistoryContainer) return;
    salesHistoryContainer.innerHTML = '';
    const filteredSales = applyFilters(sales);
    let filteredTotal = 0;
    const salesByDay = filteredSales.reduce((acc, sale) => {
        const date = sale.timestamp ? new Date(sale.timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible';
        if (!acc[date]) acc[date] = { total: 0, sales: [] };
        const amountToAdd = (filterPaymentMethod?.value && filterPaymentMethod.value !== 'Todas') ? (sale.payments.find(p => p.method === filterPaymentMethod.value)?.amount || 0) : sale.total;
        acc[date].total += amountToAdd;
        filteredTotal += amountToAdd;
        acc[date].sales.push(sale);
        return acc;
    }, {});

    const sortedDates = Object.keys(salesByDay).sort((a, b) => new Date(b) - new Date(a));
    if (sortedDates.length > 0) {
        const totalHeader = document.createElement('div');
        totalHeader.className = "bg-blue-600 text-white p-4 rounded-lg mb-4 text-center";
        totalHeader.innerHTML = `<h3 class="font-bold text-xl">Total Filtrado: $${filteredTotal.toFixed(2)}</h3>`;
        salesHistoryContainer.appendChild(totalHeader);
    }
    sortedDates.forEach(dateString => {
        const dailySales = salesByDay[dateString];
        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        dayDiv.innerHTML = `<div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300"><h3 class="font-bold text-lg">${dateString}</h3><span class="font-bold text-green-600 text-xl">Total del día: $${dailySales.total.toFixed(2)}</span></div>`;
        dailySales.sales.forEach(sale => {
            const saleDiv = document.createElement('div');
            saleDiv.className = "bg-white p-3 rounded-lg shadow-sm my-2";
            const formattedTime = sale.timestamp ? new Date(sale.timestamp.seconds * 1000).toLocaleTimeString('es-ES') : '';
            const itemsHtml = sale.items.map(item => `<li class="flex justify-between text-sm"><span class="text-gray-700">${item.name} x${item.quantity}</span><span class="text-gray-700">$${(item.price * item.quantity).toFixed(2)}</span></li>`).join('');
            const adjustmentHtml = (sale.adjustment && sale.adjustment.amount > 0) ? `<p class="text-sm text-gray-600">${sale.adjustment.type.includes('discount') ? 'Descuento' : 'Recargo'}: <span class="font-semibold">${sale.adjustment.type.includes('discount') ? '-' : '+'}$${sale.adjustment.amount.toFixed(2)}</span></p>` : '';
            const paymentsHtml = sale.payments?.length ? '<p class="mt-2 text-sm text-gray-600">Pagos:</p><ul class="space-y-1">' + sale.payments.map(p => `<li class="flex justify-between text-sm"><span class="text-gray-700">${p.method}</span><span class="text-gray-700">$${p.amount.toFixed(2)}</span></li>`).join('') + '</ul>' : '';
            const customerHtml = sale.customerId ? `<p class="mt-2 text-sm text-gray-600">Cliente: <span class="font-semibold">${sale.customerName}</span></p>` : '';
            const displayAmount = (filterPaymentMethod?.value && filterPaymentMethod.value !== 'Todas') ? (sale.payments.find(p => p.method === filterPaymentMethod.value)?.amount || 0) : sale.total;
            saleDiv.innerHTML = `
            <div class="flex justify-between items-center mb-2"><h4 class="font-semibold text-gray-800">Venta a las ${formattedTime}</h4><span class="font-bold text-gray-800">$${displayAmount.toFixed(2)}</span></div>
            <ul class="space-y-1">${itemsHtml}</ul>${adjustmentHtml}${paymentsHtml}${customerHtml}
            <div class="flex justify-end"><button class="print-receipt-btn px-3 py-1 mt-2 bg-blue-500 text-white rounded-lg text-sm" data-sale-id="${sale.id}"><i class="fas fa-print"></i> Recibo</button></div>`;
            dayDiv.appendChild(saleDiv);
        });
        salesHistoryContainer.appendChild(dayDiv);
    });
    document.querySelectorAll('.print-receipt-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const saleId = e.target.dataset.saleId;
        const saleToPrint = allSales.find(s => s.id === saleId);
        if (saleToPrint) printReceipt(saleToPrint);
    }));
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
        if (productName && !sale.items.some(item => item.name.toLowerCase().includes(productName))) return false;
        if (paymentMethod && paymentMethod !== 'Todas') return sale.payments.some(p => p.method === paymentMethod);
        return true;
    });
}

export function renderDailyExpenses(expenses) {
    if (!dailyExpensesContainer) return;
    dailyExpensesContainer.innerHTML = '';
    const expensesByDay = expenses.reduce((acc, expense) => {
        const date = expense.timestamp ? new Date(expense.timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        if (!acc[date]) acc[date] = { total: 0, expenses: [] };
        acc[date].total += expense.amount;
        acc[date].expenses.push(expense);
        return acc;
    }, {});
    const sortedDates = Object.keys(expensesByDay).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.forEach(dateString => {
        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        const dayData = expensesByDay[dateString];
        dayDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300"><h3 class="font-bold text-lg">${dateString}</h3><span class="font-bold text-red-600 text-xl">Total: -$${dayData.total.toFixed(2)}</span></div>`;
        dayData.expenses.forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = "bg-white p-3 rounded-lg shadow-sm flex justify-between items-center my-2";
            const formattedTime = expense.timestamp ? new Date(expense.timestamp.seconds * 1000).toLocaleTimeString('es-ES') : '';
            expenseDiv.innerHTML = `
            <div><span class="font-semibold">${expense.description}</span><span class="text-gray-500 text-sm"> (${expense.category})</span><span class="text-gray-500 text-sm block"> - a las ${formattedTime}</span></div>
            <span class="text-red-600 font-bold">-$${expense.amount.toFixed(2)}</span>`;
            dayDiv.appendChild(expenseDiv);
        });
        dailyExpensesContainer.appendChild(dayDiv);
    });
}

export function renderCashHistory(history) {
    if(!cashHistoryContainer) return;
    cashHistoryContainer.innerHTML = '';
    const historyByDay = history.reduce((acc, entry) => {
        const date = entry.fecha ? new Date(entry.fecha.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});
    const sortedDates = Object.keys(historyByDay).sort((a, b) => new Date(b) - new Date(a));
    sortedDates.forEach(dateString => {
        const dayDiv = document.createElement('div');
        dayDiv.className = "bg-gray-200 p-4 rounded-lg mb-4";
        const entriesHtml = historyByDay[dateString].map(entry => {
            const entryDate = entry.cierreTimestamp ? new Date(entry.cierreTimestamp.seconds * 1000).toLocaleTimeString('es-ES') : '';
            return `<div class="bg-white p-3 rounded-lg shadow-sm my-2"><div class="flex justify-between items-center mb-1"><span class="font-bold text-gray-800">Caja cerrada a las ${entryDate}</span></div><div class="text-sm">Apertura: <span class="font-semibold">$${entry.abertura.toFixed(2)}</span></div><div class="text-sm">Ventas Totales: <span class="font-semibold text-green-600">$${entry.ventasTotales.toFixed(2)}</span></div><div class="text-sm">Gastos Totales: <span class="font-semibold text-red-600">$${entry.gastosTotales.toFixed(2)}</span></div><div class="text-lg font-bold mt-2">Cierre: <span class="text-blue-600">$${entry.cierre.toFixed(2)}</span></div></div>`;
        }).join('');
        dayDiv.innerHTML = `<div class="flex justify-between items-center mb-2 pb-2 border-b-2 border-gray-300"><h3 class="font-bold text-lg">${dateString}</h3></div>${entriesHtml}`;
        cashHistoryContainer.appendChild(dayDiv);
    });
}

export function renderCashStatus() {
    if (dailyCashData && !dailyCashData.cerrada) {
        if (cashStatusText) cashStatusText.textContent = `Caja abierta: $${dailyCashData.abertura.toFixed(2)}`;
        if (openCashForm) openCashForm.classList.add('hidden');
        document.getElementById('expense-section')?.classList.remove('hidden');
        document.getElementById('expense-separator')?.classList.remove('hidden');
        if (closeCashBtn) closeCashBtn.classList.remove('hidden');
        document.getElementById('close-separator')?.classList.remove('hidden');
        if (cashStatsSection) cashStatsSection.classList.remove('hidden');
    } else {
        if (cashStatusText) cashStatusText.textContent = "Caja cerrada";
        if (currentCashDisplay) currentCashDisplay.textContent = "$0.00";
        if (openCashForm) openCashForm.classList.remove('hidden');
        document.getElementById('expense-section')?.classList.add('hidden');
        document.getElementById('expense-separator')?.classList.add('hidden');
        if (closeCashBtn) closeCashBtn.classList.add('hidden');
        document.getElementById('close-separator')?.classList.add('hidden');
        if (cashStatsSection) cashStatsSection.classList.add('hidden');
    }
}

export function renderPaymentStats(paymentMethodTotals) {
    if (!paymentStatsContainer) return;
    paymentStatsContainer.innerHTML = '';
    Object.entries(paymentMethodTotals).forEach(([method, total]) => {
        const div = document.createElement('div');
        const textColor = 'text-green-600';
        div.innerHTML = `<span class="block font-bold ${textColor} text-xl">$${total.toFixed(2)}</span><span class="text-sm text-gray-500">Total en ${method}</span>`;
        paymentStatsContainer.appendChild(div);
    });
}

export function renderCustomersList(customers) {
    if (!customersListContainer) return;
    customersListContainer.innerHTML = '';
    customers.forEach(customer => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
        itemDiv.innerHTML = `
        <span>${customer.name}</span>
        <div class="flex space-x-2">
            <button data-id="${customer.id}" class="edit-customer-btn px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm"><i class="fas fa-edit"></i></button>
            <button data-id="${customer.id}" class="delete-customer-btn px-3 py-1 bg-red-500 text-white rounded-lg text-sm"><i class="fas fa-trash-alt"></i></button>
        </div>
        `;
        customersListContainer.appendChild(itemDiv);
        itemDiv.querySelector('.edit-customer-btn').addEventListener('click', () => {
            const newName = prompt(`Editar nombre de cliente:`, customer.name);
            if (newName && newName.trim()) setDoc(doc(db, SHARED_CUSTOMERS_COLLECTION, customer.id), { name: newName.trim() }, { merge: true });
        });
        itemDiv.querySelector('.delete-customer-btn').addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de que quieres eliminar a ${customer.name}?`)) {
                await deleteDoc(doc(db, SHARED_CUSTOMERS_COLLECTION, customer.id));
                showModal("Cliente eliminado.");
            }
        });
    });
}

export function renderCustomerSelect(customers) {
    if (!customerSelect) return;
    customerSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
}

export function renderPaymentMethodFilters() {
    if(!filterPaymentMethod) return;
    filterPaymentMethod.innerHTML = '<option value="">Todas</option>';
    const allMethods = [...new Set([...defaultPaymentMethods, ...userPaymentMethods.map(m => m.name)])];
    allMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method;
        option.textContent = method;
        filterPaymentMethod.appendChild(option);
    });
}

export function renderExpenseCategories() {
    if(!document.getElementById('expense-category-select')) return;
    const select = document.getElementById('expense-category-select');
    select.innerHTML = '';
    const allCategories = [...new Set([...defaultExpenseCategories, ...userExpenseCategories.map(c => c.name)])];
    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        select.appendChild(option);
    });
}

export function renderPaymentMethodsList() {
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
                    await deleteDoc(doc(db, SHARED_PAYMENT_METHODS_COLLECTION, method.id));
                    showModal("Forma de pago eliminada con éxito.");
                }
            });
        } else {
            deleteButton.disabled = true;
            deleteButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

export function renderExpenseCategoriesList() {
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
                    await deleteDoc(doc(db, SHARED_EXPENSE_CATEGORIES_COLLECTION, category.id));
                    showModal("Categoría de gasto eliminada con éxito.");
                }
            });
        } else {
            deleteButton.disabled = true;
            deleteButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });
}

export function renderProductCategoriesList() {
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
            showConfirmationModal(`¿Estás seguro de que quieres eliminar la categoría de producto '${category.name}'?`, async () => {
                await deleteDoc(doc(db, SHARED_PRODUCT_CATEGORIES_COLLECTION, category.id));
                showModal("Categoría de producto eliminada con éxito.");
            }, () => {});
        });
    });
}

export function renderProductCategoriesInput() {
    if (!productCategoryInput) return;
    productCategoryInput.innerHTML = '<option value="">Sin Categoría</option>';
    productCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        productCategoryInput.appendChild(option);
    });
}

export function renderManageCombos() {
    if (!promotionsList) return;
    promotionsList.innerHTML = '';

    allCombos.forEach(combo => {
        const comboDiv = document.createElement('div');
        comboDiv.className = "bg-gray-100 p-3 rounded-lg flex items-center justify-between";
        
        const productsHtml = combo.items.map(item => {
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

        comboDiv.querySelector('.edit-combo-btn').addEventListener('click', () => {
            const selectedCombo = allCombos.find(c => c.id === combo.id);
            if (selectedCombo) {
                if (addComboForm) addComboForm.classList.remove('hidden');
                if (comboIdInput) comboIdInput.value = selectedCombo.id;
                if (comboNameInput) comboNameInput.value = selectedCombo.name;
                if (comboPriceInput) comboPriceInput.value = selectedCombo.price;
                if (comboProductsContainer) comboProductsContainer.innerHTML = '';
                selectedCombo.items.forEach(item => addComboProductInput(allProducts.find(p => p.id === item.productId), item.quantity));
            }
        });

        comboDiv.querySelector('.delete-combo-btn').addEventListener('click', () => {
            showConfirmationModal(`¿Estás seguro de que quieres eliminar el combo '${combo.name}'?`, async () => {
                await deleteDoc(doc(db, SHARED_COMBOS_COLLECTION, combo.id));
                showModal("Combo eliminado con éxito.");
            }, () => {});
        });
    });
}

function addComboProductInput(product = null, quantity = 1) {
    if (!comboProductsContainer) return;
    const div = document.createElement('div');
    div.className = "flex space-x-2 items-center mb-2";
    const select = document.createElement('select');
    select.className = "combo-product-select w-full px-2 py-1 border rounded-lg";
    allProducts.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = prod.name;
        select.appendChild(option);
    });
    if (product) select.value = product.id;
    const input = document.createElement('input');
    input.type = "number";
    input.className = "combo-product-quantity w-24 px-2 py-1 border rounded-lg text-center";
    input.value = quantity;
    input.min = "1";
    const removeBtn = document.createElement('button');
    removeBtn.type = "button";
    removeBtn.className = "remove-combo-product-btn text-red-500 hover:text-red-700";
    removeBtn.innerHTML = `<i class="fas fa-times-circle"></i>`;
    removeBtn.addEventListener('click', () => div.remove());
    div.appendChild(select);
    div.appendChild(input);
    div.appendChild(removeBtn);
    comboProductsContainer.appendChild(div);
}

export function addPaymentInput(amount = 0) {
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
    if (paymentInputsContainer.children.length === 0) input.value = parseFloat(paymentTotalDisplay.textContent.replace('$', '')).toFixed(2);
    else input.value = amount.toFixed(2);
    input.addEventListener('input', updateRemainingAmount);
    select.addEventListener('change', updateRemainingAmount);
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `<i class="fas fa-times-circle"></i>`;
    removeBtn.className = "px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600";
    removeBtn.addEventListener('click', () => {
        row.remove();
        if (paymentInputsContainer.children.length === 0) addPaymentInput(parseFloat(paymentTotalDisplay.textContent.replace('$', '')));
        updateRemainingAmount();
    });
    row.appendChild(select);
    row.appendChild(input);
    row.appendChild(removeBtn);
    paymentInputsContainer.appendChild(row);
    if (paymentInputsContainer.children.length >= 1) addPaymentInputBtn.classList.remove('hidden');
    else addPaymentInputBtn.classList.add('hidden');
    updateRemainingAmount();
}

export function printReceipt(sale) {
    const paymentsHtml = sale.payments.map(p => `<p class="payment-row">Pagado con ${p.method}: $${p.amount.toFixed(2)}</p>`).join('');
    const content = `
    <div id="print-area"><style>body { font-family: 'Inter', sans-serif; padding: 20px; }.receipt-header { text-align: center; margin-bottom: 20px; }.receipt-body { margin-bottom: 20px; }.receipt-footer { text-align: center; border-top: 1px dashed black; padding-top: 10px; }table { width: 100%; border-collapse: collapse; }th, td { text-align: left; padding: 5px 0; border-bottom: 1px solid #ccc; }.total-row td { font-weight: bold; font-size: 1.2em; border-top: 2px solid black; }.payment-row { margin-top: 10px; }@media print {body > *:not(#print-area) {display: none;}#print-area {display: block !important;position: fixed;top: 0;left: 0;width: 100%;height: 100%;background-color: white;z-index: 9999;}}</style>
    <div class="receipt-header"><h2>Recibo de Venta</h2><p>Fecha: ${new Date().toLocaleString()}</p>${sale.customerName ? `<p>Cliente: ${sale.customerName}</p>` : ''}</div>
    <div class="receipt-body"><table><thead><tr><th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Total</th></tr></thead><tbody>${sale.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td><td>$${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('')}</tbody></table>
    <div style="text-align: right; margin-top: 20px;"><p><strong>Total: $${sale.total.toFixed(2)}</strong></p>${paymentsHtml}</div></div>
    <div class="receipt-footer"><p>¡Gracias por tu compra!</p></div></div>`;
    const printArea = document.createElement('div');
    printArea.innerHTML = content;
    document.body.appendChild(printArea);
    setTimeout(() => {
        window.print();
        document.body.removeChild(printArea);
    }, 500);
}

export function toggleFilters() {
    if (filtersContainer) filtersContainer.classList.toggle('hidden');
}

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
