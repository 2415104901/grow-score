import { supabase } from '../lib/supabase'

/** 登录 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** 登出 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** 获取当前会话 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/** 监听认证状态变化 */
export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback)
}
