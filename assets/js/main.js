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

    revelar();
    formulario();
  });

  /* --- Aparición al hacer scroll ------------------------------------------ */

  function revelar() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    // El escalonado se aplica por posición en la fila, no por índice global:
    // así la última tarjeta de una grilla larga no espera medio segundo.
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = items.indexOf(e.target);
        e.target.style.transitionDelay = (i % 3) * 80 + 'ms';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });

    // Red de seguridad: si algo no se observó nunca (scroll muy rápido, salto
    // por ancla, pestaña en segundo plano), a los 4s se muestra igual.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
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
          mostrar(
            'No pudimos enviarlo. Escribinos por WhatsApp o a jabmarketingintegral@gmail.com.',
            'error'
          );
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
