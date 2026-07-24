import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const themes = {
  light: {
    pageBg: '#F7F6FB',
    cardBg: '#fff',
    border: '#e4e4e7',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    label: '#a1a1aa',
  },
  dark: {
    pageBg: '#313338',
    cardBg: '#383A40',
    border: '#2B2D31',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
    label: '#6D6F78',
  },
}

function Inbox() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const t = dark ? themes.dark : themes.light
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setNotifications(data || [])
    setLoading(false)

    // mark all as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)
  }

  const getTypeStyles = (type) => {
    if (type === 'warning') return { bg: dark ? '#2A1515' : '#fef2f2', border: dark ? '#5C2020' : '#fca5a5', icon: '⚠️' }
    if (type === 'ban') return { bg: dark ? '#1A0A0A' : '#fff1f1', border: dark ? '#7C1010' : '#f87171', icon: '🚫' }
    return { bg: dark ? '#0D2035' : '#E6F1FB', border: dark ? '#1A4060' : '#93C5FD', icon: 'ℹ️' }
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '3rem', color: t.textSecondary, fontFamily: 'Inter, sans-serif' }}>Loading...</p>

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: t.textPrimary, letterSpacing: '-0.01em' }}>Inbox</h2>

        {notifications.length === 0 ? (
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '2rem', textAlign: 'center', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '14px', color: t.label, margin: 0 }}>No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => {
            const typeStyle = getTypeStyles(n.type)
            return (
              <div key={n.id} style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{typeStyle.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: t.textPrimary }}>{n.title}</span>
                    {!n.is_read && <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: '#7F77DD', color: '#fff', fontWeight: '600' }}>New</span>}
                  </div>
                  <span style={{ fontSize: '11px', color: t.label }}>
                    {new Date(n.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: t.textSecondary, margin: 0, lineHeight: 1.6 }}>{n.message}</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Inbox