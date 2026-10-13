import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';

const apiUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? 'https://excellent-leaders-consortium.onrender.com/api'
    : 'http://localhost:5000/api');
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type ContactResponse = {
  message?: string;
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = ContactResponse & {
  token?: string;
  user?: AuthUser;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled frontend error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-screen">
          <div className="error-card">
            <p className="section-label">Something went wrong</p>
            <h1>We could not load this page.</h1>
            <p>Please refresh and try again. If the problem continues, contact the ELC team.</p>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh page
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function Header({ user, onAuthClick, onLogout }: { user: AuthUser | null; onAuthClick: () => void; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#programs", label: "Programs" },
    { href: "#impact", label: "Impact" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-mark">ELC</span>
          <span className="brand-text">Excellent Leaders Consortium</span>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Open"} navigation menu</span>
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
        <nav id="primary-navigation" className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Site navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
        {user ? (
          <div className="account-actions">
            <span className="account-name">Hi, {user.name.split(" ")[0]}</span>
            <button type="button" className="btn btn-outline" onClick={onLogout}>Log out</button>
          </div>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onAuthClick}>Join ELC</button>
        )}
      </div>
    </header>
  );
}

function HeroSection() {
  const heroSlides = ["v1.mp4", "v2.mp4", "v3.png"];

  return (
    <section id="home" className="hero-section">
      <div className="hero-background" aria-hidden="true">
        {heroSlides.map((src, index) => (
          src.endsWith(".mp4") ? (
            <video
              key={src}
              className={`hero-video hero-video--${index + 1}`}
              autoPlay
              muted
              loop
              playsInline
              preload={index === 0 ? "metadata" : "none"}
              poster={assetUrl("v3.png")}
            >
              <source src={assetUrl(src)} type="video/mp4" />
            </video>
          ) : (
            <img
              key={src}
              className={`hero-video hero-video--${index + 1}`}
              src={assetUrl(src)}
              alt=""
              loading="eager"
              fetchPriority="high"
            />
          )
        ))}
      </div>
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Leading for a stronger Africa</span>
          <h1>Building Africa's premier leadership ecosystem that raises ethical, visionary, and transformational leaders who shape nations and generations.</h1>
          <p>
            Excellent Leaders Consortium is a development hub for young changemakers who want to
            grow with confidence, make powerful community impact, and build lifelong leadership
            habits.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-primary">
              Apply Now
            </a>
            <a href="#programs" className="btn btn-secondary">
              Explore Programs
            </a>
          </div>
        </div>
        <aside className="hero-aside" aria-label="ELC impact highlights">
          <div className="hero-aside-top">
            <span className="hero-aside-dot" aria-hidden="true" />
            <span className="hero-aside-heading">Building Africa's next generation of leaders</span>
          </div>
          <div className="hero-aside-stat">
            <strong>150+</strong>
            <span>leaders equipped to create meaningful change</span>
          </div>
          <div className="hero-aside-divider" />
          <div className="hero-aside-footer">
            <span>Accra · Africa · Global</span>
            <span aria-hidden="true">↗</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="section section-about">
      <div className="container">
        <div className="section-header">
          <p className="section-label">About ELC</p>
          <h2>We develop bold, service-minded leaders for Africa’s future.</h2>
          <p>
            Our programs combine real-world leadership training, mentorship, and practical
            community projects so participants leave ready to lead schools, startups, nonprofits,
            and civic outcomes with competence and compassion.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Purpose-led development</h3>
            <p>
              Learn leadership from a values-driven framework that encourages social impact and
              long-term thinking.
            </p>
          </article>
          <article className="feature-card">
            <h3>Practical skills</h3>
            <p>
              Build confidence in communication, project delivery, problem solving, teamwork, and
              resilience.
            </p>
          </article>
          <article className="feature-card">
            <h3>Community impact</h3>
            <p>
              Work with peers on service projects designed to strengthen local communities and
              deliver measurable outcomes.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function ProgramsSection() {
  const programs = [
    {
      title: "LEAD THE CHANGE",
      description: "An annual leadership, innovation and impactful platform for the Excellent Leaders Consortium (ELC).",
    },
    {
      title: "LEADERS MIRROR",
      description: "Four weeks online course for students and young professionals.",
    },
    {
      title: "STUDENT LEADERDSHIP WORKSHOP (1 DAY)",
      description: "A one-day, in-person workshop introducing students to the fundamentals of leadership.",
    },
  ];

  return (
    <section id="programs" className="section section-programs">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Programs</p>
          <h2>Programs designed for early-career leaders and changemakers.</h2>
          <p>
            Each pathway is built to strengthen leadership character, expand influence, and help
            members move from good intentions to effective action.
          </p>
        </div>
        <div className="program-grid">
          {programs.map((program) => (
            <article key={program.title} className="program-card">
              <h3>{program.title}</h3>
              <p>{program.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const stats = [
    { value: "150+", label: "Leaders trained" },
    { value: "25", label: "Community projects launched" },
    { value: "12", label: "Partner schools and organizations" },
  ];

  return (
    <section id="impact" className="section section-impact">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Impact</p>
          <h2>Real leadership growth, real community results.</h2>
          <p>
            Our alumni are building stronger teams, more resilient schools, and more vibrant
            communities across the region.
          </p>
        </div>
        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "ELC changed the way I lead. I learned how to stay confident while bringing people together to solve real challenges.",
      author: "Amina, Cohort 2025",
    },
    {
      quote:
        "The mentorship and cohort energy were transformative. I finished with a clear plan to launch our community health initiative.",
      author: "Kofi, Community Bootcamp",
    },
  ];

  return (
    <section id="testimonials" className="section section-testimonials">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Testimonials</p>
          <h2>What our leaders say about ELC.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.author} className="testimonial-card">
              <p className="testimonial-quote">“{item.quote}”</p>
              <p className="testimonial-author">{item.author}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionSection() {
  return (
    <section className="section section-cta">
      <div className="container cta-card">
        <div>
          <p className="section-label">Ready to lead?</p>
          <h2>Join a cohort, launch a project, and grow with support.</h2>
        </div>
        <a href="#contact" className="btn btn-primary btn-cta">
          Start your application
        </a>
      </div>
    </section>
  );
}

function ContactSection() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submitContactForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      message: String(form.get('message') || ''),
    };

    try {
      const response = await fetchWithTimeout(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse<ContactResponse>(response);

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send your message. Please try again.');
      }

      formElement.reset();
      setStatus('success');
      setMessage(data.message || 'Thank you. Your message has been sent.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.');
    }
  }

  return (
    <section id="contact" className="section section-contact">
      <div className="container contact-grid">
        <div>
          <p className="section-label">Contact</p>
          <h2>Ready to join the next generation of excellent leaders?</h2>
          <p>
            Reach out to learn more about our cohorts, partnership opportunities, and upcoming
            workshops.
          </p>
          <div className="contact-details">
            <div>
              <strong>Phone</strong>
              <p>+233 247 639 270</p>
            </div>
            <div>
              <strong>Email</strong>
              <p>excellentleadersc@gmail.com</p>
            </div>
            <div>
              <strong>Social</strong>
              <p>@elc_global</p>
            </div>
          </div>
        </div>
        <form className="contact-form" onSubmit={submitContactForm}>
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" minLength={2} maxLength={100} required />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" maxLength={254} required />
          </label>
          <label>
            Message
            <textarea
              name="message"
              rows={5}
              placeholder="Tell us what inspired you to join."
              minLength={10}
              maxLength={2000}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status !== 'idle' && <p className={`form-message ${status}`} role="status">{message}</p>}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="brand-mark footer-elc">ELC</p>
          <p>Raising leaders, transforming the world.</p>
        </div>
        <p>© {new Date().getFullYear()} Excellent Leaders Consortium. All rights reserved.</p>
      </div>
    </footer>
  );
}

function AuthPanel({ onClose, onAuthenticated }: { onClose: () => void; onAuthenticated: (user: AuthUser, token: string) => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitAuthForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form);

    try {
      const response = await fetchWithTimeout(`${apiUrl}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJsonResponse<AuthResponse>(response);
      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.message || "The server could not process your request. Please try again.");
      }
      onAuthenticated(data.user, data.token);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to authenticate. Please try again.");
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth-close" aria-label="Close authentication dialog" onClick={onClose}>×</button>
        <p className="section-label">{mode === "register" ? "Start your journey" : "Welcome back"}</p>
        <h2 id="auth-title">{mode === "register" ? "Create your ELC account" : "Log in to ELC"}</h2>
        <p className="auth-subtitle">
          {mode === "register" ? "Join a community of purpose-driven leaders." : "Continue growing with your leadership community."}
        </p>
        <form className="auth-form" onSubmit={submitAuthForm}>
          {mode === "register" && (
            <label>Name<input name="name" type="text" placeholder="Your full name" minLength={2} maxLength={100} required /></label>
          )}
          <label>Email<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength={8} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} required /></label>
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}
          </button>
          {status === "error" && <p className="form-message error" role="alert">{message}</p>}
        </form>
        <p className="auth-switch">
          {mode === "register" ? "Already have an account?" : "New to ELC?"}
          <button type="button" onClick={() => { setMode(mode === "register" ? "login" : "register"); setStatus("idle"); }}>
            {mode === "register" ? "Log in" : "Create an account"}
          </button>
        </p>
      </section>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("elc_user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem("elc_user");
      return null;
    }
  });
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("elc_token");
    if (!token) return;

    fetchWithTimeout(`${apiUrl}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await readJsonResponse<AuthResponse>(response);
        if (!response.ok || !data.user) throw new Error("Session expired");
        localStorage.setItem("elc_user", JSON.stringify(data.user));
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("elc_token");
        localStorage.removeItem("elc_user");
        setUser(null);
      });
  }, []);

  function handleAuthenticated(authUser: AuthUser, token: string) {
    localStorage.setItem("elc_token", token);
    localStorage.setItem("elc_user", JSON.stringify(authUser));
    setUser(authUser);
    setAuthOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("elc_token");
    localStorage.removeItem("elc_user");
    setUser(null);
  }

  return (
    <div className="app">
      <Header user={user} onAuthClick={() => setAuthOpen(true)} onLogout={handleLogout} />
      <main>
        <HeroSection />
        <AboutSection />
        <ProgramsSection />
        <ImpactSection />
        <TestimonialsSection />
        <ActionSection />
        <ContactSection />
      </main>
      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />}
      <Footer />
    </div>
  );
}

export default App;
