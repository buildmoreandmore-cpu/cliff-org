import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatCompletion } from '@/lib/minimax'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  try {
    let extractedText = ''
    const fileType = file.type

    if (fileType === 'application/pdf') {
      // For PDFs, read as base64 and use MiniMax to extract text
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      
      const response = await chatCompletion([{
        role: 'user',
        content: `This is a base64-encoded PDF form related to Georgia disability benefits. Extract ALL text content from it, preserving the structure (form fields, labels, sections, instructions). If you can identify the form type (SSI application, Katie Beckett, NOW/COMP, etc.), state that first.

Base64 PDF (first 50000 chars): ${base64.substring(0, 50000)}

Extract all readable text content:`,
      }])

      extractedText = response.choices[0]?.message?.content || ''
      extractedText = extractedText.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    } else if (fileType.startsWith('image/')) {
      // For images, read as base64 and use MiniMax to OCR
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${fileType};base64,${base64}`

      const response = await chatCompletion([{
        role: 'user',
        content: `This is an image of a form or document related to Georgia disability benefits. Extract ALL text content from the image, preserving structure (form fields, labels, sections, filled-in answers). If you can identify the form type, state that first.

Image (base64 data URL): ${dataUrl.substring(0, 50000)}

Extract all readable text content:`,
      }])

      extractedText = response.choices[0]?.message?.content || ''
      extractedText = extractedText.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    } else if (fileType === 'text/plain' || fileType === 'text/csv') {
      extractedText = await file.text()
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${fileType}. Upload a PDF, image, or text file.` }, { status: 400 })
    }

    return NextResponse.json({
      filename: file.name,
      type: fileType,
      size: file.size,
      extractedText: extractedText || 'Could not extract text from file.',
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload processing failed' },
      { status: 500 }
    )
  }
}
