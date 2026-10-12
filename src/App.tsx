import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import projectsData from './data/projects.json'
import testimonialsData from './data/testimonials.json'
import servicesData from './data/services.json'
import socialsData from './data/socials.json'
import figmaData from './data/figma.json'
import figmaAspects from './data/figma-aspects.json'
import './App.css'

const figmaAspectRatios = figmaAspects as Record<string, number>

gsap.registerPlugin(ScrollTrigger)
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const assets = {
  gingham: '/gingham.webp',
  desk: '/desk.webp',
}

const roles = ['Product Designer', 'Design Engineer']

function RoleRotator() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((current) => (current + 1) % roles.length), 2600)
    return () => window.clearInterval(id)
  }, [])
  return <span className="role-rotator" aria-label={roles.join(' and ')}>
    {roles.map((role, i) => (
      <span key={role} className={`role${i === index ? ' is-active' : ''}`} aria-hidden="true">{role}</span>
    ))}
  </span>
}

type Route = '/' | '/contact'

function go(path: Route) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function navigateWork() {
  const scrollToWork = () => {
    document.getElementById('selected-work')?.scrollIntoView({ behavior: 'smooth' })
  }
  if (window.location.pathname !== '/') {
    go('/')
    setTimeout(scrollToWork, 80)
  } else {
    scrollToWork()
  }
}

function Header({ onOpenPlayground }: { onOpenPlayground: () => void }) {
  const headerRef = useRef<HTMLElement>(null)
  useClientLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo(headerRef.current, { y: -10 }, { y: 0, duration: .65, ease: 'power2.out' })
    }, headerRef)
    return () => context.revert()
  }, [])
  return <header className="site-header" ref={headerRef}>
    <div><b>Quick Links</b><nav aria-label="Primary"><a href="/">Home</a>, <a href="/#selected-work" onClick={(event) => { event.preventDefault(); navigateWork() }}>Work</a>, <a href="/contact">Contact</a>, <button type="button" className="nav-link-button" onClick={onOpenPlayground}>Playground</button></nav></div>
    <div className="header-right"><b className="header-location">Based in India</b><RoleRotator /></div>
  </header>
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  useClientLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.fromTo(footerRef.current, { y: 14 }, { y: 0, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: footerRef.current, start: 'top 92%', once: true } })
    }, footerRef)
    return () => context.revert()
  }, [])
  return <footer className="site-footer" ref={footerRef}>
    <b>Harshita</b>
    <nav aria-label="Footer"><a href="/">Home</a> · <a href="/#selected-work" onClick={(e) => { e.preventDefault(); navigateWork() }}>Work</a> · <a href="/contact">Contact</a></nav>
    <p>{socialsData.map((social, i) => (
      <span key={social.name}><a href={social.url} target="_blank" rel="noreferrer">{social.name}</a>{i < socialsData.length - 1 ? ' · ' : ''}</span>
    ))}</p>
    <span>© 2026 Harshita</span>
  </footer>
}

function Texture({ children, className = '', 'aria-labelledby': labelledBy }: { children: React.ReactNode, className?: string, 'aria-labelledby'?: string }) {
  return <section className={`texture ${className}`} aria-labelledby={labelledBy} style={{ backgroundImage: `linear-gradient(rgba(248,245,242,.72), rgba(248,245,242,.72)), url(${assets.gingham})` }}>{children}</section>
}

interface StackProject {
  id: string
  num: string
  title: string
  category: string
  desc: string
  alt: string
  role?: string
  tools?: string[]
  timeline?: string
  outcome?: string
  tags: string[]
  behance: string
  bgGradient: string
  bgImage: string
  bgImageMobile?: string
  imageWidth: number
  imageHeight: number
}

const stackProjects: StackProject[] = projectsData
// TODO(owner): Replace the Sedative Physio Behance profile URL in projects.json with its case-study URL.
// TODO(owner): Add verified role, tools, timeline, and outcome details for CyberSec Toolkit and Sedative Physio.

