import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database file path
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'dify.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Create database connection
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL') // Enable WAL mode for better concurrency
db.pragma('synchronous = NORMAL') // Better performance
db.pragma('foreign_keys = ON') // Enable foreign key constraints

// Initialize database schema FIRST
function initializeDatabase() {
  // Check if tables exist
  const tablesExist = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name IN ('users', 'courses', 'user_sessions', 'admin_sessions', 'admin_config', 'chat_history')
  `).all()

  if (tablesExist.length === 0) {
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'lib', 'migrations', '001_initial_schema.sql')
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8')
      db.exec(schema)
      console.log('✅ Database initialized with schema')
    }
    else {
      console.error('❌ Schema file not found:', schemaPath)
    }
  }
}

// Initialize database BEFORE preparing statements
initializeDatabase()

// User operations
export const userOperations = {
  // Get all users
  getAll: db.prepare('SELECT * FROM users ORDER BY created_at DESC'),

  // Get user by student ID
  getByStudentId: db.prepare('SELECT * FROM users WHERE student_id = ?'),

  // Find user by student ID and name (for login)
  findByCredentials: db.prepare('SELECT * FROM users WHERE student_id = ? AND name = ?'),

  // Insert new user
  create: db.prepare(`
    INSERT INTO users (student_id, name, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `),

  // Update user
  update: db.prepare(`
    UPDATE users
    SET name = ?, updated_at = datetime('now')
    WHERE student_id = ?
  `),

  // Delete user
  delete: db.prepare('DELETE FROM users WHERE student_id = ?'),

  // Bulk insert users (for CSV import)
  createMany: db.transaction((users: Array<{ studentId: string, name: string }>) => {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO users (student_id, name, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `)

    for (const user of users) {
      insert.run(user.studentId, user.name)
    }
  }),
}

// Course operations
export const courseOperations = {
  // Get all courses
  getAll: db.prepare('SELECT * FROM courses ORDER BY created_at DESC'),

  // Get course by course ID
  getByCourseId: db.prepare('SELECT * FROM courses WHERE course_id = ?'),

  // Insert new course
  create: db.prepare(`
    INSERT INTO courses (course_id, course_name, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `),

  // Update course
  update: db.prepare(`
    UPDATE courses
    SET course_name = ?, updated_at = datetime('now')
    WHERE course_id = ?
  `),

  // Delete course
  delete: db.prepare('DELETE FROM courses WHERE course_id = ?'),

  // Bulk insert courses (for CSV import)
  createMany: db.transaction((courses: Array<{ courseId: string, courseName?: string }>) => {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO courses (course_id, course_name, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `)

    for (const course of courses) {
      insert.run(course.courseId, course.courseName || course.courseId)
    }
  }),
}

// User session operations
export const sessionOperations = {
  // Create new user session
  createUserSession: db.prepare(`
    INSERT INTO user_sessions (session_token, student_id, course_id, name, login_at, expires_at)
    VALUES (?, ?, ?, ?, datetime('now'), ?)
  `),

  // Get user session by token
  getUserSession: db.prepare(`
    SELECT s.*, u.student_id as user_student_id, c.course_id as course_course_id
    FROM user_sessions s
    LEFT JOIN users u ON s.student_id = u.student_id
    LEFT JOIN courses c ON s.course_id = c.course_id
    WHERE s.session_token = ? AND s.expires_at > datetime('now')
  `),

  // Delete user session
  deleteUserSession: db.prepare('DELETE FROM user_sessions WHERE session_token = ?'),

  // Clean expired user sessions
  cleanExpiredUserSessions: db.prepare('DELETE FROM user_sessions WHERE expires_at <= datetime(\'now\')'),

  // Create admin session
  createAdminSession: db.prepare(`
    INSERT INTO admin_sessions (session_token, is_admin, login_at, expires_at)
    VALUES (?, 1, datetime('now'), ?)
  `),

  // Get admin session by token
  getAdminSession: db.prepare(`
    SELECT * FROM admin_sessions
    WHERE session_token = ? AND expires_at > datetime('now')
  `),

  // Delete admin session
  deleteAdminSession: db.prepare('DELETE FROM admin_sessions WHERE session_token = ?'),

  // Clean expired admin sessions
  cleanExpiredAdminSessions: db.prepare('DELETE FROM admin_sessions WHERE expires_at <= datetime(\'now\')'),
}

// Admin config operations
export const configOperations = {
  // Get admin password
  getAdminPassword: db.prepare('SELECT value FROM admin_config WHERE key = \'admin_password\''),

  // Update admin password
  setAdminPassword: db.prepare(`
    INSERT OR REPLACE INTO admin_config (key, value, updated_at)
    VALUES ('admin_password', ?, datetime('now'))
  `),
}

// Chat history operations
export const chatOperations = {
  // Insert chat message
  create: db.prepare(`
    INSERT INTO chat_history (student_id, course_id, conversation_id, message_id, message_type, content, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `),

  // Get chat history for specific user
  getByUser: db.prepare(`
    SELECT * FROM chat_history
    WHERE student_id = ? AND course_id = ?
    ORDER BY created_at DESC
  `),

  // Get chat history for specific conversation
  getByConversation: db.prepare(`
    SELECT * FROM chat_history
    WHERE student_id = ? AND course_id = ? AND conversation_id = ?
    ORDER BY created_at ASC
  `),

  // Get all chat history (for admin export)
  getAll: db.prepare(`
    SELECT ch.*, u.name as user_name
    FROM chat_history ch
    LEFT JOIN users u ON ch.student_id = u.student_id
    ORDER BY ch.created_at DESC
  `),

  // Get chat statistics
  getStatistics: db.prepare(`
    SELECT
      COUNT(DISTINCT student_id || '-' || course_id) as total_users,
      COUNT(DISTINCT conversation_id) as total_conversations,
      COUNT(*) as total_messages,
      DATE(created_at) as date,
      COUNT(*) as daily_messages
    FROM chat_history
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `),

  // Get user activity statistics
  getUserActivity: db.prepare(`
    SELECT
      ch.student_id,
      ch.course_id,
      u.name,
      COUNT(DISTINCT ch.conversation_id) as conversation_count,
      COUNT(*) as message_count,
      MAX(ch.created_at) as last_activity
    FROM chat_history ch
    LEFT JOIN users u ON ch.student_id = u.student_id
    GROUP BY ch.student_id, ch.course_id, u.name
    ORDER BY conversation_count DESC, message_count DESC
  `),
}

// Utility functions
export const utils = {
  // Clean all expired sessions
  cleanExpiredSessions: () => {
    sessionOperations.cleanExpiredUserSessions.run()
    sessionOperations.cleanExpiredAdminSessions.run()
  },

  // Get database info
  getDatabaseInfo: () => {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number }
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM user_sessions WHERE expires_at > datetime(\'now\')').get() as { count: number }
    const chatCount = db.prepare('SELECT COUNT(*) as count FROM chat_history').get() as { count: number }

    return {
      users: userCount.count,
      courses: courseCount.count,
      activeSessions: sessionCount.count,
      chatMessages: chatCount.count,
      databasePath: DB_PATH,
    }
  },

  // Close database connection (for cleanup)
  close: () => {
    db.close()
  },
}

// Export the database instance for advanced operations
export default db
