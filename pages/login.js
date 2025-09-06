'use client'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setErr('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'content-type':'application/json'},
      body: JSON.stringify({password})
    })
    const j = await res.json()
    if (!res.ok) {
      setErr(j.error || 'Login failed')
      return
    }
    router.push('/')
  }

  return (
    <div style={{maxWidth:600, margin:'40px auto', padding:20}}>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" style={{width:'100%', padding:8}} />
        <div style={{marginTop:10}}>
          <button type="submit">Login</button>
        </div>
      </form>
      {err && <p style={{color:'red'}}>{err}</p>}
    </div>
  )
}
