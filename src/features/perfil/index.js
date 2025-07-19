
document.addEventListener('DOMContentLoaded', () => {
    // --- Menú desplegable de filtros con botón ---
    const toggleBtn = document.getElementById('filter-toggle');
    const filterDropdown = document.getElementById('filter-dropdown');
    if (toggleBtn && filterDropdown) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (filterDropdown.classList.contains('show') && !filterDropdown.contains(e.target) && e.target !== toggleBtn) {
                filterDropdown.classList.remove('show');
            }
        });
        filterDropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // --- Lógica para el Modal de Crear Reporte ---
    const reportModal = document.getElementById('reportModal');
    const reportForm = document.getElementById('reportForm');
    const reportsGrid = document.getElementById('reports-grid');

    // Función para limpiar los errores de validación
    const clearValidation = (form) => {
        form.querySelectorAll('.is-invalid').forEach((el) => {
            el.classList.remove('is-invalid');
        });
    };

    // Abrir modal de crear reporte
    const createReportBtn = document.getElementById('create-report-btn');
    const closeReportBtn = document.getElementById('close-report-btn');
    if (createReportBtn && reportModal) {
        createReportBtn.addEventListener('click', () => {
            reportModal.classList.add('show');
        });
    }

    // Cerrar modal de crear reporte
    if (closeReportBtn && reportModal) {
        closeReportBtn.addEventListener('click', () => {
            clearValidation(reportForm);
            reportForm.reset();
            reportModal.classList.remove('show');
        });
        // Opcional: cerrar modal al hacer clic fuera del contenido
        reportModal.addEventListener('click', (e) => {
            if (e.target === reportModal) {
                clearValidation(reportForm);
                reportForm.reset();
                reportModal.classList.remove('show');
            }
        });
    }

    // Escuchar el envío del formulario
    if (reportForm && reportsGrid && reportModal) {
        reportForm.addEventListener('submit', (event) => {
            event.preventDefault();
            clearValidation(reportForm);

            let isValid = true;
            const requiredFields = reportForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value || field.value.trim() === '') {
                    isValid = false;
                    field.classList.add('is-invalid');
                }
            });

            if (!isValid) {
                // showToast('Por favor, complete todos los campos requeridos.', 'error');
                return;
            }

            const incidentType = reportForm.incidentType.value;
            const section = reportForm.section.value;
            const street = reportForm.street.value;
            const reference = reportForm.reference.value;
            const description = reportForm.description.value;
            const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');

            const newCard = document.createElement('article');
            newCard.className = 'card';
            newCard.innerHTML = `
                <div class="card-header">
                    <span class="card-author">Anónimo</span>
                    <span class="card-date ms-auto">${date}</span>
                    <span class="card-section">${section}</span>
                </div>
                <div class="card-body">
                    <p>
                        ${description}
                        <br>
                        <strong>Ubicación:</strong> ${street}, ${reference}.
                    </p>
                </div>
                <div class="card-footer">
                    <span class="tag tag-pending">Pendiente</span>
                    <span class="tag tag-category">${incidentType}</span>
                </div>
            `;

            reportsGrid.prepend(newCard);

            reportForm.reset();
            reportModal.classList.remove('show');
            showToast('Reporte enviado con éxito', 'success');
        });
    }

    // --- Panel de Avisos ---
    const noticesPanel = document.getElementById('notices-panel');
    const showNoticesBtn = document.getElementById('show-notices-btn');
    const closeNoticesBtn = document.getElementById('close-notices-btn');
    if (noticesPanel && showNoticesBtn && closeNoticesBtn) {
        const openNotices = () => noticesPanel.classList.add('is-visible');
        const closeNotices = () => noticesPanel.classList.remove('is-visible');
        showNoticesBtn.addEventListener('click', openNotices);
        closeNoticesBtn.addEventListener('click', closeNotices);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && noticesPanel.classList.contains('is-visible')) closeNotices();
        });
    }

    // --- Datos de ejemplo para ambas gráficas ---
    const chartData = {
        Incident: {
            labels: [
                "Alumbrado", "Fuga de agua", "Basura", "Asalto", "Ruido excesivo", "Alcohol", "Drenaje tapado"
            ],
            values: [11, 17, 30, 16, 30, 7, 7],
            colors: [
                "#1CA1C1", "#1DC6E6", "#1FC8E6", "#4DD7A7", "#7BE495", "#F7D774", "#F7B801"
            ]
        },
        Section: {
            labels: [
                "Sección 1", "Sección 2", "Sección 3", "Sección 4"
            ],
            values: [22, 18, 25, 15],
            colors: [
                "#596CFF", "#32C4C4", "#55D4B4", "#A0DD9F"
            ]
        }
    };

    // --- Función para renderizar la gráfica ---
    function renderBarChart(type = "Incident", chartId = "bar-chart", labelsId = "x-labels-row") {
        const chart = chartData[type];
        const max = Math.max(...chart.values, 40);
        const barChart = document.getElementById(chartId);
        const xLabelsRow = document.getElementById(labelsId);
        if (!barChart || !xLabelsRow) return;

        // Calcula el número de barras para flexibilidad
        const barCount = chart.values.length;

        // Genera las barras con flex: 1 para simetría
        barChart.innerHTML = chart.values.map((val, i) => `
            <div class="bar-wrapper" style="flex:1 1 0; max-width:110px; min-width:60px;">
                <div class="bar" style="height: ${Math.round((val / max) * 100)}%; background-color: ${chart.colors[i]};">
                    <span class="data-label">${val}</span>
                </div>
            </div>
        `).join("");

        // Genera las etiquetas X con flex: 1 para simetría
        xLabelsRow.innerHTML = chart.labels.map(() => `
            <span class="x-label"></span>
        `).join("");
        // Ahora rellena las etiquetas con el texto centrado
        chart.labels.forEach((label, i) => {
            xLabelsRow.children[i].textContent = label;
        });
    }

    // --- Evento para cambiar entre Incidente y Sección ---
    const filterSelect = document.getElementById("filter-select");
    if (filterSelect) {
        renderBarChart(filterSelect.value);
        filterSelect.addEventListener("change", (e) => {
            renderBarChart(e.target.value);
        });
    }
});

