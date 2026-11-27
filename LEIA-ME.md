# Nº5 Clara | Simulador «A Clara é para ti?»

Publicado em **https://simulador.numerocinco.pt** com **GitHub Pages** (ramo `main`, ficheiro `CNAME`).
DNS de `numerocinco.pt`: registo `CNAME` `simulador` para `4improvementsportugal.github.io`.

## Regra

A Clara **não** é para quem responde «Menos de 2 anos» como consultor imobiliário. A regra está em `adequada()`, em `js/inquerito.js`.

## Envio

O navegador envia cada resposta para o webhook do GHL definido em `js/webhook.js` (não em `localhost`). É o único envio:
**o email do voucher tem de ser feito pelo workflow do GHL**, só quando `adequada` é `true`.
O repositório e o endereço do webhook são públicos: o workflow deve tratar o que chega como não verificado.

## Medição

- Meta Pixel: só carrega se a pessoa marcar a autorização no formulário (`pixel.js`).
- PostHog: contagem anónima, sem cookies (`posthog.js`).

## Correr localmente

```bash
python -m http.server 8080
```

## Ficheiros não usados

`netlify/` e `netlify.toml` são do envio pela Netlify (GHL e email do voucher). No GitHub Pages não correm.
