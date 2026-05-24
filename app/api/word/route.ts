import { NextResponse } from 'next/server'
import { assignReaderWord } from '@/lib/store'

export async function GET() {
  const word = await assignReaderWord()
  return NextResponse.json({ word })
}
