const CART_KEY = 'elevation-sport-carrito';

// ========== SUPABASE ==========
const SUPABASE_URL = 'https://brdaiohchyogcuytzpvq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K8nsXrCoSVzAqqhF8OnEDA_4jK4hKJb';

const SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
};

const modal = document.getElementById('product-modal');
const modalContacto = document.getElementById('contacto-modal');
const modalLogin = document.getElementById('login-modal');

const leerCarrito = () => {
    try {
        const guardado = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(guardado) ? guardado : [];
    } catch {
        return [];
    }
};

const cantidadTotal = (carrito) =>
    carrito.reduce((total, producto) => total + producto.cantidad, 0);

const montoTotal = (carrito) =>
    carrito.reduce(
        (suma, producto) => suma + producto.precio * producto.cantidad,
        0
    );

const actualizarContador = (carrito = leerCarrito()) => {
    const contador = document.getElementById('cart-counter');
    if (contador) contador.textContent = cantidadTotal(carrito);
};

const convertirPrecio = (precio) =>
    Number(String(precio).replace(/\D/g, '')) || 0;

const formatearPrecio = (valor) => `$${valor.toLocaleString('es-AR')}`;

const sincronizar = () => {
    actualizarContador();
    renderCarrito();
};

const guardarCarrito = (carrito) => {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
    sincronizar();
};

const obtenerImagen = (boton) => {
    const articulo = boton.closest('article');
    const fuente =
        boton.dataset.imagen ||
        (articulo && articulo.querySelector('img')?.getAttribute('src')) ||
        document.getElementById('modal-img')?.src ||
        '';

    if (/^https?:\/\//i.test(fuente) || fuente.startsWith('data:')) {
        return fuente;
    }

    const inicio = fuente.indexOf('imagenes/');
    return inicio >= 0 ? fuente.slice(inicio) : '';
};

const agregarProducto = (nombre, precio, imagen) => {
    const carrito = leerCarrito();
    const existente = carrito.find((producto) => producto.nombre === nombre);

    if (existente) {
        existente.cantidad += 1;
        if (!existente.imagen && imagen) existente.imagen = imagen;
    } else {
        carrito.push({ nombre, precio, cantidad: 1, imagen: imagen || '' });
    }

    guardarCarrito(carrito);
};

const eliminarProducto = (nombre) => {
    guardarCarrito(
        leerCarrito().filter((producto) => producto.nombre !== nombre)
    );
};

const cambiarCantidad = (nombre, delta) => {
    const carrito = leerCarrito();
    const producto = carrito.find((item) => item.nombre === nombre);
    if (!producto) return;

    producto.cantidad = Math.max(1, producto.cantidad + delta);
    guardarCarrito(carrito);
};

