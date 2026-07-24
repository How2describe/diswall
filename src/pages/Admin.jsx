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
    inputBg: '#fff',
    inputBorder: '#d4d4d8',
  },
  dark: {
    pageBg: '#313338',
    cardBg: '#383A40',
    border: '#2B2D31',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
    label: '#6D6F78',
    inputBg: '#2B2D31',
    inputBorder: '#4E505A',
  },
}

function Admin() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const t = dark ? themes.dark : themes.light
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('profiles')
  const [warnModal, setWarnModal] = useState(null)
  const [warnTitle, setWarnTitle] = useState('')
  const [warnMessage, setWarnMessage] = useState('')
  const [warnLoading, setWarnLoading] = useState(false)

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!profile?.is_admin) { navigate('/'); return }

    fetchData()
  }

  const fetchData = async () => {
    const { data: allProfiles } = await supabase
      .from('commissioner_profiles')
      .select('*, profiles(username, discord_id, discord_handle, is_admin)')
      .order('published_at', { ascending: false })

    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setProfiles(allProfiles || [])
    setUsers(allUsers || [])
    setLoading(false)
  }

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Delete this profile? This cannot be undone.')) return
    await supabase.from('commissioner_profiles').delete().eq('id', profileId)
    setProfiles(prev => prev.filter(p => p.id !== profileId))
  }

  const handleWarn = async () => {
    if (!warnTitle.trim() || !warnMessage.trim()) return
    setWarnLoading(true)

    await supabase.from('notifications').insert({
      user_id: warnModal.id,
      type: 'warning',
      title: warnTitle,
      message: warnMessage,
    })

    setWarnModal(null)
    setWarnTitle('')
    setWarnMessage('')
    setWarnLoading(false)
    alert('Warning sent!')
  }

  const handleBan = async (userId) => {
    if (!window.confirm('Ban this user? They will no longer be able to post profiles.')) return
    await supabase.from('profiles').update({ is_banned: true }).eq('id', userId)

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'ban',
      title: 'Account Suspended',
      message: 'Your DisWall account has been suspended. If you believe this is a mistake, please contact us.',
    })

    // deactivate all their profiles
    await supabase
      .from('commissioner_profiles')
      .update({ is_active: false })
      .eq('user_id', userId)

    fetchData()
  }

  const handleToggleAdmin = async (userId, currentValue) => {
    await supabase.from('profiles').update({ is_admin: !currentValue }).eq('id', userId)
    fetchData()
  }

  const filteredProfiles = profiles.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.profiles?.username?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.discord_handle?.toLowerCase().includes(search.toLowerCase())
  )

  const card = {
    background: t.cardBg,
    border: `1px solid ${t.border}`,
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
    fontFamily: 'Inter, sans-serif',
  }

  const inputStyle = {
    fontSize: '14px',
    padding: '9px 12px',
    border: `0.5px solid ${t.inputBorder}`,
    borderRadius: '8px',
    outline: 'none',
    color: t.textPrimary,
    background: t.inputBg,
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: '3rem', color: t.textSecondary, fontFamily: 'Inter, sans-serif' }}>Loading...</p>

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '600', color: t.textPrimary, letterSpacing: '-0.01em' }}>Admin Panel</h2>
          <span style={{ fontSize: '12px', color: t.label, background: dark ? '#2A2547' : '#EEEDFE', padding: '4px 10px', borderRadius: '999px', border: `0.5px solid ${dark ? '#534AB7' : '#AFA9EC'}`, color: dark ? '#C4BFFF' : '#3C3489' }}>Admin</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['profiles', 'users'].map(t2 => (
            <button
              key={t2}
              onClick={() => setTab(t2)}
              style={{ fontSize: '13px', padding: '6px 16px', borderRadius: '8px', border: `0.5px solid ${tab === t2 ? '#7F77DD' : t.border}`, background: tab === t2 ? '#7F77DD' : 'transparent', color: tab === t2 ? '#fff' : t.textSecondary, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '500', textTransform: 'capitalize' }}
            >
              {t2} {t2 === 'profiles' ? `(${profiles.length})` : `(${users.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          style={inputStyle}
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Profiles tab */}
        {tab === 'profiles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredProfiles.length === 0 ? (
              <p style={{ color: t.label, textAlign: 'center', marginTop: '2rem' }}>No profiles found.</p>
            ) : filteredProfiles.map(p => (
              <div key={p.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: t.textPrimary, margin: 0 }}>{p.display_name} <span style={{ fontWeight: '400', color: t.textSecondary }}>• {p.role}</span></p>
                    <p style={{ fontSize: '12px', color: t.label, margin: '2px 0 0' }}>
                      by @{p.profiles?.username || '—'} • {p.category} • {p.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: `0.5px solid ${dark ? '#4E505A' : '#d4d4d8'}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onClick={() => navigate(`/profile/${p.id}`)}
                    >View</button>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '0.5px solid #fca5a5', background: dark ? '#2A1515' : '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onClick={() => handleDeleteProfile(p.id)}
                    >Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredUsers.length === 0 ? (
              <p style={{ color: t.label, textAlign: 'center', marginTop: '2rem' }}>No users found.</p>
            ) : filteredUsers.map(u => (
              <div key={u.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: t.textPrimary, margin: 0 }}>
                      @{u.username}
                      {u.is_admin && <span style={{ fontSize: '10px', marginLeft: '8px', padding: '2px 7px', borderRadius: '999px', background: dark ? '#2A2547' : '#EEEDFE', color: dark ? '#C4BFFF' : '#3C3489', border: `0.5px solid ${dark ? '#534AB7' : '#AFA9EC'}` }}>Admin</span>}
                      {u.is_banned && <span style={{ fontSize: '10px', marginLeft: '8px', padding: '2px 7px', borderRadius: '999px', background: dark ? '#2A1515' : '#fef2f2', color: '#dc2626', border: '0.5px solid #fca5a5' }}>Banned</span>}
                    </p>
                    <p style={{ fontSize: '12px', color: t.label, margin: '2px 0 0' }}>
                      Discord: {u.discord_handle || '—'} • Points: {u.points || 0}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid #F5C96A', background: dark ? '#2A1E0A' : '#FAEEDA', color: dark ? '#F5C96A' : '#633806', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
                      onClick={() => setWarnModal(u)}
                    >Warn</button>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: `0.5px solid ${dark ? '#4E505A' : '#d4d4d8'}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                    >{u.is_admin ? 'Remove Admin' : 'Make Admin'}</button>
                    {!u.is_banned && (
                      <button
                        style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '0.5px solid #fca5a5', background: dark ? '#2A1515' : '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        onClick={() => handleBan(u.id)}
                      >Ban</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warn Modal */}
      {warnModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: t.textPrimary, margin: 0 }}>Warn @{warnModal.username}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Warning title</label>
              <input style={inputStyle} placeholder="e.g. Community Guidelines Violation" value={warnTitle} onChange={e => setWarnTitle(e.target.value)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Message</label>
              <textarea
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                placeholder="Describe the reason for this warning..."
                value={warnMessage}
                onChange={e => setWarnMessage(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: `0.5px solid ${t.border}`, background: 'transparent', color: t.textSecondary, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                onClick={() => { setWarnModal(null); setWarnTitle(''); setWarnMessage('') }}
              >Cancel</button>
              <button
                style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', background: '#F5C96A', border: 'none', color: '#633806', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inter, sans-serif', opacity: warnLoading ? 0.7 : 1 }}
                onClick={handleWarn}
                disabled={warnLoading}
              >{warnLoading ? 'Sending...' : 'Send Warning'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin