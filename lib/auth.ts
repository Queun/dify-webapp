import { randomBytes } from 'crypto'

// Token expiration times (in milliseconds)
const USER_SESSION_EXPIRES_IN = 30 * 24 * 60 * 60 * 1000 // 30 days
const ADMIN_SESSION_EXPIRES_IN = 12 * 60 * 60 * 1000 // 12 hours

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

// Generate random session token (no JWT, just random hex)
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Create user session token
export async function createUserSessionToken(studentId: string, courseId: string, name: string) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + USER_SESSION_EXPIRES_IN).toISOString()

  return {
    token,
    expiresAt,
    payload: {
      type: 'user' as const,
      studentId,
      courseId,
      name,
    },
  }
}

// Create admin session token
export async function createAdminSessionToken() {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_EXPIRES_IN).toISOString()

  return {
    token,
    expiresAt,
    payload: {
      type: 'admin' as const,
      isAdmin: true,
    },
  }
}
