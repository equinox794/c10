import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/packages/:id
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { size, unit, price } = body

    // Get existing package
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Ambalaj bulunamadı' }, { status: 404 })
    }

    // Record price history if changed
    const priceChanged = price !== undefined && price !== existing.price

    // Update package
    const { data, error } = await supabaseAdmin
      .from('packages')
      .update({ size, unit, price })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Record price change
    if (priceChanged) {
      await supabaseAdmin
        .from('package_price_history')
        .insert([{
          package_id: id,
          old_price: existing.price,
          new_price: price,
        }])
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: 'Ambalaj güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE /api/packages/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin
      .from('packages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Ambalaj bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Ambalaj silindi' })
  } catch (error) {
    return NextResponse.json({ error: 'Ambalaj silinirken hata oluştu' }, { status: 500 })
  }
}
