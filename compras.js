// compras.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, where, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias de la UI
const alertsContainer = document.getElementById('reorder-alerts-container');
const consumptionContainer = document.getElementById('consumption-report-container');
const calculateBtn = document.getElementById('calculate-consumption-btn');
const daysToAnalyzeInput = document.getElementById('days-to-analyze');
const daysToStockInput = document.getElementById('days-to-stock');
const reorderStatus = document.getElementById('reorder-status');
const consumptionStatus = document.getElementById('consumption-status');


// =======================================================
// === FUNCIÓN 1: ALERTAS DE PUNTO DE PEDIDO (Más fácil) ===
// =======================================================

async function generateReorderAlerts() {
    reorderStatus.innerHTML = '';
    alertsContainer.innerHTML = '<p class="text-gray-500 text-center">Cargando datos de inventario...</p>';

    try {
        const q = query(collection(db, 'inventario'));
        const snapshot = await getDocs(q);
        let alertsCount = 0;
        let html = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            
            const stockActual = data.CantidadActual || 0;
            const puntoPedido = data.PuntoDePedido || 0;
            const um = data.UnidadDeMedida || 'U';

            // Comprobar si está por debajo del punto de pedido
            if (stockActual <= puntoPedido && stockActual > 0) {
                alertsCount++;
                html += `
                    <div class="p-3 bg-yellow-100 border border-yellow-400 rounded-lg flex justify-between items-center">
                        <span class="font-semibold text-yellow-800">${data.Nombre} (${data.Categoria})</span>
                        <span class="text-lg text-yellow-800">STOCK: ${stockActual.toFixed(3)} ${um} (Alerta en ${puntoPedido} ${um})</span>
                    </div>
                `;
            }
            // Comprobar si el stock es CERO
            else if (stockActual === 0) {
                alertsCount++;
                html += `
                    <div class="p-3 bg-red-100 border border-red-400 rounded-lg flex justify-between items-center">
                        <span class="font-bold text-red-800">${data.Nombre} (${data.Categoria})</span>
                        <span class="text-lg text-red-800">¡AGOTADO!</span>
                    </div>
                `;
            }
        });

        if (alertsCount > 0) {
            alertsContainer.innerHTML = html;
            reorderStatus.innerHTML = `<p class="font-bold text-red-600">Total de ${alertsCount} productos en estado crítico/alerta.</p>`;
        } else {
            alertsContainer.innerHTML = '<p class="text-green-600 font-semibold text-center p-4">¡Excelente! Ningún producto está por debajo de su punto de pedido.</p>';
        }

    } catch (error) {
        console.error("Error al generar alertas:", error);
        alertsContainer.innerHTML = '<p class="p-4 error text-center text-red-700">Error al cargar datos. Verifique su conexión y sesión.</p>';
    }
}


// =======================================================
// === FUNCIÓN 2: CÁLCULO DE CONSUMO HISTÓRICO (Complejo) ===
// =======================================================

