/* Jab Marketing — comportamiento del sitio */
(function () {
  'use strict';

  var WHATSAPP = '5493402500000';

  // Marca que hay JS: el CSS recién ahí se anima a ocultar los bloques que va a
  // revelar. Sin esta clase (JS caído, bot, navegador viejo) todo queda visible.
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var anio = document.getElementById('anio');
    if (anio) anio.textContent = new Date().getFullYear();

    navCompacto();
    cicloMetodologia();
    revelar();
    formulario();
  });

  /* --- El ciclo de un cliente, mes a mes --------------------------------- */

  function cicloMetodologia() {
    var loop = document.querySelector('[data-loop]');
    if (!loop) return;

    var marcador = loop.querySelector('[data-loop-marcador]');
    var mes = loop.querySelector('[data-loop-mes]');
    var pasos = Array.prototype.slice.call(loop.querySelectorAll('.paso'));
    if (!marcador || !mes || pasos.length !== 4) return;

    var PASO_MS = 2800;
    var i = 0;

    // Las etapas están arriba, derecha, abajo e izquierda. En CSS el ángulo 0
    // apunta a la derecha, así que la etapa 01 arranca en -90.
    function pintar() {
      var etapa = i % 4;
      // El ángulo siempre crece: así el marcador sigue girando hacia adelante
      // en vez de pegar la vuelta para atrás al cerrar el ciclo.
      marcador.style.setProperty('--a', (-90 + i * 90) + 'deg');
      mes.textContent = ('0' + (i % 12 + 1)).slice(-2);
      pasos.forEach(function (p, k) { p.classList.toggle('is-activo', k === etapa); });
    }

    pintar();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Solo corre mientras la sección está a la vista: no tiene sentido gastar
    // batería animando algo que nadie mira.
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
      }, { threshold: 0.25 }).observe(loop);
    } else {
      arrancar();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) frenar();
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

  function formulario() {
    var form = document.getElementById('form-contacto');
    if (!form) return;

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
