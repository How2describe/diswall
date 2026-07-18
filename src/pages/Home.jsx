import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import AdBanner from '../components/AdBanner'

const CATEGORIES = ['All', 'Art & Design', 'Music', 'Development', 'Voice Acting', 'Marketing', 'Tutoring']

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

function Home() {
  const [profiles, setProfiles] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { dark } = useTheme()
  const t = dark ? themes.dark : themes.light
  const tagColors = dark ? TAG_COLORS.dark : TAG_COLORS.light

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('commissioner_profiles')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    if (!error) setProfiles(data)
    setLoading(false)
  }

  const filtered = profiles.filter(p => {
    const matchesCategory = category === 'All' || p.category === category
    const matchesSearch =
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      (p.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const isNew = (published_at) => {
    const diff = new Date() - new Date(published_at)
    return diff < 1000 * 60 * 60 * 24 * 3
  }

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ background: t.pageBg, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={{ ...styles.eyebrow, background: dark ? '#2A2547' : '#EEEDFE', color: dark ? '#C4BFFF' : '#7F77DD', border: `0.5px solid ${dark ? '#534AB7' : '#AFA9EC'}` }}>
          ⚡ Discord-powered commissioner marketplace
        </div>
        <h1 style={{ ...styles.h1, color: t.textPrimary }}>
          Find your next<br />
          <span style={{ color: dark ? '#A89CF7' : '#7F77DD' }}>commissioner</span>
        </h1>
        <p style={{ ...styles.sub, color: t.textSecondary }}>
          Browse verified profiles from artists, developers, composers, voice actors, and more — all sourced from the Discord community.
        </p>
        <div style={styles.searchWrap}>
          <input
            style={{ ...styles.searchInput, background: dark ? '#1E1F22' : '#fff', border: `0.5px solid ${dark ? '#4E505A' : '#d4d4d8'}`, color: t.textPrimary }}
            type="text"
            placeholder="Search by skill, name, or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button style={styles.searchBtn}>Search</button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ ...styles.statsBar, background: dark ? '#2B2D31' : '#fff', borderTop: `0.5px solid ${t.border}`, borderBottom: `0.5px solid ${t.border}` }}>
        <div style={styles.stat}>
          <div style={{ ...styles.statNum, color: dark ? '#A89CF7' : '#7F77DD' }}>{profiles.length}</div>
          <div style={{ ...styles.statLabel, color: t.textSecondary }}>Active profiles</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statNum, color: dark ? '#A89CF7' : '#7F77DD' }}>7</div>
          <div style={{ ...styles.statLabel, color: t.textSecondary }}>Categories</div>
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statNum, color: dark ? '#A89CF7' : '#7F77DD' }}>30</div>
          <div style={{ ...styles.statLabel, color: t.textSecondary }}>Days per listing</div>
        </div>
      </div>
      
      {/* Ad */}
      <AdBanner slot="1856537957" />

      {/* Wall */}
      <div style={styles.body}>
        <div style={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              style={{
                ...styles.tag,
                background: category === cat ? (dark ? '#2A2547' : '#EEEDFE') : (dark ? '#2B2D31' : '#fff'),
                border: `0.5px solid ${category === cat ? (dark ? '#534AB7' : '#AFA9EC') : (dark ? '#4E505A' : '#d4d4d8')}`,
                color: category === cat ? (dark ? '#C4BFFF' : '#3C3489') : t.textSecondary,
              }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ ...styles.empty, color: t.textSecondary }}>Loading profiles...</p>
        ) : filtered.length === 0 ? (
          <p style={{ ...styles.empty, color: t.textSecondary }}>No profiles found.</p>
        ) : (
          <div style={styles.wall}>
            {filtered.map(p => {
              const colors = tagColors[p.category] || { bg: dark ? '#2B2D31' : '#f4f4f5', color: dark ? '#B5BAC1' : '#3f3f46' }
              return (
                <div
                  key={p.id}
                    style={{ ...styles.card, background: dark ? '#383A40' : '#fff', border: `1px solid ${dark ? '#2B2D31' : '#e4e4e7'}`, boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = dark ? '#7F77DD' : '#AFA9EC'
                      e.currentTarget.style.boxShadow = dark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(127,119,221,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = dark ? '#2B2D31' : '#e4e4e7'
                      e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.avatar, background: colors.bg, color: colors.color }}>
                      {getInitials(p.display_name)}
                    </div>
                    <div>
                      <div style={{ ...styles.cardName, color: t.textPrimary }}>{p.display_name}</div>
                      <div style={{ ...styles.cardRole, color: t.textSecondary }}>{p.role}</div>
                    </div>
                  </div>

                  {p.description && (
                    <div style={{ ...styles.cardDesc, color: t.textSecondary }}>{p.description}</div>
                  )}

                  <div style={styles.cardTags}>
                    {(p.skills || []).slice(0, 2).map(skill => (
                      <span key={skill} style={{ ...styles.ctag, background: colors.bg, color: colors.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  {p.rate && (
                    <div style={{ ...styles.cardRate, color: t.textSecondary }}>💰 {p.rate}</div>
                  )}

                  <div style={{ ...styles.cardFooter, borderTop: `0.5px solid ${dark ? '#1E1F22' : '#f4f4f5'}` }}>
                    {isNew(p.published_at) && <span style={styles.newBadge}>New</span>}
                    <button
                      style={{ ...styles.viewBtn, marginLeft: isNew(p.published_at) ? 0 : 'auto', background: dark ? '#2A2547' : '#EEEDFE', borderColor: '#7F77DD', color: dark ? '#C4BFFF' : '#3C3489' }}
                      onClick={() => navigate(`/profile/${p.id}`)}
                    >
                      View profile
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const themes = {
  light: {
    pageBg: '#F7F6FB',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    border: '#E4E2F4',
  },
  dark: {
    pageBg: '#313338',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
    border: '#1E1F22',
  },
}

const styles = {
  hero: { textAlign: 'center', padding: '3.5rem 2rem 2rem' },
  eyebrow: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', padding: '4px 12px', borderRadius: '999px', marginBottom: '1rem' },
  h1: { fontSize: '36px', fontWeight: '600', marginBottom: '10px', letterSpacing: '-0.02em', lineHeight: 1.2, fontFamily: 'Inter, sans-serif' },
  sub: { fontSize: '15px', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' },
  searchWrap: { display: 'flex', gap: '8px', maxWidth: '500px', margin: '0 auto' },
  searchInput: { flex: 1, fontSize: '14px', padding: '10px 14px', borderRadius: '10px', outline: 'none', fontFamily: 'Inter, sans-serif' },
  searchBtn: { padding: '10px 18px', borderRadius: '10px', background: '#7F77DD', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
  statsBar: { display: 'flex', gap: '2rem', justifyContent: 'center', padding: '1rem 2rem' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: '20px', fontWeight: '600', fontFamily: 'Inter, sans-serif' },
  statLabel: { fontSize: '11px', marginTop: '1px', fontFamily: 'Inter, sans-serif' },
  body: { padding: '1.5rem 2rem 3rem', maxWidth: '1100px', margin: '0 auto' },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  tag: { fontSize: '12px', padding: '5px 14px', borderRadius: '999px', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
  wall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.15s, box-shadow 0.15s', cursor: 'default' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', flexShrink: 0, fontFamily: 'Inter, sans-serif' },
  cardName: { fontSize: '15px', fontWeight: '600', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' },
  cardRole: { fontSize: '12px', marginTop: '1px', fontFamily: 'Inter, sans-serif' },
  cardDesc: { fontSize: '12.5px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Inter, sans-serif' },
  cardTags: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  ctag: { fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
  cardRate: { fontSize: '12.5px', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', marginTop: '2px' },
  newBadge: { fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#EAF3DE', color: '#3B6D11', fontWeight: '600', border: '0.5px solid #C0DD97', fontFamily: 'Inter, sans-serif' },
  viewBtn: { fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: '1.5px solid', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif' },
  empty: { textAlign: 'center', marginTop: '3rem', fontFamily: 'Inter, sans-serif' },
}

export default Home