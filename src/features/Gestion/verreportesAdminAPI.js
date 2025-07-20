document.addEventListener('DOMContentLoaded', async () => {
  const tablaContenedor = document.getElementById('report-table');

  try {
    // Obtener reportes
    const response = await fetch('http://107.22.248.129:7001/reportes');
    if (!response.ok) throw new Error('Error al obtener reportes');
    const reportes = await response.json();

    // Obtener secciones
    const seccionesResponse = await fetch('http://107.22.248.129:7001/secciones');
    if (!seccionesResponse.ok) throw new Error('Error al obtener secciones');
    const seccionesData = await seccionesResponse.json();

    // Crear diccionario de secciones
    const secciones = {};
    seccionesData.forEach(sec => {
      secciones[sec.id_seccion] = sec.nombre_seccion;
    });

    // Diccionarios
    const estados = {
      1: 'Pendiente',
      2: 'Resuelto',
    };

    const clasesEstado = {
      'Pendiente': 'status-pendiente',
      'Resuelto': 'status-resuelto'
    };

    const tipos = {
      1: "Ruido excesivo",
      2: "Problema de alcohol",
      3: "Basura",
      4: "Asalto",
      5: "Alumbrado Público",
      6: "Fuga de agua",
      7: "Drenaje tapado"
    };

    const urgencias = {
      1: { texto: "Baja", clase: "urgency-baja" },
      2: { texto: "Media", clase: "urgency-media" },
      3: { texto: "Alta", clase: "urgency-alta" }
    };

    // Limpiar la tabla antes de insertar
    const rowsExistentes = tablaContenedor.querySelectorAll('.report-row');
    rowsExistentes.forEach(row => row.remove());

    reportes.forEach(rep => {
      if (!rep.activo && rep.activo !== undefined) return;

      const estadoTexto = estados[rep.id_estado] || 'Desconocido';
      const tipoTexto = tipos[rep.id_tipo] || 'Tipo desconocido';
      const urgenciaInfo = urgencias[rep.urgencia] || { texto: 'Desconocida', clase: '' };
      const seccionTexto = secciones[rep.id_seccion] || 'Sección desconocida';
      const ubicacion = rep.nombre_ubicacion || 'Ubicación no disponible';
      const nombreUsuario = rep.nombre_usuario || 'Usuario';
      const claseEstado = clasesEstado[estadoTexto] || '';
      const idReporte = rep.id_reporte;

      const row = document.createElement('div');
      row.className = 'report-row';

      row.innerHTML = `
        <button class="btn btn-secondary" id="show-reports-btn">RPT-${String(idReporte).padStart(3, '0')}</button>
        <div>${nombreUsuario}</div>
        <div class="status-cell"><span class="status-badge ${claseEstado}">${estadoTexto}</span></div>
        <div>${tipoTexto}</div>
        <div><span class="urgency-badge ${urgenciaInfo.clase}">${urgenciaInfo.texto}</span></div>
        <div>${ubicacion}</div>
        <div>${seccionTexto}</div>
        <div class="action-cell">
          <select class="form-select form-select-sm status-select" data-id="${idReporte}">
            <option value="1" ${rep.id_estado === 1 ? 'selected' : ''}>Pendiente</option>
            <option value="2" ${rep.id_estado === 2 ? 'selected' : ''}>Resuelto</option>
          </select>
          <button class="btn btn-icon delete-report-btn" data-id="${idReporte}">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      tablaContenedor.appendChild(row);
    });

    // Event Listeners para eliminar (puedes implementar lógica real)
    tablaContenedor.addEventListener('click', e => {
      if (e.target.closest('.delete-report-btn')) {
        const id = e.target.closest('.delete-report-btn').dataset.id;
        if (confirm(`¿Eliminar reporte RPT-${String(id).padStart(3, '0')}?`)) {
          console.log(`Eliminar reporte ID: ${id}`);
          // Aquí haz un DELETE al backend
        }
      }
    });

    // Event Listeners para cambiar estado (puedes implementar lógica real)
    tablaContenedor.addEventListener('change', e => {
      if (e.target.classList.contains('status-select')) {
        const id = e.target.dataset.id;
        const nuevoEstado = e.target.value;
        console.log(`Cambiar estado del reporte ${id} a ${estados[nuevoEstado]}`);
        // Aquí haz un PATCH o PUT al backend
      }
    });

  } catch (error) {
    console.error('❌ Error al cargar la tabla de reportes:', error);
    tablaContenedor.innerHTML += `<p>Error al cargar reportes: ${error.message}</p>`;
  }
});
