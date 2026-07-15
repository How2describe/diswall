import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Log in to your DisWall account</p>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button style={styles.btnFill} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p style={styles.footer}>Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link></p>
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

export default Login