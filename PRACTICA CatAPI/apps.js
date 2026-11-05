const API_URL = 'https://api.thecatapi.com/v1/images/search?limit=10';

async function obtenerGatitos() {
    const contenedor = document.getElementById('contenedor');
    contenedor.innerHTML = '<p>Cargando michisssssss</p>';

    try {
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        contenedor.innerHTML = ''; 

        datos.forEach(gatito => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${gatito.url}" alt="Foto de gatito">
                <p><strong>ID:</strong> ${gatito.id}</p>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error('Error al consultar TheCatAPI:', error);
        contenedor.innerHTML = '<p>Ocurrió un error al cargar las imágenes.</p>';
    }
}