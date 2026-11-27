# Nº5 Clara | Simulador «A Clara é para ti?»

Publicado em **https://simulador.numerocinco.pt** com **GitHub Pages** (ramo `main`, ficheiro `CNAME`).
DNS de `numerocinco.pt`: registo `CNAME` `simulador` para `4improvementsportugal.github.io`.

## Regra

Todas as pessoas são qualificadas: toda a gente vê «a Clara é para ti», o plano e os 15 dias.

## Envio

O navegador envia cada resposta para o webhook do GHL definido em `js/webhook.js` (não em `localhost`). É o único envio:
**o email do voucher tem de ser feito pelo workflow do GHL.**
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

## Pixel e API de Conversões da Meta

- **Pixel 2995898050758755** (`pixel.js`): só carrega quando a pessoa marca a caixa «Autorizo a Nº5 a partilhar…» e envia o simulador. Envia um `Lead` com um `eventID`.
- **API de Conversões**: o simulador está no GitHub Pages (sem servidor), por isso o mesmo `Lead` vai para a função `capi-simulador` do site do inquérito na Netlify (`https://inquerito.clara.numerocinco.pt/.netlify/functions/capi-simulador`, repositório `n5-clara-inquerito`). Leva o mesmo id, por isso a Meta conta-o uma vez. Só é chamada com a autorização marcada.
- Variáveis na Netlify (site do inquérito): `META_CAPI_TOKEN` (obrigatória) e `META_TEST_EVENT_CODE` (só durante os testes).
- A função só aceita pedidos de `https://simulador.numerocinco.pt`. Se o domínio mudar, atualizar `ORIGENS` em `netlify/functions/capi-simulador.mjs`.
