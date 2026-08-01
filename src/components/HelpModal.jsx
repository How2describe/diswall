import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const tabs = ['About', 'Privacy Policy', 'Terms of Service']

const content = {
  'About': {
    title: 'About DisWall',
    body: `DisWall is a Discord-powered commissioner marketplace that connects talented creators with people looking to hire them.

Whether you're an artist, music producer, developer, voice actor, tutor, or marketer — DisWall gives you a platform to showcase your services to a wider audience sourced directly from the Discord community.

How it works:
- Create an account and post your commissioner profile
- Your profile stays live for 30 days
- Earn points from profile clicks and Discord server bumps
- Use points to earn free publish credits
- Each category has a 30-day cooldown to keep the wall fresh

DisWall is completely free to use. We run non-intrusive ads to keep the platform running. You can support us by disabling ad blockers or donating via discord.

Built with ❤️ for the Discord community.`,
  },
  'Privacy Policy': {
    title: 'Privacy Policy',
    body: `Last updated: August 2026

DisWall ("we", "us", or "our") is committed to protecting your privacy. This policy explains what information we collect and how we use it.

Information we collect:
- Email address and password (for account creation)
- Username and Discord handle (provided by you)
- Discord ID (optional, for bump rewards)
- Profile information (display name, role, skills, rate, contact)
- Profile click data (anonymized fingerprint or user ID)

How we use your information:
- To provide and improve the DisWall platform
- To track points and publish credits
- To send in-app notifications (warnings, announcements)
- To display your commissioner profile to other users

We do not sell your personal data to third parties.

Third-party services:
- Supabase — database and authentication
- Google AdSense — advertising
- Discord — bot integration

Data retention:
Your data is retained as long as your account is active. You may request deletion by contacting us.

Contact: diswallhelpandservices@gmail.com or Artemissss412 on Discord 

for any questions regarding these terms.`,
  },
  'Terms of Service': {
    title: 'Terms of Service',
    body: `Last updated: August 2026

By using DisWall, you agree to the following terms.

1. Eligibility
You must be at least 13 years old to use DisWall. By creating an account, you confirm you meet this requirement.

2. Your profile
You are responsible for the accuracy of your commissioner profile. Do not post misleading, false, or harmful content. Profiles are live for 30 days and subject to removal if they violate these terms.

3. Points and credits
Points are earned through profile clicks and Discord server bumps. Credits earned from points can be used to publish profiles. Points and credits have no monetary value and cannot be transferred.

4. Prohibited conduct
You may not:
- Post false or misleading information
- Harass or abuse other users
- Attempt to manipulate the points system
- Use DisWall for illegal activities

5. Content moderation
DisWall admins reserve the right to remove profiles and warn or ban users who violate these terms without prior notice.

6. Disclaimer
DisWall is provided "as is" without warranties of any kind. We are not responsible for transactions between commissioners and clients.

7. Changes to terms
We may update these terms at any time. Continued use of DisWall after changes constitutes acceptance.

Contact: diswallhelpandservices@gmail.com or Artemissss412 on Discord 

for any questions regarding these terms.`,
  },
}

function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('About')
  const { dark } = useTheme()

  const t = dark ? themes.dark : themes.light
  const current = content[activeTab]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }} onClick={onClose}>
      <div
        style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `0.5px solid ${t.border}` }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: t.textPrimary, fontFamily: 'Inter, sans-serif' }}>Help & Information</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.textSecondary, fontFamily: 'Inter, sans-serif' }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '0.75rem 1.5rem', borderBottom: `0.5px solid ${t.border}` }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '8px', border: `0.5px solid ${activeTab === tab ? '#7F77DD' : t.border}`, background: activeTab === tab ? '#7F77DD' : 'transparent', color: activeTab === tab ? '#fff' : t.textSecondary, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: t.textPrimary, marginBottom: '1rem', fontFamily: 'Inter, sans-serif' }}>{current.title}</h3>
          <p style={{ fontSize: '13.5px', color: t.textSecondary, lineHeight: 1.8, whiteSpace: 'pre-line', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            {current.body}
          </p>
        </div>
      </div>
    </div>
  )
}

const themes = {
  light: {
    cardBg: '#fff',
    border: '#e4e4e7',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
  },
  dark: {
    cardBg: '#383A40',
    border: '#2B2D31',
    textPrimary: '#F2F3F5',
    textSecondary: '#B5BAC1',
  },
}

export default HelpModal