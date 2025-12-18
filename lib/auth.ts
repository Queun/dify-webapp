import { SignJWT, jwtVerify } from 'jose'

// JWT secret key (from environment variable or default)
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

// Token expiration times
const USER_SESSION_EXPIRES_IN = '30d' // 30 days for user sessions
const ADMIN_SESSION_EXPIRES_IN = '12h' // 12 hours for admin sessions

// Session types
export interface UserSessionPayload {
  type: 'user'
  studentId: string
  courseId: string
  name: string
}

export interface AdminSessionPayload {
  type: 'admin'
  isAdmin: boolean
}

export type SessionPayload = UserSessionPayload | AdminSessionPayload

// Generate JWT token
export async function generateToken(payload: SessionPayload): Promise<string> {
  const expiresIn = payload.type === 'admin' ? ADMIN_SESSION_EXPIRES_IN : USER_SESSION_EXPIRES_IN

  // Calculate expiration time
  let expirationTime: string
  if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn)
    expirationTime = `${days * 24}h`
  }
  else {
    expirationTime = expiresIn
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret)

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  }
  catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Get expiration date for database storage
export function getExpirationDate(sessionType: 'user' | 'admin'): Date {
  const expiresIn = sessionType === 'admin' ? ADMIN_SESSION_EXPIRES_IN : USER_SESSION_EXPIRES_IN

  const now = new Date()

  if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn)
    now.setDate(now.getDate() + days)
  }
  else if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn)
    now.setHours(now.getHours() + hours)
  }

  return now
}

// Format date for SQLite (ISO 8601)
export function formatDateForSQLite(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '')
}

// Helper function to generate user session token and expiration
export async function createUserSessionToken(studentId: string, courseId: string, name: string) {
  const payload: UserSessionPayload = {
    type: 'user',
    studentId,
    courseId,
    name,
  }

  const token = await generateToken(payload)
  const expiresAt = formatDateForSQLite(getExpirationDate('user'))

  return { token, expiresAt }
}

// Helper function to generate admin session token and expiration
export async function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    type: 'admin',
    isAdmin: true,
  }

  const token = await generateToken(payload)
  const expiresAt = formatDateForSQLite(getExpirationDate('admin'))

  return { token, expiresAt }
}
