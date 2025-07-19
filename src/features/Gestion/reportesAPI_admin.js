//ver reportes en vista de admin
document.addEventListener('DOMContentLoaded', () =>{
    fetch('http://localhost:7001/reportes')
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
        fetch('http://localhost:7001/reportes/{id}')
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
            fetch('http://localhost:7001/reportes{id}', {
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