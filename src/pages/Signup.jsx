import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [discord, setDiscord] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async () => {
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    const user = data.user
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      username,
      discord_handle: discord,
    })

    if (profileError) setError(profileError.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create an account</h2>
        <p style={styles.sub}>Join DisWall and get discovered</p>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input style={styles.input} type="text" placeholder="Discord handle (e.g. yourname#0001)" value={discord} onChange={e => setDiscord(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.btnFill} onClick={handleSignup} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Log in</Link></p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  card: {
    background: '#fff',
    border: '0.5px solid #e4e4e7',
    borderRadius: '12px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: { fontSize: '20px', fontWeight: '500', color: '#18181b' },
  sub: { fontSize: '14px', color: '#71717a' },
  error: { fontSize: '13px', color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px' },
  input: {
    fontSize: '14px',
    padding: '9px 12px',
    border: '0.5px solid #d4d4d8',
    borderRadius: '8px',
    outline: 'none',
    color: '#18181b',
  },
  btnFill: {
    fontSize: '14px',
    padding: '9px',
    borderRadius: '8px',
    background: '#7F77DD',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '500',
  },
  footer: { fontSize: '13px', color: '#71717a', textAlign: 'center' },
  link: { color: '#7F77DD', textDecoration: 'none', fontWeight: '500' },
}

export default Signup