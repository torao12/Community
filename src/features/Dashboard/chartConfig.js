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
        // Mantener los tres endpoints: estadísticas completas, resueltos y datos para gráfica
        const [estadisticasRes, resueltosRes, graficaRes] = await Promise.all([
            fetch('http://107.22.248.129:7001/reportes/estadisticas/resumen'), // Para PDF completo
            fetch('http://107.22.248.129:7001/reportes/resueltos/total'),      // Para resueltos
            fetch('http://107.22.248.129:7001/estadisticas/por-tipo')          // Para gráfica
        ]);

        if (!estadisticasRes.ok) throw new Error('Fallo al obtener estadísticas');
        if (!resueltosRes.ok) throw new Error('Fallo al obtener resueltos');
        if (!graficaRes.ok) throw new Error('Fallo al obtener datos de gráfica');

        const estadisticas = await estadisticasRes.json();
        const resueltos = await resueltosRes.json();
        const datosGrafica = await graficaRes.json();

        // Usar los datos específicos del endpoint de gráfica para el chart
        const categorias = datosGrafica.map(item => item.tipo);
        const cantidades = datosGrafica.map(item => item.cantidad);

        // Actualizar gráfica con datos del endpoint específico
        reportesChart.data.labels = categorias;
        reportesChart.data.datasets[0].data = cantidades;
        reportesChart.update();

        // Configurar descarga de PDF con todos los datos (usar estadísticas completas)
        document.getElementById('btn-descargar-reporte').onclick = function () {
            generarPDF(estadisticas, resueltos);
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

async function generarPDF(estadisticas, resueltos) {
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
            if (typeof data === 'number') return data.toLocaleString('es-MX');
            return data.toString();
        };

        // Título principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(styles.title.size);
        doc.setTextColor(...styles.title.color);
        doc.text('Reporte Estadístico de Reportes Ciudadanos', pageWidth / 2, 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');

        let y = 35;

        // === SECCIÓN 1: RESUMEN GENERAL ===
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('1. Resumen General', margin, y);
        y += 12;

        doc.setFontSize(styles.body.size);
        doc.setTextColor(...styles.body.color);

        const resumenGeneral = [
            ['Total de Reportes (General)', formatData(estadisticas.totalReportesGeneral)],
            ['Reportes Activos', formatData(estadisticas.totalReportes)],
            ['Reportes Resueltos', formatData(estadisticas.reportesResueltos)],
            ['Promedio de Horas para Resolución', formatData(estadisticas.promedioHorasResolucion ? estadisticas.promedioHorasResolucion.toFixed(2) + ' horas' : 'N/A')]
        ];

        resumenGeneral.forEach(([label, value]) => {
            if (value && value !== 'N/A') {
                doc.text(`${label}: ${value}`, margin + 2, y);
                y += 8;
            }
        });

        y += 10;

        // === SECCIÓN 2: REPORTES POR TIPO ===
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('2. Distribución por Tipo de Reporte (General)', margin, y);
        y += 12;

        if (estadisticas.reportesPorTipo && Object.keys(estadisticas.reportesPorTipo).length > 0) {
            y = crearTabla(doc, estadisticas.reportesPorTipo, y, margin, maxWidth, styles, 'Tipo de Reporte', 'Cantidad');
        } else {
            doc.setFontSize(styles.body.size);
            doc.setTextColor(...styles.body.color);
            doc.text('No hay datos disponibles para esta sección.', margin + 2, y);
            y += 10;
        }

        y += 15;

        // === SECCIÓN 3: REPORTES POR SECCIÓN ===
        if (y > 220) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('3. Distribución por Sección/Zona (General)', margin, y);
        y += 12;

        if (estadisticas.reportesPorSeccion && Object.keys(estadisticas.reportesPorSeccion).length > 0) {
            y = crearTabla(doc, estadisticas.reportesPorSeccion, y, margin, maxWidth, styles, 'Sección/Zona', 'Cantidad');
        } else {
            doc.setFontSize(styles.body.size);
            doc.setTextColor(...styles.body.color);
            doc.text('No hay datos disponibles para esta sección.', margin + 2, y);
            y += 10;
        }

        // === SECCIÓN 4: GRÁFICA ===
        doc.addPage();
        y = 20;
        doc.setFontSize(styles.subtitle.size);
        doc.setTextColor(...styles.subtitle.color);
        doc.text('4. Visualización Gráfica - Reportes por Tipo', pageWidth / 2, y, { align: 'center' });
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

        // === PIE DE PÁGINA CON FECHA ===
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            
            const fecha = new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            doc.text(`Generado el: ${fecha}`, margin, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }

        const fechaArchivo = new Date().toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        doc.save(`Reporte_Estadistico_Completo_${fechaArchivo}.pdf`);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el reporte. Por favor intente nuevamente.');
    }
}

function crearTabla(doc, datos, startY, margin, maxWidth, styles, headerCol1, headerCol2) {
    let y = startY;
    const col1Width = maxWidth - 50;
    const col2Width = 40;

    // Header de tabla
    doc.setFontSize(styles.tableHeader.size);
    doc.setFillColor(...styles.tableHeader.fill);
    doc.rect(margin, y, col1Width + col2Width, 8, 'F');
    doc.setTextColor(...styles.tableHeader.color);
    doc.text(headerCol1, margin + 2, y + 6);
    doc.text(headerCol2, margin + col1Width + 2, y + 6, { align: 'right' });

    y += 8;
    doc.setFontSize(styles.body.size);

    // Filas de datos
    const entries = Object.entries(datos);
    entries.forEach(([key, value], i) => {
        // Verificar si necesita nueva página
        if (y > 260) {
            doc.addPage();
            y = 20;
            // Repetir header en nueva página
            doc.setFontSize(styles.tableHeader.size);
            doc.setFillColor(...styles.tableHeader.fill);
            doc.rect(margin, y, col1Width + col2Width, 8, 'F');
            doc.setTextColor(...styles.tableHeader.color);
            doc.text(headerCol1, margin + 2, y + 6);
            doc.text(headerCol2, margin + col1Width + 2, y + 6, { align: 'right' });
            y += 8;
            doc.setFontSize(styles.body.size);
        }

        // Alternar colores de fila
        const rowStyle = i % 2 === 0 ? styles.evenRow : styles.oddRow;
        doc.setFillColor(...rowStyle.fill);
        doc.rect(margin, y, col1Width + col2Width, 8, 'F');

        doc.setTextColor(...styles.body.color);

        // Manejar texto largo en la primera columna
        const maxTextWidth = col1Width - 4;
        const lines = doc.splitTextToSize(key, maxTextWidth);

        doc.text(lines[0], margin + 2, y + 6);

        // Si el texto requiere múltiples líneas
        if (lines.length > 1) {
            for (let j = 1; j < lines.length; j++) {
                y += 6;
                doc.setFillColor(...rowStyle.fill);
                doc.rect(margin, y, col1Width + col2Width, 8, 'F');
                doc.text(lines[j], margin + 2, y + 6);
            }
        }

        // Valor en segunda columna
        doc.text(value.toString(), margin + col1Width + 2, y + 6, { align: 'right' });
        y += 8;
    });

    return y;
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