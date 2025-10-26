import { createClient } from '@supabase/supabase-js'

// Supabase client for client-side operations
// Uses anon key which respects RLS policies
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Supabase admin client for server-side operations
// Uses service role key which bypasses RLS
// ⚠️ WARNING: Only use this in API routes (server-side), NEVER in client components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// Helper function to handle Supabase errors
export function handleSupabaseError(error) {
  if (!error) return null

  console.error('Supabase Error:', error)

  return {
    message: error.message || 'Bir hata oluştu',
    details: error.details || error.hint || '',
    code: error.code || 'UNKNOWN_ERROR',
  }
}

// Helper function to check if a record exists
export async function recordExists(table, column, value) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(column, value)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found, which is expected
    throw error
  }

  return !!data
}

// Helper for soft delete
export async function softDelete(table, id) {
  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  return { data, error }
}

// Helper to get non-deleted records
export function whereNotDeleted(query) {
  return query.is('deleted_at', null)
}
