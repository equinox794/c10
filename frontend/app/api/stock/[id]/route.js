import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/stock/:id - Get a single stock item
export async function GET(request, { params }) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin
      .from('stock')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Stok kalemi bulunamadı' },
          { status: 404 }
        )
      }
      console.error(`GET /api/stock/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`GET /api/stock/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Stok kalemi alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// PUT /api/stock/:id - Update a stock item
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, code, quantity, min_quantity, cost, price, unit, category } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'İsim zorunludur' },
        { status: 400 }
      )
    }

    // Get current stock item
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('stock')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Stok kalemi bulunamadı' },
        { status: 404 }
      )
    }

    // Check for duplicate code (excluding current item)
    if (code && code !== existing.code) {
      const { data: duplicate } = await supabaseAdmin
        .from('stock')
        .select('id')
        .eq('code', code)
        .neq('id', id)
        .is('deleted_at', null)
        .limit(1)

      if (duplicate && duplicate.length > 0) {
        return NextResponse.json(
          { error: 'Bu koda sahip başka bir stok kalemi mevcut' },
          { status: 409 }
        )
      }
    }

    // If price changed, record price history
    const priceChanged = price !== undefined && price !== existing.price

    // Update stock item
    const { data, error } = await supabaseAdmin
      .from('stock')
      .update({
        name,
        code: code || null,
        quantity: quantity !== undefined ? quantity : existing.quantity,
        min_quantity: min_quantity !== undefined ? min_quantity : existing.min_quantity,
        cost: cost !== undefined ? cost : existing.cost,
        price: price !== undefined ? price : existing.price,
        unit: unit || existing.unit,
        category: category || existing.category,
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error(`PUT /api/stock/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Record price change history
    if (priceChanged) {
      await supabaseAdmin
        .from('stock_price_history')
        .insert([
          {
            stock_id: id,
            old_price: existing.price,
            new_price: price,
            changed_at: new Date().toISOString(),
          },
        ])
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error(`PUT /api/stock/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Stok kalemi güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE /api/stock/:id - Soft delete a stock item
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Soft delete
    const { data, error } = await supabaseAdmin
      .from('stock')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()

    if (error) {
      console.error(`DELETE /api/stock/${id} error:`, error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Stok kalemi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Stok kalemi silindi' })
  } catch (error) {
    console.error(`DELETE /api/stock/${params.id} exception:`, error)
    return NextResponse.json(
      { error: 'Stok kalemi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
