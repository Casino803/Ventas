// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc", // REEMPLAZA ESTO CON TU API KEY REAL
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "tu-id",
    appId: "tu-id"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// UI Elements
const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const showSignupBtn = document.getElementById('show-signup-btn');
const signupForm = document.getElementById('signup-form');
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const productForm = document.getElementById('add-product-form');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productsContainer = document.getElementById('products-container');
const productSearchInput = document.getElementById('product-search');
const salesListContainer = document.getElementById('sales-list');
const totalPriceElement = document.getElementById('total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const cajaStatusElement = document.getElementById('caja-status');
const cajaAbrirBtn = document.getElementById('caja-abrir-btn');
const cajaCerrarBtn = document.getElementById('caja-cerrar-btn');
const cajaDetails = document.getElementById('caja-details');
const cajaMontoInicialElement = document.getElementById('caja-monto-inicial');
const cajaIngresosElement = document.getElementById('caja-ingresos');
const cajaEgresosElement = document.getElementById('caja-egresos');
const cajaTotalEfectivoElement = document.getElementById('caja-total-efectivo');
const cajaTotalTarjetaElement = document.getElementById('caja-total-tarjeta');
const gastosBtn = document.getElementById('gastos-btn');
const gastosFormContainer = document.getElementById('gastos-form-container');
const gastosForm = document.getElementById('gastos-form');
const configTabs = document.querySelectorAll('.config-tab-btn');
const configContent = document.getElementById('config-content');

// NUEVOS ELEMENTOS PARA CATEGORÍAS
const addCategoryForm = document.getElementById('add-category-form');
const categoryNameInput = document.getElementById('category-name');
const productCategorySelect = document.getElementById('product-category');
const categoryFilterSelect = document.getElementById('category-filter');

let sales = [];
let cajaAbierta = null;
let currentProducts = [];

// --- Funciones de Utilidad ---

function showView(viewId) {
    views.forEach(view => {
        view.style.display = 'none';
    });
    document.getElementById(viewId).style.display = 'flex';
}

function updateTotalPrice() {
    const total = sales.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
}

function renderProducts(productsToRender) {
    productsContainer.innerHTML = '';
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${product.name}</h4>
            <p>Categoría: ${product.category || 'Sin categoría'}</p>
            <p>$${product.price.toFixed(2)}</p>
            <button class="btn btn-primary add-to-sale-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Añadir</button>
        `;
        productsContainer.appendChild(productCard);
    });
}

function filterProducts() {
    const categoryId = categoryFilterSelect.value;
    const searchTerm = productSearchInput.value.toLowerCase();
    
    let filteredProducts = currentProducts;

    if (categoryId !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.categoryId === categoryId);
    }

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
    }
    
    renderProducts(filteredProducts);
}

// --- Eventos de Autenticación ---

auth.onAuthStateChanged(user => {
    if (user) {
        authContainer.style.display = 'none';
        mainContainer.style.display = 'flex';
        setupRealtimeListeners();
    } else {
        authContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(`Error de inicio de sesión: ${error.message}`));
});

logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// --- Listeners en Tiempo Real ---

function setupRealtimeListeners() {
    // Escucha de productos
    db.collection('productos').onSnapshot(snapshot => {
        currentProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterProducts();
    });

    // Escucha de caja abierta
    const today = new Date().toISOString().slice(0, 10);
    db.collection('cajas').doc(today).onSnapshot(doc => {
        if (doc.exists) {
            cajaAbierta = { id: doc.id, ...doc.data() };
            cajaStatusElement.innerHTML = `Estado de la Caja: <span class="badge text-bg-success">Caja abierta</span>`;
            cajaAbrirBtn.style.display = 'none';
            cajaCerrarBtn.style.display = 'inline-block';
            cajaDetails.style.display = 'block';
            cajaMontoInicialElement.textContent = `$${cajaAbierta.montoInicial.toFixed(2)}`;
            cajaIngresosElement.textContent = `$${cajaAbierta.totalVentas.toFixed(2)}`;
            cajaEgresosElement.textContent = `$${cajaAbierta.totalGastos.toFixed(2)}`;
            cajaTotalEfectivoElement.textContent = `$${cajaAbierta.efectivo.toFixed(2)}`;
            cajaTotalTarjetaElement.textContent = `$${cajaAbierta.tarjeta.toFixed(2)}`;
        } else {
            cajaAbierta = null;
            cajaStatusElement.innerHTML = `Estado de la Caja: <span class="badge text-bg-danger">Caja cerrada</span>`;
            cajaAbrirBtn.style.display = 'inline-block';
            cajaCerrarBtn.style.display = 'none';
            cajaDetails.style.display = 'none';
        }
    });

    // Escucha de categorías
    db.collection('categoriasDeProducto').onSnapshot(snapshot => {
        productCategorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';
        categoryFilterSelect.innerHTML = '<option value="all">Todas las categorías</option>';
        snapshot.docs.forEach(doc => {
            const category = { id: doc.id, ...doc.data() };
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            productCategorySelect.appendChild(option);
            
            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilterSelect.appendChild(filterOption);
        });
    });
}

// --- Funciones y Eventos de Vistas y Navegación ---

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(nav => nav.classList.remove('active'));
        link.classList.add('active');
        const viewId = link.getAttribute('href').substring(1) + '-view';
        showView(viewId);
    });
});

configTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        configTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const sectionId = tab.dataset.tab;
        const sections = configContent.querySelectorAll('.add-new-container');
        sections.forEach(s => {
            s.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    });
});

// --- Funciones de Productos ---

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = productNameInput.value;
    const price = parseFloat(productPriceInput.value);
    const categoryId = productCategorySelect.value;
    const categoryName = productCategorySelect.options[productCategorySelect.selectedIndex].text;

    db.collection('productos').add({
        name,
        price,
        categoryId,
        categoryName
    }).then(() => {
        productForm.reset();
        alert('Producto guardado con éxito!');
    }).catch(error => {
        console.error('Error al añadir producto:', error);
    });
});

// NUEVA FUNCIÓN PARA AÑADIR CATEGORÍA
addCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = categoryNameInput.value;
    db.collection('categoriasDeProducto').add({
        name
    }).then(() => {
        addCategoryForm.reset();
        alert('Categoría guardada con éxito!');
    }).catch(error => {
        console.error('Error al añadir categoría:', error);
    });
});

productSearchInput.addEventListener('input', filterProducts);
categoryFilterSelect.addEventListener('change', filterProducts);

// --- Funciones de Venta ---

productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-sale-btn')) {
        const productId = e.target.dataset.id;
        const productName = e.target.dataset.name;
        const productPrice = parseFloat(e.target.dataset.price);

        const existingItem = sales.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            sales.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        renderSalesList();
    }
});

function renderSalesList() {
    salesListContainer.innerHTML = '';
    sales.forEach((item, index) => {
        const saleItem = document.createElement('div');
        saleItem.className = 'sale-item';
        saleItem.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
            <div class="sale-item-controls">
                <button class="btn btn-sm btn-secondary decrease-btn" data-index="${index}">-</button>
                <button class="btn btn-sm btn-secondary increase-btn" data-index="${index}">+</button>
                <button class="btn btn-sm btn-danger remove-btn" data-index="${index}">x</button>
            </div>
        `;
        salesListContainer.appendChild(saleItem);
    });
    updateTotalPrice();
}