const renderCarrito = () => {
    const contenedor = document.getElementById('cart-content');
    if (!contenedor) return;

    const carrito = leerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="cart-empty-state">
                <p class="cart-empty">Tu carrito está vacío</p>
                <a href="index.html#catalogo" class="btn-volver">Volver al catálogo</a>
            </div>`;
        return;
    }

    contenedor.innerHTML = `
        <div class="cart-layout">
            <ul class="cart-list">
                ${carrito
                    .map((producto) => {
                        const imagen = producto.imagen
                            ? `<img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">`
                            : `<span class="cart-item-thumb-fallback">${producto.nombre
                                  .charAt(0)
                                  .toUpperCase()}</span>`;

                        return `
                <li class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-thumb">${imagen}</div>
                        <div class="cart-item-texto">
                            <span class="cart-item-nombre">${producto.nombre}</span>
                            <span class="cart-item-precio-unit">${formatearPrecio(
                                producto.precio
                            )} c/u</span>
                        </div>
                    </div>
                    <div class="cart-item-acciones">
                        <button type="button" class="btn-cantidad" data-accion="restar" data-nombre="${
                            producto.nombre
                        }" aria-label="Restar una unidad de ${producto.nombre}"${
                            producto.cantidad === 1 ? ' disabled' : ''
                        }>&minus;</button>
                        <span class="cart-item-cantidad">${producto.cantidad}</span>
                        <button type="button" class="btn-cantidad" data-accion="sumar" data-nombre="${
                            producto.nombre
                        }" aria-label="Sumar una unidad de ${producto.nombre}">+</button>
                        <button type="button" class="btn-eliminar" data-nombre="${
                            producto.nombre
                        }" aria-label="Eliminar ${producto.nombre}">Eliminar</button>
                    </div>
                    <span class="cart-item-subtotal">${formatearPrecio(
                        producto.precio * producto.cantidad
                    )}</span>
                </li>`;
                    })
                    .join('')}
            </ul>
            <aside class="cart-summary">
                <h3>Resumen de compra</h3>
                <p class="cart-summary-row">
                    <span>Productos</span>
                    <span>${cantidadTotal(carrito)}</span>
                </p>
                <p class="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <strong>${formatearPrecio(montoTotal(carrito))}</strong>
                </p>
                <button type="button" class="btn-finalizar">Finalizar Compra</button>
                <a href="index.html#catalogo" class="btn-volver">Seguir comprando</a>
            </aside>
        </div>`;
};

const finalizarCompra = () => {
    localStorage.removeItem(CART_KEY);
    actualizarContador([]);

    const contenedor = document.getElementById('cart-content');
    if (contenedor) {
        contenedor.innerHTML =
            '<p class="cart-success">¡Gracias por tu compra! Tu pedido fue registrado.</p>';
    }
};

const sincronizarScroll = () => {
    const algunAbierto =
        (modal && modal.classList.contains('is-open')) ||
        (modalContacto && modalContacto.classList.contains('is-open')) ||
        (modalLogin && modalLogin.classList.contains('is-open'));
    document.body.classList.toggle('no-scroll', Boolean(algunAbierto));
};

const abrirModalContacto = () => {
    if (!modalContacto) return;

    modalContacto.classList.add('is-open');
    modalContacto.setAttribute('aria-hidden', 'false');
    sincronizarScroll();
    modalContacto.querySelector('.btn-cerrar')?.focus();
};

const cerrarModalContacto = () => {
    if (!modalContacto) return;

    modalContacto.classList.remove('is-open');
    modalContacto.setAttribute('aria-hidden', 'true');
    sincronizarScroll();

    // Volver al catálogo (enfoque al nav para accesibilidad)
    document.getElementById('nav-contacto')?.focus();
};

// ========== MODAL DE INICIO DE SESIÓN (GLOBAL) ==========
const abrirModalLogin = () => {
    if (!modalLogin) return;

    modalLogin.classList.add('is-open');
    modalLogin.setAttribute('aria-hidden', 'false');
    sincronizarScroll();
    modalLogin.querySelector('.btn-cerrar')?.focus();
};

const cerrarModalLogin = () => {
    if (!modalLogin) return;

    modalLogin.classList.remove('is-open');
    modalLogin.setAttribute('aria-hidden', 'true');
    sincronizarScroll();

    // Reiniciar el formulario y el mensaje de estado al cerrar
    modalLogin.querySelector('form')?.reset();
    const estado = modalLogin.querySelector('.estado');
    if (estado) estado.textContent = '';

    document.getElementById('nav-login')?.focus();
};

const abrirModal = (articulo) => {
    if (!modal || !articulo) return;

    const imagen = articulo.querySelector('img');
    const titulo = articulo.querySelector('h3');
    const descripcion = articulo.querySelector('p');
    const botonAgregar = articulo.querySelector('.btn-agregar');
    const modalAgregar = document.getElementById('modal-agregar');

    document.getElementById('modal-img').src = imagen.src;
    document.getElementById('modal-img').alt = imagen.alt;
    document.getElementById('modal-title').textContent = titulo.textContent;
    document.getElementById('modal-desc').textContent = descripcion.textContent;
    document.getElementById('modal-precio').textContent = formatearPrecio(
        convertirPrecio(botonAgregar.dataset.precio)
    );

    modalAgregar.dataset.producto = botonAgregar.dataset.producto;
    modalAgregar.dataset.precio = botonAgregar.dataset.precio;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    sincronizarScroll();
    modal.querySelector('.btn-cerrar').focus();
};

const cerrarModal = () => {
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    sincronizarScroll();
};

document.addEventListener('click', (evento) => {
    const botonAgregar = evento.target.closest('.btn-agregar');

    if (botonAgregar) {
        agregarProducto(
            botonAgregar.dataset.producto,
            convertirPrecio(botonAgregar.dataset.precio),
            obtenerImagen(botonAgregar)
        );
        return;
    }

    const botonCantidad = evento.target.closest('.btn-cantidad');

    if (botonCantidad) {
        cambiarCantidad(
            botonCantidad.dataset.nombre,
            botonCantidad.dataset.accion === 'restar' ? -1 : 1
        );
        return;
    }

    const botonEliminar = evento.target.closest('.btn-eliminar');

    if (botonEliminar) {
        eliminarProducto(botonEliminar.dataset.nombre);
        return;
    }

    const botonDetalle = evento.target.closest('.btn-detalle');

    if (botonDetalle) {
        abrirModal(botonDetalle.closest('article'));
        return;
    }

    if (evento.target.closest('.modal-cerrar') || evento.target === modal) {
        cerrarModal();
        return;
    }

    if (
        evento.target.closest('.login-cerrar') ||
        evento.target === modalLogin
    ) {
        cerrarModalLogin();
        return;
    }

    if (
        evento.target.closest('.contacto-cerrar') ||
        evento.target === modalContacto
    ) {
        cerrarModalContacto();
        return;
    }

    // Delegación global en document: funciona en index, carrito, registro, etc.
    const navLogin = evento.target.closest('#nav-login, a[href="#login"]');
    if (navLogin && modalLogin) {
        evento.preventDefault();
        abrirModalLogin();
        return;
    }

    const navContacto = evento.target.closest(
        '#nav-contacto, a[href="#contacto"], a[href$="#contacto"]'
    );
    if (navContacto && modalContacto) {
        evento.preventDefault();
        abrirModalContacto();
        return;
    }

    if (evento.target.closest('.btn-finalizar')) {
        finalizarCompra();
    }
});

document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;

    if (modalLogin && modalLogin.classList.contains('is-open')) {
        cerrarModalLogin();
        return;
    }

    if (modalContacto && modalContacto.classList.contains('is-open')) {
        cerrarModalContacto();
        return;
    }

    if (modal && modal.classList.contains('is-open')) {
        cerrarModal();
    }
});

sincronizar();

// ========== CATÁLOGO DINÁMICO (SUPABASE) ==========
const contenedorCatalogo = document.querySelector(
    '#catalogo .catalogo-resultados'
);
const buscadorInput = document.getElementById('buscador-productos');
const precioMinInput = document.getElementById('precio-min');
const precioMaxInput = document.getElementById('precio-max');
const ordenInput = document.getElementById('orden-productos');
const mensajeVacio = document.getElementById('catalogo-vacio');
const btnLimpiarFiltros = document.getElementById('limpiar-filtros');

// La tabla no tiene columna "categoria": se infiere del nombre/descripción
const CATEGORIAS_PATRONES = [
    { id: 'pesas-rusas', patron: /pesa\s*rusa|kettlebell/i },
    { id: 'mancuernas', patron: /mancuerna/i },
    { id: 'discos', patron: /\bdisco/i },
    { id: 'barras', patron: /barra/i },
    {
        id: 'accesorios',
        patron: /caj[oó]n|bolsa|banda|guante|colchoneta|accesorio|step|salto/i
    }
];

const detectarCategoria = (texto) =>
    CATEGORIAS_PATRONES.find(({ patron }) => patron.test(texto))?.id ??
    'accesorios';

const crearTarjetaProducto = (producto, indice = 0) => {
    const id = producto.id;
    const nombre = producto.nombre ?? '';
    const precio = Number(producto.precio) || 0;
    const descripcion = producto.descripcion ?? '';
    const urlImagen = producto.url_imagen ?? '';
    const precioTexto = formatearPrecio(precio);

    const article = document.createElement('article');
    article.dataset.id = id;
    article.dataset.orden = String(indice);
    article.dataset.categoria = detectarCategoria(`${nombre} ${descripcion}`);

    const img = document.createElement('img');
    img.src = urlImagen;
    img.alt = nombre;
    img.loading = 'lazy';

    const h3 = document.createElement('h3');
    h3.textContent = nombre;

    const pDesc = document.createElement('p');
    pDesc.textContent = descripcion;

    const pPrecio = document.createElement('p');
    pPrecio.className = 'Precio';
    pPrecio.textContent = precioTexto;

    const cardActions = document.createElement('div');
    cardActions.className = 'card-actions';

    const btnAgregar = document.createElement('button');
    btnAgregar.className = 'btn-agregar';
    btnAgregar.dataset.producto = nombre;
    btnAgregar.dataset.precio = precioTexto;
    btnAgregar.dataset.id = id;
    btnAgregar.textContent = 'Agregar al Carrito';

    const btnDetalle = document.createElement('button');
    btnDetalle.className = 'btn-detalle';
    btnDetalle.dataset.id = id;
    btnDetalle.textContent = 'Ver';

    cardActions.append(btnAgregar, btnDetalle);
    article.append(img, h3, pDesc, pPrecio, cardActions);

    return article;
};

const cargarCatalogo = async () => {
    if (!contenedorCatalogo) return;

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/productos?select=*`,
            {
                method: 'GET',
                headers: SUPABASE_HEADERS
            }
        );

        if (!res.ok) throw new Error(res.status);

        const productos = await res.json();

        contenedorCatalogo
            .querySelectorAll('article')
            .forEach((nodo) => nodo.remove());

        const frag = document.createDocumentFragment();
        productos.forEach((producto, indice) => {
            frag.append(crearTarjetaProducto(producto, indice));
        });
        contenedorCatalogo.append(frag);

        // Los artículos ya están en el DOM: aplico el filtro activo actual
        filtrarCatalogo();
    } catch (error) {
        console.error('Error al cargar el catálogo:', error.message);

        if (!contenedorCatalogo.querySelector('.catalogo-error')) {
            const aviso = document.createElement('p');
            aviso.className = 'catalogo-error';
            aviso.textContent = 'No se pudieron cargar los productos.';
            contenedorCatalogo.append(aviso);
        }
    }
};

