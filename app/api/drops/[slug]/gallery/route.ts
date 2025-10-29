import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { data: drop } = await supabaseAdmin
      .from('drops')
      .select('id')
      .eq('slug', params.slug)
      .single()

    if (!drop) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }

    const { data: media, error } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('drop_id', drop.id)
      .eq('approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ media: media || [] })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}
