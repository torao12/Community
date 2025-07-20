document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('confirm-delete-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  let idAEliminar = null; // Almacena el ID temporalmente

  // Abrir modal al hacer clic en un botón de eliminar
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      idAEliminar = btn.getAttribute('data-id'); // Guarda el ID
      modal.style.display = 'block'; // Muestra el modal
    });
  });

  // Cerrar modal sin eliminar
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    idAEliminar = null;
  });

  // Confirmar eliminación
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!idAEliminar) return;

    try {
      const response = await fetch(`http://107.22.248.129:7001/mensajes-admin/${idAEliminar}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`Anuncio con ID ${idAEliminar} eliminado correctamente.`);
        // Opcional: eliminar la tarjeta del DOM o recargar la lista
        location.reload(); // o elimina dinámicamente el elemento
      } else {
        const error = await response.json();
        console.error('Error al eliminar el anuncio:', error);
      }
    } catch (error) {
      console.error('Error de red al eliminar el anuncio:', error);
    } finally {
      modal.style.display = 'none';
      idAEliminar = null;
    }
  });
});
