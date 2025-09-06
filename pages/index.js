'use client'
import { useState } from 'react'
export default function Home() {
  const [docId, setDocId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  async function upload(e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setUploading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Upload failed')
      setDocId(j.docId)
      alert('Uploaded. docId: ' + j.docId)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
      form.reset()
    }
  }
  async function ask() {
    if (!docId || !question) return
    setAnswer('...')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify({docId, question})
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Ask failed')
      setAnswer(j.answer)
    } catch (err) {
      alert(err.message)
      setAnswer('')
    }
  }
  async function logout() {
    await fetch('/api/auth/logout', {method:'POST'})
    window.location.href = '/login'
  }
  return (
    <div style={{maxWidth:800, margin:'30px auto', padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Mini PDF Q&A</h1>
        <button onClick={logout}>Logout</button>
      </div>
      <section style={{marginTop:20}}>
        <h3>1) Upload PDF</h3>
        <form onSubmit={upload}>
          <input name="file" type="file" accept="application/pdf" required />
          <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        </form>
        {docId && <p>docId: <code>{docId}</code></p>}
      </section>
      <section style={{marginTop:20}}>
        <h3>2) Ask</h3>
        <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about the PDF" style={{width:'100%',padding:8}} />
        <div style={{marginTop:8}}>
          <button onClick={ask} disabled={!docId}>Ask</button>
        </div>
        {answer && <div style={{marginTop:12, padding:12, border:'1px solid #ddd', whiteSpace:'pre-wrap'}}>{answer}</div>}
      </section>
    </div>
  )
}
