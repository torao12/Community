document.addEventListener('DOMContentLoaded', () => {
  const noticesPanel = document.getElementById('notices-panel');
  const showNoticesBtn = document.getElementById('show-notices-btn');
  const closeNoticesBtn = document.getElementById('close-notices-btn');
  const noticesList = document.querySelector('.notices-list');
  const tabButtons = document.querySelectorAll('.tab-button');

  let avisos = [];

  // --- Mostrar / Ocultar el panel ---
  if (noticesPanel && showNoticesBtn && closeNoticesBtn) {
    const openNotices = () => noticesPanel.classList.add('is-visible');
    const closeNotices = () => noticesPanel.classList.remove('is-visible');

    showNoticesBtn.addEventListener('click', openNotices);
    closeNoticesBtn.addEventListener('click', closeNotices);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && noticesPanel.classList.contains('is-visible')) closeNotices();
    });
  }

  // --- Cargar los avisos desde el backend ---
  fetch('http://107.22.248.129:7001/mensajes-admin')
    .then(res => res.json())
    .then(data => {
      avisos = data;
      mostrarAvisos('todos');
    })
    .catch(err => {
      console.error('Error al cargar avisos:', err);
    });

  // --- Mostrar avisos según filtro ---
  function mostrarAvisos(filtro) {
    noticesList.innerHTML = ''; // Limpiar lista
    const hoy = new Date();

    const filtrados = avisos.filter(aviso => {
      const fechaAviso = new Date(aviso.fecha);
      if (filtro === 'actuales') return fechaAviso >= hoy;
      if (filtro === 'pasados') return fechaAviso < hoy;
      return true;
    });

    if (filtrados.length === 0) {
      noticesList.innerHTML = '<p class="text-center text-muted">No hay avisos disponibles.</p>';
      return;
    }

    filtrados.forEach(aviso => {
      const descripcion = aviso.descripcion || 'Sin descripción';
      const avisoHTML = `
        <article class="notice-item">
          <div class="notice-title">
            <h4><i class="fa-solid fa-user-shield"></i> ${aviso.autor}</h4>
          </div>
          <h5>${aviso.titulo || 'Sin título'}</h5>
          <p>${recortarTexto(descripcion)} <a href="#">Leer más</a></p>
          <time>${formatearFecha(aviso.fecha)}</time>
        </article>
      `;
      noticesList.insertAdjacentHTML('beforeend', avisoHTML);
    });
  }

  // --- Manejo de pestañas ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtro = btn.textContent.toLowerCase(); // 'todos', 'actuales', 'pasados'
      mostrarAvisos(filtro);
    });
  });

  // --- Funciones utilitarias ---
  function recortarTexto(texto, limite = 50) {
    if (typeof texto !== 'string') return 'Descripción no disponible';
    return texto.length > limite ? texto.slice(0, limite) + '...' : texto;
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-MX', opciones);
  }
});
