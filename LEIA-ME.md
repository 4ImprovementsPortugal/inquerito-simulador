# Nº5 Clara | Simulador «A Clara é para ti?»

Versão do inquérito em forma de simulador: 6 perguntas e um resultado.

## Regra

A Clara **não** é para quem responde «Menos de 2 anos» como consultor imobiliário. Em todos os outros casos é.
A regra está num só sítio: `adequada()` em `js/inquerito.js`, usada pela página e pelo servidor.

| Resultado | Ecrã | GHL | Email com voucher | Webhook | Lead no pixel |
|---|---|---|---|---|---|
| É para ti | plano, 15 dias, Passa a Clara | `simulador-adequado`, `voucher-clara-15-dias`, `plano-…` | sim | sim (se configurado) | sim |
| Não é para ti | explicação, sem voucher | `simulador-nao-adequado` | não | não | não |

## Publicar (Netlify)

1. Criar um site novo a partir deste repositório (o `netlify.toml` já está configurado, sem build).
2. Variáveis de ambiente: `GHL_TOKEN` e `GHL_LOCATION_ID`. **Não marcar o `GHL_LOCATION_ID` como segredo:** o endereço do webhook em `js/webhook.js` contém esse id e a Netlify bloquearia o build.
3. Confirmar em **Forms** que aparece `simulador-clara` (ativar a deteção de formulários e voltar a publicar, se preciso).
4. Quando houver domínio, pôr em `index.html` o `og:url`, o `canonical` e o `og:image` com endereço completo.

## Meta: pixel e API de Conversões

- O **pixel** (`2995898050758755`, em `pixel.js`) só carrega quando a pessoa marca a autorização para a Meta no último passo e a Clara é para ela. No GitHub Pages fica desligado (pré-visualização).
- A **API de Conversões** (`netlify/meta-capi.js`, chamada em `netlify/functions/submission-created.mjs`) envia o mesmo **Lead** pelo servidor, com o mesmo `event_id` do pixel. A Meta junta os dois. Segue as mesmas regras: só adequados, só com a autorização marcada e nunca nas inscrições de teste.
- Variáveis na Netlify:
  - `META_CAPI_TOKEN`: token gerado em Gestor de Eventos > pixel N5 CLARA > Definições > API de Conversões (obrigatório);
  - `META_TEST_EVENT_CODE`: código de «Testar eventos», só durante os testes. Apagar depois.
- Teste: fazer o simulador com uma resposta adequada e a caixa da Meta marcada. Em Testar eventos deve aparecer um Lead do navegador e do servidor, desduplicado. Os registos da função mostram «Meta CAPI Lead simulador: enviado» ou o motivo de não enviar.

## Correr localmente

```bash
python -m http.server 8080
```

Em local nada é enviado; o percurso segue para a página de resultado.

## Por rever

`termos.html` vem do inquérito e ainda não fala do simulador. A `privacidade.html` foi revista a 27/11 para o simulador (pontos 5, 6 e 8: sem painel de cookies e com a autorização para a Meta no formulário); falta validação legal.

## Webhook do GHL

O navegador envia todas as respostas para o webhook definido em `js/webhook.js`, também no GitHub Pages (não em `localhost`).
O campo `adequada` diz se a Clara serve a pessoa: o workflow não deve enviar ofertas quando é `false`.
