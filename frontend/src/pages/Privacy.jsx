export default function Privacy() {
  const sections = [
    { title: '1. Information We Collect', body: 'We collect information you provide when creating an account (name, email, phone, address), placing orders, and using our website. We also collect usage data such as pages visited and products viewed.' },
    { title: '2. How We Use Your Information', body: 'Your information is used to process orders, deliver products, send order confirmations, provide customer support, and improve our services. We do not sell your personal data to third parties.' },
    { title: '3. Data Storage & Security', body: 'Your data is stored securely. Passwords are hashed using bcrypt and are never stored in plain text. We use JWT tokens for session management. However, no method of internet transmission is 100% secure.' },
    { title: '4. Cookies', body: 'We use cookies and localStorage to maintain your cart, authentication session, and theme preferences. You can disable cookies in your browser settings, but some features may not work correctly.' },
    { title: '5. Sharing of Information', body: 'We may share your shipping address with our delivery partners solely for the purpose of order fulfillment. We do not share your data with advertisers or other third parties.' },
    { title: '6. Your Rights', body: 'You have the right to access, update, or delete your personal information at any time from your Account Dashboard. To request complete data deletion, contact us at privacy@bastins.com.' },
    { title: '7. Children\'s Privacy', body: 'Our website is not intended for users under the age of 13. We do not knowingly collect personal information from children.' },
    { title: '8. Changes to This Policy', body: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on our website.' },
    { title: '9. Contact', body: 'For privacy-related concerns, email us at privacy@bastins.com.' }
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.4em] uppercase text-[#C8F135] mb-4">Legal</p>
        <h1 className="text-5xl font-black tracking-tight mb-2">PRIVACY</h1>
        <h1 className="text-5xl font-black tracking-tight mb-10">POLICY</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: January 2024</p>
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title} className="border-t border-white/10 pt-8">
              <h2 className="font-black text-lg mb-3">{s.title}</h2>
              <p className="text-white/60 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
