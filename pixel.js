/* Nº5 Clara | Meta Pixel 2995898050758755.
   Só carrega quando a pessoa marca a autorização no formulário do simulador e o envia. Sem ela, a página não faz
   nenhum pedido à Meta. O pixel cifra (SHA-256) o email e o telemóvel no navegador antes de os enviar.
   Expõe window.N5Pixel.lead({ email, telefone, eventID }), que resolve quando o evento teve tempo de sair. */
(() => {
  'use strict';
  const PIXEL_ID = '2995898050758755';

  /* mesmos formatos que a Meta pede: email em minúsculas; telemóvel só com dígitos e indicativo do país */
  const email = e => String(e || '').trim().toLowerCase();
  const telefone = t => {
    let d = String(t || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    return d.length === 9 ? '351' + d : d;
  };

  function enviar(dados) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('set', 'autoConfig', false, PIXEL_ID); /* sem recolha automática de cliques e campos */
    fbq('init', PIXEL_ID, { em: email(dados.email), ph: telefone(dados.telefone) });
    fbq('track', 'Lead', { content_name: 'Simulador Nº5 Clara' }, { eventID: dados.eventID });
  }

  window.N5Pixel = {
    lead(dados) {
      /* pré-visualização (GitHub Pages) e testes locais: não entram nos números dos anúncios */
      const h = window.location.hostname;
      if (['', 'localhost', '127.0.0.1'].includes(h) || h.endsWith('.github.io')) return Promise.resolve();
      enviar(dados);
      /* espera a biblioteca carregar antes de mudar de página, no máximo 2,5 s */
      return new Promise(resolve => {
        const fim = Date.now() + 2500;
        const ver = () => {
          if ((window.fbq && window.fbq.callMethod) || Date.now() > fim) setTimeout(resolve, 400);
          else setTimeout(ver, 100);
        };
        ver();
      });
    },
  };
})();
