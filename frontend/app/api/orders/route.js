import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/orders
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers(id, name),
        recipe:recipes(id, name)
      `)
      .order('order_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Siparişler alınırken hata oluştu' }, { status: 500 })
  }
}

// POST /api/orders
export async function POST(request) {
  try {
    const body = await request.json()
    const { customer_id, recipe_id, quantity, total_price, status, notes } = body

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        customer_id,
        recipe_id,
        quantity,
        total_price,
        status: status || 'Beklemede',
        notes
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Sipariş oluşturulurken hata oluştu' }, { status: 500 })
  }
}
