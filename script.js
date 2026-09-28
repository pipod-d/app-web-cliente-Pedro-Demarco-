const CART_KEY = 'elevation-sport-carrito';

const modal = document.getElementById('product-modal');

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
    document.body.classList.toggle(
        'no-scroll',
        Boolean(modal && modal.classList.contains('is-open'))
    );
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

    if (evento.target.closest('.btn-finalizar')) {
        finalizarCompra();
    }
});

document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;

    if (modal && modal.classList.contains('is-open')) {
        cerrarModal();
    }
});

sincronizar();
