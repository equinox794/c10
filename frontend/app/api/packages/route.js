import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/packages
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .is('deleted_at', null)
      .order('size', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Ambalajlar alınırken hata oluştu' }, { status: 500 })
  }
}

// POST /api/packages
export async function POST(request) {
  try {
    const body = await request.json()
    const { size, unit, price } = body

    if (!size || !unit || price === undefined) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('packages')
      .insert([{ size, unit, price }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Ambalaj eklenirken hata oluştu' }, { status: 500 })
  }
}
