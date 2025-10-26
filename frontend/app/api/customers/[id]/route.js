import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/customers/:id - Get a single customer
export async function GET(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Müşteri bulunamadı' },
          { status: 404 }
        )
      }
      console.error(`GET /api/customers/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`GET /api/customers/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Müşteri alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/:id - Update a customer
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, type, phone, email, address, balance } = body

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'İsim ve tip zorunludur' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    // Check for duplicate name (excluding current customer)
    const { data: duplicate } = await supabaseAdmin
      .from('customers')
      .select('id')
      .ilike('name', name)
      .neq('id', id)
      .is('deleted_at', null)
      .limit(1)

    if (duplicate && duplicate.length > 0) {
      return NextResponse.json(
        { error: 'Bu isimde başka bir müşteri mevcut' },
        { status: 409 }
      )
    }

    // Update customer
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({
        name,
        type,
        phone: phone || null,
        email: email || null,
        address: address || null,
        balance: balance !== undefined ? balance : existing.balance,
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error(`PUT /api/customers/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error(`PUT /api/customers/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Müşteri güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/:id - Soft delete a customer
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Soft delete
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()

    if (error) {
      console.error(`DELETE /api/customers/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Müşteri silindi' })
  } catch (error) {
    console.error(`DELETE /api/customers/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Müşteri silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
