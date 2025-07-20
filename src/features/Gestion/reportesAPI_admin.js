//ver reportes en vista de admin
document.addEventListener('DOMContentLoaded', () =>{
    fetch('http://107.22.248.129:7001/reportes')
    .then (response => response.json())
    .then (reportes => {
        const contenedor = document.getElementById('report-row');
        contenedor.innerHTML ='';

        reportes.forEach (reporte => {
            const fila = document.createElement('div');
            fila.className = 'report-row';

            fila.innerHTML = `
          <button class="btn btn-secondary">
            <div class="report-id show-reports-btn" data-id="${reporte.id}">${reporte.codigo}</div>
          </button>
          <div>${reporte.autor}</div>
          <div class="status-cell">
            <span class="status-badge status-${reporte.estado.toLowerCase().replace(/\s/g, '-')}">${reporte.estado}</span>
          </div>
          <div>${reporte.tipo}</div>
          <div><span class="urgency-badge urgency-${reporte.urgencia.toLowerCase()}">${reporte.urgencia}</span></div>
          <div>${reporte.calle}</div>
          <div>${reporte.seccion}</div>
          <div class="action-cell">
            <select class="form-select form-select-sm status-select">
              <option value="Pendiente" ${reporte.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En proceso" ${reporte.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
              <option value="Resuelto" ${reporte.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
            </select>
            <button class="btn btn-icon delete-report-btn" data-id="${reporte.id}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `;

        contenedor.appendChild(fila);
        });
    })
    .catch(error => {
        console.log('Error al cargar llos reportes', error);
    })
})


//mostrar el reporte completo en el aside
document.addEventListener('click', function (e){
    const target = e.target.closest('.show-reports-btn');
    if(target){
        const id= target.getAtribute('data-id');

        //obtener los datos del reporte individual
        fetch('http://107.22.248.129:7001/reportes/{id}')
        .then (response => response.json())
        .then (reporte => {
            //mostrar el aside
            document.getElementById('reports-panel').style.display = 'block';

            //insertar datos en los campos
            document.getElementById('report-author').textContent = reporte.autor;
            document.querySelector('panel-status span').textContent = reporte.estado;
            document.querySelector('panel-status span').className = `status-badge status-${reporte.estado.toLowerCase().replace(/\s/g, '-')}`;
            document.getElementById('report-type').textContent = reporte.tipo;
            document.querySelector('panel-urgency span').textContent = reporte.urgencia;
            document.querySelector('panel-urgency span').className = `urgency-badge urgency-${reporte.urgencia.toLowerCase()}`;
            document.getElementById('report-location').textContent = reporte.calle;
            document.getElementById('report-section').textContent = reporte.seccion;
            document.getElementById('report-referency').textContent = reporte.referencia;
            document.getElementById('report-description').textContent = reporte.descripcion;
        })
        .catch(error => {
            console.log('Error al obtener detalles del reporte: ', error);
        })
    }
})


//funcion para eliminar los reportes
document.addEventListener('click', function(e) {
    if(e.target.closest('.delete-report-btn')){
        const btn = e.target ('.delete-report-btn');
        const id = btn.getAtribute ('data-id');

        if(confirm ('¿Estas seguro de que deseas eliminar este reporte?')){
            fetch('http://107.22.248.129:7001/reportes{id}', {
                method: 'DELETE'
            })
            .then (response => {
                if(!reponse.ok) throw new Error ('Error al eliminar');
                //Elmina visualmente el reporte del DOM
                const card = btn.closest('.card');
                if (card) card.remove();
                alert('Reporte eliminado exitosamente');
            })
            .catch (error => {
                console.error('Error al eliminar el reporte: ', error);
                alert('Hubo un problema al eliminar el reporte');
            });
        }
    }
});

//cambiar el estado de los reportes
confirmStatusBtn.addEventListener('click', () => {
    if  (rowToModify && newStatus) {
        const reporteID = obtenerIDReporte(rowToModify);
        const statusBadge = rowToModify.querySelector('.status-badge');
        
        fetch('', {
            method : 'PUT',
            headers: {
                'Content-Type' : 'aplication/json'
            },
            body: JSON.stringify({estado:newStatus})
        })
        .then(response => {
            if(!response.ok) throw new Error ('Error al actualizar el estado');
            //actualizar visualmente
            statusBadge.textContent = newStatus;
            statusBadge.className = 'status-badge';
            if(newStatus == 'Resuelto') statusBadge.classList.add('status-resuelto');
            else if(newStatus =='En proceso') statusBadge.classList.add('status-en-proceso');
            else statusBadge.classList('status-pendiente');

            statusConfirmModal.classList.remove('show');
            showToast('Estado actualizado con exito', 'success');
        })
        .catch(error => {
            console.error('Error', error);
            showToast('Error al cambiar el estado', 'error');
        });
        
    }
});

//confirmar eliminacion
confirmDeleteBtn.addEventListener('click', () => {
    if(rowToModify){
        const reporteID = obtenerIDReporte(rowToModify);

        fetch('', {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error ('Error al eliminar');
            //eliminar la fila visualmente
            rowToModify.remove();
            deleteConfirmModal.classList.remove('show');
            showToast('Reporte eliminado con exito', 'success');
        })
        .catch(error => {
            console.error('Error al eliminar el reporte', 'error');
        });
    }
})










