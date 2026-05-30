import { NextRequest, NextResponse } from 'next/server'
import { addSubmission, getSubmissions, clearSubmissions } from '@/lib/store'

export async function POST(req: NextRequest) {
  const { intake, personalText, rating, note, readerWord, profile } = await req.json()
  await addSubmission({ intake, personalText, rating, note: note ?? '', readerWord: readerWord ?? '', profile })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const submissions = await getSubmissions()
  return NextResponse.json(submissions)
}

export async function DELETE() {
  await clearSubmissions()
  return NextResponse.json({ ok: true })
}
