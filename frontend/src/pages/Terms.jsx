export default function Terms() {
  const sections = [
    { title: '1. Legal Entity', body: 'BASTIN\'S is a brand operated under DOMINUS BONUS PRIVATE LIMITED. Registered Address: 12/430, Block No. 41-403, Perumbakkam Main Road, Nookkampalayam, Bollineni Hillside, Chennai, Chengalpattu, Tamil Nadu 600126. GST Registration Number: 33AALCD4602M1ZM.' },
    { title: '2. Acceptance of Terms', body: 'By accessing and using the BASTIN\'S website, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.' },
    { title: '3. Products & Pricing', body: 'All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices at any time. Product images are for representation purposes only; actual product may vary slightly.' },
    { title: '4. Orders & Payment', body: 'Orders are confirmed only after payment is received. We currently support Cash on Delivery (COD). We reserve the right to cancel orders due to stock unavailability or pricing errors.' },
    { title: '5. Shipping', body: 'We ship across India. Standard delivery takes 5–7 business days. Free shipping on orders above ₹999. Shipping charges of ₹99 apply to orders below ₹999.' },
    { title: '6. Returns & Exchanges', body: 'We accept returns within 7 days of delivery for unused, unwashed items in original packaging. Sale items are non-returnable. Contact us at mybastins@gmail.com to initiate a return.' },
    { title: '7. Intellectual Property', body: 'All content on this website including designs, logos, and text are the intellectual property of BASTIN\'S. You may not reproduce, distribute, or use any content without prior written permission.' },
    { title: '8. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials. BASTIN\'S is not liable for any unauthorized access resulting from your failure to secure your account.' },
    { title: '9. Limitation of Liability', body: 'BASTIN\'S shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.' },
    { title: '10. Changes to Terms', body: 'We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.' },
    { title: '11. Contact', body: 'For any queries regarding these Terms, contact us at mybastins@gmail.com or visit our Contact page.' }
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.4em] uppercase text-[#C8F135] mb-4">Legal</p>
        <h1 className="text-5xl font-black tracking-tight mb-2">TERMS &</h1>
        <h1 className="text-5xl font-black tracking-tight mb-10">CONDITIONS</h1>
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
