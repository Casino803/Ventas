// stock_registro.js

// stock_registro.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc, collection, getDocs, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ... (El resto del código sigue abajo)
// CONFIGURACIÓN DE FIREBASE (Tus datos)
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
const auth = getAuth(app); // Necesario para la autenticación
const db = getFirestore(app);

// Referencias de la UI
const statusDiv = document.getElementById('status');
const newProductStatusDiv = document.getElementById('new-product-status');
const stockForm = document.getElementById('stockForm');
const newProductForm = document.getElementById('new-product-form');
const stockItemsContainer = document.getElementById('stock-items-container');


// =======================================================
// === FUNCIÓN 1: CARGAR EL FORMULARIO DE INVENTARIO ===
// =======================================================

async function renderStockForm() {
    // Verificar que el contenedor existe
    if (!stockItemsContainer) return; 

    // Limpiar y mostrar mensaje de carga
    stockItemsContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Cargando inventario...</p>';
    
    // Crear la consulta ordenada por Categoría y Nombre
    const q = query(collection(db, 'inventario'), orderBy('Categoria'), orderBy('Nombre'));

    try {
        const querySnapshot = await getDocs(q);
        stockItemsContainer.innerHTML = ''; // Limpiar el mensaje de carga

        let currentCategory = null;
        let currentSectionDiv = null;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            const category = data.Categoria || 'Sin Categoría'; 

            // Crear una nueva sección (Acordeón) si la categoría cambia
            if (category !== currentCategory) {
                currentCategory = category;
                
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'p-4 bg-gray-50 rounded-lg border border-gray-200';
                sectionContainer.innerHTML = `
                    <h2 class="flex justify-between items-center text-xl font-bold text-gray-700 cursor-pointer" onclick="window.toggleSection('${category}-content')">
                        <span>• ${category}</span>
                        <i id="${category}-icon" class="fas fa-chevron-down text-gray-500"></i>
                    </h2>
                    <div id="${category}-content" class="mt-4 space-y-3 stock-section-content hidden">
                        </div>
                `;
                stockItemsContainer.appendChild(sectionContainer);

                currentSectionDiv = sectionContainer.querySelector('.stock-section-content');
                
                // Ocultar la sección por defecto
                currentSectionDiv.classList.add('hidden');
            }

            // Crear el input para el producto y pre-cargar el valor de stock
            const itemDiv = document.createElement('div');
            itemDiv.className = 'stock-item grid grid-cols-3 gap-4 items-center';
            itemDiv.innerHTML = `
                <label for="${id}" class="col-span-1 font-semibold text-gray-700">${data.Nombre}:</label>
                <input type="number" id="${id}" data-id="${id}" value="${data.CantidadActual !== undefined ? data.CantidadActual : ''}" step="any" placeholder="0.000"
                    class="col-span-1 px-3 py-2 border rounded-lg">
                <span class="text-gray-500 text-sm">${data.UnidadDeMedida || 'U'}</span>
            `;
            currentSectionDiv.appendChild(itemDiv);
        });

    } catch (error) {
        console.error("Error al cargar el formulario de stock:", error);
        // Si hay un error de permisos, mostramos una alerta clara al usuario
        if (error.code === 'permission-denied' || error.message.includes('permissions')) {
            stockItemsContainer.innerHTML = `<p class="p-4 error text-center text-red-700">❌ Error de Permisos: Debe iniciar sesión en el POS antes de acceder al inventario.</p>`;
        } else {
            stockItemsContainer.innerHTML = `<p class="p-4 error text-center text-red-700">Error al cargar el inventario: ${error.message}</p>`;
        }
    }
}


