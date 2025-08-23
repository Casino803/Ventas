// firestore.js

import { db, appId, auth } from "./main.js";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, where, deleteDoc, getDocs, updateDoc, limit, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showModal, hideModal } from "./main.js";

let userId = auth.currentUser ? auth.currentUser.uid : null;
auth.onAuthStateChanged(user => {
    userId = user ? user.uid : null;
    if (userId) {
        checkCashierStatus();
    }
});

let cart = [];
let openCashierDocId = null; 
let itemToDeleteId = null;
let itemToDeleteType = null;
let productToEditId = null;

// Elementos de la UI
const cashierStatus = document.getElementById('cashierStatus');
const statusMessage = document.getElementById('statusMessage');
const openCashierSection = document.getElementById('openCashierSection');
const openingAmountInput = document.getElementById('openingAmountInput');
const salesSection = document.getElementById('salesSection');
const menuContainer = document.getElementById('menuContainer');
const cartItemsContainer = document.getElementById('cartItems');
const totalPriceEl = document.getElementById('totalPrice');
const recentOrdersSection = document.getElementById('recentOrdersSection');
const recentOrdersContainer = document.getElementById('recentOrders');
const ordersMessage = document.getElementById('ordersMessage');
const productsListContainer = document.getElementById('productsList');
const productsMessage = document.getElementById('productsMessage');
const expenseDescriptionInput = document.getElementById('expenseDescriptionInput');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const expensesListContainer = document.getElementById('expensesList');
const expensesMessage = document.getElementById('expensesMessage');
const totalSalesEl = document.getElementById('totalSales');
const totalExpensesEl = document.getElementById('totalExpenses');
const netProfitEl = document.getElementById('netProfit');
const statsMessage = document.getElementById('statsMessage');
const cashierHistory = document.getElementById('cashierHistory');
const confirmationModal = document.getElementById('confirmationModal');
const deleteModal = document.getElementById('deleteModal');
const closeCashierModal = document.getElementById('closeCashierModal');
const dailySalesEl = document.getElementById('dailySales');
const dailyExpensesEl = document.getElementById('dailyExpenses');
const closingAmountInput = document.getElementById('closingAmountInput');

// --- Funciones de Gestión de Caja ---
export const checkCashierStatus = async () => {
    cashierStatus.classList.remove('hidden');
    statusMessage.textContent = 'Verificando estado de la caja...';
    openCashierSection.classList.add('hidden');
    salesSection.classList.add('hidden');
    recentOrdersSection.classList.add('hidden');

    try {
        if (!userId) return; // Asegurarse de que el usuario está autenticado
        const path = `artifacts/${appId}/users/${userId}/cashiers`;
        const q = query(collection(db, path), where('status', '==', 'open'), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            openCashierDocId = snapshot.docs[0].id;
            const openingAmount = snapshot.docs[0].data().openingAmount;
            statusMessage.textContent = `Caja abierta con $${openingAmount.toFixed(2)}`;
            salesSection.classList.remove('hidden');
            recentOrdersSection.classList.remove('hidden');
            renderMenu();
            renderCart();
            listenForOrders();
        } else {
            openCashierDocId = null;
            statusMessage.textContent = 'La caja está cerrada. Por favor, ábrela para comenzar a vender.';
            openCashierSection.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Error al verificar el estado de la caja:", e);
        statusMessage.textContent = 'Error al verificar la caja.';
    }
};

export const openCashier = async () => {
    const openingAmount = parseFloat(openingAmountInput.value);
    if (isNaN(openingAmount) || openingAmount < 0) {
        showModal(confirmationModal, 'Por favor, ingresa un monto válido para abrir la caja.');
        return;
    }

    try {
        const path = `artifacts/${appId}/users/${userId}/cashiers`;
        await addDoc(collection(db, path), {
            userId,
            openingAmount,
            openingTimestamp: serverTimestamp(),
            status: 'open'
        });
        openingAmountInput.value = '';
        showModal(confirmationModal, 'Caja abierta con éxito.');
        checkCashierStatus();
    } catch (e) {
        console.error("Error al abrir la caja:", e);
        showModal(confirmationModal, 'Error al abrir la caja. Inténtalo de nuevo.');
    }
};

export const closeCashier = async () => {
    let totalSales = 0;
    let totalExpenses = 0;
    
    try {
        const ordersSnapshot = await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/orders`), where('cashierSessionId', '==', openCashierDocId)));
        ordersSnapshot.forEach(doc => {
            totalSales += doc.data().total;
        });

        const expensesSnapshot = await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/expenses`), where('cashierSessionId', '==', openCashierDocId)));
        expensesSnapshot.forEach(doc => {
            totalExpenses += doc.data().amount;
        });
        
        dailySalesEl.textContent = `$${totalSales.toFixed(2)}`;
        dailyExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        showModal(closeCashierModal, "");
    } catch (e) {
        console.error("Error al calcular los totales para el cierre:", e);
        showModal(confirmationModal, 'Error al preparar el cierre de caja.');
    }
};

