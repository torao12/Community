// Variable global para almacenar el filtro actual
let filtroActual = 'Todos';

// Función principal para cargar avisos con filtro
async function cargarAnuncios(filtro = 'Todos') {
  const container = document.getElementById('avisos-grid');
  container.innerHTML = ''; // Limpiar

  try {
    let url;
    switch(filtro) {
      case 'recientes':
        url = 'http://localhost:7001/avisos/ultimos7dias';
        break;
      case 'pasados':
        url = 'http://localhost:7001/avisos/mayores7dias';
        break;
      default:
        url = 'http://localhost:7001/mensajes-admin';
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Error al obtener los anuncios: ${response.status}`);
    const anuncios = await response.json();

    // Verificar si hay datos
    if (!anuncios || anuncios.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hay avisos disponibles para este filtro.</p></div>';
      return;
    }

    // Ordenar por id descendente
    anuncios.sort((a, b) => {
      const idA = a.id ?? a.id_mensaje ?? a.id_aviso ?? 0;
      const idB = b.id ?? b.id_mensaje ?? b.id_aviso ?? 0;
      return idB - idA;
    });

    anuncios.forEach(anuncio => {
      const idAviso = anuncio.id ?? anuncio.id_mensaje ?? anuncio.id_aviso ?? null;
      if (!idAviso) return;

      const nombreAdmin = anuncio.admin?.nombre || anuncio.nombre_admin || 'Administrador';
      const fechaRaw = anuncio.fecha || anuncio.createdAt || anuncio.fecha_creacion || null;

      let fechaMostrar = 'Fecha no disponible';
      if (fechaRaw) {
        const fechaObj = new Date(fechaRaw);
        if (!isNaN(fechaObj)) {
          fechaMostrar = fechaObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      }

      const contenidoCorto = anuncio.contenido?.length > 100
        ? `${anuncio.contenido.substring(0, 100)}...`
        : anuncio.contenido;

      const cardHTML = `
        <div class="col-md-4 mb-4">
          <div class="card notice-card h-100 card-clickable shadow-sm" 
               data-titulo="${encodeURIComponent(anuncio.titulo || '')}" 
               data-contenido="${encodeURIComponent(anuncio.contenido || '')}"
               data-admin="${encodeURIComponent(nombreAdmin)}"
               data-fecha="${encodeURIComponent(fechaMostrar)}">
            <div class="card-body d-flex flex-column">
              <!-- Encabezado con información del admin -->
              <div class="d-flex align-items-center mb-3">
                <i class="fa-solid fa-user-shield text-primary me-2" style="font-size: 1.1rem;"></i>
                <span class="text-muted fw-semibold">${nombreAdmin}</span>
              </div>
              
              <!-- Título con margen superior e inferior -->
              <h5 class="card-title mb-3" style="font-size: 1rem; line-height: 1.4;">${anuncio.titulo || 'Sin título'}</h5>
              
              <!-- Contenido con margen inferior -->
              <div class="card-text mb-3 flex-grow-1">
                <p class="mb-0" style="line-height: 1.6;">
                  ${contenidoCorto}
                  ${anuncio.contenido?.length > 100 ? '<span class="text-primary">Leer más...</span>' : ''}
                </p>
              </div>
              
              <!-- Pie de tarjeta -->
              <div class="card-footer bg-transparent px-0 pb-0 pt-2 mt-auto">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <i class="fa-regular fa-calendar text-muted me-2"></i>
                    <small class="text-muted">${fechaMostrar}</small>
                  </div>
                  <button class="btn btn-sm btn-outline-danger style="margin-left=1rem;" delete-notice-btn" data-id="${idAviso}">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    activarModalYEventos();

  } catch (error) {
    console.error('Error cargando los anuncios:', error);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          Error al cargar los avisos. Por favor, intenta nuevamente.
          ${error.message.includes('401') ? '<p class="mt-2 small">No tienes autorización. Por favor inicia sesión.</p>' : ''}
        </div>
      </div>
    `;
  }
}

function activarModalYEventos() {
  if (!document.getElementById('modal-leer-mas')) {
    crearModal();
  }

  document.querySelectorAll('.card-clickable').forEach(card => {
    card.replaceWith(card.cloneNode(true));
  });

  document.querySelectorAll('.card-clickable').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.delete-notice-btn')) {
        return;
      }

      const titulo = decodeURIComponent(card.dataset.titulo || '');
      const contenido = decodeURIComponent(card.dataset.contenido || '');
      const admin = decodeURIComponent(card.dataset.admin || '');
      const fecha = decodeURIComponent(card.dataset.fecha || '');

      mostrarModal(titulo, contenido, admin, fecha);
    });
    card.style.cursor = 'pointer';
  });
}

function crearModal() {
  const modal = document.createElement('div');
  modal.id = 'modal-leer-mas';
  modal.className = 'modal-overlay';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'flex-start';
  modal.style.zIndex = '9999';
  modal.style.overflowY = 'auto';
  modal.style.padding = '3rem 1rem';

  modal.innerHTML = `
    <div class="modal-content" style="width: 100%; max-width: 700px; background: white; border-radius: 12px; box-shadow: 0 0 20px rgba(0,0,0,0.3); margin: 0 auto;">
      <div class="modal-header" style="border-bottom: 1px solid #dee2e6; padding: 1rem 1rem 1rem;">
        <div class="d-flex flex-column">
          <div class="d-flex align-items-center mb-3">
            <i class="fa-solid fa-user-shield me-3 text-primary" style="font-size: 1.2rem;"></i>
            <span id="modal-admin" class="fw-semibold" style="font-size: 1rem;"></span>
          </div>
          <h3 id="modal-titulo" class="mb-0" style="font-size: 1.5rem; line-height: 1.3; margin-left: 2.2rem;"></h3>
        </div>
      </div>
      
      <div class="modal-body" style="padding: 1.5rem; max-height: 50vh; overflow-y: auto;">
        <p id="modal-descripcion" style="white-space: pre-line; line-height: 1.7; font-size: 1.05rem;"></p>
      </div>
      
      <div class="modal-footer" style="border-top: 1px solid #dee2e6; padding: 1rem 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div class="d-flex align-items-center text-muted">
          <i class="fa-regular fa-calendar me-2"></i>
          <small id="modal-fecha" style="font-size: 0.9rem;"></small>
        </div>
        <button id="cerrar-modal-leer-mas" class="btn btn-secondary" style="padding: 0.4rem 1rem; margin-left: 1rem;">
          <i class="fa-solid fa-times me-1"></i>Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('cerrar-modal-leer-mas').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
}

function mostrarModal(titulo, contenido, admin, fecha) {
  const modal = document.getElementById('modal-leer-mas');
  document.getElementById('modal-titulo').textContent = titulo || 'Sin título';
  document.getElementById('modal-descripcion').textContent = contenido || 'Sin contenido';
  document.getElementById('modal-admin').textContent = admin || 'Administrador';
  document.getElementById('modal-fecha').textContent = fecha || 'Fecha no disponible';
  
  modal.style.display = 'flex';
  modal.scrollTo(0, 0);
}

// Función para inicializar los filtros
function inicializarFiltros() {
  const selectFiltro = document.getElementById('category-aviso-select');
  const btnLimpiar = document.getElementById('limpiarFiltro');

  if (selectFiltro) {
    selectFiltro.addEventListener('change', (e) => {
      filtroActual = e.target.value;
      cargarAnuncios(filtroActual);
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      filtroActual = 'Todos';
      if (selectFiltro) {
        selectFiltro.value = 'Todos';
      }
      cargarAnuncios('Todos');
    });
  }
}

function refrescarAvisos() {
  cargarAnuncios(filtroActual);
}

function iniciarSistemaAvisos() {
  inicializarFiltros();
  cargarAnuncios();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarSistemaAvisos);
} else {
  iniciarSistemaAvisos();
}

// Exportar funciones globales para uso externo
window.SistemaAvisos = {
  cargar: cargarAnuncios,
  refrescar: refrescarAvisos,
  obtenerFiltroActual: () => filtroActual,
  inicializar: iniciarSistemaAvisos,
  
  aplicarFiltro: (filtro) => {
    filtroActual = filtro;
    const selectFiltro = document.getElementById('category-aviso-select');
    if (selectFiltro) selectFiltro.value = filtro;
    cargarAnuncios(filtro);
  },
  
  limpiarFiltro: () => {
    filtroActual = 'Todos';
    const selectFiltro = document.getElementById('category-aviso-select');
    if (selectFiltro) selectFiltro.value = 'Todos';
    cargarAnuncios('Todos');
  }
};