// =======================================================
// === FUNCIÓN 2: GUARDAR STOCK DIARIO (Histórico y Actual) ===
// =======================================================
async function guardarStockDiario(event) {
    event.preventDefault();
    
    // Obtener referencias de estado
    const currentStatusDiv = document.getElementById('status');
    if (currentStatusDiv) {
        currentStatusDiv.innerHTML = '<p class="text-blue-600 font-semibold">Guardando datos históricos y stock actual...</p>';
        currentStatusDiv.className = 'p-3 bg-blue-100 rounded-lg';
    }

    // 1. Inicializar la operación por lotes (Batch Write)
    const batch = writeBatch(db);
    const fechaHoraRegistro = new Date();
    
    // 2. Preparar el documento histórico
    const registroHistorico = {
        FechaHora: fechaHoraRegistro,
        Productos: {} // Aquí guardaremos un resumen de cada producto
    };

    // 3. Obtener inputs y preparar actualizaciones
    const stockInputs = document.querySelectorAll('#stock-items-container input[type="number"]');
    let productosContados = 0;

    stockInputs.forEach(input => {
        const idProducto = input.dataset.id;
        const cantidad = parseFloat(input.value); 
        
        if (idProducto && !isNaN(cantidad)) {
            productosContados++;
            
            // a) Tarea Batch 1: Actualizar la colección 'inventario' (stock actual)
            const inventarioDocRef = doc(db, 'inventario', idProducto);
            batch.set(inventarioDocRef, {
                CantidadActual: cantidad,
                FechaUltimoConteo: fechaHoraRegistro 
            }, { merge: true }); // Mantenemos el merge: true

            // b) Tarea Batch 2: Agregar este producto al registro histórico
            registroHistorico.Productos[idProducto] = {
                Cantidad: cantidad,
                Nombre: input.previousElementSibling.textContent.replace(':', '').trim() // Nombre del label
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

    // 4. Tarea Batch 3: Crear el registro histórico completo
    // Usamos la fecha y hora como ID del documento (formato ISO para fácil ordenación)
    const registroId = fechaHoraRegistro.toISOString().replace(/[:.]/g, '-');
    const historicoDocRef = doc(db, 'registros_diarios_stock', registroId);
    batch.set(historicoDocRef, registroHistorico);


    // 5. Ejecutar la operación por lotes
    try {
        await batch.commit(); // Esto ejecuta las dos actualizaciones (inventario y registros_diarios_stock)
        
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


// =======================================================
// === FUNCIÓN 3: AÑADIR NUEVA MATERIA PRIMA ===
// =======================================================
async function addNewMaterial(event) {
    event.preventDefault();
    
    // Verifica que el usuario esté logueado antes de escribir
    if (!auth.currentUser) {
        newProductStatusDiv.innerHTML = '❌ Error de Permisos: Debe iniciar sesión para agregar nuevos productos.';
        newProductStatusDiv.className = 'p-3 error rounded-lg';
        return;
    }

    const nombre = document.getElementById('new-product-name').value.trim();
    const unidad = document.getElementById('new-product-unit').value.trim().toUpperCase();
    const costo = parseFloat(document.getElementById('new-product-cost').value);
    const puntoPedido = parseFloat(document.getElementById('new-product-reorder').value) || 0;
    const categoria = document.getElementById('new-product-category').value.trim();
    
    const idMateriaPrima = nombre.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_{2,}/g, '_').slice(0, 20) + '_' + unidad.toUpperCase();

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
            CantidadActual: 0, 
            FechaCreacion: new Date()
        });

        newProductStatusDiv.innerHTML = `✅ Materia prima <strong>${nombre}</strong> creada con ID: <strong>${idMateriaPrima}</strong>`;
        newProductStatusDiv.className = 'p-3 success rounded-lg';
        newProductForm.reset();
        
        // Vuelve a renderizar el formulario para incluir el nuevo producto en la lista
        await renderStockForm();
        
    } catch (error) {
        console.error("Error al añadir materia prima:", error);
        newProductStatusDiv.innerHTML = `❌ Error al crear la materia prima: ${error.message}`;
        newProductStatusDiv.className = 'p-3 error rounded-lg';
    }
}


// =======================================================
// === LÓGICA DE INICIALIZACIÓN Y AUTHENTICACIÓN ===
// =======================================================

// Lógica para alternar las secciones (Acordeón)
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

// Inicializa la aplicación al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar listeners a los formularios
    if (stockForm) {
        stockForm.addEventListener('submit', guardarStockDiario);
    }
    if (newProductForm) {
        newProductForm.addEventListener('submit', addNewMaterial);
    }
    
    // 2. Ocultar el formulario de creación de productos por defecto
    const productFormContainer = document.getElementById('product-form-container');
    if(productFormContainer) productFormContainer.classList.add('hidden');

    // 3. Chequear el estado de autenticación antes de interactuar con Firestore
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario logueado: podemos cargar el inventario
            console.log("Usuario autenticado. Cargando inventario...");
            renderStockForm(); 
        } else {
            // Usuario NO logueado: mostrar mensaje de error
            console.log("Usuario no autenticado. Acceso denegado.");
            if (stockItemsContainer) {
                stockItemsContainer.innerHTML = `
                    <p class="p-6 error text-center text-xl font-bold">
                        <i class="fas fa-lock"></i> ACCESO DENEGADO
                    </p>
                    <p class="p-3 text-center text-gray-700">
                        Por favor, inicie sesión en el Punto de Venta (POS) para cargar el stock.
                    </p>
                    <div class="text-center mt-4">
                        <a href="index.html" class="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                            Ir a Iniciar Sesión
                        </a>
                    </div>
                `;
            }
        }
    });
});