// ========== FILTRADO DEL CATÁLOGO ==========
// Consulta el DOM en cada ejecución (no cachea el array al cargar el script)
const tituloDe = (articulo) =>
    articulo.querySelector('h3')?.textContent || '';

const precioDe = (articulo) =>
    convertirPrecio(articulo.querySelector('.btn-agregar')?.dataset.precio);

const ORDENADORES = {
    destacados: (a, b) => Number(a.dataset.orden) - Number(b.dataset.orden),
    'precio-asc': (a, b) => precioDe(a) - precioDe(b),
    'precio-desc': (a, b) => precioDe(b) - precioDe(a),
    az: (a, b) => tituloDe(a).localeCompare(tituloDe(b), 'es')
};

const filtrarCatalogo = () => {
    const productosCatalogo = Array.from(
        document.querySelectorAll('#catalogo .catalogo-resultados article')
    );

    const busqueda = (buscadorInput?.value || '').trim().toLowerCase();
    const min =
        precioMinInput?.value === '' || precioMinInput?.value == null
            ? 0
            : Number(precioMinInput.value);
    const max =
        precioMaxInput?.value === '' || precioMaxInput?.value == null
            ? Infinity
            : Number(precioMaxInput.value);
    // Checkboxes múltiples: recolecto todas las categorías tildadas
    const categoriasActivas = Array.from(
        document.querySelectorAll('input[name="categoria"]:checked')
    ).map((input) => input.value);

    // Sin ninguna tildada (o con "Todo" tildado) => sin filtro de categoría
    const sinFiltroCategoria =
        categoriasActivas.length === 0 ||
        categoriasActivas.includes('todo');

    const visibles = new Set(
        productosCatalogo.filter((articulo) => {
            const titulo = tituloDe(articulo).toLowerCase();
            const precio = precioDe(articulo);
            const coincideCategoria =
                sinFiltroCategoria ||
                categoriasActivas.includes(articulo.dataset.categoria);
            return (
                titulo.includes(busqueda) &&
                precio >= min &&
                precio <= max &&
                coincideCategoria
            );
        })
    );

    // Ordenamiento: reacomoda los nodos en el DOM (el buscador queda arriba)
    const comparar = ORDENADORES[ordenInput?.value] || ORDENADORES.destacados;
    [...productosCatalogo]
        .sort(comparar)
        .forEach((articulo) => contenedorCatalogo.append(articulo));

    productosCatalogo.forEach((articulo) => {
        articulo.style.display = visibles.has(articulo) ? '' : 'none';
    });

    if (mensajeVacio) {
        mensajeVacio.hidden = visibles.size > 0;
        if (!mensajeVacio.hidden) contenedorCatalogo.append(mensajeVacio);
    }
};

