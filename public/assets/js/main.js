/* Jab Marketing — comportamiento del sitio */
(function () {
  'use strict';

  var WHATSAPP = '5493402415366';

  // Marca que hay JS: el CSS recién ahí se anima a ocultar los bloques que va a
  // revelar. Sin esta clase (JS caído, bot, navegador viejo) todo queda visible.
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    navCompacto();
    videoDiferido();
    pilaresApilados();
    cicloMetodologia();
    muroClientes();
    carrusel();
    revelar();
    formulario();
  });

  /* --- El cliente recorriendo las etapas del ciclo ----------------------- */

  // Dos formas de mostrar lo mismo: el anillo en desktop y la línea de tiempo
  // en mobile. Solo una está visible a la vez, pero las dos se animan igual.
  function cicloMetodologia() {
    [
      document.querySelector('[data-loop]'),
      document.querySelector('[data-loop-mobile]')
    ].filter(Boolean).forEach(engancharCiclo);
  }

  function engancharCiclo(caja) {
    var marcador = caja.querySelector('[data-loop-marcador]');
    var pasos = Array.prototype.slice.call(caja.querySelectorAll('.paso'));
    if (!marcador || pasos.length !== 4) return;

    var esAnillo = caja.hasAttribute('data-loop');
    var PASO_MS = 2600;
    var VUELTAS = 4;   // después de esto el cliente vuelve a su tamaño original
    var i = 0;

    function pintar() {
      var etapa = i % 4;
      var vuelta = Math.floor(i / 4) % VUELTAS;

      // Crece 14% por vuelta cumplida: el cliente que sigue el ciclo, crece.
      marcador.style.setProperty('--escala', (1 + vuelta * 0.14).toFixed(2));

      if (esAnillo) {
        // El ángulo siempre crece: así el marcador sigue girando hacia adelante
        // en vez de pegar la vuelta para atrás al cerrar el ciclo.
        marcador.style.setProperty('--a', (-90 + i * 90) + 'deg');
      } else {
        // En la línea de tiempo se ubica a la altura de la etapa activa.
        var p = pasos[etapa];
        marcador.style.top = (p.offsetTop + 6) + 'px';
      }

      pasos.forEach(function (p, k) { p.classList.toggle('is-activo', k === etapa); });
    }

    pintar();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Solo corre mientras la sección está a la vista y la pestaña activa: no
    // tiene sentido gastar batería animando algo que nadie mira.
    var timer = null;
    var arrancar = function () {
      if (timer) return;
      timer = setInterval(function () { i++; pintar(); }, PASO_MS);
    };
    var frenar = function () {
      clearInterval(timer);
      timer = null;
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) { e.isIntersecting ? arrancar() : frenar(); });
      }, { threshold: 0.25 }).observe(caja);
    } else {
      arrancar();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) frenar();
    });

    // La posición en la línea de tiempo depende del alto de las etapas, que
    // cambia al rotar el teléfono o al recargar fuentes.
    window.addEventListener('resize', pintar, { passive: true });
  }

  /* --- Carrusel de notas -------------------------------------------------- */

  // Avanza solo, vuelve al principio al terminar, y se frena apenas alguien
  // interactúa: nadie quiere leer una tarjeta que se le escapa.
  function carrusel() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-carrusel]'), function (caja) {
      var pista = caja.querySelector('.carrusel__pista');
      var tarjetas = pista ? pista.children : [];
      if (!pista || tarjetas.length < 2) return;

      var antes = caja.querySelector('[data-carrusel-antes]');
      var luego = caja.querySelector('[data-carrusel-luego]');
      var AVANCE_MS = 5200;
      var timer = null;
      var detenido = false;

      function paso() { return tarjetas[0].offsetWidth + parseFloat(getComputedStyle(pista).columnGap || 0); }

      function mover(dir) {
        var fin = pista.scrollWidth - pista.clientWidth - 4;
        if (dir > 0 && pista.scrollLeft >= fin) pista.scrollLeft = 0;        // vuelve al principio
        else if (dir < 0 && pista.scrollLeft <= 4) pista.scrollLeft = fin;   // y al final si va para atrás
        else pista.scrollLeft += dir * paso();
      }

      if (antes) antes.addEventListener('click', function () { frenar(); mover(-1); });
      if (luego) luego.addEventListener('click', function () { frenar(); mover(1); });

      function arrancar() {
        if (timer || detenido) return;
        timer = setInterval(function () { mover(1); }, AVANCE_MS);
      }
      function pausar() { clearInterval(timer); timer = null; }
      // Si tocaron el carrusel, deja de moverse solo: mandan ellos.
      function frenar() { detenido = true; pausar(); }

      caja.addEventListener('mouseenter', pausar);
      caja.addEventListener('mouseleave', arrancar);
      caja.addEventListener('focusin', frenar);
      pista.addEventListener('pointerdown', frenar);
      pista.addEventListener('wheel', frenar, { passive: true });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { e.isIntersecting ? arrancar() : pausar(); });
        }, { threshold: 0.3 }).observe(caja);
      } else {
        arrancar();
      }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) pausar();
      });
    });
  }

  /* --- Tarjetas de etapas que se van tapando al bajar --------------------- */

  // Cada tarjeta queda pegada 40px más abajo que la anterior. Cuando la
  // siguiente la alcanza, la de atrás se atenúa: da sensación de profundidad
  // sin que el usuario pierda de vista dónde está.
  function pilaresApilados() {
    var pilares = document.querySelectorAll('.ind-pilar');
    if (pilares.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var pedido = false;
    var aplicar = function () {
      Array.prototype.forEach.call(pilares, function (p, i) {
        if (i === pilares.length - 1) return;
        p.classList.toggle('is-tapado', p.getBoundingClientRect().top <= (i + 1) * 40 + 2);
      });
      pedido = false;
    };

    window.addEventListener('scroll', function () {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(aplicar);
    }, { passive: true });

    aplicar();
  }

  /* --- Video que se carga recién al hacer clic --------------------------- */

  // Incrustar YouTube de entrada trae medio megabyte de scripts que la mayoría
  // no va a usar. Hasta el clic solo hay una imagen.
  function videoDiferido() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-video]'), function (caja) {
      var boton = caja.querySelector('button');
      if (!boton) return;

      boton.addEventListener('click', function () {
        var id = caja.getAttribute('data-video');
        var marco = document.createElement('iframe');
        marco.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
        marco.title = 'Cómo funciona el sistema';
        marco.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
        marco.allowFullscreen = true;
        marco.loading = 'lazy';
        var btn = caja.querySelector('button');
        if (btn) btn.remove();
        caja.appendChild(marco);
      });
    });
  }

  /* --- Nav que se achica al bajar --------------------------------------- */

  function navCompacto() {
    var nav = document.querySelector('.nav');
    if (!nav) return;

    // rAF para no recalcular estilos en cada evento de scroll.
    var pedido = false;
    var aplicar = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
      pedido = false;
    };

    window.addEventListener('scroll', function () {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(aplicar);
    }, { passive: true });

    aplicar();
  }

  /* --- Muro de clientes que se va renovando ------------------------------- */

  // Son más de treinta logos: puestos todos juntos la sección se comía media
  // página. Se dejan dos filas y los que no entran se reparten adentro de esas
  // casillas, que los van turnando de a uno.
  function muroClientes() {
    var grilla = document.querySelector('[data-muro]');
    if (!grilla) return;

    var FILAS = 2;
    var CADA = 2200;   // cuánto tarda en cambiar el siguiente logo
    var casillas = Array.prototype.slice.call(grilla.children);
    var logos = casillas.map(function (c) { return c.querySelector('img'); });
    if (casillas.length < 6 || logos.indexOf(null) !== -1) return;

    // Con movimiento reducido no se turna nada: quedan los treinta a la vista,
    // que es más largo pero no se mueve.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var turnos = [];   // { casilla, logos, i }
    var orden = [];
    var puntero = 0;
    var reloj = null;
    var anchoPrevio = 0;

    // Cuántas columnas hay de verdad en este ancho: se cuenta cuántas casillas
    // comparten la fila de la primera, sin repetir acá los breakpoints del CSS.
    function columnas() {
      var n = 0;
      for (var i = 0; i < casillas.length; i++) {
        if (casillas[i].offsetTop !== casillas[0].offsetTop) break;
        n++;
      }
      return n || 1;
    }

    function desarmar() {
      turnos = [];
      casillas.forEach(function (casilla, i) {
        casilla.hidden = false;
        casilla.classList.remove('cliente--turno');
        logos[i].classList.remove('esta');
        casilla.appendChild(logos[i]);
      });
    }

    function armar() {
      desarmar();

      var visibles = Math.min(casillas.length, columnas() * FILAS);
      if (visibles >= casillas.length) return;   // entran todos: no hay nada que turnar

      var grupos = [];
      var i;
      for (i = 0; i < visibles; i++) grupos.push([logos[i]]);
      for (i = visibles; i < logos.length; i++) grupos[i % visibles].push(logos[i]);

      grupos.forEach(function (grupo, n) {
        var casilla = casillas[n];
        casilla.classList.add('cliente--turno');
        grupo.forEach(function (logo, k) {
          casilla.appendChild(logo);
          if (k === 0) logo.classList.add('esta');
        });
        if (grupo.length > 1) turnos.push({ logos: grupo, i: 0 });
      });

      for (i = visibles; i < casillas.length; i++) casillas[i].hidden = true;

      // Se barajan una vez para que los cambios no recorran la fila en orden,
      // que se leería como una ola en lugar de un muro vivo.
      orden = turnos.slice();
      for (i = orden.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = orden[i]; orden[i] = orden[j]; orden[j] = tmp;
      }
      puntero = 0;
    }

    function girar() {
      if (!orden.length) return;
      var turno = orden[puntero % orden.length];
      puntero++;
      turno.logos[turno.i].classList.remove('esta');
      turno.i = (turno.i + 1) % turno.logos.length;
      turno.logos[turno.i].classList.add('esta');
    }

    function arrancar() {
      if (reloj || !orden.length) return;
      reloj = setInterval(girar, CADA);
    }

    function parar() {
      if (!reloj) return;
      clearInterval(reloj);
      reloj = null;
    }

    // Sólo gira mientras la sección está a la vista: si no, el visitante llega y
    // se encuentra el muro ya rotado sin haber visto ningún cambio.
    function aLaVista() {
      var r = grilla.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }

    function revisar() {
      aLaVista() ? arrancar() : parar();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        entradas[0].isIntersecting ? arrancar() : parar();
      }, { threshold: 0.1 }).observe(grilla);
    }

    // Red de seguridad, igual que en revelar(): si el observer no reporta, el
    // muro igual arranca cuando la sección entra en pantalla.
    window.addEventListener('scroll', revisar, { passive: true });

    var rearmar = function () {
      if (Math.abs(window.innerWidth - anchoPrevio) < 40) return;
      anchoPrevio = window.innerWidth;
      parar();
      armar();
      revisar();
    };

    anchoPrevio = window.innerWidth;
    armar();
    revisar();
    window.addEventListener('resize', rearmar, { passive: true });
  }

  /* --- Aparición al hacer scroll ------------------------------------------ */

  function revelar() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    // Cuántas columnas tiene realmente la grilla en este ancho. Se cuenta cuántos
    // hijos comparten la fila del primero: sirve igual con 1, 2 o 3 columnas, sin
    // repetir en JS los breakpoints del CSS.
    function columnas(cont) {
      var hijos = cont.children, n = 0;
      if (!hijos.length) return 1;
      for (var i = 0; i < hijos.length; i++) {
        if (hijos[i].offsetTop !== hijos[0].offsetTop) break;
        n++;
      }
      return n || 1;
    }

    // El escalonado va por posición en la fila, no por índice global: así la
    // última tarjeta de una grilla larga no espera medio segundo, y las de una
    // misma fila entran en cascada de izquierda a derecha.
    function retardo(el) {
      var padre = el.parentElement;
      if (!padre) return 0;
      var hermanos = Array.prototype.filter.call(padre.children, function (c) {
        return c.hasAttribute('data-reveal');
      });
      if (hermanos.length < 2) return 0;
      return (hermanos.indexOf(el) % columnas(padre)) * 90;
    }

    function mostrar(el) {
      if (el.classList.contains('is-in')) return;
      el.style.transitionDelay = retardo(el) + 'ms';
      el.classList.add('is-in');
      io.unobserve(el);
    }

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) mostrar(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad para scroll muy rápido, saltos por ancla o un observer que
    // no reporta. Revela SOLO lo que ya está a la vista: si acá se revelara todo,
    // el que tarda unos segundos en scrollear se encontraría la página entera ya
    // mostrada y no vería ninguna animación.
    var barrer = function () {
      var alto = window.innerHeight;
      items.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < alto * 0.92 && r.bottom > 0) mostrar(el);
      });
    };

    window.addEventListener('scroll', barrer, { passive: true });
    window.addEventListener('resize', barrer, { passive: true });
    barrer();
  }

  /* --- Formulario --------------------------------------------------------- */

  // Puede haber más de un formulario por página (home y la de industrial),
  // así que se engancha cada uno por separado.
  function formulario() {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-form-contacto]'),
      engancharFormulario
    );
  }

  function engancharFormulario(form) {
    var estado = form.querySelector('.form__status');
    var boton = form.querySelector('button[type="submit"]');

    // Netlify Forms intercepta el submit por su cuenta: no hay que tocarlo.
    if (form.hasAttribute('data-netlify')) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: si vino relleno, es un bot. Fingimos éxito y no mandamos nada.
      if (form.elements['empresa-web'] && form.elements['empresa-web'].value) {
        exito();
        return;
      }

      var datos = new FormData(form);
      datos.delete('empresa-web');

      var accion = (form.getAttribute('action') || '').trim();

      // Sin servicio configurado: abrimos WhatsApp con la consulta ya escrita.
      if (!accion) {
        window.open(enlaceWhatsapp(datos), '_blank', 'noopener');
        exito('Te abrimos WhatsApp con el mensaje listo para enviar.');
        return;
      }

      enviando(true);
      fetch(accion, { method: 'POST', body: datos, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          exito();
        })
        .catch(function () {
          // El servicio no respondió. Antes que perder la consulta, la pasamos
          // a WhatsApp con todo lo que la persona ya había escrito.
          window.open(enlaceWhatsapp(datos), '_blank', 'noopener');
          mostrar('No pudimos enviar el mail. Te abrimos WhatsApp con el mensaje listo.', 'error');
        })
        .finally(function () { enviando(false); });
    });

    function enlaceWhatsapp(datos) {
      var texto = 'Hola Jab, soy ' + (datos.get('nombre') || '') + '.';
      if (datos.get('empresa')) texto += ' Trabajo en ' + datos.get('empresa') + '.';
      if (datos.get('mensaje')) texto += ' ' + datos.get('mensaje');
      if (datos.get('contacto')) texto += ' Mi contacto: ' + datos.get('contacto');
      return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
    }

    function enviando(activo) {
      if (!boton) return;
      boton.disabled = activo;
      boton.textContent = activo ? 'Enviando…' : 'Enviar mensaje';
    }

    function exito(msg) {
      mostrar(msg || 'Gracias. Te respondemos dentro del día hábil.');
      form.reset();
    }

    function mostrar(msg, tipo) {
      if (!estado) return;
      estado.textContent = msg;
      if (tipo) estado.setAttribute('data-state', tipo);
      else estado.removeAttribute('data-state');
    }
  }
})();
