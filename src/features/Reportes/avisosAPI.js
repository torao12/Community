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
      console.log('AVISOS RECIBIDOS:', data.map(a => a.id)); // Mostrar ids
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

    // 🔽 Ordenar por ID descendente (más reciente primero)
    filtrados.sort((a, b) => {
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return idB - idA;
    });

    console.log('ORDENADOS POR ID ↓↓↓:', filtrados.map(a => a.id));

    if (filtrados.length === 0) {
      noticesList.innerHTML = '<p class="text-center text-muted">No hay avisos disponibles.</p>';
      return;
    }

    filtrados.forEach(aviso => {
      const descripcion = aviso.contenido || 'Sin descripción';
      const autor = aviso.autor || 'Administrador';
      const titulo = aviso.titulo || 'Sin título';
      const fecha = formatearFecha(aviso.fecha);
      const id = aviso.id || '?';

      const avisoHTML = `
        <article class="notice-item">
          <div class="notice-title">
            <h4><i class="fa-solid fa-user-shield"></i> ${autor} </h4>
          </div>
          <h5>${titulo}</h5>
          <p>${recortarTexto(descripcion)} <a href="#">Leer más</a></p>
          <time>${fecha}</time>
        </article>
      `;

      // ✅ Insertar al principio para que el más nuevo quede arriba
      noticesList.insertAdjacentHTML('afterbegin', avisoHTML);
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
    const fechaObj = new Date(fecha);
    return isNaN(fechaObj) ? 'Fecha no válida' : fechaObj.toLocaleDateString('es-MX', opciones);
  }
});
