let reportesChart;
let intervaloRefresco;

function inicializarGrafica() {
    const ctx = document.getElementById('reportesChart').getContext('2d');
    reportesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Reportes por categoría',
                data: [],
                backgroundColor: [
                    'rgba(28, 161, 193, 0.8)',
                    'rgba(247, 184, 1, 0.8)',
                    'rgba(89, 108, 255, 0.8)',
                    'rgba(77, 215, 167, 0.8)',
                    'rgba(160, 221, 159, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(28, 161, 193, 1)',
                    'rgba(247, 184, 1, 1)',
                    'rgba(89, 108, 255, 1)',
                    'rgba(77, 215, 167, 1)',
                    'rgba(160, 221, 159, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function cargarDatos() {
    try {
        const [resumenRes, resueltosRes, graficaRes] = await Promise.all([
            fetch('http://107.22.248.129:7001/reportes/estadisticas/resumen'),
            fetch('http://107.22.248.129:7001/reportes/resueltos/total'),
            fetch('http://107.22.248.129:7001/estadisticas/por-tipo') // ✅ nuevo endpoint
        ]);

        if (!resumenRes.ok) throw new Error('Fallo al obtener resumen');
        if (!resueltosRes.ok) throw new Error('Fallo al obtener resueltos');
        if (!graficaRes.ok) throw new Error('Fallo al obtener datos de gráfica');

        const resumen = await resumenRes.json();
        const resueltos = await resueltosRes.json();
        const datosGrafica = await graficaRes.json();

        const categorias = datosGrafica.map(item => item.tipo);
        const cantidades = datosGrafica.map(item => item.cantidad);

        reportesChart.data.labels = categorias;
        reportesChart.data.datasets[0].data = cantidades;
        reportesChart.update();

        document.getElementById('btn-descargar-reporte').onclick = function () {
            generarPDF(resumen, resueltos, categorias, cantidades);
        };

    } catch (error) {
        console.error('Error al cargar datos:', error.message);
        alert(`Ocurrió un error al cargar los datos: ${error.message}`);
    }
}

function iniciarAutoRefresco() {
    intervaloRefresco = setInterval(cargarDatos, 600000); // 10 minutos
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarGrafica();
    cargarDatos();
    iniciarAutoRefresco();
});

window.addEventListener('beforeunload', () => {
    clearInterval(intervaloRefresco);
});

async function generarPDF(resumen, resueltos, categorias, cantidades) {
    try {
        if (!window.jspdf) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        if (!window.html2canvas) {
            await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;

        const styles = {
            title: { size: 16, color: [28, 161, 193], align: 'center' },
            subtitle: { size: 14, color: [28, 161, 193] },
            body: { size: 12, color: [0, 0, 0] },
            tableHeader: { size: 10, color: [255, 255, 255], fill: [28, 161, 193] },
            evenRow: { fill: [240, 248, 255] },
            oddRow: { fill: [255, 255, 255] }
        };

        const formatData = (data) => {
            if (data === undefined || data === null) return 'N/A';
            if (typeof data === 'object') {
                if (data.tipo || data.cantidad) return '';
                return Object.values(data).filter(val => val !== undefined).join(', ');
            }
            return data.toString();
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(styles.title.size);
        doc.setTextColor(...styles.title.color);
        doc.text('Reporte Estadístico de Reportes', pageWidth / 2, 20, styles.title);
        doc.setFont('helvetica', 'normal');

        let y = 35;
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('Resumen General', margin, y);
        y += 10;

        doc.setFontSize(styles.body.size);
        doc.setTextColor(...styles.body.color);

        const filteredResumen = {
            'Total Reportes (activos)': resumen.totalReportes || resumen.total,
            'Reportes Resueltos': resumen.reportesResueltos || resumen.resueltos,
            'Promedio Horas Resolución': resumen.promedioHorasResolucion
        };

        for (const [key, value] of Object.entries(filteredResumen)) {
            const formattedValue = formatData(value);
            if (formattedValue && formattedValue !== 'N/A') {
                doc.text(`${key}: ${formattedValue}`, margin + 2, y);
                y += 8;
                if (y > 260) {
                    doc.addPage();
                    y = 20;
                }
            }
        }

        y += 10;
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('Distribución de Reportes (reportes inactivos y activos)', margin, y);
        y += 10;

        doc.setFontSize(styles.tableHeader.size);
        const col1Width = maxWidth - 40;
        const col2Width = 30;

        doc.setFillColor(...styles.tableHeader.fill);
        doc.rect(margin, y, col1Width + col2Width, 8, 'F');
        doc.setTextColor(...styles.tableHeader.color);
        doc.text('Categoría/Tipo', margin + 2, y + 6);
        doc.text('Cantidad', margin + col1Width + 2, y + 6, { align: 'right' });

        y += 8;
        doc.setFontSize(styles.body.size);

        categorias.forEach((cat, i) => {
            if (y > 260) {
                doc.addPage();
                y = 20;
                doc.setFontSize(styles.tableHeader.size);
                doc.setFillColor(...styles.tableHeader.fill);
                doc.rect(margin, y, col1Width + col2Width, 8, 'F');
                doc.setTextColor(...styles.tableHeader.color);
                doc.text('Categoría/Tipo', margin + 2, y + 6);
                doc.text('Cantidad', margin + col1Width + 2, y + 6, { align: 'right' });
                y += 8;
                doc.setFontSize(styles.body.size);
            }

            const rowStyle = i % 2 === 0 ? styles.evenRow : styles.oddRow;
            doc.setFillColor(...rowStyle.fill);
            doc.rect(margin, y, col1Width + col2Width, 8, 'F');

            doc.setTextColor(...styles.body.color);

            const maxTextWidth = col1Width - 4;
            const lines = doc.splitTextToSize(cat, maxTextWidth);

            doc.text(lines[0], margin + 2, y + 6);

            if (lines.length > 1) {
                for (let j = 1; j < lines.length; j++) {
                    y += 6;
                    doc.setFillColor(...rowStyle.fill);
                    doc.rect(margin, y, col1Width + col2Width, 8, 'F');
                    doc.text(lines[j], margin + 2, y + 6);
                }
            }

            doc.text(cantidades[i].toString(), margin + col1Width + 2, y + 6, { align: 'right' });
            y += 8;
        });

        doc.addPage();
        y = 20;
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('Visualización Gráfica', pageWidth / 2, y, { align: 'center' });
        y += 15;

        try {
            const canvas = document.getElementById('reportesChart');
            const canvasImage = await html2canvas(canvas, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                allowTaint: true
            });

            const imgData = canvasImage.toDataURL('image/png');
            const imgWidth = maxWidth;
            const imgHeight = canvasImage.height * imgWidth / canvasImage.width;

            const availableHeight = doc.internal.pageSize.getHeight() - y - 20;
            const finalHeight = Math.min(imgHeight, availableHeight);
            const finalWidth = finalHeight * imgWidth / imgHeight;

            doc.addImage(imgData, 'PNG', (pageWidth - finalWidth) / 2, y, finalWidth, finalHeight);
        } catch (error) {
            console.error('Error al generar la gráfica:', error);
            doc.setFontSize(styles.body.size);
            doc.setTextColor(255, 0, 0);
            doc.text('No se pudo incluir la gráfica en el PDF', margin, y + 20);
        }

        const fecha = new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        doc.save(`Reporte_Estadistico_${fecha}.pdf`);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el reporte. Por favor intente nuevamente.');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Error al cargar: ${src}`));
        document.head.appendChild(script);
    });
}
