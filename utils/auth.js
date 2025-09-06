import jwt from 'jsonwebtoken'
import { parse } from 'cookie'
export function verifySession(req){
  try {
    const cookie = req.headers.cookie || ''
    const c = parse(cookie || '')
    const token = c.session
    if (!token) return false
    jwt.verify(token, process.env.JWT_SECRET || 'secret')
    return true
  } catch {
    return false
  }
}
