import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/settings
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar alınırken hata oluştu' }, { status: 500 })
  }
}

// PUT /api/settings
export async function PUT(request) {
  try {
    const body = await request.json()
    const { dolar_kuru, liste_a_kar_orani, liste_b_kar_orani, liste_c_kar_orani } = body

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({
        dolar_kuru,
        liste_a_kar_orani,
        liste_b_kar_orani,
        liste_c_kar_orani,
      })
      .eq('id', 1)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar güncellenirken hata oluştu' }, { status: 500 })
  }
}
