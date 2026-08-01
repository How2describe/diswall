import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import HelpModal from './HelpModal'

const themes = {
  light: {
    navBg: '#ffffff',
    border: '#E4E2F4',
    text: '#3f3f46',
    muted: '#71717a',
  },
  dark: {
    navBg: '#2B2D31',
    border: '#1E1F22',
    text: '#B5BAC1',
    muted: '#6D6F78',
  },
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: '500',
    letterSpacing: '-0.01em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    fontSize: '13px',
    padding: '7px 16px',
    borderRadius: '8px',
    background: 'transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
  },
  btnFill: {
    fontSize: '13px',
    padding: '7px 16px',
    borderRadius: '8px',
    background: '#7F77DD',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: '500',
    fontFamily: 'inherit',
  },
}

function Navbar() {
  const [user, setUser] = useState(null)
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const t = dark ? themes.dark : themes.light
  const [showHelp, setShowHelp] = useState(false)

  const fetchUnread = async (userId) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setUnread(count || 0)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUnread(session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUnread(session.user.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }


  return (
    <nav style={{ ...styles.nav, background: t.navBg, borderBottom: `0.5px solid ${t.border}` }}>
      <Link to="/" style={styles.logo}>
        <div style={{ ...styles.logoIcon, background: dark ? '#2A2547' : '#EEEDFE' }}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M19 7L10 17H16L13 25L22 15H16L19 7Z" fill={dark ? '#A89CF7' : '#7F77DD'} stroke={dark ? '#A89CF7' : '#7F77DD'} strokeWidth="0.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ ...styles.logoText, color: dark ? '#C4BFFF' : '#3C3489' }}>DisWall</span>
      </Link>

      <div style={styles.right}>
        <button
          onClick={() => setShowHelp(true)}
          style={{ ...styles.iconBtn, color: t.muted, border: `0.5px solid ${t.border}`, fontSize: '13px', fontWeight: '600' }}
          aria-label="Help"
        >
          ?
        </button>
        <button
          onClick={toggle}
          style={{ ...styles.iconBtn, color: t.muted, border: `0.5px solid ${t.border}` }}
          aria-label="Toggle dark mode"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {user ? (
          <>
            ...
            <Link to="/create" style={{ ...styles.btnFill }}>Post a profile</Link>
            <Link to="/inbox" style={{ ...styles.btnOutline, color: t.text, border: `0.5px solid ${t.border}`, position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              🔔
              {unread > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: '600', borderRadius: '999px', padding: '1px 5px', minWidth: '16px', textAlign: 'center' }}>
                  {unread}
                </span>
              )}
            </Link>
            <Link to="/settings" style={{ ...styles.btnOutline, color: t.text, border: `0.5px solid ${t.border}` }}>Settings</Link>
            <button onClick={handleLogout} style={{ ...styles.btnOutline, color: t.text, border: `0.5px solid ${t.border}` }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ ...styles.btnOutline, color: t.text, border: `0.5px solid ${t.border}` }}>Log in</Link>
            <Link to="/signup" style={{ ...styles.btnFill }}>Sign up</Link>
          </>
        )}
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </nav>
  )
}

export default Navbar