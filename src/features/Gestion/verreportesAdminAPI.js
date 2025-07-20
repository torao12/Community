document.addEventListener('DOMContentLoaded', async () => {
  const tablaContenedor = document.getElementById('report-table');
  const idUsuario = localStorage.getItem('id_usuario');

  if (!idUsuario) {
    tablaContenedor.innerHTML = '<p>Por favor inicia sesión para ver tus reportes.</p>';
    return;
  }

  try {
    const [reportesRes, seccionesRes, usuariosRes, callesRes] = await Promise.all([
      fetch('http://107.22.248.129:7001/reportes'),
      fetch('http://107.22.248.129:7001/secciones'),
      fetch('http://107.22.248.129:7001/usuarios'),
      fetch('http://107.22.248.129:7001/calles'),
    ]);

    if (!reportesRes.ok) throw new Error('Error al obtener reportes');
    if (!seccionesRes.ok) throw new Error('Error al obtener secciones');
    if (!usuariosRes.ok) throw new Error('Error al obtener usuarios');
    if (!callesRes.ok) throw new Error('Error al obtener calles');

    const reportes = await reportesRes.json();
    const seccionesData = await seccionesRes.json();
    const usuariosData = await usuariosRes.json();
    const callesData = await callesRes.json();

    const secciones = {};
    seccionesData.forEach(s => {
      secciones[s.id_seccion] = s.nombre_seccion || `Sección ${s.id_seccion}`;
    });

    const usuarios = {};
    usuariosData.forEach(u => {
      usuarios[u.id_usuario] = u.nombre || 'Usuario';
    });

    const calles = {};
    callesData.forEach(c => {
      calles[c.id_ubicacion] = c.nombre_calle || 'Ubicación desconocida';
    });

    const estados = { 1: 'Pendiente', 2: 'Resuelto', 3: 'En proceso' };
    const clasesEstado = {
      'Pendiente': 'status-pendiente',
      'Resuelto': 'status-resuelto',
      'En proceso': 'status-en-proceso',
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
      1: { texto: "Alta", clase: "urgency-alta" },
      2: { texto: "Media", clase: "urgency-media" },
      3: { texto: "Baja", clase: "urgency-baja" }
    };

    tablaContenedor.querySelectorAll('.report-row').forEach(fila => fila.remove());

    reportes.forEach(rep => {
      if (!rep.activo && rep.activo !== undefined) return;

      const idReporte = rep.id_reporte;
      const nombreUsuario = usuarios[rep.id_usuario] || 'Usuario';
      const estadoTexto = estados[rep.id_estado] || 'Desconocido';
      const claseEstado = clasesEstado[estadoTexto] || '';
      const tipoTexto = tipos[rep.id_tipo] || 'Tipo desconocido';

      // ✅ Cambio aquí: se usa rep.id_nivel_urgencia
      const urgenciaInfo = urgencias[rep.id_nivel_urgencia] || { texto: 'Desconocida', clase: '' };
      const ubicacionTexto = calles[rep.id_ubicacion] || 'Ubicación no disponible';
      const seccionTexto = secciones[rep.id_seccion] || 'Sección desconocida';

      const fila = document.createElement('div');
      fila.className = 'report-row';

      fila.innerHTML = `
        <button class="btn btn-secondary" id="show-reports-btn">RPT-${String(idReporte).padStart(3, '0')}</button>
        <div>${nombreUsuario}</div>
        <div class="status-cell"><span class="status-badge ${claseEstado}">${estadoTexto}</span></div>
        <div>${tipoTexto}</div>
        <div><span class="urgency-badge ${urgenciaInfo.clase}">${urgenciaInfo.texto}</span></div>
        <div>${ubicacionTexto}</div>
        <div>${seccionTexto}</div>
        <div class="action-cell">
          <select class="form-select form-select-sm status-select" data-id="${idReporte}">
            <option value="1" ${rep.id_estado === 1 ? 'selected' : ''}>Pendiente</option>
            <option value="3" ${rep.id_estado === 3 ? 'selected' : ''}>En proceso</option>
            <option value="2" ${rep.id_estado === 2 ? 'selected' : ''}>Resuelto</option>
          </select>
          <button class="btn btn-icon delete-report-btn" data-id="${idReporte}">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      tablaContenedor.appendChild(fila);
    });

    tablaContenedor.addEventListener('click', e => {
      if (e.target.closest('.delete-report-btn')) {
        const id = e.target.closest('.delete-report-btn').dataset.id;
        if (confirm(`¿Eliminar reporte RPT-${String(id).padStart(3, '0')}?`)) {
          console.log(`Eliminar reporte ID: ${id}`);
        }
      }
    });

    tablaContenedor.addEventListener('change', e => {
      if (e.target.classList.contains('status-select')) {
        const id = e.target.dataset.id;
        const nuevoEstado = e.target.value;
        console.log(`Cambiar estado del reporte ${id} a ${estados[nuevoEstado]}`);
      }
    });

  } catch (error) {
    console.error('❌ Error al cargar la tabla de reportes:', error);
    tablaContenedor.innerHTML += `<p>Error al cargar reportes: ${error.message}</p>`;
  }
});
