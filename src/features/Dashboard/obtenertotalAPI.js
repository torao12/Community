document.addEventListener('DOMContentLoaded', () => {
    fetch('http://107.22.248.129:7001/reportes/total')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Total de reportes recibido:', data);

            // Asegúrate que la respuesta tenga una propiedad 'total'
            const total = data.total !== undefined ? data.total : 'No disponible';
            document.getElementById('total-reportes').textContent = total;
        })
        .catch(error => {
            console.error('Error al obtener el total de reportes:', error);
            document.getElementById('total-reportes').textContent = 'Error';
        });
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('http://107.22.248.129:7001/reportes')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(reportes => {
            console.log('Lista completa de reportes:', reportes);

            // Reportes con id_estado === 2, sin importar 'activo'
            const reportesResueltos = reportes.filter(r => r.id_estado === 2);

            console.log('Reportes resueltos (sin filtrar activo):', reportesResueltos.length);

            // Actualiza la tarjeta con el total de resueltos
            document.getElementById('reportes-atendidos').textContent = reportesResueltos.length;
        })
        .catch(error => {
            console.error('Error al obtener reportes resueltos:', error);
            document.getElementById('reportes-atendidos').textContent = 'Error';
        });
});
