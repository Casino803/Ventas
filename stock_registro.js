// stock_registro.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// Importamos serverTimestamp directamente de la librería de firestore
import { getFirestore, setDoc, doc, collection, getDocs, query, orderBy, writeBatch, deleteDoc, getDoc, FieldValue, serverTimestamp as firestoreServerTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDaeiHDKjK_DkdYNF9FvL8aMGINPGvU9uc",
    authDomain: "ventas-casino.firebaseapp.com",
    projectId: "ventas-casino",
    storageBucket: "ventas-casino.firebasestorage.app",
    messagingSenderId: "683247450522",
    appId: "1:683247450522:web:87a57e190d2c252d0a6223"
};

// Inicializar Firebase y servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables Globales para el CACHE y gestión
let inventoryCache = []; 
let inventoryElements = {};

// Referencias de la UI
const statusDiv = document.getElementById('status');
const newProductStatusDiv = document.getElementById('new-product-status');
const stockForm = document.getElementById('stockForm');
const newProductForm = document.getElementById('new-product-form');
const stockItemsContainer = document.getElementById('stock-items-container');
const productFormContainer = document.getElementById('product-form-container'); 
const toggleNewProductBtn = document.getElementById('toggle-new-product-form-btn');
const inventorySearchInput = document.getElementById('inventory-search');


// =======================================================
// === FUNCIÓN GLOBAL: TOGGLE SECTION (FIX para HTML) ===
// =======================================================
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    const icon = document.getElementById(sectionId.replace('-content', '-icon'));
    
    if (section) {
        section.classList.toggle('hidden');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
}


// =======================================================
// === LÓGICA DE NEGOCIO Y CRUD ===
// =======================================================

