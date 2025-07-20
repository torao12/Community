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
                            <p class="card-text">${contenido} <a href="#">Leer más</a></p>
                        </div>
                        <div class="card-footer notice-card-footer">
                            <div class="d-flex align-items-center text-muted">
                                <i class="fa-regular fa-calendar me-2"></i>
                                <small>${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                            </div>
                            <button class="btn btn-icon btn-icon-danger delete-notice-btn">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;

                avisosGrid.prepend(newNoticeCard);
                createNoticeForm.reset();
                createNoticeModal.classList.remove('show');
                mostrarAlerta('Aviso creado con éxito.', 'success');
            } catch (error) {
                console.error('Error de red:', error);
                mostrarAlerta('No se pudo conectar con el servidor.', 'error');
            }
        });
    }
});


async function cargarAnuncios() {
    const container = document.getElementById('avisos-grid');
    container.innerHTML = ''; // Limpiar contenido previo

    try {
        const response = await fetch('http://107.22.248.129:7001/mensajes-admin');
        if (!response.ok) throw new Error('Error al obtener los anuncios');
        const anuncios = await response.json();

        anuncios.forEach(anuncio => {
            const { titulo, contenido } = anuncio; // Ajusta si los nombres son diferentes

            const cardHTML = `
                <div class="col-md-4">
                    <div class="card notice-card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fa-solid fa-user-shield notice-author-icon"></i>
                                <span class="notice-author">Administrador</span>
                            </div>
                            <h5 class="card-title">${titulo}</h5>
                            <p class="card-text">${contenido} <a href="#">Leer más</a></p>
                        </div>
                        <div class="card-footer notice-card-footer">
                            <div class="d-flex align-items-center text-muted">
                                <i class="fa-regular fa-calendar me-2"></i>
                                <small>${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                            </div>
                            <button class="btn btn-icon btn-icon-danger delete-notice-btn">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        console.error('Error cargando los anuncios:', error);
        container.innerHTML = '<p>No se pudieron cargar los anuncios.</p>';
    }
}

document.addEventListener('DOMContentLoaded', cargarAnuncios);
