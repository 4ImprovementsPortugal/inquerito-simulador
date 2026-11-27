/* Nº5 Clara | PostHog (nuvem da UE): como as pessoas usam o simulador, para afinar a mensagem.
   O simulador não tem painel de cookies, por isso conta sempre de forma anónima: sem cookies, sem nada guardado no
   navegador e sem gravações (cookieless on_reject, sempre «rejeitado»). No projeto do PostHog tem de estar ligado o
   modo «cookieless server hash», senão os eventos anónimos são descartados.
   O GitHub Pages não faz de intermediário: os pedidos vão diretos ao PostHog da UE.
   A chave phc_ é pública por desenho (só permite enviar eventos). Nunca ponhas aqui uma chave pessoal (phx_).
   Não liga em testes locais nem no GitHub Pages.
   Expõe window.N5Analytics.track(evento, propriedades). */
(() => {
  'use strict';
  const TOKEN = 'phc_knF2fZccBcGVgHcayHbPfcYfXguFx3jzxaBksdduz9R3';
  const HOST = 'https://eu.i.posthog.com';
  const FICHEIROS = 'https://eu-assets.i.posthog.com';
  const LOCAIS = ['', 'localhost', '127.0.0.1'];

  const fila = [];
  let ph = null;

  const ligado = !LOCAIS.includes(window.location.hostname) && !window.location.hostname.endsWith('.github.io');

  function aplicar() {
    if (!ph) return;
    ph.opt_out_capturing(); // modo anónimo, sem cookies
    for (const [nome, props] of fila.splice(0)) ph.capture(nome, props);
  }

  window.N5Analytics = {
    track(nome, props = {}) {
      if (!ligado) return;
      if (ph) ph.capture(nome, props);
      else fila.push([nome, props]);
    },
  };
  if (!ligado) return;

  function carregar() {
    const s = document.createElement('script');
    s.async = true;
    s.src = FICHEIROS + '/static/array.js';
    s.onload = () => {
      if (!window.posthog || typeof window.posthog.init !== 'function') return;
      window.posthog.init(TOKEN, {
        api_host: HOST,
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-08-30',
        cookieless_mode: 'on_reject',
        person_profiles: 'identified_only',
        capture_pageleave: true,
        disable_session_recording: true,
      });
      ph = window.posthog;
      aplicar();
    };
    s.onerror = () => { /* sem PostHog a página continua igual */ };
    document.head.appendChild(s);
  }

  // só depois de a página carregar, para não atrasar quem chega pelo anúncio
  if (document.readyState === 'complete') carregar();
  else window.addEventListener('load', carregar, { once: true });
})();