//aside para ver el reporte completo
document.addEventListener('DOMContentLoaded', () => {
  // Asegúrate de que estos IDs existan en tu HTML.
  // 'report-container' es el elemento que contendrá todas las filas de reportes.
  const contenedor = document.getElementById('report-container');
  const reportsPanel = document.getElementById('reports-panel');
  const closeReportsBtn = document.getElementById('close-reports-btn');

  // Función para abrir el panel lateral.
  const openPanel = () => reportsPanel.classList.add('is-visible');
  // Función para cerrar el panel lateral.
  const closePanel = () => reportsPanel.classList.remove('is-visible');

  // Asigna el evento de clic para cerrar el panel con el botón.
  if (closeReportsBtn) {
    closeReportsBtn.addEventListener('click', closePanel);
  }

  // Permite cerrar el panel presionando la tecla 'Escape'.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && reportsPanel.classList.contains('is-visible')) {
      closePanel();
    }
  });

  // Carga y muestra los reportes en la tabla.
  fetch('http://107.22.248.129:7001/reportes')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(reportes => {
      if (!contenedor) {
        console.error("El elemento contenedor 'report-container' no fue encontrado.");
        return;
      }
      contenedor.innerHTML = ''; // Limpia el contenedor antes de añadir nuevos elementos.

      reportes.forEach(reporte => {
        const fila = document.createElement('div');
        fila.className = 'report-row';

        // --- CORRECCIÓN CLAVE ---
        // Se movió la clase 'show-reports-btn' y el atributo 'data-id' al <button>.
        // Esto asegura que el clic se capture correctamente en todo el botón.
        fila.innerHTML = `
          <button class="btn btn-secondary show-reports-btn" data-id="${reporte.id}">
            <div class="report-id">${reporte.codigo}</div>
          </button>
          <div>${reporte.autor}</div>
          <div class="status-cell">
            <span class="status-badge status-${reporte.estado.toLowerCase().replace(/\s/g, '-')}">${reporte.estado}</span>
          </div>
          <div>${reporte.tipo}</div>
          <div><span class="urgency-badge urgency-${reporte.urgencia.toLowerCase()}">${reporte.urgencia}</span></div>
          <div>${reporte.calle}</div>
          <div>${reporte.seccion}</div>
          <div class="action-cell">
            <select class="form-select form-select-sm status-select" data-id="${reporte.id}">
              <option value="Pendiente" ${reporte.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="En proceso" ${reporte.estado === 'En proceso' ? 'selected' : ''}>En proceso</option>
              <option value="Resuelto" ${reporte.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
            </select>
            <button class="btn btn-icon delete-report-btn" data-id="${reporte.id}">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `;

        contenedor.appendChild(fila);
      });
    })
    .catch(error => {
      console.error('Error al cargar los reportes:', error);
      if (contenedor) {
        contenedor.innerHTML = '<p class="text-danger">No se pudieron cargar los reportes. Intente de nuevo más tarde.</p>';
      }
    });

  // Escucha los clics en el contenedor para abrir el reporte completo en el panel.
  // Es más eficiente que escuchar en todo el 'document'.
  if (contenedor) {
    contenedor.addEventListener('click', function (e) {
      // Usa .closest() para encontrar el botón sin importar si se hizo clic en el icono o el botón mismo.
      const target = e.target.closest('.show-reports-btn');
      if (target) {
        const id = target.getAttribute('data-id');
        if (!id) return; // Salir si no hay ID.

        fetch(`http://107.22.248.129:7001/reportes/${id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(reporte => {
            // Inserta los datos del reporte en el panel lateral.
            document.getElementById('report-author').textContent = reporte.autor || 'Sin autor';

            const estadoSpan = document.querySelector('.panel-status span.status-badge');
            if(estadoSpan) {
              estadoSpan.textContent = reporte.estado || 'Sin estado';
              estadoSpan.className = `status-badge status-${(reporte.estado || 'default').toLowerCase().replace(/\s/g, '-')}`;
            }

            const urgenciaSpan = document.querySelector('.panel-urgency span.urgency-badge');
            if(urgenciaSpan) {
              urgenciaSpan.textContent = reporte.urgencia || 'Sin urgencia';
              urgenciaSpan.className = `urgency-badge urgency-${(reporte.urgencia || 'default').toLowerCase()}`;
            }

            document.getElementById('report-type').textContent = reporte.tipo || 'Sin tipo';
            document.getElementById('report-location').textContent = reporte.calle || 'Sin ubicación';
            document.getElementById('report-section').textContent = reporte.seccion || 'Sin sección';
            document.getElementById('report-referency').textContent = reporte.referencia || 'Sin referencia';
            document.getElementById('report-description').textContent = reporte.descripcion || 'Sin descripción';
            
            // Finalmente, muestra el panel.
            openPanel();
          })
          .catch(error => {
            console.error('Error al obtener detalles del reporte:', error);
            alert('No se pudieron cargar los detalles del reporte.');
          });
      }
    });
  }
});