import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/customers - Get all customers with optional filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''

    let query = supabaseAdmin
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('id', { ascending: false })

    // Search by name (case-insensitive)
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Filter by type
    if (type && type !== 'Tümü') {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('GET /api/customers error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/customers exception:', error)
    return NextResponse.json(
      { error: 'Müşteriler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, phone, email, address, balance } = body

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'İsim ve tip zorunludur' },
        { status: 400 }
      )
    }

    // Check for duplicate name (case-insensitive)
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .ilike('name', name)
      .is('deleted_at', null)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Bu isimde bir müşteri zaten mevcut' },
        { status: 409 }
      )
    }

    // Insert new customer
    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([
        {
          name,
          type,
          phone: phone || null,
          email: email || null,
          address: address || null,
          balance: balance || 0,
        },
      ])
      .select()

    if (error) {
      console.error('POST /api/customers error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/customers exception:', error)
    return NextResponse.json(
      { error: 'Müşteri eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
