import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis do Supabase não configuradas! Por favor:\n' +
      '1. Crie um arquivo .env.local na raiz do projeto\n' +
      '2. Adicione as seguintes variáveis:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
      '   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon\n' +
      '3. Reinicie o servidor (Ctrl+C e depois npm run dev)\n\n' +
      'Para obter as credenciais:\n' +
      'https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