buscadorInput?.addEventListener('input', filtrarCatalogo);
precioMinInput?.addEventListener('input', filtrarCatalogo);
precioMaxInput?.addEventListener('input', filtrarCatalogo);
ordenInput?.addEventListener('change', filtrarCatalogo);

const inputsCategoria = Array.from(
    document.querySelectorAll('input[name="categoria"]')
);
const inputCategoriaTodo = document.getElementById('cat-todo');

inputsCategoria.forEach((input) =>
    input.addEventListener('change', () => {
        // "Todo" se desmarca al elegir una categoría concreta...
        if (
            inputCategoriaTodo &&
            input !== inputCategoriaTodo &&
            input.checked
        ) {
            inputCategoriaTodo.checked = false;
        }
        // ...y vuelve a marcarse si el usuario desmarca todo lo demás
        if (
            inputCategoriaTodo &&
            !inputsCategoria.some((item) => item.checked)
        ) {
            inputCategoriaTodo.checked = true;
        }
        filtrarCatalogo();
    })
);

btnLimpiarFiltros?.addEventListener('click', () => {
    if (buscadorInput) buscadorInput.value = '';
    if (precioMinInput) precioMinInput.value = '';
    if (precioMaxInput) precioMaxInput.value = '';
    if (ordenInput) ordenInput.value = 'destacados';
    inputsCategoria.forEach((input) => {
        input.checked = input === inputCategoriaTodo;
    });
    filtrarCatalogo();
});

