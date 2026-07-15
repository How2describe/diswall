import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const CATEGORIES = ['Art & Design', 'Music', 'Development', 'Voice Acting', 'Marketing', 'Tutoring']

const themes = {
  light: {
    pageBg: '#F7F6FB',
    cardBg: '#fff',
    border: '#e4e4e7',
    inputBg: '#fff',
    inputBorder: '#d4d4d8',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    label: '#3f3f46',
    hint: '#a1a1aa',
  },
  dark: {
    pageBg: '#313338',
    cardBg: '#383A40',
    border: '#2B2D31',
    inputBg: '#2B2D31',
    inputBorder: '#4E505A',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
    label: '#B5BAC1',
    hint: '#6D6F78',
  },
}

function CreateProfile() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const t = dark ? themes.dark : themes.light
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [publishCount, setPublishCount] = useState(0)
  const [credits, setCredits] = useState(0)

  const [form, setForm] = useState({
    display_name: '',
    role: '',
    description: '',
    category: '',
    skills: '',
    rate: '',
    discord_handle: '',
    contact: '',
  })

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
    setUser(session.user)
    fetchPublishData(session.user.id)
  }

  const fetchPublishData = async (userId) => {
    const { count } = await supabase
      .from('publish_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { data: profileIds } = await supabase
      .from('commissioner_profiles')
      .select('id')
      .eq('user_id', userId)

    let totalClicks = 0
    if (profileIds?.length > 0) {
      const ids = profileIds.map(p => p.id)
      const { count: clickCount } = await supabase
        .from('profile_clicks')
        .select('*', { count: 'exact', head: true })
        .in('profile_id', ids)
      totalClicks = clickCount || 0
    }

    setPublishCount(count || 0)
    setCredits(Math.floor(totalClicks / 20))
  }

  const canPublishFree = publishCount < 3
  const hasCredits = credits > 0
  const canPublish = canPublishFree || hasCredits

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.display_name || !form.role || !form.category) {
      setError('Please fill in name, role, and category.')
      return
    }
    if (!canPublish) {
      setError('You have no free publishes or credits left.')
      return
    }

    setLoading(true)
    setError(null)

    const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean)

    const { data: profile, error: insertError } = await supabase
      .from('commissioner_profiles')
      .insert({
        user_id: user.id,
        display_name: form.display_name,
        role: form.role,
        description: form.description,
        category: form.category,
        skills: skillsArray,
        rate: form.rate,
        discord_handle: form.discord_handle,
        contact: form.contact,
      })
      .select()
      .single()

    if (insertError) { setError(insertError.message); setLoading(false); return }

    await supabase.from('publish_history').insert({
      user_id: user.id,
      profile_id: profile.id,
      was_free: canPublishFree,
    })

    navigate('/')
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

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: t.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>Post a profile</h2>
            <p style={{ fontSize: '13px', color: t.hint, margin: '4px 0 0' }}>
              {canPublishFree
                ? `Free publish ${publishCount + 1} of 3`
                : hasCredits
                ? `Using 1 earned credit (${credits} remaining)`
                : 'No publishes remaining'}
            </p>
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#dc2626', background: dark ? '#2A1515' : '#fef2f2', padding: '8px 12px', borderRadius: '8px', margin: 0, border: `0.5px solid ${dark ? '#5C2020' : '#fca5a5'}` }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Display name *</label>
            <input style={inputStyle} name="display_name" placeholder="e.g. Kira L." value={form.display_name} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Role *</label>
            <input style={inputStyle} name="role" placeholder="e.g. Digital Artist" value={form.role} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Category *</label>
            <select style={inputStyle} name="category" value={form.category} onChange={handleChange}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>
              Skills <span style={{ fontWeight: '400', color: t.hint }}>(comma separated)</span>
            </label>
            <input style={inputStyle} name="skills" placeholder="e.g. Illustration, Character art" value={form.skills} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>About you</label>
            <textarea
              style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
              name="description"
              placeholder="Tell commissioners about yourself..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Rate</label>
            <input style={inputStyle} name="rate" placeholder="e.g. ₱500/piece or ₱300/hr" value={form.rate} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Discord handle</label>
            <input style={inputStyle} name="discord_handle" placeholder="e.g. yourname#0001" value={form.discord_handle} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: t.label }}>Other contact</label>
            <input style={inputStyle} name="contact" placeholder="e.g. email, Twitter, etc." value={form.contact} onChange={handleChange} />
          </div>

          <button
            style={{ fontSize: '14px', padding: '10px', borderRadius: '10px', background: canPublish ? '#7F77DD' : '#a0a0a0', border: 'none', color: '#fff', cursor: canPublish ? 'pointer' : 'not-allowed', fontWeight: '600', marginTop: '0.5rem', fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading || !canPublish}
          >
            {loading ? 'Publishing...' : 'Publish profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProfile