import { createClient } from '@supabase/supabase-js'

// Sustituye estos valores con las credenciales de tu proyecto gratuito en supabase.com
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co'
const SUPABASE_ANON_KEY = 'TU-CLAVE-PUBLICA-ANON'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)