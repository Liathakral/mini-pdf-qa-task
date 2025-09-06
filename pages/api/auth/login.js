import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body || {}
  const APP_PASSWORD = process.env.APP_PASSWORD || ''
  if (!password || password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = jwt.sign({ ok: true }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })
  res.setHeader('Set-Cookie', serialize('session', token, { httpOnly:true, path:'/' }))
  return res.json({ ok: true })
}
