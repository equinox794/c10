import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/recipes
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('recipes')
      .select(`
        *,
        customer:customers(id, name, type),
        recipe_ingredients(*),
        recipe_packages(*, package:packages(*))
      `)
      .is('deleted_at', null)
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Reçeteler alınırken hata oluştu' }, { status: 500 })
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, customer_id, density, ingredients, packages: recipePackages } = body

    // Create recipe
    const { data: recipe, error: recipeError } = await supabaseAdmin
      .from('recipes')
      .insert([{ name, customer_id, density, total_cost: 0 }])
      .select()
      .single()

    if (recipeError) {
      return NextResponse.json({ error: recipeError.message }, { status: 500 })
    }

    // Add ingredients
    if (ingredients && ingredients.length > 0) {
      const { error: ingredientsError } = await supabaseAdmin
        .from('recipe_ingredients')
        .insert(
          ingredients.map(ing => ({
            recipe_id: recipe.id,
            ...ing
          }))
        )

      if (ingredientsError) {
        return NextResponse.json({ error: ingredientsError.message }, { status: 500 })
      }
    }

    // Add packages
    if (recipePackages && recipePackages.length > 0) {
      const { error: packagesError } = await supabaseAdmin
        .from('recipe_packages')
        .insert(
          recipePackages.map(pkg => ({
            recipe_id: recipe.id,
            package_id: pkg.package_id
          }))
        )

      if (packagesError) {
        return NextResponse.json({ error: packagesError.message }, { status: 500 })
      }
    }

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Reçete oluşturulurken hata oluştu' }, { status: 500 })
  }
}
