import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const TAG_COLORS = {
  light: {
    'Art & Design': { bg: '#EEEDFE', color: '#3C3489' },
    'Music':        { bg: '#E1F5EE', color: '#085041' },
    'Development':  { bg: '#E6F1FB', color: '#0C447C' },
    'Voice Acting': { bg: '#FBEAF0', color: '#72243E' },
    'Tutoring':     { bg: '#FAEEDA', color: '#633806' },
    'Marketing':    { bg: '#FAECE7', color: '#712B13' },
  },
  dark: {
    'Art & Design': { bg: '#2A2547', color: '#C4BFFF' },
    'Music':        { bg: '#0F2A20', color: '#6FCF8A' },
    'Development':  { bg: '#0D2035', color: '#7EC8F5' },
    'Voice Acting': { bg: '#2A1525', color: '#F4A0C4' },
    'Tutoring':     { bg: '#2A1E0A', color: '#F5C96A' },
    'Marketing':    { bg: '#2A1510', color: '#F5A87E' },
  },
}

const themes = {
  light: {
    pageBg: '#F7F6FB',
    cardBg: '#fff',
    border: '#e4e4e7',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    muted: '#a1a1aa',
    label: '#a1a1aa',
  },
  dark: {
    pageBg: '#313338',
    cardBg: '#383A40',
    border: '#2B2D31',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
    muted: '#6D6F78',
    label: '#6D6F78',
  },
}

function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const t = dark ? themes.dark : themes.light
  const tagColors = dark ? TAG_COLORS.dark : TAG_COLORS.light

  useEffect(() => {
    fetchProfile()
    trackClick()
  }, [id])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('commissioner_profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setProfile(data)
    setLoading(false)
  }

  const trackClick = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const identifier = session?.user?.id || getFingerprint()
// check if already clicked
    const { data: existing } = await supabase
      .from('profile_clicks')
      .select('id')
      .eq('profile_id', id)
      .eq('clicked_by', identifier)
      .single()

    if (existing) return // already clicked, no points

    // insert click
    const { error: clickError } = await supabase
      .from('profile_clicks')
      .insert({ profile_id: id, clicked_by: identifier })

   if (clickError) return

   // find profile owner
   const { data: commProfile } = await supabase
     .from('commissioner_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!commProfile) return

    // add 1 point to profile owner
    const { data: ownerProfile } = await supabase
      .from('profiles')
     .select('points')
      .eq('id', commProfile.user_id)
     .single()

   await supabase
      .from('profiles')
      .update({ points: (ownerProfile?.points || 0) + 1 })
      .eq('id', commProfile.user_id)
  }

  const getFingerprint = () => {
    let fp = localStorage.getItem('diswall_fp')
    if (!fp) { fp = crypto.randomUUID(); localStorage.setItem('diswall_fp', fp) }
    return fp
  }

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (loading) return <p style={{ textAlign: 'center', marginTop: '3rem', color: t.textSecondary }}>Loading...</p>
  if (!profile) return <p style={{ textAlign: 'center', marginTop: '3rem', color: t.textSecondary }}>Profile not found.</p>

  const colors = tagColors[profile.category] || { bg: dark ? '#2B2D31' : '#f4f4f5', color: dark ? '#B5BAC1' : '#3f3f46' }

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <button
          style={{ fontSize: '13px', marginBottom: '1.25rem', background: 'none', border: 'none', color: '#7F77DD', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
          onClick={() => navigate('/')}
        >
          ← Back
        </button>

        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '58px', height: '58px', borderRadius: '14px', background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', flexShrink: 0 }}>
              {getInitials(profile.display_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '600', color: t.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>{profile.display_name}</h1>
              <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0, marginTop: '2px' }}>{profile.role}</p>
            </div>
          </div>

          <div style={{ borderTop: `0.5px solid ${t.border}` }} />

          {/* About */}
          {profile.description && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</p>
              <p style={{ fontSize: '14px', color: t.textSecondary, lineHeight: 1.7, margin: 0 }}>{profile.description}</p>
            </div>
          )}

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</p>
            <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', background: colors.bg, color: colors.color, fontWeight: '500', display: 'inline-block', width: 'fit-content' }}>
              {profile.category}
            </span>
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.skills.map(skill => (
                  <span key={skill} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', background: colors.bg, color: colors.color, fontWeight: '500' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rate */}
          {profile.rate && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rate</p>
              <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0, fontWeight: '500' }}>💰 {profile.rate}</p>
            </div>
          )}

          {/* Discord */}
          {profile.discord_handle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Discord</p>
              <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0 }}>🎮 {profile.discord_handle}</p>
            </div>
          )}

          {/* Contact */}
          {profile.contact && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</p>
              <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0 }}>📬 {profile.contact}</p>
            </div>
          )}

          <div style={{ borderTop: `0.5px solid ${t.border}` }} />

          <p style={{ fontSize: '12px', color: t.muted, textAlign: 'center', margin: 0 }}>
            Profile active until {new Date(profile.expires_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile