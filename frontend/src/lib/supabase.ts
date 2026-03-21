import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 开发环境：调试信息
if (import.meta.env.DEV) {
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key:', supabaseAnonKey ? '***已设置***' : '未设置')
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase 配置缺失。URL: ${supabaseUrl ? '✓' : '✗'}, Key: ${supabaseAnonKey ? '✓' : '✗'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // 会话永不自动过期：refresh token 有效期在 Supabase Dashboard 中设置为 3650 天
  },
})