cargarCatalogo();

// ========== FORMULARIO DE CONTACTO ==========
const formContacto = document.getElementById('form-contacto');
const formCampos = formContacto?.querySelector('.form-campos');
const envioExito = document.getElementById('envio-exito');
const btnVolverForm = formContacto?.querySelector('.btn-volver-form');
let temporizadorExito = null;

const mostrarExito = () => {
    if (!formCampos || !envioExito) return;

    formCampos.hidden = true;
    envioExito.hidden = false;

    temporizadorExito = setTimeout(() => {
        restablecerFormContacto();
    }, 4000);
};

const restablecerFormContacto = () => {
    if (temporizadorExito) {
        clearTimeout(temporizadorExito);
        temporizadorExito = null;
    }

    formContacto?.reset();
    formContacto?.querySelectorAll('.campo-error').forEach((nodo) => {
        nodo.classList.remove('campo-error');
    });

    const estado = document.getElementById('estado-contacto');
    if (estado) estado.textContent = '';

    if (formCampos) formCampos.hidden = false;
    if (envioExito) envioExito.hidden = true;
};

// Validación nativa del navegador al intentar enviar incompleto
formContacto?.addEventListener(
    'invalid',
    (evento) => {
        evento.target.classList.add('campo-error');
        evento.target.focus();
    },
    true
);

// Quitar marca de error cuando el usuario corrige el campo
formContacto?.addEventListener('input', (evento) => {
    if (evento.target.validity.valid) {
        evento.target.classList.remove('campo-error');
    }
});

formContacto?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Doble chequeo defensivo (el navegador ya bloqueó vacíos/inválidos)
    if (!formContacto.checkValidity()) {
        formContacto.reportValidity();
        return;
    }

    const estado = document.getElementById('estado-contacto');
    if (estado) estado.textContent = '';

    // Simulación de envío (sin backend): success visual + auto-reset
    mostrarExito();
});

btnVolverForm?.addEventListener('click', () => {
    restablecerFormContacto();
});

// Al cerrar el modal de contacto, volver al estado inicial del form
modalContacto?.addEventListener('transitionend', () => {
    if (!modalContacto.classList.contains('is-open')) {
        restablecerFormContacto();
    }
});





// ========== FORMULARIO DE INICIO DE SESIÓN (MODAL GLOBAL) ==========
const formLogin = document.getElementById('form-login');

formLogin?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Doble chequeo defensivo (el navegador ya bloqueó vacíos/inválidos)
    if (!formLogin.checkValidity()) {
        formLogin.reportValidity();
        return;
    }

    const estado = document.getElementById('estado-login');
    if (estado) {
        estado.textContent = '¡Bienvenido! Inicio de sesión exitoso.';
    }

    formLogin.reset();
});

// ========== FORMULARIO DE REGISTRO (registro.html) ==========
const formRegistro = document.getElementById('form-registro');
const registroExito = document.getElementById('registro-exito');

formRegistro?.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Doble chequeo defensivo (el navegador ya bloqueó vacíos/inválidos)
    if (!formRegistro.checkValidity()) {
        formRegistro.reportValidity();
        return;
    }

    const estado = document.getElementById('estado-registro');
    if (estado) estado.textContent = '';

    // Ocultar el formulario y mostrar la confirmación visual
    formRegistro.hidden = true;
    if (registroExito) {
        registroExito.hidden = false;
        registroExito.querySelector('a')?.focus();
    }
});
