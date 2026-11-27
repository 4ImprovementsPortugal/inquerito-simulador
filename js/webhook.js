/* webhook de entrada do workflow do GHL: leva o contacto, as respostas por extenso, o resultado e o plano.
   É chamado pelo navegador (app.js), para funcionar também sem funções de servidor. O endereço só aceita dados;
   não é uma chave. Como fica visível no código, o workflow deve tratar o que chega como não verificado.
   Todas as pessoas são qualificadas: «adequada» vai sempre true (o campo fica para o mapeamento no GHL). */
import { PERGUNTAS, limparRespostas, rotulo, planoDoConsultor } from './inquerito.js?v=19'

export const WEBHOOK_SIMULADOR = 'https://services.leadconnectorhq.com/hooks/edKb7bpIXSA838eQDrMd/webhook-trigger/nD6cJPysZyhBuVKPsA3R'

export function corpoWebhook(dados = {}) {
  const r = limparRespostas(dados.respostas || {})
  const legiveis = {}
  for (const p of PERGUNTAS) {
    const v = r[p.id]
    legiveis[p.id] = v === undefined ? '' : Array.isArray(v) ? v.map(x => rotulo(p.id, x) || x).join('; ') : p.tipo === 'texto' ? v : (rotulo(p.id, v) || v)
  }
  return {
    nome: String(dados.nome || '').trim(),
    email: String(dados.email || '').trim(),
    telefone: String(dados.telefone || '').trim(),
    ...legiveis,
    adequada: true,
    resultado: 'adequada',
    plano_recomendado: planoDoConsultor(r).nomePlano,
    consentimento: true,
    consentimento_meta: dados.consentimentoMeta === true,
    origem: dados.origem || '',
    pagina: dados.pagina || '',
    event_id: dados.event_id || '',
    teste: dados.teste === true,
    timestamp: new Date().toISOString(),
  }
}
