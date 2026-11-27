/* Nº5 Clara | Meta Pixel 2995898050758755, com consentimento.
   - Painel de cookies (Aceitar / Rejeitar, com o mesmo destaque). A escolha fica no navegador (localStorage, essencial).
   - Aceite: o pixel carrega logo e envia PageView em cada página. Ao concluir o simulador, envia o Lead com o email e
     o telemóvel cifrados (SHA-256, feito pelo próprio pixel).
   - Rejeitado ou sem escolha: a página não faz nenhum pedido à Meta. Quem marcar a caixa da Meta no formulário
     autoriza só nesse momento, e o pixel carrega então para enviar o Lead.
   - «Definições de cookies» no rodapé volta a abrir o painel.
   Expõe window.N5Pixel.aceite() e window.N5Pixel.lead({ email, telefone, eventID }), que resolve quando o evento
   teve tempo de sair. */
(() => {
  'use strict';
  const PIXEL_ID = '2995898050758755';
  const CHAVE = 'n5_cookies_meta'; /* 'aceite' | 'rejeitado' */
  const h = window.location.hostname;
  /* pré-visualização (GitHub Pages) e testes locais: o painel aparece, mas nada é enviado à Meta */
  const ligado = !['', 'localhost', '127.0.0.1'].includes(h) && !h.endsWith('.github.io');

  const ler = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };
  const gravar = v => { try { localStorage.setItem(CHAVE, v); } catch { /* sem armazenamento: vale só nesta página */ } };
  let escolha = ler();

  /* mesmos formatos que a Meta pede: email em minúsculas; telemóvel só com dígitos e indicativo do país */
  const email = e => String(e || '').trim().toLowerCase();
  const telefone = t => {
    let d = String(t || '').replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    return d.length === 9 ? '351' + d : d;
  };

  let carregado = false;
  function carregar(dados) {
    if (!ligado) return false;
    if (!carregado) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('set', 'autoConfig', false, PIXEL_ID); /* sem recolha automática de cliques e campos */
      carregado = true;
    }
    fbq('init', PIXEL_ID, dados ? { em: email(dados.email), ph: telefone(dados.telefone) } : {});
    return true;
  }

  function aceitar() {
    escolha = 'aceite';
    gravar(escolha);
    if (carregar()) fbq('track', 'PageView');
    sincronizarCaixa();
  }
  function rejeitar() {
    const antes = escolha;
    escolha = 'rejeitado';
    gravar(escolha);
    /* um pixel já carregado só sai com a página: recarrega para parar de enviar */
    if (antes === 'aceite' && carregado) window.location.reload();
    sincronizarCaixa();
  }

  /* com os cookies aceites, a caixa da Meta no formulário já está respondida: fica marcada e escondida */
  function sincronizarCaixa() {
    const caixa = document.getElementById('consent-meta');
    if (!caixa) return;
    const linha = caixa.closest('label');
    if (escolha === 'aceite') { caixa.checked = true; if (linha) linha.hidden = true; }
    else if (linha && linha.hidden) { caixa.checked = false; linha.hidden = false; }
  }

  let painel = null;
  function abrirPainel() {
    if (!painel) {
      painel = document.createElement('section');
      painel.className = 'cookie-panel';
      painel.setAttribute('role', 'dialog');
      painel.setAttribute('aria-labelledby', 'cookie-titulo');
      painel.innerHTML =
        '<h2 id="cookie-titulo">Cookies</h2>' +
        '<p class="cookie-intro">Usamos cookies da Meta (Facebook e Instagram) para medir os nossos anúncios e mostrá-los a quem já nos visitou. ' +
        'Se aceitares, ao concluíres o simulador partilhamos também o teu email e telemóvel, cifrados, com a Meta, para o mesmo fim. ' +
        'Podes mudar a escolha no rodapé. <a href="privacidade.html#cookies">Saber mais</a></p>' +
        '<div class="cookie-actions cookie-actions-2">' +
        '<button type="button" class="cookie-btn cookie-btn-outline" data-escolha="rejeitar">Rejeitar</button>' +
        '<button type="button" class="cookie-btn cookie-btn-outline" data-escolha="aceitar">Aceitar</button>' +
        '</div>';
      painel.addEventListener('click', ev => {
        const b = ev.target.closest('[data-escolha]');
        if (!b) return;
        b.dataset.escolha === 'aceitar' ? aceitar() : rejeitar();
        painel.hidden = true;
      });
      document.body.appendChild(painel);
    }
    painel.hidden = false;
  }

  function ligarRodape() {
    const links = document.querySelector('.footer-links');
    if (!links || links.querySelector('.cookie-settings-link')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cookie-settings-link';
    b.textContent = 'Definições de cookies';
    b.addEventListener('click', abrirPainel);
    links.appendChild(b);
  }

  function iniciar() {
    ligarRodape();
    sincronizarCaixa();
    if (escolha === 'aceite') { if (carregar()) fbq('track', 'PageView'); }
    else if (escolha !== 'rejeitado') abrirPainel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  window.N5Pixel = {
    aceite: () => escolha === 'aceite',
    lead(dados) {
      if (!carregar(dados)) return Promise.resolve();
      fbq('track', 'Lead', { content_name: 'Simulador Nº5 Clara' }, { eventID: dados.eventID });
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
