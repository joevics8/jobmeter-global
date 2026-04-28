'use client';

import { useEffect } from 'react';

export default function ExtensionWelcomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black: #0d0d0d;
          --white: #f8f7f4;
          --gray-100: #f0efe9;
          --gray-300: #d1cfc6;
          --gray-500: #888880;
          --gray-700: #3a3a36;
          --accent: #2563eb;
          --green: #16a34a;
          --green-light: #dcfce7;
        }
        html { scroll-behavior: smooth; }
        body {
          background: var(--white);
          color: var(--black);
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          line-height: 1.6;
          min-height: 100vh;
          overflow-x: hidden;
        }
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(248, 247, 244, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-300);
        }
        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: var(--black);
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-dot {
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }
        .nav-cta {
          background: var(--black);
          color: var(--white);
          padding: 10px 22px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .hero {
          padding: 160px 48px 100px;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--green-light);
          color: var(--green);
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s ease both;
        }
        .hero-badge::before {
          content: '';
          width: 7px;
          height: 7px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(40px, 5vw, 60px);
          line-height: 1.08;
          letter-spacing: -2px;
          margin-bottom: 24px;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .hero-title em {
          font-style: normal;
          color: var(--accent);
        }
        .hero-sub {
          font-size: 17px;
          color: var(--gray-700);
          line-height: 1.65;
          margin-bottom: 40px;
          font-weight: 300;
          animation: fadeUp 0.5s 0.2s ease both;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .btn-primary {
          background: var(--black);
          color: var(--white);
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .btn-secondary {
          background: transparent;
          color: var(--black);
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1.5px solid var(--gray-300);
        }
        .hero-visual { animation: fadeUp 0.6s 0.2s ease both; }
        .mock-page {
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          position: relative;
        }
        .mock-topbar {
          background: var(--gray-100);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--gray-300);
        }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mock-url {
          flex: 1;
          background: white;
          border: 1px solid var(--gray-300);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--gray-500);
          margin-left: 8px;
        }
        .mock-content {
          padding: 24px;
          font-size: 13px;
          line-height: 1.8;
          color: #333;
          min-height: 200px;
          position: relative;
        }
        .mock-content h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .hl-salary { background: #d1fae5; color: #065f46; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #10b981; }
        .hl-skill { background: #e0e7ff; color: #3730a3; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #6366f1; }
        .hl-remote { background: #e9d5ff; color: #6b21a8; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #a855f7; }
        .hl-exp { background: #fed7aa; color: #9a3412; padding: 1px 4px; border-radius: 3px; border-bottom: 2px solid #f97316; }
        .mock-widget {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 180px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          overflow: hidden;
          font-size: 11px;
          animation: widgetPop 0.5s 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes widgetPop {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .mock-widget-head {
          background: #1f2937;
          color: white;
          padding: 8px 10px;
          font-weight: 600;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .mock-widget-score {
          padding: 10px;
          text-align: center;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        .score-num {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #1f2937;
        }
        .score-sub { font-size: 10px; color: #6b7280; }
        .mock-widget-items { padding: 8px 10px; }
        .mock-widget-item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 0;
          font-size: 10px;
        }
        .mock-widget-item.ok { color: #065f46; }
        .mock-widget-item.warn { color: #92400e; }
        .section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 48px;
        }
        .section-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--gray-500);
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(28px, 4vw, 44px);
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 60px;
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--gray-300);
          border: 1px solid var(--gray-300);
          border-radius: 12px;
          overflow: hidden;
        }
        .step {
          background: var(--white);
          padding: 36px 32px;
        }
        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: var(--gray-300);
          line-height: 1;
          margin-bottom: 20px;
        }
        .step h3 {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .step p {
          font-size: 14px;
          color: var(--gray-700);
          line-height: 1.6;
        }
        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .highlight-card {
          background: var(--gray-100);
          border-radius: 10px;
          padding: 28px;
          border: 1px solid var(--gray-300);
        }
        .highlight-swatch {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .highlight-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .highlight-card p {
          font-size: 14px;
          color: var(--gray-700);
        }
        .highlight-example {
          margin-top: 12px;
          font-size: 12px;
          color: var(--gray-500);
          font-style: italic;
        }
        .setup-strip {
          background: var(--gray-100);
          border-top: 1px solid var(--gray-300);
          border-bottom: 1px solid var(--gray-300);
        }
        .setup-strip .section { padding: 80px 48px; }
        .setup-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          counter-reset: setup;
        }
        .setup-item {
          counter-increment: setup;
          position: relative;
        }
        .setup-item::before {
          content: counter(setup);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--black);
          color: var(--white);
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          border-radius: 50%;
          margin-bottom: 16px;
        }
        .setup-item h4 {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .setup-item p {
          font-size: 13px;
          color: var(--gray-700);
        }
        .cta-block { background: var(--black); color: var(--white); }
        .cta-block .section { text-align: center; padding: 100px 48px; }
        .cta-block .section-title { color: var(--white); margin-bottom: 16px; }
        .cta-sub {
          font-size: 17px;
          color: var(--gray-300);
          margin-bottom: 40px;
          font-weight: 300;
        }
        .cta-block .btn-primary {
          background: var(--white);
          color: var(--black);
          font-size: 16px;
          padding: 16px 36px;
        }
        .cta-block .btn-primary:hover { box-shadow: 0 8px 32px rgba(255,255,255,0.2); }
        .cta-note { margin-top: 20px; font-size: 13px; color: var(--gray-500); }
        footer {
          background: var(--black);
          border-top: 1px solid var(--gray-700);
          padding: 32px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        footer .logo { color: var(--white); }
        .footer-links { display: flex; gap: 28px; }
        .footer-links a {
          font-size: 13px;
          color: var(--gray-500);
          text-decoration: none;
        }
        .footer-links a:hover { color: var(--white); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 860px) {
          nav { padding: 16px 24px; }
          .hero { grid-template-columns: 1fr; gap: 48px; padding: 120px 24px 60px; }
          .hero-visual { order: -1; }
          .section { padding: 60px 24px; }
          .steps { grid-template-columns: 1fr; }
          .highlights-grid { grid-template-columns: 1fr; }
          .setup-steps { grid-template-columns: 1fr 1fr; }
          footer { flex-direction: column; gap: 20px; text-align: center; padding: 24px; }
          .footer-links { flex-wrap: wrap; justify-content: center; }
        }
        @media (max-width: 540px) { .setup-steps { grid-template-columns: 1fr; } }
      `}</style>

      <nav>
        <a href="https://remote.jobmeter.app" className="logo">
          <span className="logo-dot"></span>
          JobMeter
        </a>
        <a href="https://remote.jobmeter.app/signup" className="nav-cta">Create free account</a>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <div className="hero-badge">Extension installed successfully</div>
          <h1 className="hero-title">
            Job hunting<br />just got a lot<br /><em>smarter.</em>
          </h1>
          <p className="hero-sub">
            JobMeter now sits quietly in your browser, automatically highlighting salary, skills, experience, and work mode on every job page you visit — so you can see what matters in seconds, not minutes.
          </p>
          <div className="hero-actions">
            <a href="https://remote.jobmeter.app/signup" className="btn-primary">Create your free account</a>
            <a href="#how-it-works" className="btn-secondary">See how it works</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="mock-page">
            <div className="mock-topbar">
              <div className="mock-dot" style={{ background: '#ff5f57' }}></div>
              <div className="mock-dot" style={{ background: '#febc2e' }}></div>
              <div className="mock-dot" style={{ background: '#28c840' }}></div>
              <div className="mock-url">linkedin.com/jobs/view/senior-product-designer</div>
            </div>
            <div className="mock-content">
              <h3>Senior Product Designer</h3>
              <p>
                We&apos;re looking for a <span className="hl-exp">Senior designer</span> with
                <span className="hl-exp">5+ years of experience</span> in product design.
                You&apos;ll work with <span className="hl-skill">Figma</span>,
                <span className="hl-skill">React</span>, and
                <span className="hl-skill">TypeScript</span> teams.
                This is a <span className="hl-remote">Remote</span> role.
                <br /><br />
                Compensation: <span className="hl-salary">$130,000 – $160,000</span> per year, plus equity.
              </p>

              <div className="mock-widget">
                <div className="mock-widget-head">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#2563eb"/>
                    <path d="M12 6L8 18M16 6L12 18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  JobMeter
                </div>
                <div className="mock-widget-score">
                  <div className="score-num">82%</div>
                  <div className="score-sub">Job Match Score</div>
                </div>
                <div className="mock-widget-items">
                  <div className="mock-widget-item ok">✓ 4/5 skills match</div>
                  <div className="mock-widget-item ok">✓ Remote available</div>
                  <div className="mock-widget-item ok">✓ Salary listed</div>
                  <div className="mock-widget-item warn">⚠ Senior level req.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="reveal">
          <div className="section-label">How it works</div>
          <div className="section-title">Open a job page.<br />Everything happens automatically.</div>
        </div>
        <div className="steps reveal">
          <div className="step">
            <div className="step-num">01</div>
            <h3>You open a job posting</h3>
            <p>On LinkedIn, Indeed, Glassdoor, Greenhouse, Lever — anywhere. The extension detects it instantly.</p>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <h3>Key info gets highlighted</h3>
            <p>Salary, remote/hybrid, required skills, and experience are color-coded so your eye goes straight to what matters.</p>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <h3>You see your match score</h3>
            <p>A clean widget shows how well the job fits your profile. Green checks, yellow warnings. Done.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="reveal">
          <div className="section-label">What gets highlighted</div>
          <div className="section-title">Four things. The right four things.</div>
        </div>
        <div className="highlights-grid reveal">
          <div className="highlight-card">
            <div className="highlight-swatch" style={{ background: '#d1fae5', color: '#065f46' }}>
              💰 Salary
            </div>
            <h3>Compensation</h3>
            <p>Any salary range, hourly rate, or annual figure — in any currency. Never miss buried pay info again.</p>
            <div className="highlight-example">e.g. &quot;$130,000 – $160,000&quot; · &quot;£60k&quot; · &quot;€80,000 per year&quot;</div>
          </div>
          <div className="highlight-card">
            <div className="highlight-swatch" style={{ background: '#e9d5ff', color: '#6b21a8' }}>
              📍 Work Mode
            </div>
            <h3>Remote / Hybrid / On-site</h3>
            <p>Instantly see how flexible the role is, without reading three paragraphs to find out.</p>
            <div className="highlight-example">e.g. &quot;Remote&quot; · &quot;Hybrid 3 days&quot; · &quot;On-site required&quot;</div>
          </div>
          <div className="highlight-card">
            <div className="highlight-swatch" style={{ background: '#e0e7ff', color: '#3730a3' }}>
              🛠 Skills
            </div>
            <h3>Technical Skills</h3>
            <p>200+ skills in our database — from JavaScript and Python to Kubernetes and Figma. Every match highlighted automatically.</p>
            <div className="highlight-example">e.g. React, TypeScript, AWS, PostgreSQL, Docker</div>
          </div>
          <div className="highlight-card">
            <div className="highlight-swatch" style={{ background: '#fed7aa', color: '#9a3412' }}>
              ⏱ Experience
            </div>
            <h3>Experience Required</h3>
            <p>Know immediately if the role is junior, mid, or senior — and how many years they&apos;re actually looking for.</p>
            <div className="highlight-example">e.g. &quot;5+ years&quot; · &quot;Senior level&quot; · &quot;Entry level welcome&quot;</div>
          </div>
        </div>
      </section>

      <div className="setup-strip">
        <section className="section">
          <div className="reveal">
            <div className="section-label">Get set up</div>
            <div className="section-title">Takes two minutes.<br />Pays off every day.</div>
          </div>
          <div className="setup-steps reveal">
            <div className="setup-item">
              <h4>Click the extension icon</h4>
              <p>Find the JobMeter icon in your Chrome toolbar. Pin it for easy access.</p>
            </div>
            <div className="setup-item">
              <h4>Add your skills</h4>
              <p>Type in your tech stack — React, Python, whatever you know — and save your profile.</p>
            </div>
            <div className="setup-item">
              <h4>Set your preferences</h4>
              <p>Remote or hybrid? Minimum salary? Senior or mid-level? Tell us once.</p>
            </div>
            <div className="setup-item">
              <h4>Browse jobs as normal</h4>
              <p>That&apos;s it. Open any job posting and JobMeter does the rest automatically.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="cta-block">
        <section className="section">
          <div className="reveal">
            <div className="section-title">The extension is free.<br />Create your account to unlock everything.</div>
            <p className="cta-sub">Save your profile across devices, track applications, and get deeper salary insights on remote.jobmeter.app.</p>
            <a href="https://remote.jobmeter.app/signup" className="btn-primary">Create free account →</a>
            <p className="cta-note">No credit card. No nonsense.</p>
          </div>
        </section>
      </div>

      <footer>
        <a href="https://remote.jobmeter.app" className="logo">
          <span className="logo-dot"></span>
          JobMeter
        </a>
        <div className="footer-links">
          <a href="https://remote.jobmeter.app">Home</a>
          <a href="https://remote.jobmeter.app/privacy">Privacy</a>
          <a href="https://remote.jobmeter.app/terms">Terms</a>
          <a href="help.jobmeter@gmail.com">Support</a>
        </div>
      </footer>
    </>
  );
}