export const confirmCloseCashier = async () => {
    const closingAmount = parseFloat(closingAmountInput.value);
    if (isNaN(closingAmount)) {
        showModal(confirmationModal, 'Por favor, ingresa un monto final para cerrar la caja.');
        return;
    }

    try {
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/cashiers`, openCashierDocId);
        const docSnapshot = await getDoc(docRef);
        const docData = docSnapshot.data();
        
        const totalSales = parseFloat(dailySalesEl.textContent.substring(1));
        const totalExpenses = parseFloat(dailyExpensesEl.textContent.substring(1));
        const openingAmount = docData.openingAmount;
        const expectedAmount = openingAmount + totalSales - totalExpenses;
        const cashDifference = closingAmount - expectedAmount;

        await updateDoc(docRef, {
            closingAmount,
            closingTimestamp: serverTimestamp(),
            status: 'closed',
            dailySales: totalSales,
            dailyExpenses: totalExpenses,
            expectedAmount,
            cashDifference
        });
        
        hideModal(closeCashierModal);
        showModal(confirmationModal, 'Caja cerrada con éxito.');
        checkCashierStatus();
    } catch (e) {
        console.error("Error al cerrar la caja:", e);
        showModal(confirmationModal, 'Error al cerrar la caja. Inténtalo de nuevo.');
    }
};

// --- Funciones para la vista de POS ---
export const renderMenu = async () => {
    menuContainer.innerHTML = '';
    const productsSnapshot = await getDocs(collection(db, `artifacts/${appId}/users/${userId}/products`));
    productsSnapshot.forEach(doc => {
        const productData = doc.data();
        const itemEl = document.createElement('div');
        itemEl.classList.add('bg-gray-50', 'rounded-xl', 'shadow-md', 'overflow-hidden', 'cursor-pointer', 'transition-transform', 'duration-200', 'hover:scale-105', 'transform');
        itemEl.innerHTML = `
            <img src="${productData.image || 'https://placehold.co/400x300/cccccc/333333?text=Sin+Imagen'}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/cccccc/333333?text=Sin+Imagen';" alt="${productData.name}" class="w-full h-32 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg text-gray-800">${productData.name}</h3>
                <p class="text-sm text-gray-600 mt-1">$${productData.price.toFixed(2)}</p>
            </div>
        `;
        itemEl.addEventListener('click', () => addItemToCart({ ...productData, id: doc.id }));
        menuContainer.appendChild(itemEl);
    });
};

const addItemToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    renderCart();
};

export const renderCart = () => {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const itemEl = document.createElement('div');
        itemEl.classList.add('flex', 'justify-between', 'items-center', 'bg-gray-50', 'rounded-xl', 'p-3', 'mb-2');
        itemEl.innerHTML = `
            <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-800">${item.name}</h4>
                <p class="text-xs text-gray-500">$${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button class="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" data-id="${item.id}" data-action="decrease">-</button>
                <span class="text-sm font-semibold">${item.quantity}</span>
                <button class="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs" data-id="${item.id}" data-action="increase">+</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
    cartItemsContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;
            const item = cart.find(cartItem => cartItem.id === id);
            if (item) {
                if (action === 'increase') {
                    item.quantity++;
                } else if (action === 'decrease' && item.quantity > 1) {
                    item.quantity--;
                } else if (action === 'decrease' && item.quantity === 1) {
                    cart = cart.filter(cartItem => cartItem.id !== id);
                }
                renderCart();
            }
        });
    });
};

export const placeOrder = async () => {
    if (cart.length === 0) {
        showModal(confirmationModal, "El carrito está vacío.");
        return;
    }
    if (!openCashierDocId) {
        showModal(confirmationModal, "La caja no está abierta. Por favor, abre una caja para registrar ventas.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    try {
        const path = `artifacts/${appId}/users/${userId}/orders`;
        await addDoc(collection(db, path), {
            items: cart,
            total,
            timestamp: serverTimestamp(),
            cashierSessionId: openCashierDocId
        });
        cart = [];
        renderCart();
        showModal(confirmationModal, "¡Pedido Realizado! El pedido ha sido guardado con éxito.");
    } catch (e) {
        console.error("Error al guardar el pedido: ", e);
        showModal(confirmationModal, "Hubo un error al procesar el pedido.");
    }
};

export const listenForOrders = () => {
    const path = `artifacts/${appId}/users/${userId}/orders`;
    const q = query(collection(db, path), where('cashierSessionId', '==', openCashierDocId), orderBy('timestamp', 'desc'), limit(5));
    onSnapshot(q, (snapshot) => {
        ordersMessage.classList.add('hidden');
        recentOrdersContainer.innerHTML = '';
        if (snapshot.empty) {
            ordersMessage.textContent = 'Aún no hay pedidos.';
            ordersMessage.classList.remove('hidden');
        } else {
            snapshot.forEach(doc => {
                const orderData = doc.data();
                const orderEl = document.createElement('div');
                orderEl.classList.add('bg-gray-50', 'rounded-xl', 'p-4', 'mb-2', 'shadow-sm', 'flex', 'justify-between', 'items-center');
                const itemsList = orderData.items.map(item => `${item.quantity}x ${item.name}`).join(', ');
                orderEl.innerHTML = `
                    <div class="flex-1">
                        <p class="text-sm text-gray-800">Pedido ID: <span class="font-mono text-xs">${doc.id.substring(0, 8)}...</span></p>
                        <p class="text-sm text-gray-600 mt-1">Artículos: ${itemsList}</p>
                        <p class="text-sm font-bold text-gray-800 mt-2">Total: $${orderData.total.toFixed(2)}</p>
                    </div>
                    <button data-id="${doc.id}" data-type="order" class="delete-item-btn text-red-500 hover:text-red-700 transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                `;
                recentOrdersContainer.appendChild(orderEl);
            });
            document.querySelectorAll('.delete-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    itemToDeleteId = e.currentTarget.dataset.id;
                    itemToDeleteType = e.currentTarget.dataset.type;
                    showModal(deleteModal, "");
                });
            });
        }
    }, (error) => {
        console.error("Error al escuchar los pedidos: ", error);
        ordersMessage.textContent = 'Error al cargar los pedidos.';
        ordersMessage.classList.remove('hidden');
    });
};

// --- Funciones para la vista de Productos ---
export const listenForProducts = () => {
    productsMessage.textContent = 'Cargando productos...';
    productsMessage.classList.remove('hidden');
    const path = `artifacts/${appId}/users/${userId}/products`;
    const productsCollection = collection(db, path);
    onSnapshot(productsCollection, (snapshot) => {
        productsMessage.classList.add('hidden');
        productsListContainer.innerHTML = '';
        if (snapshot.empty) {
            productsMessage.textContent = 'Aún no hay productos.';
            productsMessage.classList.remove('hidden');
        } else {
            snapshot.forEach(doc => {
                const productData = doc.data();
                const productEl = document.createElement('div');
                productEl.classList.add('bg-gray-50', 'rounded-xl', 'p-4', 'mb-2', 'shadow-sm', 'flex', 'justify-between', 'items-center');
                productEl.innerHTML = `
                    <div class="flex-1">
                        <p class="text-lg font-semibold text-gray-800">${productData.name}</p>
                        <p class="text-sm text-gray-600">$${productData.price.toFixed(2)}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button data-id="${doc.id}" data-name="${productData.name}" data-price="${productData.price}" data-image="${productData.image || ''}" class="edit-product-btn text-blue-500 hover:text-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button data-id="${doc.id}" data-type="product" class="delete-item-btn text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                `;
                productsListContainer.appendChild(productEl);
            });
            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    productToEditId = e.currentTarget.dataset.id;
                    const productNameInput = document.getElementById('productNameInput');
                    const productPriceInput = document.getElementById('productPriceInput');
                    const productImageInput = document.getElementById('productImageInput');
                    productNameInput.value = e.currentTarget.dataset.name;
                    productPriceInput.value = e.currentTarget.dataset.price;
                    productImageInput.value = e.currentTarget.dataset.image;
                });
            });
            document.querySelectorAll('.delete-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    itemToDeleteId = e.currentTarget.dataset.id;
                    itemToDeleteType = e.currentTarget.dataset.type;
                    showModal(deleteModal, "");
                });
            });
        }
    }, (error) => {
        console.error("Error al escuchar productos: ", error);
        productsMessage.textContent = 'Error al cargar productos.';
        productsMessage.classList.remove('hidden');
    });
};

export const saveProduct = async () => {
    const productNameInput = document.getElementById('productNameInput');
    const productPriceInput = document.getElementById('productPriceInput');
    const productImageInput = document.getElementById('productImageInput');

    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const image = productImageInput.value.trim();

    if (name === '' || isNaN(price) || price <= 0) {
        showModal(confirmationModal, "Por favor, introduce un nombre y un precio válidos.");
        return;
    }

    try {
        if (productToEditId) {
            const docRef = doc(db, `artifacts/${appId}/users/${userId}/products`, productToEditId);
            await updateDoc(docRef, { name, price, image });
            productToEditId = null;
            showModal(confirmationModal, "Producto actualizado con éxito.");
        } else {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/products`), { name, price, image });
            showModal(confirmationModal, "Producto añadido con éxito.");
        }
        productNameInput.value = '';
        productPriceInput.value = '';
        productImageInput.value = '';
    } catch (e) {
        console.error("Error al guardar el producto: ", e);
        showModal(confirmationModal, "Error al guardar el producto.");
    }
};

export const deleteItem = async () => {
    let path;
    if (itemToDeleteType === 'order') {
        path = `artifacts/${appId}/users/${userId}/orders`;
    } else if (itemToDeleteType === 'product') {
        path = `artifacts/${appId}/users/${userId}/products`;
    } else if (itemToDeleteType === 'expense') {
        path = `artifacts/${appId}/users/${userId}/expenses`;
    }

    try {
        const docRef = doc(db, path, itemToDeleteId);
        await deleteDoc(docRef);
        hideModal(deleteModal);
    } catch (e) {
        console.error("Error al eliminar el documento: ", e);
        showModal(confirmationModal, "Error al eliminar el documento.");
    }
};

// --- Funciones para la vista de Gastos ---
export const listenForExpenses = () => {
    expensesMessage.textContent = 'Cargando gastos...';
    expensesMessage.classList.remove('hidden');
    const path = `artifacts/${appId}/users/${userId}/expenses`;
    const expensesCollection = collection(db, path);
    onSnapshot(expensesCollection, (snapshot) => {
        expensesMessage.classList.add('hidden');
        expensesListContainer.innerHTML = '';
        if (snapshot.empty) {
            expensesMessage.textContent = 'Aún no hay gastos registrados.';
            expensesMessage.classList.remove('hidden');
        } else {
            snapshot.forEach(doc => {
                const expenseData = doc.data();
                const expenseEl = document.createElement('div');
                expenseEl.classList.add('bg-gray-50', 'rounded-xl', 'p-4', 'mb-2', 'shadow-sm', 'flex', 'justify-between', 'items-center');
                expenseEl.innerHTML = `
                    <div class="flex-1">
                        <p class="text-lg font-semibold text-gray-800">${expenseData.description}</p>
                        <p class="text-sm text-gray-600 mt-1">Monto: $${expenseData.amount.toFixed(2)}</p>
                        <p class="text-xs text-gray-500 mt-1">Fecha: ${expenseData.timestamp ? new Date(expenseData.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <button data-id="${doc.id}" data-type="expense" class="delete-item-btn text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                `;
                expensesListContainer.appendChild(expenseEl);
            });

            document.querySelectorAll('.delete-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    itemToDeleteId = e.currentTarget.dataset.id;
                    itemToDeleteType = e.currentTarget.dataset.type;
                    showModal(deleteModal, "");
                });
            });
        }
    }, (error) => {
        console.error("Error al escuchar los gastos: ", error);
        expensesMessage.textContent = 'Error al cargar los gastos.';
        expensesMessage.classList.remove('hidden');
    });
};

