import { openai } from '../../utils/openai'
import { queryVectors } from '../../utils/vector'
import { verifySession } from '../../utils/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const ok = verifySession(req)
  if (!ok) return res.status(401).json({ error: 'Unauthorized' })
  const { question, docId } = req.body || {}
  if (!question || !docId) return res.status(400).json({ error: 'question and docId required' })
  try {
    const q = await openai.embeddings.create({ model: process.env.OPENAI_EMBED_MODEL, input: question })
    const qvec = q.data[0].embedding
    const results = await queryVectors(qvec, docId, Number(process.env.UPSTASH_VECTOR_TOP_K || 6))
    const contexts = results.map(r => r.metadata?.text).filter(Boolean).join('\n\n')
    const prompt = `Context:\n${contexts}\n\nQuestion: ${question}\nAnswer concisely using the context. If not found, say you don't know.`
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    })
    const answer = completion.choices[0]?.message?.content || ''
    return res.json({ answer })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message || 'ask error' })
  }
}
