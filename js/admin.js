// ========== CONFIGURACIÓN SUPABASE ==========
// Reemplazá con tu URL y KEY de Project Settings → API
const SUPABASE_URL = 'https://brdaiohchyogcuytzpvq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K8nsXrCoSVzAqqhF8OnEDA_4jK4hKJb';
const TABLE = 'productos';

const ENDPOINT = `${SUPABASE_URL}/rest/v1/${TABLE}`;

const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
};

const form = document.getElementById('form-producto');
const lista = document.getElementById('lista-productos');
const estadoForm = document.getElementById('estado-form');
const estadoLista = document.getElementById('estado-lista');
const btnSubmit = form?.querySelector('button[type="submit"]');
const btnCancelar = form?.querySelector('.btn-cancelar');

// Estado de edición: null = modo creación, id = modo actualización
let idEditando = null;

// ========== GET: listar productos ==========
const obtenerProductos = async () => {
    try {
        const res = await fetch(ENDPOINT, {
            method: 'GET',
            headers
        });

        if (!res.ok) throw new Error(res.status);

        const productos = await res.json();
        renderProductos(productos);
    } catch (error) {
        if (estadoLista) {
            estadoLista.textContent = `Error al cargar productos (${error.message})`;
        }
    }
};

// ========== RENDER: sólo createElement + append ==========
const renderProductos = (productos) => {
    if (!lista) return;

    // Limpiar items previos sin tocar el h3 del título
    lista.querySelectorAll('.item-producto, .estado-vacio').forEach((nodo) => nodo.remove());

    if (!productos.length) {
        const vacio = document.createElement('p');
        vacio.className = 'estado-vacio';
        vacio.textContent = 'No hay productos cargados.';
        lista.append(vacio);
        if (estadoLista) estadoLista.textContent = '';
        return;
    }

    if (estadoLista) estadoLista.textContent = '';

    productos.forEach((producto) => {
        const item = document.createElement('article');
        item.className = 'item-producto';

        const titulo = document.createElement('h4');
        titulo.textContent = producto.nombre;

        const precio = document.createElement('p');
        precio.className = 'item-precio';
        precio.textContent = `$${producto.precio}`;

        const desc = document.createElement('p');
        desc.className = 'item-desc';
        desc.textContent = producto.descripcion;

        const img = document.createElement('img');
        img.src = producto.url_imagen;
        img.alt = producto.nombre;
        img.loading = 'lazy';

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.dataset.id = producto.id;
        btnEliminar.textContent = 'Eliminar';

        const btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.className = 'btn-editar';
        btnEditar.dataset.id = producto.id;
        btnEditar.textContent = 'Editar';

        const acciones = document.createElement('div');
        acciones.className = 'item-acciones';
        acciones.append(btnEditar, btnEliminar);

        item.append(img, titulo, precio, desc, acciones);
        lista.append(item);
    });
};

// ========== Helpers de modo edición ==========
const activarModoEdicion = (producto) => {
    idEditando = producto.id;
    form.nombre.value = producto.nombre ?? '';
    form.precio.value = producto.precio ?? '';
    form.descripcion.value = producto.descripcion ?? '';
    form.url_imagen.value = producto.url_imagen ?? '';

    const h3Form = form.querySelector('h3');
    if (h3Form) h3Form.textContent = 'Editar producto';
    if (btnSubmit) btnSubmit.textContent = 'Actualizar producto';
    if (btnCancelar) btnCancelar.hidden = false;
    if (estadoForm) estadoForm.textContent = '';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.nombre.focus();
};

const resetearModoCreacion = () => {
    idEditando = null;
    form.reset();

    const h3Form = form.querySelector('h3');
    if (h3Form) h3Form.textContent = 'Agregar producto';
    if (btnSubmit) btnSubmit.textContent = 'Guardar producto';
    if (btnCancelar) btnCancelar.hidden = true;
    if (estadoForm) estadoForm.textContent = '';
};

// ========== POST (crear) / PATCH (actualizar) ==========
form?.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        nombre: form.nombre.value.trim(),
        precio: Number(form.precio.value),
        descripcion: form.descripcion.value.trim(),
        url_imagen: form.url_imagen.value.trim()
    };

    const esEdicion = idEditando !== null;
    const url = esEdicion
        ? `${ENDPOINT}?id=eq.${encodeURIComponent(idEditando)}`
        : ENDPOINT;
    const method = esEdicion ? 'PATCH' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { ...headers, Prefer: 'return=representation' },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error(res.status);

        const mensaje = esEdicion
            ? 'Producto actualizado correctamente.'
            : 'Producto agregado correctamente.';

        resetearModoCreacion();
        if (estadoForm) estadoForm.textContent = mensaje;
        await obtenerProductos();
    } catch (error) {
        if (estadoForm) {
            estadoForm.textContent = esEdicion
                ? `Error al actualizar (${error.message})`
                : `Error al guardar (${error.message})`;
        }
    }
});

// Cancelar edición (delegación en el form)
form?.addEventListener('click', (evento) => {
    if (!evento.target.closest('.btn-cancelar')) return;
    if (idEditando === null) return;
    resetearModoCreacion();
});

// ========== DELETE + EDITAR: delegación en #lista-productos ==========
lista?.addEventListener('click', async (evento) => {
    // --- Editar ---
    const btnEditar = evento.target.closest('.btn-editar');
    if (btnEditar) {
        const id = btnEditar.dataset.id;
        if (!id) return;

        try {
            const res = await fetch(`${ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
                method: 'GET',
                headers
            });

            if (!res.ok) throw new Error(res.status);

            const [producto] = await res.json();
            if (!producto) throw new Error('Producto no encontrado');

            activarModoEdicion(producto);
        } catch (error) {
            if (estadoLista) {
                estadoLista.textContent = `Error al cargar producto para editar (${error.message})`;
            }
        }
        return;
    }

    // --- Eliminar ---
    const btnEliminar = evento.target.closest('.btn-eliminar');
    if (!btnEliminar) return;

    const id = btnEliminar.dataset.id;
    if (!id) return;

    try {
        const res = await fetch(`${ENDPOINT}?id=eq.${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers
        });

        if (!res.ok) throw new Error(res.status);

        await obtenerProductos();
    } catch (error) {
        if (estadoLista) {
            estadoLista.textContent = `Error al eliminar (${error.message})`;
        }
    }
});

// ========== INIT ==========
obtenerProductos();
