/* webhook de entrada do workflow do GHL: leva o contacto, as respostas por extenso, o resultado e o plano.
   É chamado pelo navegador (app.js), para funcionar também sem funções de servidor. O endereço só aceita dados;
   não é uma chave. Como fica visível no código, o workflow deve tratar o que chega como não verificado.
   Seguem todas as respostas: «adequada: false» identifica quem a Clara não serve (sem ofertas para essas pessoas). */
import { PERGUNTAS, limparRespostas, rotulo, planoDoConsultor, adequada } from './inquerito.js?v=16'

export const WEBHOOK_SIMULADOR = 'https://services.leadconnectorhq.com/hooks/edKb7bpIXSA838eQDrMd/webhook-trigger/2715a2be-e5c4-4eb4-a92c-d37b948b6694'

export function corpoWebhook(dados = {}) {
  const r = limparRespostas(dados.respostas || {})
  const legiveis = {}
  for (const p of PERGUNTAS) {
    const v = r[p.id]
    legiveis[p.id] = v === undefined ? '' : Array.isArray(v) ? v.map(x => rotulo(p.id, x) || x).join('; ') : p.tipo === 'texto' ? v : (rotulo(p.id, v) || v)
  }
  const serve = adequada(r)
  return {
    nome: String(dados.nome || '').trim(),
    email: String(dados.email || '').trim(),
    telefone: String(dados.telefone || '').trim(),
    ...legiveis,
    adequada: serve,
    resultado: serve ? 'adequada' : 'nao-adequada',
    plano_recomendado: serve ? planoDoConsultor(r).nomePlano : '',
    consentimento: true,
    consentimento_meta: dados.consentimentoMeta === true,
    origem: dados.origem || '',
    pagina: dados.pagina || '',
    event_id: dados.event_id || '',
    teste: dados.teste === true,
    timestamp: new Date().toISOString(),
  }
}
