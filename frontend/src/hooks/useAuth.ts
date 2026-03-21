import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole } from '../types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  childId: string | null
  isLoading: boolean
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初始化时读取已有会话
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        fetchProfile(data.session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // 监听会话变化
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId: string) {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('获取用户 profile 失败:', error.message)
      setProfile(null)
    } else {
      setProfile(data as Profile)
    }
    setIsLoading(false)
  }

  return {
    session,
    profile,
    role: (profile?.role ?? null) as UserRole | null,
    childId: profile?.child_id ?? null,
    isLoading,
  }
}