async function calculateConsumption() {
    consumptionStatus.innerHTML = '';
    consumptionContainer.innerHTML = '<p class="text-gray-500 text-center">Calculando consumo y proyectando...</p>';

    const daysToAnalyze = parseInt(daysToAnalyzeInput.value);
    const daysToStock = parseInt(daysToStockInput.value);

    if (isNaN(daysToAnalyze) || daysToAnalyze < 1 || isNaN(daysToStock) || daysToStock < 1) {
        consumptionStatus.innerHTML = '<p class="p-2 error">Por favor, ingrese un número de días válido.</p>';
        return;
    }
    
    // Obtener la fecha de inicio para la consulta (ej. hace 7 días)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToAnalyze);
    const startDateISO = startDate.toISOString().replace(/[:.]/g, '-');


    try {
        // 1. Obtener el stock actual de referencia (para el cálculo de compra)
        const inventarioSnapshot = await getDocs(query(collection(db, 'inventario')));
        const inventarioActual = {};
        inventarioSnapshot.forEach(doc => {
            inventarioActual[doc.id] = doc.data();
        });
        
        // 2. Obtener el registro histórico
        // Buscamos el registro de stock más antiguo dentro del rango a analizar
        // IMPORTANTE: Esto requiere el índice que creaste/crearás en la colección 'registros_diarios_stock'.
        const historicoQ = query(
            collection(db, 'registros_diarios_stock'), 
            orderBy('FechaHora', 'asc'), // Ordenar de más antiguo a más nuevo
            // Opcional: Si el nombre del documento es el ISO string, podemos usar where
            // where(documentId(), '>=', startDateISO) 
            limit(1) // Solo necesitamos el registro más antiguo dentro del rango
        );
        const historicoSnapshot = await getDocs(historicoQ);
        
        if (historicoSnapshot.empty) {
            consumptionContainer.innerHTML = `<p class="p-4 error text-red-700">No se encontraron registros de stock históricos para analizar. Realice al menos 2 cargas diarias.</p>`;
            return;
        }

        // Simplificamos: Usaremos solo el registro de stock más antiguo encontrado para comparar con el actual.
        const registroAntiguo = historicoSnapshot.docs[0].data();
        const diasTranscurridos = (new Date() - registroAntiguo.FechaHora.toDate()) / (1000 * 60 * 60 * 24); // Diferencia en días

        const consumoSemanal = {}; // Diccionario para guardar el consumo
        let reportHTML = `<table class="min-w-full divide-y divide-gray-200 shadow overflow-hidden sm:rounded-lg">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario Prom.</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faltante Sugerido (${daysToStock} Días)</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">`;

        // Iterar sobre el registro de stock más antiguo
        for (const id in registroAntiguo.Productos) {
            const stockInicial = registroAntiguo.Productos[id].Cantidad;
            const stockActualData = inventarioActual[id];

            if (stockActualData) {
                const stockFinal = stockActualData.CantidadActual || 0;
                const um = stockActualData.UnidadDeMedida || 'U';

                // Consumo = (Stock Inicial - Stock Final) / Días Transcurridos
                const consumoTotal = stockInicial - stockFinal;
                const consumoDiario = consumoTotal > 0 ? (consumoTotal / diasTranscurridos) : 0;
                
                // Demanda de Stock = Consumo Diario * Días Deseados
                const demandaDeseada = consumoDiario * daysToStock;
                
                // Cantidad a Comprar = Demanda Deseada - Stock Actual
                let aComprar = demandaDeseada - stockFinal;
                aComprar = aComprar > 0 ? aComprar : 0; // Solo comprar si es un valor positivo

                const isCritical = aComprar > 0;
                const rowClass = isCritical ? 'bg-red-50' : 'bg-green-50';

                reportHTML += `
                    <tr class="${rowClass}">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${stockActualData.Nombre}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${consumoDiario.toFixed(3)} ${um}/día</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm ${isCritical ? 'text-red-700 font-bold' : 'text-gray-500'}">${stockFinal.toFixed(3)} ${um}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold ${isCritical ? 'text-red-900' : 'text-green-700'}">
                            ${aComprar.toFixed(3)} ${um}
                        </td>
                    </tr>
                `;
            }
        }

        reportHTML += `</tbody></table>`;
        consumptionContainer.innerHTML = reportHTML;
        consumptionStatus.innerHTML = `<p class="font-bold text-blue-600">Análisis basado en el stock de hace ${diasTranscurridos.toFixed(1)} días.</p>`;

    } catch (error) {
        console.error("Error al calcular consumo:", error);
        consumptionContainer.innerHTML = `<p class="p-4 error text-center text-red-700">Error en el cálculo. Asegúrese de que el índice en 'registros_diarios_stock' esté listo.</p>`;
    }
}


// =======================================================
// === INICIALIZACIÓN Y AUTHENTICACIÓN ===
// =======================================================

function initApp() {
    // 1. Asignar listener para el cálculo de consumo
    calculateBtn.addEventListener('click', calculateConsumption);
    
    // 2. Ejecutar la primera carga de alertas
    generateReorderAlerts();
    
    // 3. Ejecutar el cálculo de consumo inicial
    calculateConsumption(); 
}

// Chequear el estado de autenticación antes de interactuar con Firestore
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Usuario autenticado. Cargando reportes...");
            initApp(); 
        } else {
            console.log("Usuario no autenticado. Acceso denegado.");
            alertsContainer.innerHTML = `
                <p class="p-6 error text-center text-xl font-bold">
                    <i class="fas fa-lock"></i> ACCESO DENEGADO
                </p>
                <p class="p-3 text-center text-gray-700">
                    Por favor, inicie sesión en el POS para ver los reportes.
                </p>
            `;
            consumptionContainer.innerHTML = alertsContainer.innerHTML; // Duplicar el mensaje de error
        }
    });
});