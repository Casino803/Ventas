import { allSales } from './firestore.js';

let salesChart;
let topProductsChart;
let paymentMethodsChart;

export function renderSalesChart(sales) {
    const salesChartCtx = document.getElementById('salesChart')?.getContext('2d');
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

    if (salesChart) salesChart.destroy();
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
                y: { beginAtZero: true, title: { display: true, text: 'Ventas Totales ($)' } },
                x: { title: { display: true, text: 'Fecha' } }
            }
        }
    });
}

export function renderTopProductsChart(sales) {
    const topProductsChartCtx = document.getElementById('topProductsChart')?.getContext('2d');
    if (!topProductsChartCtx) return;

    const productSales = sales.flatMap(sale => sale.items).reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
    }, {});

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([, quantity]) => quantity);

    if (topProductsChart) topProductsChart.destroy();
    topProductsChart = new Chart(topProductsChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad Vendida',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
                x: { title: { display: true, text: 'Producto' } }
            }
        }
    });
}

export function renderPaymentMethodsChart(sales) {
    const paymentMethodsChartCtx = document.getElementById('paymentMethodsChart')?.getContext('2d');
    if (!paymentMethodsChartCtx) return;

    const paymentTotals = sales.reduce((acc, sale) => {
        sale.payments?.forEach(payment => {
            acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
        });
        return acc;
    }, {});

    const labels = Object.keys(paymentTotals);
    const data = Object.values(paymentTotals);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

    if (paymentMethodsChart) paymentMethodsChart.destroy();
    paymentMethodsChart = new Chart(paymentMethodsChartCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) label += `$${context.parsed.toFixed(2)}`;
                            return label;
                        }
                    }
                }
            }
        }
    });
}
