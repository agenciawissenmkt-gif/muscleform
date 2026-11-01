// Se o app não abrir (navegador muito antigo ou internet falhou), explica o que fazer.
// Fica num arquivo próprio (e não dentro do index.html) por causa da proteção de
// segurança das páginas (Content-Security-Policy), que bloqueia código embutido.
setTimeout(function () {
  var r = document.getElementById('root');
  if (r && !window.__bsStarted) {
    r.innerHTML =
      '<p style="padding:24px;font:17px sans-serif;text-align:center;color:#24123f">' +
      'O Beauty and self está demorando para abrir. Verifique a internet e toque em atualizar. ' +
      'Se não abrir, use o Chrome, Safari, Samsung Internet ou Firefox atualizado.</p>';
  }
}, 20000);
