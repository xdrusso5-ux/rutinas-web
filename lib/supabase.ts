import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahxecwzqrbhcvngbrhwu.supabase.co'
const supabaseAnonKey = 'sb_publishable_CwYv3hL9e0OVI1ZSi3d3tg_ahi9pzh2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)