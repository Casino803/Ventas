import { db } from './firebase.js';
import { addDoc, setDoc, deleteDoc, doc, collection, query, where, getDocs, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { showModal, renderCart, showConfirmationModal, showPage, addPaymentInput, printReceipt, renderCashStatus, renderPaymentStats } from './ui.js';
import { allProducts, allCombos, dailyCashData, SHARED_PRODUCTS_COLLECTION, SHARED_SALES_COLLECTION, SHARED_RESERVATIONS_COLLECTION, SHARED_CUSTOMERS_COLLECTION, SHARED_CASH_COLLECTION, SHARED_CASH_HISTORY_COLLECTION, SHARED_EXPENSES_COLLECTION, SHARED_PAYMENT_METHODS_COLLECTION, SHARED_EXPENSE_CATEGORIES_COLLECTION, SHARED_PRODUCT_CATEGORIES_COLLECTION, SHARED_COMBOS_COLLECTION, userPaymentMethods } from './firestore.js';

export let cart = [];
export let currentDiscountSurcharge = { value: 0, type: null };
export let isProcessingPayment = false;
export let currentReservationToProcess = null;

export function addProductToCart(product) {
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

export function addComboToCart(combo) {
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

export function removeProductFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

export function calculateTotal() {
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
    return { subtotal, total, adjustmentAmount };
}

export function updateRemainingAmount() {
    const paymentTotalDisplay = document.getElementById('payment-total-display');
    const paymentRemainingDisplay = document.getElementById('payment-remaining-display');
    const paymentInputsContainer = document.getElementById('payment-inputs-container');
    if (!paymentTotalDisplay || !paymentRemainingDisplay || !paymentInputsContainer) return;
    const total = parseFloat(paymentTotalDisplay.textContent.replace('$', ''));
    let sum = 0;
    paymentInputsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    const remaining = total - sum;
    paymentRemainingDisplay.textContent = `$${remaining.toFixed(2)}`;
    paymentRemainingDisplay.style.color = remaining < 0 ? '#ef4444' : '#f59e0b';
    if (remaining === 0) paymentRemainingDisplay.style.color = '#10b981';
}

export async function updateDailyTotals() {
    const cashStatsSection = document.getElementById('cash-stats');
    const currentCashDisplay = document.getElementById('current-cash-display');
    const statsTotalSales = document.getElementById('stats-total-sales');
    const statsSalesCount = document.getElementById('stats-sales-count');
    const statsTotalExpenses = document.getElementById('stats-total-expenses');
    const paymentStatsContainer = document.getElementById('payment-stats-container');
    if (!dailyCashData) {
        if(currentCashDisplay) currentCashDisplay.textContent = `$0.00`;
        if (cashStatsSection) cashStatsSection.classList.add('hidden');
        return;
    }
    if (cashStatsSection) cashStatsSection.classList.remove('hidden');
    const today = new Date().toLocaleDateString('en-CA');
    const salesQuery = query(collection(db, SHARED_SALES_COLLECTION), where("cashId", "==", today));
    const salesSnapshot = await getDocs(salesQuery);
    let salesCount = 0;
    let paymentMethodTotals = {};
    const allPaymentMethods = [...new Set(["Efectivo", "Transferencia MP", ...userPaymentMethods.map(m => m.name)])];
    allPaymentMethods.forEach(method => paymentMethodTotals[method] = 0);
    const dailySalesTotal = salesSnapshot.docs.reduce((sum, doc) => {
        const sale = doc.data();
        if (sale.total && !isNaN(sale.total)) {
            salesCount++;
            sale.payments?.forEach(payment => {
                if (paymentMethodTotals.hasOwnProperty(payment.method)) paymentMethodTotals[payment.method] += payment.amount;
            });
            return sum + sale.total;
        }
        return sum;
    }, 0);
    const expensesQuery = query(collection(db, SHARED_EXPENSES_COLLECTION), where("cashId", "==", today));
    const expensesSnapshot = await getDocs(expensesQuery);
    const dailyExpensesTotal = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    const currentCash = dailyCashData.abertura + paymentMethodTotals['Efectivo'] - dailyExpensesTotal;
    if (currentCashDisplay) currentCashDisplay.textContent = `$${currentCash.toFixed(2)}`;
    if (statsTotalSales) statsTotalSales.textContent = `$${dailySalesTotal.toFixed(2)}`;
    if (statsSalesCount) statsSalesCount.textContent = salesCount;
    if (statsTotalExpenses) statsTotalExpenses.textContent = `$${dailyExpensesTotal.toFixed(2)}`;
    renderPaymentStats(paymentMethodTotals);
    renderCashStatus();
}

export async function processPayment() {
    if (isProcessingPayment) return;
    isProcessingPayment = true;
    const processPaymentBtn = document.getElementById('process-payment-btn');
    if (processPaymentBtn) processPaymentBtn.disabled = true;

    const paymentInputsContainer = document.getElementById('payment-inputs-container');
    const customerSelect = document.getElementById('customer-select');
    const splitPaymentModal = document.getElementById('split-payment-modal');
    if (!paymentInputsContainer || !customerSelect || !splitPaymentModal) {
        console.error("Faltan elementos del DOM para procesar el pago.");
        isProcessingPayment = false;
        if (processPaymentBtn) processPaymentBtn.disabled = false;
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
            isProcessingPayment = false;
            if (processPaymentBtn) processPaymentBtn.disabled = false;
            return;
        }
        sum += amount;
        payments.push({ method, amount });
    }

    if (Math.abs(sum - total) > 0.01) {
        showModal("La suma de los pagos no coincide con el total.");
        isProcessingPayment = false;
        if (processPaymentBtn) processPaymentBtn.disabled = false;
        return;
    }
    const cashId = new Date().toLocaleDateString('en-CA');
    try {
        const productUpdates = cart.map(item => {
            if (item.stock !== undefined) {
                return updateDoc(doc(db, SHARED_PRODUCTS_COLLECTION, item.id), { stock: increment(-item.quantity) });
            }
        }).filter(Boolean);
        await Promise.all(productUpdates);
        const customerId = customerSelect.value;
        const customerName = customerSelect.options[customerSelect.selectedIndex].text;
        const saleData = {
            items: cart,
            subtotal,
            adjustment: { amount: adjustmentAmount, type: currentDiscountSurcharge.type },
            total,
            payments,
            customerId: customerId || null,
            customerName: customerName === 'Seleccionar Cliente' ? null : customerName,
            timestamp: serverTimestamp(),
            cashId
        };
        const newSaleRef = await addDoc(collection(db, SHARED_SALES_COLLECTION), saleData);

        if (currentReservationToProcess) {
            await deleteDoc(doc(db, SHARED_RESERVATIONS_COLLECTION, currentReservationToProcess.id));
            showModal("Pedido reservado facturado con éxito y eliminado de las reservaciones.");
        } else {
            showModal("Venta finalizada con éxito. El carrito se ha vaciado.");
        }

        if (confirm("¿Deseas imprimir el recibo de la venta?")) {
            printReceipt({
                id: newSaleRef.id,
                ...saleData,
                timestamp: new Date()
            });
        }
    } catch (error) {
        console.error("Error al finalizar la venta:", error);
        showModal("Hubo un error al registrar la venta. Por favor, intenta de nuevo.");
    } finally {
        cart.length = 0;
        currentDiscountSurcharge = { value: 0, type: null };
        currentReservationToProcess = null;
        renderCart();
        if (splitPaymentModal) splitPaymentModal.classList.add('hidden');
        if (customerSelect) customerSelect.value = "";
        isProcessingPayment = false;
        if (processPaymentBtn) processPaymentBtn.disabled = false;
    }
}

export async function reserveOrder() {
    const customerSelect = document.getElementById('customer-select');
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
    const { subtotal, total, adjustmentAmount } = calculateTotal();
    try {
        await addDoc(collection(db, SHARED_RESERVATIONS_COLLECTION), {
            items: cart,
            subtotal,
            adjustment: { amount: adjustmentAmount, type: currentDiscountSurcharge.type },
            total,
            customerId,
            customerName,
            timestamp: serverTimestamp()
        });
        cart.length = 0;
        currentDiscountSurcharge = { value: 0, type: null };
        renderCart();
        customerSelect.value = "";
        showModal("Pedido reservado con éxito.");
    } catch (error) {
        console.error("Error al reservar el pedido:", error);
        showModal("Hubo un error al reservar el pedido. Intenta de nuevo.");
    }
}

export async function deleteReservedOrder(reservationId) {
    showConfirmationModal(`¿Estás seguro de que quieres eliminar esta reservación? Esta acción no se puede deshacer.`, async () => {
        try {
            await deleteDoc(doc(db, SHARED_RESERVATIONS_COLLECTION, reservationId));
            showModal("Reservación eliminada con éxito.");
        } catch (error) {
            console.error("Error al eliminar la reservación:", error);
            showModal("Hubo un error al eliminar la reservación. Intenta de nuevo.");
        }
    }, () => {});
}

export async function processImportedSales(csvData) {
    const rows = csvData.split('\n').filter(row => row.trim() !== '');
    if (rows.length < 2) {
        showModal("El archivo CSV debe contener al menos una fila de datos después del encabezado.");
        return;
    }
    let importedCount = 0;
    const errors = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',').map(cell => cell.trim());
        if (row.length !== 3) {
            errors.push(`Fila ${i + 1}: Formato de fila incorrecto.`);
            continue;
        }
        const [dateString, totalStr, paymentMethod] = row;
        const total = parseFloat(totalStr);
        if (isNaN(total) || total <= 0) {
            errors.push(`Fila ${i + 1}: El total no es un número válido.`);
            continue;
        }
        try {
            await addDoc(collection(db, SHARED_SALES_COLLECTION), {
                items: [],
                total,
                payments: [{ method: paymentMethod, amount: total }],
                timestamp: new Date(dateString)
            });
            importedCount++;
        } catch (error) {
            errors.push(`Fila ${i + 1}: Error al guardar en la base de datos.`);
        }
    }
    let message = `Importación completada. Se importaron ${importedCount} ventas.`;
    if (errors.length > 0) message += ` Hubo ${errors.length} errores:\n${errors.join('\n')}`;
    showModal(message);
}

export function exportSalesToCsv(sales) {
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