function ProjectStack() {
  const stackRef = useRef<HTMLElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const scrollToProject = useCallback((idx: number) => {
    if (!stRef.current) return
    const targets = [0.02, 0.52, 0.98]
    const targetProgress = targets[idx] ?? 0
    const start = stRef.current.start
    const end = stRef.current.end
    const scrollPos = start + (end - start) * targetProgress
    window.scrollTo({ top: scrollPos, behavior: 'smooth' })
  }, [])

  useClientLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
      const n = cards.length
      if (!n) return

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isReduced) {
        // Cascade the cards vertically so every project stays visible
        cards.forEach((card, i) => {
          gsap.set(card, {
            y: i * 56,
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            zIndex: i + 1,
          })
        })
        const bg = stackRef.current?.querySelector<HTMLElement>('.stack-bg')
        if (bg) gsap.set(bg, { clearProps: 'transform,filter' })
        return
      }

      const w = window.innerWidth
      const isMobile = w < 650
      const isTablet = w < 1050
      const leftShift = isMobile ? -68 : (isTablet ? -54 : -60)
      const rightShift = isMobile ? 68 : (isTablet ? 54 : 60)
      const rotAngle = isMobile ? 3 : 4
      const sideScale = isMobile ? 0.88 : 0.92
      const sideOpacity = isMobile ? 0.5 : 0.82

      // Initial positions:
      // Card 0 starts in center
      // Cards 1 and 2 wait below the fold
      gsap.set(cards[0], {
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        rotation: 0,
        zIndex: 30,
        autoAlpha: 1,
        filter: 'brightness(1)',
      })
      gsap.set(cards[1], {
        xPercent: 0,
        yPercent: 120,
        scale: 1,
        rotation: 0,
        zIndex: 25,
        autoAlpha: 0,
        filter: 'brightness(1)',
      })
      gsap.set(cards[2], {
        xPercent: 0,
        yPercent: 120,
        scale: 1,
        rotation: 0,
        zIndex: 20,
        autoAlpha: 0,
        filter: 'brightness(1)',
      })

      // Scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (isMobile ? 1.8 : 2.2)}`,
          scrub: isMobile ? 0.3 : 0.8,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress
            if (p < 0.38) {
              setActiveIdx(0)
            } else if (p < 0.76) {
              setActiveIdx(1)
            } else {
              setActiveIdx(2)
            }
          },
        },
      })

      stRef.current = tl.scrollTrigger ?? null

      // Background atmospheric depth (skip blur on mobile — too expensive)
      if (!isMobile) {
        tl.to('.stack-bg', { filter: 'blur(10px)', scale: 1.07, ease: 'none', duration: 2.4 }, 0)
      } else {
        tl.to('.stack-bg', { scale: 1.07, ease: 'none', duration: 2.4 }, 0)
      }
      tl.to('.stack-fade', { backgroundColor: 'rgba(38, 28, 25, 0.48)', ease: 'none', duration: 2.4 }, 0)

      // Hold Card 0 slightly at start (0 -> 0.15)

      // Transition 1: As Card 1 enters center from below, Card 0 moves LEFT
      tl.to(cards[0], {
        xPercent: leftShift,
        rotation: -rotAngle,
        scale: sideScale,
        ...(isMobile ? {} : { filter: 'brightness(0.82)' }),
        opacity: sideOpacity,
        zIndex: 10,
        duration: 0.9,
        ease: 'power2.out',
      }, 0.15)
      tl.to(cards[1], {
        yPercent: 0,
        autoAlpha: 1,
        zIndex: 30,
        duration: 0.9,
        ease: 'power2.out',
      }, 0.15)

      // Hold Card 1 in center (1.05 -> 1.25)

      // Transition 2: As Card 2 enters center from below, Card 1 moves RIGHT
      tl.to(cards[1], {
        xPercent: rightShift,
        rotation: rotAngle,
        scale: sideScale,
        ...(isMobile ? {} : { filter: 'brightness(0.82)' }),
        opacity: sideOpacity,
        zIndex: 20,
        duration: 0.9,
        ease: 'power2.out',
      }, 1.25)
      tl.to(cards[0], {
        xPercent: leftShift * 1.04,
        scale: sideScale * 0.96,
        opacity: isMobile ? 0.35 : sideOpacity,
        duration: 0.9,
        ease: 'power2.out',
      }, 1.25)
      tl.to(cards[2], {
        yPercent: 0,
        autoAlpha: 1,
        zIndex: 35,
        duration: 0.9,
        ease: 'power2.out',
      }, 1.25)

      // Buffer at end so user can read card 2 comfortably
      tl.to({}, { duration: 0.25 })
    }, stackRef)

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 350)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(refreshTimer)
      window.removeEventListener('resize', onResize)
      context.revert()
    }
  }, [])

  useClientLayoutEffect(() => {
    const applyBackgrounds = () => {
      const bg = stackRef.current?.querySelector<HTMLElement>('.stack-bg')
      if (bg) bg.style.backgroundImage = "linear-gradient(rgba(248,245,242,.62), rgba(248,245,242,.62)), url('/gingham.webp')"
    }
    const target = stackRef.current
    if (!target) return
    if (!('IntersectionObserver' in window)) { applyBackgrounds(); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        applyBackgrounds()
        io.disconnect()
      }
    }, { rootMargin: '900px 0px' })
    io.observe(target)
    return () => io.disconnect()
  }, [])

  return (
    <section id="selected-work" className="project-stack" aria-labelledby="selected-work-title" ref={stackRef}>
      <div className="stack-bg" aria-hidden="true" />
      <div className="stack-fade" aria-hidden="true" />
      <div className="stack-header">
        <div className="stack-heading-text">
          <h2 id="selected-work-title">SELECTED WORK</h2>
        </div>
        <div className="stack-nav" role="group" aria-label="Selected work navigation">
          {stackProjects.map((proj, idx) => (
            <button
              key={proj.id}
              type="button"
              aria-pressed={activeIdx === idx}
              className={`stack-nav-pill ${activeIdx === idx ? 'is-active' : ''}`}
              onClick={() => scrollToProject(idx)}
            >
              <span className="pill-index">{proj.num}</span>
              <span className="pill-title">{proj.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="stack-area">
        {stackProjects.map((proj, i) => (
          <article
            className={`stack-card stack-card-${i} ${activeIdx === i ? 'active-card' : 'inactive-side-card'}`}
            key={proj.id}
            style={{ '--card-scrim': proj.bgGradient } as React.CSSProperties}
            onClick={() => {
              if (activeIdx !== i) scrollToProject(i)
            }}
          >
            <picture className="stack-card-visual">
              {proj.bgImageMobile && <source media="(max-width: 768px)" srcSet={proj.bgImageMobile} />}
              <img
                src={proj.bgImage}
                alt={proj.alt}
                width={proj.imageWidth}
                height={proj.imageHeight}
                decoding="async"
                loading="lazy"
              />
            </picture>
            <div className="stack-card-top">
              <span className="stack-card-tag">{proj.category}</span>
              <span className="stack-card-num">{proj.num} / {String(stackProjects.length).padStart(2, '0')}</span>
            </div>
            <div className="stack-card-body">
              <h3>{proj.title}</h3>
              <p>{proj.desc}</p>
              {(proj.role || proj.tools?.length || proj.timeline) && <p className="stack-card-meta">{[proj.role, proj.tools?.join(', '), proj.timeline].filter(Boolean).join(' · ')}</p>}
              {proj.outcome && <p className="stack-card-outcome">{proj.outcome}</p>}
              <div className="stack-card-pills">
                {proj.tags.map((pill) => (
                  <span className="stack-pill-tag" key={pill}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="stack-card-footer">
              <a className="stack-card-btn" href={proj.behance} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                View {proj.title} case study on Behance <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Home() {
  const homeRef = useRef<HTMLDivElement>(null)
  useClientLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const context = gsap.context(() => {
        gsap.set('.home-intro > div, .name-letter, .avatar, .home-about > div, .home-about figure', { clearProps: 'transform' })
      }, homeRef)
      return () => context.revert()
    }
    const context = gsap.context(() => {
      gsap.fromTo('.home-intro > div', { y: 8 }, { y: 0, duration: .8, ease: 'power2.out', delay: .12 })
      gsap.fromTo('.avatar', { y: 8 }, { y: 0, duration: .85, ease: 'power2.out', delay: .24 })
      gsap.fromTo('.name-letter', { y: 14 }, { y: 0, duration: .55, stagger: .055, ease: 'power3.out', delay: .36 })
      gsap.to('.avatar', { y: -6, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.1 })
      gsap.fromTo('.home-about figure', { y: 12 }, { y: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.home-about', start: 'top 82%', once: true } })
      gsap.fromTo('.home-about > div', { y: 12 }, { y: 0, duration: .7, ease: 'power2.out', delay: .12, scrollTrigger: { trigger: '.home-about', start: 'top 82%', once: true } })
    }, homeRef)
    return () => context.revert()
  }, [])
  return <>
    <div ref={homeRef} className="home-page">
      <section className="home-intro"><div><p>I design and build clear interfaces for<br />SaaS, web and mobile products.<br /><span className="dil-se"><span className="dil-se-hi" lang="hi">दिल से.</span><span className="dil-se-en">from heart.</span></span></p></div><img className="avatar" src="/avatar.webp" width="190" height="190" decoding="async" loading="eager" fetchPriority="high" alt="Illustrated portrait of Harshita Upadhyay" /></section>
      <div className="name-display" aria-hidden="true">{'Harshita'.split('').map((letter, index) => <span className="name-letter" key={`${letter}-${index}`}>{letter}</span>)}</div>
      {/* TODO(owner): Add city, education, certifications, and internship details when verified. */}
      <Texture className="home-about" aria-labelledby="about-title"><h2 className="visually-hidden" id="about-title">About Harshita</h2><figure><img src={assets.desk} width="982" height="949" loading="lazy" decoding="async" alt="A cosy illustrated designer workspace" /></figure><div><p>Hi, I’m <strong>Harshita Upadhyay</strong>, a Product Designer &amp; Design Engineer in India. I design thoughtful digital experiences for SaaS, web and mobile products, and use AI-assisted coding to bring my designs to life.</p><p>My recent work includes CyberSec Toolkit and Sedative Physio. Currently, I’m designing and building <strong>Designer’s Room</strong>.</p><p>~I design with intention.</p><div className="button-row"><a href="/#selected-work" onClick={(e) => { e.preventDefault(); navigateWork() }}>View selected work</a>{/* TODO(owner): Add public/resume.pdf and relink. */}<a href="/contact">Get in touch</a></div></div></Texture>
      <section className="home-promise" aria-labelledby="promise-title"><h2 id="promise-title">I MAKE DESIGNS<br />PEOPLE REMEMBER</h2><p>I design clean websites, apps and design systems that make ideas clearer, feel more<br />intuitive and work with purpose, bringing them to life with AI-assisted coding.</p></section>
    </div>
    <ProjectStack />
    <RecentWriting />
    <TestimonialsSection />
  </>
}

function RecentWriting() {
  return (
    <section className="recent-writing" aria-labelledby="recent-writing-title">
      <div className="recent-writing-inner">
        <div className="recent-writing-heading">
          <h2 id="recent-writing-title">Recent articles &amp; writings</h2>
        </div>
        <a
          className="article-card"
          href="https://www.skediodesign.in/blog/what-is-a-design-system-why-startups-need-one"
          target="_blank"
          rel="noopener"
        >
          <span className="article-card-top"><span>DESIGN SYSTEMS</span><span>SKEDIO DESIGN</span></span>
          <span className="article-card-title">What Is a Design System? Why Startups Need One</span>
          <span className="article-card-byline">Written for Skedio Design.</span>
          <span className="article-card-bottom">
            <span className="article-card-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M8 7h9v9" /></svg>
            </span>
          </span>
        </a>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = testimonialsData[activeIdx]

  useEffect(() => {
    if (testimonialsData.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => {
      setActiveIdx((current) => (current + 1) % testimonialsData.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-title">
      <div className="testimonials-header">
        <span className="testimonials-badge">COLLABORATIONS &amp; WORDS</span>
        <h2 className="testimonials-title" id="testimonials-title">Thoughtful teams and collaborators.</h2>
      </div>
      <div className="testimonial-grid">
        <article
          className="testimonial-feature"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="feature-orbit" aria-hidden="true" />
          <img className="feature-avatar" src={`/testimonial${activeIdx + 1}.webp`} alt={`${active.person}`} width="56" height="56" decoding="async" loading="lazy" />
          <figure className="feature-quote"><blockquote key={active.id}>“{active.quote}”</blockquote><figcaption className="feature-person"><strong>{active.person}</strong><span>{active.role}</span></figcaption></figure>
        </article>
        {testimonialsData.map((t, index) => (
          <article className={`testimonial-card testimonial-card-${index + 1}${index === activeIdx ? ' is-selected' : ''}`} key={t.id}>
            <span className="testimonial-card-mark" aria-hidden="true">“</span>
            <figure className="testimonial-quote">{index !== activeIdx && <blockquote>{t.quote}</blockquote>}
            <figcaption className="testimonial-person">
              <img className="testimonial-avatar" src={`/testimonial${index + 1}.webp`} alt={`${t.person}`} width="39" height="39" decoding="async" loading="lazy" />
              <span className="testimonial-person-copy"><strong>{t.person}</strong><small>{t.role}</small></span>
            </figcaption></figure>
          </article>
        ))}
      </div>
    </section>
  )
}

// TODO(owner): Add a verified public email to socials.json before rendering a direct email link.
function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('https://formsubmit.co/ajax/harshitaupadhyay7741@gmail.com', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.currentTarget),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }
  return <><h1 className="contact-title" id="contact-title">Have a project, idea, or opportunity?<br className="desktop" /> I’d love to hear from you.</h1><Texture className="contact-area" aria-labelledby="contact-title"><form onSubmit={submit}>
    <input type="hidden" name="_subject" value="New message from your portfolio" />
    <input type="text" name="_honey" className="honey-pot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <label>Name<input name="name" required placeholder="Jane Smith" disabled={status === 'sending'} /></label>
    <label>Email<input name="email" required type="email" placeholder="yourmail@gmail.com" disabled={status === 'sending'} /></label>
    <label>Service<select name="service" defaultValue={servicesData[0].name}>{servicesData.map((service) => <option key={service.name}>{service.name}</option>)}</select></label>
    <label>Message<textarea name="message" rows={5} required placeholder="Tell me about your project…" disabled={status === 'sending'} /></label>
    <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : status === 'sent' ? 'Thank you!' : status === 'error' ? 'Try again' : 'Submit'}</button>
    {status === 'sent' && <p className="form-note ok">Message sent — I’ll get back to you soon.</p>}
    {status === 'error' && <p className="form-note err">Couldn’t send. Please try again later.</p>}
  </form></Texture></>
}

function figmaSrc(url: string) {
  try {
    const parsed = new URL(url)
    if (!/(^|\.)figma\.com$/.test(parsed.hostname)) return url
    parsed.hostname = 'embed.figma.com'
    if (!parsed.searchParams.has('embed-host')) parsed.searchParams.set('embed-host', 'portfolio')
    parsed.searchParams.set('footer', 'false')
    parsed.searchParams.set('page-selector', 'false')
    if (isPrototype(url)) {
      parsed.searchParams.set('scaling', 'contain')
      parsed.searchParams.set('device-frame', 'false')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

function isPrototype(url: string) {
  return /figma\.com\/proto\//.test(url)
}

function Playground({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const frameRef = useRef(0)
  const redrawRef = useRef<() => void>(() => {})

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !stage || !context) return

    const render = () => {
      frameRef.current = 0
      const dpr = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      const { x, y, scale } = viewRef.current
      const spacing = Math.max(26, 44 * scale)
      const startX = ((x % spacing) + spacing) % spacing - spacing
      const startY = ((y % spacing) + spacing) % spacing - spacing
      const radius = Math.max(0.7, Math.min(2.2, 1.1 * scale))
      context.fillStyle = 'rgba(91, 74, 68, 0.35)'
      for (let gx = startX; gx < width + spacing; gx += spacing) {
        for (let gy = startY; gy < height + spacing; gy += spacing) {
          context.beginPath()
          context.arc(gx, gy, radius, 0, Math.PI * 2)
          context.fill()
        }
      }
      if (worldRef.current) {
        worldRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
      }
    }

    const schedule = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(render)
    }
    redrawRef.current = schedule

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = stage.getBoundingClientRect()
      const pointerX = event.clientX - rect.left
      const pointerY = event.clientY - rect.top
      const view = viewRef.current
      const nextScale = Math.min(4, Math.max(0.2, view.scale * Math.exp(-event.deltaY * 0.0015)))
      const worldX = (pointerX - view.x) / view.scale
      const worldY = (pointerY - view.y) / view.scale
      view.scale = nextScale
      view.x = pointerX - worldX * nextScale
      view.y = pointerY - worldY * nextScale
      schedule()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      if ((event.target as HTMLElement).closest('iframe, button, a, input, select, textarea')) return
      stage.setPointerCapture(event.pointerId)
      dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
      stage.classList.add('is-panning')
    }
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      const view = viewRef.current
      view.x += event.clientX - drag.x
      view.y += event.clientY - drag.y
      drag.x = event.clientX
      drag.y = event.clientY
      schedule()
    }
    const onPointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) return
      dragRef.current = null
      stage.classList.remove('is-panning')
    }

    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerUp)
    stage.addEventListener('pointercancel', onPointerUp)
    window.addEventListener('resize', schedule)
    schedule()

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerUp)
      stage.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const reset = () => {
    viewRef.current = { x: 0, y: 0, scale: 1 }
    redrawRef.current()
  }

  return <div className="playground" role="dialog" aria-modal="true" aria-label="Playground — Figma boards">
    <div className="playground-bar">
      <b>Playground</b>
      <span className="playground-hint">Drag to pan · Scroll to zoom</span>
      <div className="playground-actions">
        <button type="button" onClick={reset}>Reset view</button>
        <button type="button" onClick={onClose} autoFocus>Close</button>
      </div>
    </div>
    <div className="playground-stage" ref={stageRef}>
      <canvas ref={canvasRef} className="playground-canvas" aria-label="Infinite canvas — drag to pan, scroll to zoom" />
      <div className="canvas-world" ref={worldRef}>
        <div className="figma-board">
          {figmaData.map((project) => {
            const cols = Math.max(1, Math.min(project.screens.length, 3))
            const isPrototypeBoard = project.screens.some((url) => isPrototype(url))
            return (
              <section className={`figma-project${isPrototypeBoard ? ' is-prototype' : ''}`} key={project.name} style={{ '--cols': cols } as React.CSSProperties}>
                <header className="figma-project-head">
                  <h3>{project.name}</h3>
                  <span>{project.screens.length} screen{project.screens.length === 1 ? '' : 's'}</span>
                </header>
                <div className="figma-screens">
                  {project.screens.map((url, index) => {
                    const isUrl = url.startsWith('http')
                    const isProto = isUrl ? isPrototype(url) : isPrototypeBoard
                    const screenClass = `figma-screen${isProto ? ' prototype' : ''}`
                    const ratio = figmaAspectRatios[url]
                    const screenStyle = ratio ? { aspectRatio: String(ratio) } : undefined
                    return isUrl
                      ? <iframe key={`${project.name}-${index}`} className={screenClass} style={screenStyle} src={figmaSrc(url)} title={`${project.name} — screen ${index + 1}`} loading="lazy" allowFullScreen />
                      : <div key={`${project.name}-${index}`} className={`${screenClass} is-placeholder`} style={screenStyle}><span>Screen {index + 1}</span><small>Paste a Figma embed URL</small></div>
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  </div>
}

function App({ initialPath }: { initialPath?: string } = {}) {
  const resolvePath = (raw: string): Route => {
    const pathname = raw.replace(/\/+$/, '') || '/'
    if (pathname === '/contact') return '/contact'
    return '/'
  }
  const [path, setPath] = useState<Route>(() => resolvePath(initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname)))
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  useEffect(() => { const handler = () => setPath(resolvePath(window.location.pathname)); window.addEventListener('popstate', handler); return () => window.removeEventListener('popstate', handler) }, [])
  useClientLayoutEffect(() => {
    window.scrollTo({ top: 0 })
  }, [path])
  const content = path === '/contact' ? <Contact /> : <Home />
  return <>
    <main className="container"><Header onOpenPlayground={() => setPlaygroundOpen(true)} /><div className="page-content">{content}</div><Footer /></main>
    {playgroundOpen && <Playground onClose={() => setPlaygroundOpen(false)} />}
  </>
}

export default App