salesListContainer.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (e.target.classList.contains('increase-btn')) {
        sales[index].quantity += 1;
    } else if (e.target.classList.contains('decrease-btn')) {
        sales[index].quantity -= 1;
        if (sales[index].quantity <= 0) {
            sales.splice(index, 1);
        }
    } else if (e.target.classList.contains('remove-btn')) {
        sales.splice(index, 1);
    }
    renderSalesList();
});

checkoutBtn.addEventListener('click', () => {
    if (!cajaAbierta) {
        alert('Error: La caja está cerrada. No se pueden registrar ventas.');
        return;
    }

    if (sales.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    const totalVenta = sales.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const saleData = {
        items: sales,
        total: totalVenta,
        fecha: new Date(),
        cajaId: cajaAbierta.id,
        metodoPago: 'Efectivo', // O podría ser "Tarjeta", dependiendo de la lógica que implementes
        usuarioId: auth.currentUser.uid
    };

    db.collection('ventas').add(saleData)
        .then(() => {
            alert('Venta registrada con éxito!');
            const newTotal = cajaAbierta.totalVentas + totalVenta;
            const newEfectivo = cajaAbierta.efectivo + totalVenta;
            return db.collection('cajas').doc(cajaAbierta.id).update({
                totalVentas: newTotal,
                efectivo: newEfectivo
            });
        })
        .then(() => {
            sales = [];
            renderSalesList();
        })
        .catch(error => {
            console.error('Error al finalizar la venta:', error);
            alert('Ocurrió un error al registrar la venta.');
        });
});

// --- Funciones de Caja ---

cajaAbrirBtn.addEventListener('click', () => {
    const montoInicial = parseFloat(prompt('Ingrese el monto inicial de la caja:'));
    if (isNaN(montoInicial) || montoInicial < 0) {
        alert('Monto inválido. La caja no se ha abierto.');
        return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const cajaData = {
        montoInicial: montoInicial,
        efectivo: montoInicial,
        tarjeta: 0,
        totalVentas: 0,
        totalGastos: 0,
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
        estado: 'abierta'
    };

    db.collection('cajas').doc(today).set(cajaData)
        .then(() => {
            alert('Caja abierta con éxito!');
        })
        .catch(error => {
            console.error('Error al abrir la caja:', error);
        });
});

gastosBtn.addEventListener('click', () => {
    gastosFormContainer.style.display = gastosFormContainer.style.display === 'none' ? 'block' : 'none';
});

gastosForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cajaAbierta) {
        alert('No se puede registrar un gasto, la caja está cerrada.');
        return;
    }

    const monto = parseFloat(document.getElementById('gasto-monto').value);
    const descripcion = document.getElementById('gasto-descripcion').value;

    const gastoData = {
        monto,
        descripcion,
        cajaId: cajaAbierta.id,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('gastos').add(gastoData)
        .then(() => {
            alert('Gasto registrado con éxito!');
            const newTotalGastos = cajaAbierta.totalGastos + monto;
            const newEfectivo = cajaAbierta.efectivo - monto;
            return db.collection('cajas').doc(cajaAbierta.id).update({
                totalGastos: newTotalGastos,
                efectivo: newEfectivo
            });
        })
        .then(() => {
            gastosForm.reset();
            gastosFormContainer.style.display = 'none';
        })
        .catch(error => {
            console.error('Error al registrar el gasto:', error);
            alert('Ocurrió un error al registrar el gasto.');
        });
});
