import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/customers/bulk - Bulk import customers
export async function POST(request) {
  try {
    const body = await request.json()
    const { customers } = body

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli cari verisi gönderilmedi' },
        { status: 400 }
      )
    }

    // Get existing customers for duplicate check
    const { data: existingCustomers } = await supabaseAdmin
      .from('customers')
      .select('name')
      .is('deleted_at', null)

    const existingNames = new Set(
      existingCustomers?.map((c) => c.name.toLowerCase()) || []
    )

    let successCount = 0
    let updateCount = 0
    let errorCount = 0
    const duplicateNames = []
    const errors = []

    // Process each customer
    for (const customer of customers) {
      try {
        const { name, type, phone, email, address } = customer

        // Validation
        if (!name || !type) {
          errorCount++
          errors.push({ name: name || 'unknown', error: 'İsim ve tip zorunlu' })
          continue
        }

        const nameLower = name.toLowerCase()

        // Check if exists
        if (existingNames.has(nameLower)) {
          duplicateNames.push(name)
          // Update existing
          const { error } = await supabaseAdmin
            .from('customers')
            .update({
              type,
              phone: phone || null,
              email: email || null,
              address: address || null,
            })
            .ilike('name', name)
            .is('deleted_at', null)

          if (error) {
            errorCount++
            errors.push({ name, error: error.message })
          } else {
            updateCount++
          }
        } else {
          // Insert new
          const { error } = await supabaseAdmin
            .from('customers')
            .insert([
              {
                name,
                type,
                phone: phone || null,
                email: email || null,
                address: address || null,
                balance: 0,
              },
            ])

          if (error) {
            errorCount++
            errors.push({ name, error: error.message })
          } else {
            successCount++
            existingNames.add(nameLower)
          }
        }
      } catch (err) {
        errorCount++
        errors.push({ name: customer.name || 'unknown', error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${successCount} yeni cari eklendi, ${updateCount} cari güncellendi`,
      successCount,
      updateCount,
      errorCount,
      duplicateNames,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('POST /api/customers/bulk exception:', error)
    return NextResponse.json(
      { error: 'Toplu ekleme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
