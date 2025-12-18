import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { courseOperations } from '@/lib/db'

// GET all courses
export async function GET() {
  try {
    const courses = courseOperations.getAll.all()

    return NextResponse.json({
      success: true,
      courses,
    })
  }
  catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { success: false, message: '获取课程列表失败' },
      { status: 500 },
    )
  }
}

// POST - Create new course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, courseName } = body

    // Validate input
    if (!courseId) {
      return NextResponse.json(
        { success: false, message: '课程号不能为空' },
        { status: 400 },
      )
    }

    // Check if course already exists
    const existing = courseOperations.getByCourseId.get(courseId)

    if (existing) {
      return NextResponse.json(
        { success: false, message: '该课程号已存在' },
        { status: 409 },
      )
    }

    // Create course
    courseOperations.create.run(courseId, courseName || courseId)

    return NextResponse.json({
      success: true,
      message: '添加课程成功',
    })
  }
  catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json(
      { success: false, message: '添加课程失败' },
      { status: 500 },
    )
  }
}

// DELETE all courses (admin only - for testing/reset)
export async function DELETE() {
  try {
    // This would delete all courses - implement only if needed
    return NextResponse.json(
      { success: false, message: '批量删除功能未实现' },
      { status: 501 },
    )
  }
  catch (error) {
    console.error('Delete all courses error:', error)
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 },
    )
  }
}
