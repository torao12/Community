document.addEventListener('DOMContentLoaded', () => {
    const createNoticeBtn = document.getElementById('create-notice-btn');
    const createNoticeModal = document.getElementById('crear-anuncio');
    const createNoticeForm = document.getElementById('crear-anuncio-form');
    const avisosGrid = document.getElementById('avisos-grid');

    // Función que sincroniza id_admin con id_usuario si id_admin no existe
    function sincronizarIdAdminConUsuario() {
        const idUsuario = localStorage.getItem('id_usuario');
        const idAdmin = localStorage.getItem('id_admin');

        if (!idAdmin && idUsuario) {
            localStorage.setItem('id_admin', idUsuario);
            console.log(`id_admin no existía y se asignó el valor de id_usuario: ${idUsuario}`);
        }
    }

    // Función para obtener id_admin desde localStorage
    function obtenerIdAdmin() {
        const id = localStorage.getItem('id_admin');
        return id ? Number(id) : null;
    }

    function mostrarAlerta(mensaje, tipo = 'info') {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        alert(mensaje);
    }

    sincronizarIdAdminConUsuario();

    if (createNoticeBtn && createNoticeModal) {
        createNoticeBtn.addEventListener('click', () => {
            createNoticeModal.classList.add('show');
        });
    }

    const closeModalBtns = createNoticeModal.querySelectorAll('.close-modal-btn');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            createNoticeModal.classList.remove('show');
            createNoticeForm.reset();
        });
    });

    if (createNoticeForm && avisosGrid && createNoticeModal) {
        createNoticeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('anuncio-titulo').value.trim();
            const contenido = document.getElementById('anuncio-descripcion').value.trim();
            const idAdmin = obtenerIdAdmin();

            if (!titulo || !contenido) {
                mostrarAlerta('Por favor, completa todos los campos.', 'error');
                return;
            }

            if (!idAdmin) {
                mostrarAlerta('No se encontró el ID de administrador. Por favor inicia sesión nuevamente.', 'error');
                return;
            }

            const payload = {
                titulo,
                contenido,
                id_admin: idAdmin
            };

            console.log('Enviando datos al backend:', payload);

            try {
                const response = await fetch('http://107.22.248.129:7001/mensajes-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.text();
                console.log('Respuesta del servidor:', result);

                if (!response.ok) {
                    mostrarAlerta('Error al crear el aviso: ' + result, 'error');
                    return;
                }

                const newNoticeCard = document.createElement('div');
                newNoticeCard.className = 'col-12 col-md-6 col-lg-4';
                newNoticeCard.dataset.title = titulo;
                newNoticeCard.innerHTML = `
                    <div class="card notice-card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fa-solid fa-user-shield notice-author-icon"></i>
                                <span class="notice-author">Administrador</span>
                            </div>
                            <h5 class="card-title">${titulo}</h5>
                            <p class="card-text">${contenido} <a href="#" class="leer-mas-link" data-titulo="${encodeURIComponent(titulo)}" data-contenido="${encodeURIComponent(contenido)}">Leer más</a></p>
                        </div>
                        <div class="card-footer notice-card-footer">
                            <div class="d-flex align-items-center text-muted">
                                <i class="fa-regular fa-calendar me-2"></i>
                                <small>${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                            </div>
                        </div>
                    </div>
                `;

                avisosGrid.prepend(newNoticeCard);
                createNoticeForm.reset();
                createNoticeModal.classList.remove('show');
                mostrarAlerta('Aviso creado con éxito.', 'success');

                activarModalLeerMas(); // Re-activar modal en nuevo aviso

            } catch (error) {
                console.error('Error de red:', error);
                mostrarAlerta('No se pudo conectar con el servidor.', 'error');
            }

            // Refrescar después de 1.5 segundos
            setTimeout(() => {
              location.reload();
            }, 1500);
        });
    }
});

// Función para mostrar los avisos con modal "Leer más"
async function cargarAnuncios() {
  const container = document.getElementById('avisos-grid');
  container.innerHTML = ''; // Limpiar

  try {
    const response = await fetch('http://107.22.248.129:7001/mensajes-admin');
    if (!response.ok) throw new Error('Error al obtener los anuncios');
    const anuncios = await response.json();

    // Ordenar por fecha descendente
    anuncios.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.createdAt || 0).getTime();
      const fechaB = new Date(b.fecha || b.createdAt || 0).getTime();
      return fechaB - fechaA;
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
        <div class="col-md-4">
          <div class="card notice-card h-100">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <i class="fa-solid fa-user-shield notice-author-icon"></i>
                <span class="notice-author">${nombreAdmin}</span>
              </div>
              <h5 class="card-title">${anuncio.titulo}</h5>
              <p class="card-text">
                ${contenidoCorto}
                <a href="#" class="leer-mas-link" data-titulo="${encodeURIComponent(anuncio.titulo)}" data-contenido="${encodeURIComponent(anuncio.contenido)}">Leer más</a>
              </p>
            </div>
            <div class="card-footer notice-card-footer">
              <div class="d-flex align-items-center text-muted">
                <i class="fa-regular fa-calendar me-2"></i>
                <small>${fechaMostrar}</small>
              </div>
              <button class="btn btn-icon btn-icon-danger delete-notice-btn" data-id="${idAviso}">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    activarModalLeerMas();

  } catch (error) {
    console.error('Error cargando los anuncios:', error);
    container.innerHTML = '<p>No se pudieron cargar los anuncios.</p>';
  }
}

// Crear el modal solo si no existe y activar los botones
function activarModalLeerMas() {
  if (!document.getElementById('modal-leer-mas')) {
    const modal = document.createElement('div');
    modal.id = 'modal-leer-mas';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';

    modal.innerHTML = `
      <div class="modal-content" style="margin: auto; max-width: 500px; margin-top: 10rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
        <h3 id="modal-titulo" style="margin-bottom: 1rem;"></h3>
        <p id="modal-descripcion" style="white-space: pre-line;"></p>
        <button id="cerrar-modal-leer-mas" class="btn btn-secondary" style="margin-top: 1rem;">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Botón para cerrar
    document.getElementById('cerrar-modal-leer-mas').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Cerrar haciendo clic fuera del contenido
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Agregar eventos a los enlaces "Leer más"
  document.querySelectorAll('.leer-mas-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const titulo = decodeURIComponent(link.dataset.titulo || '');
      const contenido = decodeURIComponent(link.dataset.contenido || '');

      // Establecer contenido del modal
      document.getElementById('modal-titulo').textContent = titulo;
      document.getElementById('modal-descripcion').textContent = contenido;
      document.getElementById('modal-leer-mas').style.display = 'flex';
    });
  });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarAnuncios);
