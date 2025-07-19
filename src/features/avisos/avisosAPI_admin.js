document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM
  const adminNoticesContainer = document.getElementById('avisos-grid');
  const deleteConfirmModal = document.getElementById('confirm-delete-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const crearAnuncioForm = document.getElementById('crear-anuncio-form');
  const crearAnuncioModal = document.getElementById('crear-anuncio');
  const closeModalBtn = document.querySelector('.close-modal-btn');
  const openCreateModalBtn = document.getElementById('open-create-modal-btn');
  
  let cardToDelete = null;

  // Función para mostrar notificaciones
  function showToast(message, type = 'success') {
    // Implementa tu propio sistema de notificaciones aquí
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(`${type.toUpperCase()}: ${message}`);
  }

  // Función para mostrar/ocultar modales
  function showModal(modal) {
    if (modal) {
      modal.style.display = 'block';
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function hideModal(modal) {
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  }

  // ========== FUNCIONALIDAD PARA CREAR AVISOS ==========
  if (crearAnuncioForm) {
    crearAnuncioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const titulo = document.getElementById('anuncio-titulo').value.trim();
      const descripcion = document.getElementById('anuncio-descripcion').value.trim();
      
      if (!titulo || !descripcion) {
        showToast('Por favor completa todos los campos', 'error');
        return;
      }

      try {
        const response = await fetch('http://107.22.248.129:7001/mensajes-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            titulo: titulo,
            descripcion: descripcion,
            autor: 'Administrador',
            fecha: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al crear el anuncio');
        }

        const data = await response.json();
        showToast('Anuncio creado exitosamente', 'success');
        hideModal(crearAnuncioModal);
        
        // Limpiar el formulario
        crearAnuncioForm.reset();
        
        // Recargar los avisos
        cargarAvisos();
        
      } catch (error) {
        console.error('Error al crear anuncio:', error);
        showToast(`Error: ${error.message}`, 'error');
      }
    });
  }

  // Abrir modal de creación
  if (openCreateModalBtn) {
    openCreateModalBtn.addEventListener('click', () => {
      showModal(crearAnuncioModal);
    });
  }

  // Cerrar modales
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      hideModal(crearAnuncioModal);
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      hideModal(deleteConfirmModal);
      cardToDelete = null;
    });
  }

  // Cerrar modales haciendo clic fuera
  [crearAnuncioModal, deleteConfirmModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideModal(modal);
          if (modal === deleteConfirmModal) cardToDelete = null;
        }
      });
    }
  });

  // ========== FUNCIONALIDAD PARA MOSTRAR Y ELIMINAR AVISOS ==========
  function cargarAvisos() {
    if (!adminNoticesContainer) return;

    fetch('http://107.22.248.129:7001/mensajes-admin')
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del servidor');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Formato de datos incorrecto');

        data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        renderizarAvisosAdmin(data);
        activarLeerMas();
      })
      .catch(err => {
        console.error('Error al cargar avisos:', err);
        adminNoticesContainer.innerHTML = `<p class="text-danger">Error al cargar avisos: ${err.message}</p>`;
      });
  }

  function renderizarAvisosAdmin(avisos) {
    if (!adminNoticesContainer) return;

    adminNoticesContainer.innerHTML = '';

    if (avisos.length === 0) {
      adminNoticesContainer.innerHTML = `<p class="text-muted">No hay avisos disponibles.</p>`;
      return;
    }

    avisos.forEach(aviso => {
      const avisoHTML = generarTarjetaAviso(aviso);
      adminNoticesContainer.insertAdjacentHTML('afterbegin', avisoHTML);
    });
  }

  function generarTarjetaAviso(aviso) {
    const descripcion = aviso.descripcion || 'Sin descripción';
    const titulo = aviso.titulo || 'Sin título';
    const autor = aviso.autor || 'Anónimo';
    const fecha = formatearFecha(aviso.fecha);

    return `
      <div class="col-12 col-md-6 col-lg-4" data-id="${aviso.id}">
        <div class="card notice-card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <i class="fa-solid fa-user-shield notice-author-icon"></i>
              <span class="notice-author ms-2">${autor}</span>
            </div>
            <h5 class="card-title">${titulo}</h5>
            <p class="card-text">${recortarTexto(descripcion)} <a href="#" class="read-more" data-descripcion="${encodeURIComponent(descripcion)}">Leer más</a></p>
          </div>
          <div class="card-footer notice-card-footer">
            <div class="d-flex align-items-center text-muted">
              <i class="fa-regular fa-calendar me-2"></i>
              <small>${fecha}</small>
            </div>
            <button class="btn btn-icon btn-icon-danger delete-notice-btn" title="Eliminar aviso">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function recortarTexto(texto, limite = 100) {
    return typeof texto === 'string' && texto.length > limite ? texto.slice(0, limite) + '...' : texto || 'Descripción no disponible';
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function activarLeerMas() {
    if (!document.getElementById('modal-leer-mas')) {
      const modal = document.createElement('div');
      modal.id = 'modal-leer-mas';
      modal.className = 'modal-overlay';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="modal-content">
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

  // Delegación de eventos para eliminar
  if (adminNoticesContainer) {
    adminNoticesContainer.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.delete-notice-btn');
      if (deleteButton) {
        cardToDelete = deleteButton.closest('.col-12');
        showModal(deleteConfirmModal);
      }
    });
  }

  // Confirmar eliminación
  if (confirmDeleteBtn && deleteConfirmModal) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!cardToDelete) return;
      
      const avisoId = cardToDelete.getAttribute('data-id');
      if (!avisoId) {
        showToast('ID de aviso no encontrado', 'error');
        return;
      }

      try {
        const response = await fetch(`http://107.22.248.129:7001/mensajes-admin/${avisoId}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar aviso');

        cardToDelete.remove();
        showToast('Aviso eliminado correctamente', 'success');
      } catch (error) {
        console.error('Error al eliminar aviso:', error);
        showToast('Error al eliminar el aviso', 'error');
      } finally {
        hideModal(deleteConfirmModal);
        cardToDelete = null;
      }
    });
  }

  // Cargar avisos al iniciar
  cargarAvisos();
});