import formidable from 'formidable'
import fs from 'fs'
import pdf from 'pdf-parse'
import { v4 as uuidv4 } from 'uuid'
import { openai } from '../../utils/openai'
import { upsertVectors } from '../../utils/vector'
import { verifySession } from '../../utils/auth'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  // verify auth
  const ok = verifySession(req)
  if (!ok) return res.status(401).json({ error: 'Unauthorized' })

    const form = formidable();
    form.parse(req, async (err, fields, files) => {
  try {
    if (err) throw err;
    const f = Array.isArray(files.file) ? files.file[0] : files.file;


    if (!f) return res.status(400).json({ error: 'file required' });

    // FIXED: use f.filepath instead of files.file.filepath
    const buffer = fs.readFileSync(f.filepath);
      const data = await pdf(buffer)
      const text = data.text || ''
      if (!text) return res.status(400).json({ error: 'no text extracted' })
      const chunks = chunkText(text, 1200, 150)
      const embeddingRes = await openai.embeddings.create({ model: process.env.OPENAI_EMBED_MODEL, input: chunks })
      const docId = uuidv4()
      const vectors = embeddingRes.data.map((d, i) => ({
        id: `${docId}::${i}`,
        vector: d.embedding,
        metadata: { docId, index: i, text: chunks[i].slice(0,300) }
      }))
      await upsertVectors(vectors)
      return res.json({ ok:true, docId, chunks: chunks.length })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: e.message || 'upload error' })
    }
  })
}

function chunkText(text, chunkSize=1200, overlap=150){
  const chunks=[]
  let i=0
  while(i < text.length){
    const end = Math.min(text.length, i+chunkSize)
    chunks.push(text.slice(i,end))
    if(end === text.length) break
    i = end - overlap
  }
  return chunks
}
