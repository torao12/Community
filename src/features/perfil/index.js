
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

