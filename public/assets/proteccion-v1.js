/* Protección de los medios del portafolio: que guardar una pieza no sea a un
   clic de distancia. Es disuasión, no candado -- lo que el navegador muestra
   ya está descargado (captura de pantalla, herramientas de desarrollador o el
   link directo siguen funcionando). Lo que sí quita:
   - el menú del clic derecho y el "mantener presionado" del celular sobre
     imágenes y videos (Guardar imagen como, Copiar imagen, Guardar video);
   - arrastrar la imagen al escritorio;
   - el botón de descarga y el picture-in-picture de los controles del video.
   Va en la portada (y por build-en.js en /en/) y en los casos; NO en
   /aprobar/, donde guardar el video en el celular es justo lo que se busca.
   El nombre lleva versión porque /assets/* se cachea un año (ver _headers):
   si cambia, se sube como proteccion-v2.js y se actualizan los <script>. */
(function(){
  var MEDIOS = 'img, video, picture, svg image';

  var css = document.createElement('style');
  css.textContent = 'img,video{-webkit-user-drag:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}';
  document.head.appendChild(css);

  function esMedio(t){ return t && t.closest && t.closest(MEDIOS); }
  document.addEventListener('contextmenu', function(e){ if (esMedio(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ if (esMedio(e.target)) e.preventDefault(); });

  function blindar(v){
    v.setAttribute('controlslist', 'nodownload noplaybackrate');
    v.disablePictureInPicture = true;
    v.setAttribute('disablepictureinpicture', '');
    v.setAttribute('disableremoteplayback', '');
  }
  function todo(raiz){
    if (raiz.tagName === 'VIDEO') blindar(raiz);
    if (raiz.querySelectorAll) Array.prototype.forEach.call(raiz.querySelectorAll('video'), blindar);
    if (raiz.tagName === 'IMG') raiz.setAttribute('draggable', 'false');
    if (raiz.querySelectorAll) Array.prototype.forEach.call(raiz.querySelectorAll('img'), function(i){ i.setAttribute('draggable', 'false'); });
  }
  todo(document.body);
  // El visor de la galería y el muro de loops crean o cambian medios después.
  new MutationObserver(function(cambios){
    cambios.forEach(function(c){ Array.prototype.forEach.call(c.addedNodes, function(n){ if (n.nodeType === 1) todo(n); }); });
  }).observe(document.body, { childList: true, subtree: true });
})();
