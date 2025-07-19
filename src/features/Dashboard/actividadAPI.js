async function fetchChartData(type) {
    try{
        const response = await fetch ('');
        if (!response.ok) throw new Error ('Error al obtener datos de la gráfica');
        const data = await response.json();

        //si no tiene datos desde la API, generemos aleatoriamente
        const colors = geenerarColores(data.label.length);
        return { ...data, colors };
    }catch(error){
        console.error('Error al cargar datos de gráfica', error);
        showToast('No se pudo cargar los datos de la gráfica', 'error');
        return { labels: [], values: [], colors: []};
    }
}

async function renderBarChart(type = "Incident", chartId = "bar-chart", labelsId = "x-labels-row") {
    const chart = await fetchChartData(type);
    const max = Math.max(...chart.values, 40);
    const barChart = document.getElementById(chartId);
    const xLabelsRow = document.getElementById(labelsId);
    if (!barChart || !xLabelsRow) return;

    // Rellenar las barras
    barChart.innerHTML = chart.values.map((val, i) => `
        <div class="bar-wrapper" style="flex:1 1 0; max-width:110px; min-width:60px;">
            <div class="bar" style="height: ${Math.round((val / max) * 100)}%; background-color: ${chart.colors[i]};">
                <span class="data-label">${val}</span>
            </div>
        </div>
    `).join("");

    // Rellenar las etiquetas X
    xLabelsRow.innerHTML = chart.labels.map(label => `
        <span class="x-label">${label}</span>
    `).join("");
}


const filterSelect = document.getElementById("filter-select");
if (filterSelect) {
    renderBarChart(filterSelect.value); // Mostrar el primero por defecto

    filterSelect.addEventListener("change", (e) => {
        renderBarChart(e.target.value);
    });
}

function generarColores(cantidad) {
    const coloresBase = ["#1CA1C1", "#1DC6E6", "#F7B801", "#F7D774", "#4DD7A7", "#7BE495", "#596CFF", "#A0DD9F"];
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
        colores.push(coloresBase[i % coloresBase.length]);
    }
    return colores;
}
    