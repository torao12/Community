document.addEventListener('DOMContentLoaded', async () => {
  const contenedorReportes = document.getElementById('reports-grid');
  const paginacionComponent = document.querySelector('dynamic-pagination');
  const idUsuario = localStorage.getItem('id_usuario');
  const LIMIT = 9;

  if (!idUsuario) {
    contenedorReportes.innerHTML = '<p>Por favor inicia sesión para ver tus reportes.</p>';
    return;
  }

  const estados = { 1: 'Pendiente', 2: 'Resuelto' };
  const incidentes = {
    1: "Ruido excesivo", 2: "Problema de alcohol", 3: "Basura",
    4: "Asalto", 5: "Alumbrado Público", 6: "Fuga de agua", 7: "Drenaje tapado"
  };

  let calles = [], secciones = [], ubicaciones = [], usuarios = [];

  async function cargarDatosIniciales() {
    const [callesRes, seccionesRes, ubicacionesRes, usuariosRes] = await Promise.all([
      fetch('http://107.22.248.129:7001/calles'),
      fetch('http://107.22.248.129:7001/secciones'),
      fetch('http://107.22.248.129:7001/ubicaciones'),
      fetch('http://107.22.248.129:7001/usuarios')
    ]);

    if (!callesRes.ok || !seccionesRes.ok || !ubicacionesRes.ok || !usuariosRes.ok)
      throw new Error('Error al cargar datos iniciales');

    calles = await callesRes.json();
    secciones = await seccionesRes.json();
    ubicaciones = await ubicacionesRes.json();
    usuarios = await usuariosRes.json();
  }

  function obtenerNombreSeccion(id_ubicacion) {
  const ubicacion = ubicaciones.find(u => u.id_ubicacion === id_ubicacion);
  if (!ubicacion) return 'Sección desconocida';
  const seccion = secciones.find(s => s.id_seccion === ubicacion.id_seccion);
  if (!seccion) return 'Sección desconocida';

  // Mapeo personalizado
  if (seccion.id_seccion === 1) return 'Sección 3';
  if (seccion.id_seccion === 2) return 'Sección 4';

  return `Sección ${seccion.id_seccion}`;
}


  // Función para obtener nombre de usuario por id
  function obtenerNombreUsuario(id_usuario) {
    const usuario = usuarios.find(u => u.id_usuario === id_usuario);
    return usuario ? usuario.nombre : `Usuario #${id_usuario}`;
  }

  async function cargarTotalReportes() {
    const res = await fetch('http://107.22.248.129:7001/reportes/total');
    const data = await res.json();
    return typeof data === 'number' ? data : data.total || 0;
  }

  async function cargarReportesPagina(pagina) {
    contenedorReportes.innerHTML = '<p>Cargando reportes...</p>';
    try {
      const response = await fetch(`http://107.22.248.129:7001/reportes?page=${pagina}&limit=${LIMIT}`);
      if (!response.ok) throw new Error('Error al obtener reportes paginados');
      const reportes = await response.json();

      contenedorReportes.innerHTML = '';

      const listaReportes = Array.isArray(reportes) ? reportes : (reportes.reportes || []);
      const reportesActivos = listaReportes.filter(r => r.activo !== false);

      if (reportesActivos.length === 0) {
        contenedorReportes.innerHTML = '<p>No hay reportes disponibles en esta página.</p>';
        return;
      }

      reportesActivos.forEach(rep => {
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

        const nombreSeccion = obtenerNombreSeccion(rep.id_ubicacion);
        const tipoIncidente = incidentes[rep.id_tipo] || 'Tipo desconocido';
        const nombreUsuario = obtenerNombreUsuario(rep.id_usuario);

        const articulo = document.createElement('article');
        articulo.className = 'card';
        articulo.innerHTML = `
          <div class="card-header">
            <span class="card-profile"><img src="${avatarUrl}" alt="Avatar" class="user-avatar" /></span>
            <span class="card-author">${nombreUsuario}</span>
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

      activarModalLeerMas();

    } catch (err) {
      contenedorReportes.innerHTML = `<p>Error: ${err.message}</p>`;
      console.error('❌ Error en cargarReportesPagina:', err);
    }

    paginacionComponent.setAttribute('current-page', pagina);
  }

  function activarModalLeerMas() {
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

    document.querySelectorAll('.read-more').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const textoCompleto = decodeURIComponent(e.target.dataset.descripcion);
        document.getElementById('modal-descripcion').textContent = textoCompleto;
        document.getElementById('modal-leer-mas').style.display = 'block';
      });
    });
  }

  paginacionComponent.addEventListener('page-change', e => {
    const pagina = e.detail.page;
    cargarReportesPagina(pagina);
  });

  try {
    await cargarDatosIniciales();
    const total = await cargarTotalReportes();
    const totalPaginas = Math.ceil(total / LIMIT);
    paginacionComponent.setAttribute('total-pages', totalPaginas);
    paginacionComponent.setAttribute('current-page', 1);
    await cargarReportesPagina(1);
  } catch (error) {
    console.error('❌ Error al inicializar la vista:', error);
    contenedorReportes.innerHTML = `<p>Error al cargar los reportes: ${error.message}</p>`;
  }
});