export const addExpense = async () => {
    const expenseDescriptionInput = document.getElementById('expenseDescriptionInput');
    const expenseAmountInput = document.getElementById('expenseAmountInput');

    const description = expenseDescriptionInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);

    if (description === '' || isNaN(amount) || amount <= 0) {
        showModal(confirmationModal, "Por favor, introduce una descripción y un monto válidos.");
        return;
    }
    if (!openCashierDocId) {
        showModal(confirmationModal, "La caja no está abierta. Por favor, abre una caja para registrar gastos.");
        return;
    }

    try {
        await addDoc(collection(db, `artifacts/${appId}/users/${userId}/expenses`), {
            description,
            amount,
            timestamp: serverTimestamp(),
            cashierSessionId: openCashierDocId
        });
        expenseDescriptionInput.value = '';
        expenseAmountInput.value = '';
        showModal(confirmationModal, "Gasto registrado con éxito.");
    } catch (e) {
        console.error("Error al añadir el gasto: ", e);
        showModal(confirmationModal, "Error al registrar el gasto.");
    }
};

// --- Funciones para la vista de Estadísticas ---
export const loadStats = async () => {
    statsMessage.textContent = 'Cargando estadísticas...';
    statsMessage.classList.remove('hidden');
    totalSalesEl.textContent = '$0.00';
    totalExpensesEl.textContent = '$0.00';
    netProfitEl.textContent = '$0.00';
    cashierHistory.innerHTML = '';
    
    try {
        const cashierSnapshot = await getDocs(query(collection(db, `artifacts/${appId}/users/${userId}/cashiers`), where('status', '==', 'closed'), orderBy('closingTimestamp', 'desc')));
        let totalSales = 0;
        let totalExpenses = 0;

        if (cashierSnapshot.empty) {
            statsMessage.textContent = "No hay cajas cerradas para mostrar estadísticas.";
            statsMessage.classList.remove('hidden');
            return;
        }

        cashierSnapshot.forEach(doc => {
            const data = doc.data();
            const sales = data.dailySales || 0;
            const expenses = data.dailyExpenses || 0;
            totalSales += sales;
            totalExpenses += expenses;

            const date = data.closingTimestamp ? new Date(data.closingTimestamp.seconds * 1000).toLocaleString() : 'N/A';
            
            const historyEl = document.createElement('div');
            historyEl.classList.add('bg-gray-50', 'rounded-xl', 'p-4', 'mb-2', 'shadow-sm');
            historyEl.innerHTML = `
                <p class="font-bold text-gray-800">Caja cerrada el ${date}</p>
                <p class="text-sm text-gray-600 mt-1">Monto inicial: $${(data.openingAmount || 0).toFixed(2)}</p>
                <p class="text-sm text-gray-600">Ventas del día: $${sales.toFixed(2)}</p>
                <p class="text-sm text-gray-600">Gastos del día: $${expenses.toFixed(2)}</p>
                <p class="text-sm font-bold text-gray-800 mt-2">Monto Final: $${(data.closingAmount || 0).toFixed(2)}</p>
                <p class="text-xs text-gray-500">Diferencia: $${(data.cashDifference || 0).toFixed(2)}</p>
            `;
            cashierHistory.appendChild(historyEl);
        });

        const netProfit = totalSales - totalExpenses;
        totalSalesEl.textContent = `$${totalSales.toFixed(2)}`;
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        netProfitEl.textContent = `$${netProfit.toFixed(2)}`;
        statsMessage.classList.add('hidden');
    } catch (e) {
        console.error("Error al cargar las estadísticas: ", e);
        statsMessage.textContent = 'Error al cargar las estadísticas.';
        statsMessage.classList.remove('hidden');
    }
};
