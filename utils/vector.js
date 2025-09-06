import { Index } from '@upstash/vector'
const idx = new Index({ url: process.env.UPSTASH_VECTOR_REST_URL, token: process.env.UPSTASH_VECTOR_REST_TOKEN })
const namespace = process.env.UPSTASH_VECTOR_NAMESPACE || 'pdfqa'
export async function upsertVectors(vectors){
  // vectors: [{id, vector, metadata}]
  await idx.upsert(vectors, { namespace })
}
export async function queryVectors(vector, docId, topK=6){
  const res = await idx.query({
    vector,
    topK,
    includeMetadata: true,
    filter: `docId = '${docId}'`
  }, { namespace })
  return res || []
}
