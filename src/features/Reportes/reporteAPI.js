import { initializeReportPagination } from "./controllers/reportesController.js";

// Visualizar los reportes como usuario
document.addEventListener('DOMContentLoaded', async () => {
  const contenedorReportes = document.getElementById('reports-grid');
  const idUsuario = localStorage.getItem('id_usuario');

  if (!idUsuario) {
    contenedorReportes.innerHTML = '<p>Por favor inicia sesión para ver tus reportes.</p>';
    return;
  }

  try {
    // Obtener reportes
    const response = await fetch(`http://107.22.248.129:7001/reportes`);
    if (!response.ok) throw new Error('Error al obtener reportes');
    const reportes = await response.json();

    if (reportes.length === 0) {
      contenedorReportes.innerHTML = '<p>No tienes reportes aún.</p>';
      return;
    }

    // Obtener todas las calles (ubicaciones) con su id_seccion
    const callesRes = await fetch('http://107.22.248.129:7001/calles');
    if (!callesRes.ok) throw new Error('Error al obtener ubicaciones');
    const calles = await callesRes.json();

    // Obtener todas las secciones con su nombre
    const seccionesRes = await fetch('http://107.22.248.129:7001/secciones');
    if (!seccionesRes.ok) throw new Error('Error al obtener secciones');
    const secciones = await seccionesRes.json();

    // Mapeo: id_ubicacion => id_seccion
    const ubicacionASeccion = {};
    calles.forEach(calle => {
      ubicacionASeccion[calle.id_ubicacion] = calle.id_seccion;
    });

    // Mapeo: id_seccion => nombre
    const seccionANombre = {};
    secciones.forEach(seccion => {
      seccionANombre[seccion.id_seccion] = seccion.nombre || `Sección ${seccion.id_seccion}`;
    });

    // Estados e incidentes
    const estados = {
      1: 'Pendiente',
      2: 'Resuelto',
    };

    const incidentes = {
      1: "Ruido excesivo",
      2: "Problema de alcohol",
      3: "Basura",
      4: "Asalto",
      5: "Alumbrado Público",
      6: "Fuga de agua",
      7: "Drenaje tapado"
    };

    contenedorReportes.innerHTML = '';

    reportes.forEach(rep => {
      if (!rep.activo && rep.activo !== undefined) return;

      const fecha = new Date(rep.fecha_creacion).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      const estadoTexto = estados[rep.id_estado] || 'Desconocido';
      const estadoClase =
        estadoTexto === 'Resuelto' ? 'tag-resolved' :
        estadoTexto === 'Pendiente' ? 'tag-pending' : 'tag-review';

      const avatarUrl = `https://i.pravatar.cc/40?u=usuario${rep.id_usuario}`;
      const descripcionCorta = rep.descripcion.length > 100
        ? `${rep.descripcion.substring(0, 100)}...`
        : rep.descripcion;

      // Obtener id_seccion desde id_ubicacion, y luego el nombre
      const idSeccion = ubicacionASeccion[rep.id_ubicacion];
      const nombreSeccion = seccionANombre[idSeccion] || 'Sección desconocida';
      const tipoIncidente = incidentes[rep.id_tipo] || 'Tipo desconocido';

      const articulo = document.createElement('article');
      articulo.className = 'card';

      articulo.innerHTML = `
        <div class="card-header">
          <span class="card-profile">
            <img src="${avatarUrl}" alt="Avatar" class="user-avatar" />
          </span>
          <span class="card-author">${rep.nombre_usuario || 'Usuario'}</span>
          <span class="card-date">${fecha}</span>
          <span class="card-section">${nombreSeccion}</span>
        </div>
        <div class="card-body">
          <p>${descripcionCorta} <a href="#" class="read-more" data-descripcion="${encodeURIComponent(rep.descripcion)}">Leer más...</a></p>
        </div>
        <div class="card-footer">
          <span class="tag ${estadoClase}">${estadoTexto}</span>
          <span class="tag tag-category">${tipoIncidente}</span>
        </div>
      `;

      contenedorReportes.appendChild(articulo);
    });

    // Modal para leer más
    if (!document.getElementById('modal-leer-mas')) {
      const modal = document.createElement('div');
      modal.id = 'modal-leer-mas';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal-content" style="margin: auto; max-width: 500px; margin-top: 10rem;">
          <h3>Descripción completa</h3>
          <p id="modal-descripcion"></p>
          <button id="cerrar-modal-leer-mas" class="btn btn-secondary">Cerrar</button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('cerrar-modal-leer-mas').addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Activar modal
    document.querySelectorAll('.read-more').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const textoCompleto = decodeURIComponent(e.target.dataset.descripcion);
        document.getElementById('modal-descripcion').textContent = textoCompleto;
        document.getElementById('modal-leer-mas').style.display = 'block';
      });
    });

  } catch (error) {
    console.error('❌ Error al cargar los reportes:', error);
    contenedorReportes.innerHTML = `<p>Error al cargar los reportes: ${error.message}</p>`;
  }
});

const pagination = initializeReportPagination('pagination-container');
