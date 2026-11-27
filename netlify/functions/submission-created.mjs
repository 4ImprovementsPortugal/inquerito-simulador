import { enviarParaGhl } from '../ghl.js'
import { codigoVoucher, enviarEmailVoucher } from '../voucher.js'
import { lerRespostas, adequada } from '../../js/inquerito.js'
import { dadosUtilizador, enviarEvento } from '../meta-capi.js'

/* API de Conversões: o mesmo Lead que o pixel envia no navegador, agora também pelo servidor (com o mesmo event_id, a Meta junta os dois).
   Só para quem a Clara serve e só com a autorização para a Meta marcada no formulário. A Netlify junta ip e user_agent a cada inscrição. */
export async function enviarLeadSimulador(payload, opcoes) {
  const d = payload?.data || {}
  if (d.teste === '1') return { ok: false, motivo: 'inscrição de teste interno' }
  if (d.consentimento_meta !== 'sim') return { ok: false, motivo: 'sem autorização para a Meta' }
  if (!adequada(lerRespostas(d.respostas))) return { ok: false, motivo: 'a Clara não serve (não conta como Lead)' }
  return enviarEvento({
    event_name: 'Lead',
    event_time: Math.floor(Date.parse(payload.created_at || '') / 1000) || Math.floor(Date.now() / 1000),
    event_id: d.event_id || undefined,
    action_source: 'website',
    event_source_url: d.pagina || undefined,
    user_data: dadosUtilizador({ email: d.email, telefone: d.telefone, nome: d.nome, ip: d.ip || payload.ip, ua: d.user_agent || payload.user_agent, fbc: d.fbc }),
    custom_data: { content_name: 'Simulador Nº5 Clara' },
  }, opcoes)
}

/* corre a cada inscrição válida do formulário «simulador-clara» (Netlify Forms; o spam fica de fora).
   - A Clara serve a pessoa: contacto no GHL, email com o voucher e o plano.
   - Não serve (menos de 2 anos): só o contacto no GHL com a etiqueta «simulador-nao-adequado». Sem voucher nem email.
   O webhook do GHL é chamado pelo navegador (js/webhook.js).
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

  try {
    const r = await enviarLeadSimulador(payload)
    console.log('Meta CAPI Lead simulador:', r.ok ? 'enviado' : r.motivo || `falhou (${r.estado}) ${JSON.stringify(r.resposta)}`)
  } catch (e) {
    console.error('Meta CAPI falhou:', e.message)
  }
  const { GHL_TOKEN: token, GHL_LOCATION_ID: localizacao } = process.env

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
