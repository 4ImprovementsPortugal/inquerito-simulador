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

## Correr localmente

```bash
python -m http.server 8080
```

Em local nada é enviado; o percurso segue para a página de resultado.

## Por rever

`privacidade.html` e `termos.html` vêm do inquérito e ainda não falam do simulador.

## Webhook do GHL

O navegador envia todas as respostas para o webhook definido em `js/webhook.js`, também no GitHub Pages (não em `localhost`).
O campo `adequada` diz se a Clara serve a pessoa: o workflow não deve enviar ofertas quando é `false`.
