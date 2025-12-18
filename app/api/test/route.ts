import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test 1: Can we import the module?
    console.log('Test 1: Importing db module...')
    const dbModule = await import('@/lib/db')
    console.log('✅ db module imported successfully')

    // Test 2: Can we access configOperations?
    console.log('Test 2: Accessing configOperations...')
    const { configOperations } = dbModule
    console.log('✅ configOperations accessed')

    // Test 3: Can we query the database?
    console.log('Test 3: Querying admin password...')
    const result = configOperations.getAdminPassword.get() as any
    console.log('✅ Query executed, result:', result)

    return NextResponse.json({
      success: true,
      message: '数据库测试成功',
      result,
    })
  }
  catch (error: any) {
    console.error('❌ Database test error:', error)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      {
        success: false,
        message: '数据库测试失败',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