// --- FUNCIÓN DE FILTRADO DINÁMICO ---
function filterInventory() {
    const searchTerm = inventorySearchInput.value.toLowerCase().trim();
    let totalVisibleItems = 0;

    for (const categoryId in inventoryElements) {
        const sectionContainer = inventoryElements[categoryId].container;
        const itemsWrapper = inventoryElements[categoryId].wrapper;
        const categoryHeader = inventoryElements[categoryId].header;
        
        let visibleItemsInCategory = 0;

        Array.from(itemsWrapper.children).forEach(itemElement => {
            const itemName = itemElement.querySelector('.font-semibold').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || searchTerm === '') {
                itemElement.classList.remove('hidden');
                visibleItemsInCategory++;
                totalVisibleItems++;
            } else {
                itemElement.classList.add('hidden');
            }
        });

        // Ocultar la sección si no hay items coincidentes
        sectionContainer.classList.toggle('hidden', visibleItemsInCategory === 0 && searchTerm.length > 0);

        // Forzar apertura de la categoría si hay búsqueda
        if (searchTerm.length > 0) {
            itemsWrapper.classList.remove('hidden');
            const icon = categoryHeader.querySelector('i');
            if (icon) {
                 icon.classList.remove('fa-chevron-down');
                 icon.classList.add('fa-chevron-up');
            }
        } else if (visibleItemsInCategory > 0) {
             // Si la búsqueda está vacía, volvemos al estado inicial (cerrado por defecto)
             itemsWrapper.classList.add('hidden');
             const icon = categoryHeader.querySelector('i');
             if (icon) {
                icon.classList.add('fa-chevron-down');
                icon.classList.remove('fa-chevron-up');
            }
        }
    }

    if (totalVisibleItems === 0 && searchTerm.length > 0) {
        // Mostrar mensaje de "No encontrado" si no hay coincidencias
        stockItemsContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No se encontraron productos que coincidan con "${searchTerm}".</p>`;
    }
}


// --- FUNCIÓN: ELIMINAR MATERIA PRIMA ---
async function handleDeleteClick(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;

    if (!confirm(`⚠️ ¿Estás seguro de eliminar PERMANENTEMENTE el producto ${name} (${id})? Esto no se puede deshacer y afectará a las recetas.`)) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'inventario', id));
        
        newProductStatusDiv.innerHTML = `✅ Producto **${name}** eliminado exitosamente.`;
        newProductStatusDiv.className = 'p-3 success rounded-lg';
        
        await renderStockForm();
        
    } catch (error) {
        console.error("Error al eliminar materia prima:", error);
        newProductStatusDiv.innerHTML = `❌ Error al eliminar materia prima: ${error.message}`;
        newProductStatusDiv.className = 'p-3 error rounded-lg';
    }
}


// --- FUNCIÓN: MANEJAR CLIC EN EL BOTÓN EDITAR ---
async function handleEditClick(event) {
    const id = event.currentTarget.dataset.id;
    
    productFormContainer.classList.remove('hidden');
    toggleNewProductBtn.scrollIntoView({ behavior: 'smooth' });

    try {
        const docRef = doc(db, 'inventario', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('new-product-name').value = data.Nombre || '';
            document.getElementById('new-product-unit').value = data.UnidadDeMedida || '';
            document.getElementById('new-product-cost').value = data.CostoUnitario || 0;
            document.getElementById('new-product-reorder').value = data.PuntoDePedido || 0;
            document.getElementById('new-product-category').value = data.Categoria || 'Otros';
            
            document.getElementById('new-product-form').dataset.editingId = id;

            document.querySelector('#new-product-form button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';

        } else {
            newProductStatusDiv.innerHTML = '❌ Documento no encontrado.';
            newProductStatusDiv.className = 'p-3 error rounded-lg';
        }

    } catch (error) {
        console.error("Error al cargar datos para edición:", error);
        newProductStatusDiv.innerHTML = `❌ Error al cargar datos para edición: ${error.message}`;
        newProductStatusDiv.className = 'p-3 error rounded-lg';
    }
}


// --- FUNCIÓN: AÑADIR/EDITAR NUEVA MATERIA PRIMA ---
async function addNewMaterial(event) {
    event.preventDefault();
    
    const form = document.getElementById('new-product-form');
    const editingId = form.dataset.editingId; 

    const nombre = document.getElementById('new-product-name').value.trim();
    const unidad = document.getElementById('new-product-unit').value.trim().toUpperCase();
    const costo = parseFloat(document.getElementById('new-product-cost').value);
    const puntoPedido = parseFloat(document.getElementById('new-product-reorder').value) || 0;
    const categoria = document.getElementById('new-product-category').value.trim();
    
    let idMateriaPrima;
    if (editingId) {
        idMateriaPrima = editingId;
    } else {
        idMateriaPrima = nombre.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_{2,}/g, '_').slice(0, 20) + '_' + unidad.toUpperCase();
    }

    if (!nombre || !unidad || isNaN(costo)) {
        newProductStatusDiv.innerHTML = '⚠️ Por favor, complete Nombre, Unidad de Medida y Costo.';
        newProductStatusDiv.className = 'p-3 error rounded-lg';
        return;
    }

    try {
        await setDoc(doc(db, 'inventario', idMateriaPrima), {
            Nombre: nombre,
            UnidadDeMedida: unidad,
            CostoUnitario: costo,
            PuntoDePedido: puntoPedido,
            Categoria: categoria,
            // Usamos firestoreServerTimestamp que ya está importado
            ...(editingId ? {} : { CantidadActual: 0, FechaCreacion: firestoreServerTimestamp() }) 
        }, { merge: true });

        // Limpieza de UI
        newProductStatusDiv.innerHTML = `✅ Producto **${nombre}** ${editingId ? 'editado' : 'creado'} exitosamente.`;
        newProductStatusDiv.className = 'p-3 success rounded-lg';
        
        form.reset();
        form.removeAttribute('data-editing-id');
        document.querySelector('#new-product-form button[type="submit"]').innerHTML = '<i class="fas fa-database"></i> Crear y Guardar Base de Materia Prima';

        await renderStockForm();
        
    } catch (error) {
        console.error("Error al añadir/editar materia prima:", error);
        newProductStatusDiv.innerHTML = `❌ Error al guardar: ${error.message}`;
        newProductStatusDiv.className = 'p-3 error rounded-lg';
    }
}


// --- FUNCIÓN: GUARDAR STOCK DIARIO (Histórico y Actual) ---
async function guardarStockDiario(event) {
    event.preventDefault();
    
    const currentStatusDiv = document.getElementById('status');
    if (currentStatusDiv) {
        currentStatusDiv.innerHTML = '<p class="text-blue-600 font-semibold">Guardando datos históricos y stock actual...</p>';
        currentStatusDiv.className = 'p-3 bg-blue-100 rounded-lg';
    }

    const batch = writeBatch(db);
    const fechaHoraRegistro = new Date();
    
    const registroHistorico = {
        FechaHora: fechaHoraRegistro,
        Productos: {} 
    };

    const stockInputs = document.querySelectorAll('#stock-items-container input[type="number"]');
    let productosContados = 0;

    stockInputs.forEach(input => {
        const idProducto = input.dataset.id;
        const cantidad = parseFloat(input.value); 
        
        if (idProducto && !isNaN(cantidad) && !input.closest('.stock-item').classList.contains('hidden')) {
            productosContados++;
            
            // Tarea Batch 1: Actualizar la colección 'inventario'
            const inventarioDocRef = doc(db, 'inventario', idProducto);
            batch.set(inventarioDocRef, {
                CantidadActual: cantidad,
                FechaUltimoConteo: fechaHoraRegistro 
            }, { merge: true });

            // Tarea Batch 2: Preparar el registro histórico
            const itemDiv = input.closest('.stock-item');
            const nombre = itemDiv.querySelector('.font-semibold').textContent;
            const unidad = itemDiv.querySelector('.col-span-1:nth-child(3)').textContent.trim();

            registroHistorico.Productos[idProducto] = {
                Cantidad: cantidad,
                Nombre: nombre.trim(),
                Unidad: unidad
            };
        }
    });
    
    if (productosContados === 0) {
        if (currentStatusDiv) {
            currentStatusDiv.innerHTML = '⚠️ No hay productos válidos para guardar.';
            currentStatusDiv.className = 'p-3 error rounded-lg';
        }
        return;
    }

    // Tarea Batch 3: Crear el registro histórico
    const registroId = fechaHoraRegistro.toISOString().replace(/[:.]/g, '-');
    const historicoDocRef = doc(db, 'registros_diarios_stock', registroId);
    batch.set(historicoDocRef, registroHistorico);


    try {
        await batch.commit();
        
        if (currentStatusDiv) {
            const hora = fechaHoraRegistro.toLocaleTimeString('es-CL');
            currentStatusDiv.innerHTML = `✅ Stock y Registro Histórico guardado exitosamente a las ${hora}! <i class="fas fa-check-circle"></i>`;
            currentStatusDiv.classList.remove('bg-blue-100');
            currentStatusDiv.className = 'p-3 success rounded-lg';
        }
    } catch (error) {
        console.error("Error al guardar el stock histórico:", error);
        if (currentStatusDiv) {
             currentStatusDiv.innerHTML = `❌ Error al guardar. Verifique su sesión. Mensaje: ${error.message}`;
            currentStatusDiv.classList.remove('bg-blue-100');
            currentStatusDiv.className = 'p-3 error rounded-lg';
        }
    }
}


// --- FUNCIÓN: CARGAR Y RENDERIZAR EL INVENTARIO ---
async function renderStockForm(cachedData = null) {
    if (!stockItemsContainer) return; 

    if (!cachedData) {
        stockItemsContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Cargando inventario...</p>';
    }
    
    let products = cachedData;
    
    if (!products) {
        try {
            const q = query(collection(db, 'inventario'), orderBy('Categoria'), orderBy('Nombre'));
            const querySnapshot = await getDocs(q);
            products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            inventoryCache = products; // Llenamos el cache global
        } catch (error) {
            stockItemsContainer.innerHTML = `<p class="p-4 error text-center text-red-700">❌ Error de Permisos: Debe iniciar sesión en el POS antes de acceder al inventario.</p>`;
            return;
        }
    }
    
    stockItemsContainer.innerHTML = '';
    inventoryElements = {};
    
    let currentCategory = null;

    products.forEach((data) => {
        const id = data.id;
        const category = data.Categoria || 'Sin Categoría'; 

        if (category !== currentCategory) {
            currentCategory = category;
            
            const categoryId = category.replace(/\s+/g, '-');
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'p-4 bg-gray-50 rounded-lg border border-gray-200';
            
            const headerHTML = `
                <h2 class="flex justify-between items-center text-xl font-bold text-gray-700 cursor-pointer" onclick="window.toggleSection('${categoryId}-content')" id="${categoryId}-header">
                    <span>• ${category}</span>
                    <i id="${categoryId}-icon" class="fas fa-chevron-down text-gray-500"></i>
                </h2>
                <div id="${categoryId}-content" class="mt-4 space-y-3 stock-section-content hidden">
                    </div>
            `;
            sectionContainer.innerHTML = headerHTML;
            stockItemsContainer.appendChild(sectionContainer);

            let currentSectionDiv = sectionContainer.querySelector('.stock-section-content');
            
            inventoryElements[categoryId] = {
                container: sectionContainer,
                wrapper: currentSectionDiv,
                header: sectionContainer.querySelector('h2')
            };
        }
        
        let currentSectionDiv = inventoryElements[category.replace(/\s+/g, '-')].wrapper;

        // Crear el elemento del producto (ítem)
        const itemDiv = document.createElement('div');
        itemDiv.className = 'stock-item grid grid-cols-4 gap-4 items-center border-b border-gray-100 pb-2'; 
        
        const nameCell = `
            <div class="col-span-1 flex flex-col">
                <span class="font-semibold text-gray-700">${data.Nombre}</span>
                <div class="mt-1 space-x-1">
                    <button type="button" data-id="${id}" 
                        class="edit-btn text-xs text-blue-600 hover:text-blue-800" 
                        title="Editar Metadata (Costo, PP, UM)">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" data-id="${id}" data-name="${data.Nombre}"
                        class="delete-btn text-xs text-red-600 hover:text-red-800" 
                        title="Eliminar permanentemente del inventario">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        const inputCell = `
            <div class="col-span-1">
                <input type="number" id="${id}" data-id="${id}" 
                    value="${data.CantidadActual !== undefined ? data.CantidadActual : ''}" 
                    step="any" placeholder="0.000"
                    class="w-full px-3 py-2 border rounded-lg text-center">
            </div>
        `;
        
        const unitCell = `<span class="col-span-1 text-gray-500 text-sm">${data.UnidadDeMedida || 'U'}</span>`;
        
        const infoCell = `<span class="col-span-1 text-gray-500 text-xs">PP: ${data.PuntoDePedido || 0}</span>`;
        
        itemDiv.innerHTML = nameCell + inputCell + unitCell + infoCell;
        currentSectionDiv.appendChild(itemDiv);
    });
    
    // 4. Añadir listeners a los botones recién creados
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
    });
    
    // 5. Si el buscador tiene texto, filtrar inmediatamente al cargar
    if (inventorySearchInput && inventorySearchInput.value.trim().length > 0) {
        filterInventory();
    }
}


// =======================================================
// === INICIALIZACIÓN Y LISTENERS ===
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar listeners a los formularios
    if (stockForm) {
        stockForm.addEventListener('submit', guardarStockDiario);
    }
    if (newProductForm) {
        newProductForm.addEventListener('submit', addNewMaterial);
    }
    
    // 2. Listener para el buscador
    if (inventorySearchInput) {
        inventorySearchInput.addEventListener('input', filterInventory);
    }
    
    // 3. Ocultar el formulario de creación de productos por defecto
    if(productFormContainer) productFormContainer.classList.add('hidden');

    // 4. Chequear el estado de autenticación (CRÍTICO)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            renderStockForm(); // Inicia la carga de Firebase y llena el cache
        } else {
            if (stockItemsContainer) {
                stockItemsContainer.innerHTML = `
                    <p class="p-6 error text-center text-xl font-bold">
                        <i class="fas fa-lock"></i> ACCESO DENEGADO
                    </p>
                    <p class="p-3 text-center text-gray-700">
                        Por favor, inicie sesión en el POS para cargar el stock.
                    </p>
                `;
            }
        }
    });
});