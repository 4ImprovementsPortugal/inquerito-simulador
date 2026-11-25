import { enviarParaGhl } from '../ghl.js'
import { codigoVoucher, enviarEmailVoucher } from '../voucher.js'
import { enviarWebhookInquerito } from '../webhook.js'
import { lerRespostas, adequada } from '../../js/inquerito.js'

/* corre a cada inscrição válida do formulário «simulador-clara» (Netlify Forms; o spam fica de fora).
   - A Clara serve a pessoa: contacto no GHL, email com o voucher e o plano e, se configurado, o webhook do workflow.
   - Não serve (menos de 2 anos): só o contacto no GHL com a etiqueta «simulador-nao-adequado». Sem voucher, email ou webhook.
   Precisa das variáveis GHL_TOKEN e GHL_LOCATION_ID (Netlify > Site configuration > Environment variables).
   O token do GHL precisa também de conversations/message.write, e numerocinco.pt tem de ser domínio de envio no GHL. */
export const handler = async event => {
  let payload
  try {
    payload = JSON.parse(event.body).payload
  } catch (e) {
    console.error('inscrição ilegível:', e.message)
    return { statusCode: 200 }
  }
  if (payload.form_name !== 'simulador-clara') return { statusCode: 200 }

  const serve = adequada(lerRespostas(payload.data?.respostas))
  const { GHL_TOKEN: token, GHL_LOCATION_ID: localizacao, GHL_WEBHOOK_SIMULADOR: webhook } = process.env

  /* webhook do workflow do GHL (opcional): o endereço fica só na variável GHL_WEBHOOK_SIMULADOR, nunca no código */
  if (serve && webhook) {
    try {
      const r = await enviarWebhookInquerito({ dados: payload.data, url: webhook })
      console.log('webhook GHL simulador', r.ok ? 'enviado' : `falhou (${r.estado})`)
    } catch (e) {
      console.error('webhook GHL falhou:', e.message)
    }
  }

  if (!token || !localizacao) {
    console.log('GHL por configurar: falta GHL_TOKEN ou GHL_LOCATION_ID')
    return { statusCode: 200 }
  }

  try {
    const dados = { ...payload.data, voucher: serve ? codigoVoucher(payload.data?.email) : '' }
    const r = await enviarParaGhl({ dados, token, localizacao })
    console.log('GHL simulador-clara', r.ok ? `contacto atualizado (${serve ? 'adequado' : 'não adequado'})` : r.motivo)
    /* o voucher e o plano seguem por email só para quem a Clara serve */
    if (r.ok && serve) {
      try {
        await enviarEmailVoucher({ contactId: r.id, nome: dados.nome, email: dados.email, respostas: dados.respostas, teste: dados.teste === '1', passaCodigo: dados.codigo, token })
        console.log('GHL simulador-clara: email do voucher enviado')
      } catch (e) {
        console.error('email do voucher falhou:', e.message)
      }
    }
  } catch (e) {
    console.error('GHL falhou:', e.message)
  }
  return { statusCode: 200 }
}
