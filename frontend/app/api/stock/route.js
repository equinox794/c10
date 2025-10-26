import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/stock - Get all stock items with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    let query = supabaseAdmin
      .from('stock')
      .select('*')
      .is('deleted_at', null)
      .order('id', { ascending: false })

    // Search by name or code
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('GET /api/stock error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/stock exception:', error)
    return NextResponse.json(
      { error: 'Stok listesi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/stock - Create a new stock item
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, code, quantity, min_quantity, cost, price, unit, category } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'İsim zorunludur' },
        { status: 400 }
      )
    }

    // Check for duplicate code (if provided)
    if (code) {
      const { data: existing } = await supabaseAdmin
        .from('stock')
        .select('id')
        .eq('code', code)
        .is('deleted_at', null)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: 'Bu koda sahip bir stok kalemi zaten mevcut' },
          { status: 409 }
        )
      }
    }

    // Insert new stock item
    const { data, error } = await supabaseAdmin
      .from('stock')
      .insert([
        {
          name,
          code: code || null,
          quantity: quantity || 0,
          min_quantity: min_quantity || 0,
          cost: cost || 0,
          price: price || 0,
          unit: unit || 'kg',
          category: category || 'hammadde',
        },
      ])
      .select()

    if (error) {
      console.error('POST /api/stock error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/stock exception:', error)
    return NextResponse.json(
      { error: 'Stok kalemi eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
