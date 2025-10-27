import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { getDocuments } from '@/lib/actions'

export async function GET() {
  try {
    const documents = await getDocuments()
    return NextResponse.json({ 
      success: true, 
      documents,
      count: documents.length 
    })
  } catch (error) {
    console.error('Error testing documents:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
