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

function Settings() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const t = dark ? themes.dark : themes.light
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeProfiles, setActiveProfiles] = useState([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [publishCount, setPublishCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [discordId, setDiscordId] = useState('')
  const [discordLinkLoading, setDiscordLinkLoading] = useState(false)

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    setUser(session.user)
    fetchData(session.user.id)
  }

  const fetchData = async (userId) => {
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', userId).single()
    setProfile(profileData)
    if (profileData?.discord_id) setDiscordId(profileData.discord_id)

    const { data: commProfiles } = await supabase
      .from('commissioner_profiles').select('*')
      .eq('user_id', userId).eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    setActiveProfiles(commProfiles || [])

    const { count: pubCount, error: pubError } = await supabase
      .from('publish_history').select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      console.log('publish count:', pubCount, pubError)
      setPublishCount(pubCount || 0)

    if (commProfiles?.length > 0) {
      const ids = commProfiles.map(p => p.id)
      const { count: clickCount } = await supabase
        .from('profile_clicks').select('*', { count: 'exact', head: true })
        .in('profile_id', ids)
      setTotalClicks(clickCount || 0)
    }

    setLoading(false)
  }

  const handleDeactivate = async (profileId) => {
    const confirm = window.confirm('Are you sure you want to delete this profile? This cannot be undone.')
    if (!confirm) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }

    const { error } = await supabase
      .from('commissioner_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', session.user.id)

    if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete profile: ' + error.message)
      return
    }

    setActiveProfiles(prev => prev.filter(p => p.id !== profileId))
  }

  
  const earnedCredits = Math.floor(totalClicks / 20)
  const pointsToNextCredit = 20 - (totalClicks % 20)
  const progressPct = ((20 - pointsToNextCredit) / 20) * 100

  if (loading) return <p style={{ textAlign: 'center', marginTop: '3rem', color: t.textSecondary, fontFamily: 'Inter, sans-serif' }}>Loading...</p>

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

  const freePublishesLeft = Math.max(0, 3 - publishCount)
  
  const label = {
    fontSize: '11px', fontWeight: '600', color: t.label,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  }

  const row = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }

  const handleLinkDiscord = async () => {
    if (!discordId.trim()) return
      setDiscordLinkLoading(true)
      const { error } = await supabase
        .from('profiles')
        .update({ discord_id: discordId.trim() })
        .eq('id', user.id)
      if (!error) {
        setProfile(prev => ({ ...prev, discord_id: discordId.trim() }))
      }
      setDiscordLinkLoading(false)
    }

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', color: t.textPrimary, letterSpacing: '-0.01em' }}>Settings</h2>

        {/* Account */}
        <div style={card}>
          <p style={label}>Account</p>
          <div style={row}>
           <span style={{ fontSize: '13px', color: t.textSecondary }}>Username</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{profile?.username || '—'}</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
          <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Email</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{user?.email}</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={row}>
              <span style={{ fontSize: '13px', color: t.textSecondary }}>Discord ID</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: profile?.discord_id ? '#3B6D11' : t.textSecondary }}>
                {profile?.discord_id ? '✓ Linked' : 'Not linked'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={{ flex: 1, fontSize: '13px', padding: '8px 12px', border: `0.5px solid ${t.inputBorder || (dark ? '#4E505A' : '#d4d4d8')}`, borderRadius: '8px', background: dark ? '#2B2D31' : '#fff', color: t.textPrimary, fontFamily: 'Inter, sans-serif', outline: 'none' }}
                placeholder="Enter your Discord ID (e.g. 123456789012345678)"
                value={discordId}
                onChange={e => setDiscordId(e.target.value)}
              />
              <button
                style={{ fontSize: '13px', padding: '8px 14px', borderRadius: '8px', background: '#7F77DD', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
                onClick={handleLinkDiscord}
              >
                {discordLinkLoading ? 'Saving...' : 'Link'}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: t.label, margin: 0 }}>
              To find your Discord ID: enable Developer Mode in Discord settings → right-click your username → Copy ID
            </p>
          </div>
        </div>

        {/* Points */}
        <div style={card}>
          <p style={label}>Points & Credits</p>
          <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Total points</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{profile?.points || 0}</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
          <div style={row}>
           <span style={{ fontSize: '13px', color: t.textSecondary }}>Earned credits</span>
           <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{Math.floor((profile?.points || 0) / 20)}</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
         <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Points to next credit</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{20 - ((profile?.points || 0) % 20)}</span>
          </div>
          <div style={{ height: '6px', background: dark ? '#2B2D31' : '#f4f4f5', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(((profile?.points || 0) % 20) / 20) * 100}%`, background: '#7F77DD', borderRadius: '999px', transition: 'width 0.3s ease' }} />
         </div>
         <p style={{ fontSize: '12px', color: t.label, margin: 0 }}>{(profile?.points || 0) % 20} / 20 points toward your next free publish</p>
        </div>

        {/* Publishes */}
        <div style={card}>
          <p style={label}>Publishes</p>
          <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Free publishes used</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{Math.min(publishCount, 3)} / 3</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
          <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Free publishes left</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: freePublishesLeft > 0 ? '#3B6D11' : '#dc2626' }}>{freePublishesLeft}</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${t.border}` }} />
          <div style={row}>
            <span style={{ fontSize: '13px', color: t.textSecondary }}>Credit publishes available</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{earnedCredits}</span>
          </div>
        </div>

        {/* Active profiles */}
        <div style={card}>
          <p style={label}>Active Profiles</p>
          {activeProfiles.length === 0 ? (
            <p style={{ fontSize: '13px', color: t.label, margin: 0 }}>
              No active profiles.{' '}
              <span style={{ color: '#7F77DD', cursor: 'pointer', fontWeight: '500' }} onClick={() => navigate('/create')}>Post one!</span>
            </p>
          ) : (
            activeProfiles.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div style={{ borderTop: `0.5px solid ${t.border}`, marginBottom: '12px' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: t.textPrimary, margin: 0 }}>{p.display_name}</p>
                    <p style={{ fontSize: '12px', color: t.label, margin: 0, marginTop: '2px' }}>
                      Expires {new Date(p.expires_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid #7F77DD', background: dark ? '#2A2547' : '#EEEDFE', color: dark ? '#C4BFFF' : '#3C3489', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif' }}
                      onClick={() => navigate(`/profile/${p.id}`)}
                    >View</button>
                    <button
                      style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '0.5px solid #fca5a5', background: dark ? '#2A1515' : '#fef2f2', color: '#dc2626', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onClick={() => handleDeactivate(p.id)}
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings