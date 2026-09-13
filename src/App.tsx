import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import projectsData from './data/projects.json'
import testimonialsData from './data/testimonials.json'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const assets = {
  gingham: 'https://framerusercontent.com/images/pFxihdcjpfn91IKuZI3YvGOqth0.jpg',
  desk: 'https://framerusercontent.com/images/ZwXc6ZYDaHTR5rT7350eKKIDU.png',
}

type Route = '/' | '/skills' | '/work' | '/contact'
const routes: Route[] = ['/', '/skills', '/work', '/contact']

function go(path: Route) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Header() {
  const headerRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(headerRef.current, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .65, ease: 'power2.out' })
    }, headerRef)
    return () => context.revert()
  }, [])
  return <header className="site-header" ref={headerRef}>
    <div><b>Quick Links</b><nav>{routes.map((path, index) => <a key={path} href={path} onClick={(event) => { event.preventDefault(); go(path) }}>{['Home', 'Skills', 'Work', 'Contact'][index]}{index < 3 && ', '}</a>)}</nav></div>
    <div className="header-right"><b>Based in India</b><span>Product Designer</span></div>
  </header>
}

function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(footerRef.current, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: footerRef.current, start: 'top 92%', once: true } })
    }, footerRef)
    return () => context.revert()
  }, [])
  return <footer className="site-footer" ref={footerRef}>
    <b>Harshita</b>
    <nav><a href="/" onClick={(e) => { e.preventDefault(); go('/') }}>Home</a> · <a href="/skills" onClick={(e) => { e.preventDefault(); go('/skills') }}>Skills</a> · <a href="/work" onClick={(e) => { e.preventDefault(); go('/work') }}>Work</a> · <a href="/contact" onClick={(e) => { e.preventDefault(); go('/contact') }}>Contact</a></nav>
    <p><a href="https://www.linkedin.com/in/harshita-upadhyay-288682414" target="_blank">LinkedIn</a> · <a href="https://www.behance.net/harshitaupadhyay" target="_blank">Behance</a> · <a href="https://www.instagram.com/velvet.drafts_" target="_blank">Instagram</a></p>
    <i>Designed softly, always.</i><span>© 2026 Harshita</span>
  </footer>
}

function Texture({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <section className={`texture ${className}`} style={{ backgroundImage: `linear-gradient(rgba(248,245,242,.72), rgba(248,245,242,.72)), url(${assets.gingham})` }}>{children}</section>
}

interface StackProject {
  id: string
  num: string
  title: string
  category: string
  desc: string
  tags: string[]
  behance: string
  bgGradient: string
  bgImage: string
}

const stackProjects: StackProject[] = projectsData

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

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.stack-card')
      const n = cards.length
      if (!n) return

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isReduced) {
        cards.forEach((card, i) => {
          gsap.set(card, {
            y: 0,
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            zIndex: i + 1,
          })
        })
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
          end: () => `+=${window.innerHeight * 2.2}`,
          scrub: 0.8,
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

      // Background atmospheric depth
      tl.to('.stack-bg', { filter: 'blur(10px)', scale: 1.07, ease: 'none', duration: 2.4 }, 0)
      tl.to('.stack-fade', { backgroundColor: 'rgba(38, 28, 25, 0.48)', ease: 'none', duration: 2.4 }, 0)

      // Hold Card 0 slightly at start (0 -> 0.15)

      // Transition 1: As Card 1 enters center from below, Card 0 moves LEFT
      tl.to(cards[0], {
        xPercent: leftShift,
        rotation: -rotAngle,
        scale: sideScale,
        filter: 'brightness(0.82)',
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
        filter: 'brightness(0.82)',
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

  return (
    <section className="project-stack" ref={stackRef}>
      <div className="stack-bg" aria-hidden="true" />
      <div className="stack-fade" aria-hidden="true" />
      <div className="stack-header">
        <div className="stack-heading-text">
          <b>SELECTED WORK</b>
          <span>Scroll down to explore each project</span>
        </div>
        <div className="stack-nav" role="tablist" aria-label="Selected work navigation">
          {stackProjects.map((proj, idx) => (
            <button
              key={proj.id}
              type="button"
              role="tab"
              aria-selected={activeIdx === idx}
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
            style={{
              backgroundImage: `${proj.bgGradient}, url(${proj.bgImage})`,
            }}
            onClick={() => {
              if (activeIdx !== i) {
                scrollToProject(i)
              }
            }}
          >
            <div className="stack-card-top">
              <span className="stack-card-tag">{proj.category}</span>
              <span className="stack-card-num">{proj.num} / {String(stackProjects.length).padStart(2, '0')}</span>
            </div>
            <div className="stack-card-body">
              <h2>{proj.title}</h2>
              <p>{proj.desc}</p>
              <div className="stack-card-pills">
                {proj.tags.map((pill) => (
                  <span className="stack-pill-tag" key={pill}>
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="stack-card-footer">
              <span className="stack-card-hint">
                {activeIdx !== i
                  ? 'Click card to focus'
                  : i < stackProjects.length - 1
                  ? 'Scroll for next project'
                  : 'Final selected project'}
              </span>
              <a
                className="stack-card-btn"
                href={proj.behance}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                View on Behance <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Home() {
  const homeRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo('.home-intro > div', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .8, ease: 'power2.out', delay: .12 })
      gsap.fromTo('.avatar', { autoAlpha: 0, scale: .92 }, { autoAlpha: 1, scale: 1, duration: .85, ease: 'power2.out', delay: .24 })
      gsap.fromTo('.name-letter', { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .55, stagger: .055, ease: 'power3.out', delay: .36 })
      gsap.to('.avatar', { y: -6, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.1 })
      gsap.fromTo('.home-about figure', { autoAlpha: 0, scale: .96, y: 18 }, { autoAlpha: 1, scale: 1, y: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.home-about', start: 'top 82%', once: true } })
      gsap.fromTo('.home-about > div', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out', delay: .12, scrollTrigger: { trigger: '.home-about', start: 'top 82%', once: true } })
    }, homeRef)
    return () => context.revert()
  }, [])
  return <>
    <section ref={homeRef} className="home-page">
      <section className="home-intro"><div><h1>Designing gentle moments in a<br className="desktop" /> digital world.</h1><p>दिल से.</p></div><img className="avatar" src="/avatar.png" alt="Illustrated portrait of Harshita" /></section>
      <h2 className="name-display" aria-label="Harshita">{'Harshita'.split('').map((letter, index) => <span className="name-letter" aria-hidden="true" key={`${letter}-${index}`}>{letter}</span>)}</h2>
      <Texture className="home-about"><figure><img src={assets.desk} alt="A cosy illustrated designer workspace" /></figure><div><p>Hi, I’m <strong>Harshita Upadhyay</strong>, a product designer who loves creating gentle, thoughtful digital experiences. I care deeply about aesthetics, clarity, and the small details that make designs feel calm, human, and meaningful.</p><p>~I design with intention.</p><div className="button-row"><button onClick={() => go('/work')}>See works</button><button onClick={() => go('/contact')}>Resume</button></div></div></Texture>
      <section className="home-promise"><h2>I MAKE DESIGNS<br />PEOPLE REMEMBER</h2><p>I design clean websites, apps and brand systems that help ideas look sharper, feel trusted and work with purpose</p></section>
    </section>
    <ProjectStack />
    <TestimonialsSection />
  </>
}

const experience = [
  ['Product Designer Intern - Neurobots Club, GGITS', 'December 2024 - March 2025', 'Harshita worked as a Product Design Intern at Neurobots Club, GGITS where she consistently brought thoughtful design ideas to team. She has a good eye for clean and user friendly interfaces. She was always open to feedback and iteration. Her ability to balance aesthetics with usability made her a valuable contributor to our team.'],
  ['Marketing Communication Intern - FinnAI', 'July 2025 - October 2025', 'Worked on content creation, digital marketing initiatives, and market research while collaborating with cross-functional teams to support brand visibility and outreach. Contributed to marketing campaigns and collateral with a focus on clarity, creativity, and communication.'],
  ['Product Designer Intern - Skedio', 'December 2025 - March 2026', 'Harshita brings creativity, curiosity, and dedication to every project she works on. She has a strong understanding of design fundamentals and always strives to create thoughtful user experiences.']
]

function Skills() {
  return <><h1 className="page-title">What I Bring to the Table</h1><Texture className="skills-intro"><div className="note"><b>~ Product Thinking</b><br />• User Research<br />• Problem Framing<br />• User Personas<br />• User Flows<br />• Information Architecture<br />• Design Strategy<br /><b>~ Product Design</b><br />• Wireframing<br />• High-Fidelity UI<br />• Interactive Prototypes<br />• Design Systems<br />• Responsive Design<br /><b>~ Validation</b><br />• Usability Testing<br />• Heuristic Evaluation</div><div className="note rotate"><b>~TOOLS</b><br />• Figma<br />• Framer<br />• FigJam<br />• Notion (documentation)<br />• Blender</div><img className="desk-mini" src={assets.desk} alt="" /></Texture><section className="experience"><h2>Experience</h2>{experience.map(([role, date, text]) => <article key={role}><b>{role}</b><i>{date}</i><p>{text}</p></article>)}</section><section className="certifications"><h2>Certifications</h2><p><i>Professional courses and credentials that strengthen my expertise in UI/UX design and digital product development.</i><br /><b>Google UX Design Professional Certificate</b><br />Google × Coursera · 2025</p><div className="cert-grid">{['Foundations of UX Design', 'Start the UX Design Process', 'Build Wireframes', 'Conduct UX Research', 'Create High-fidelity Designs', 'Build Dynamic UI', 'Design a User Experience', 'Final Certificate'].map((title, i) => <div key={title}><small>HAPPY<br />UNNOTE</small><span>~0{i + 1}. {title}</span></div>)}</div></section></>
}

function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (isReduced) {
        gsap.set('.card-left-1, .card-right-1', { autoAlpha: 1, y: 0 })
        gsap.set('.card-left-2, .card-right-2', { display: 'none' })
        gsap.set('.spine-draw', { height: '100%' })
        return
      }

      // Initial state: Only pair 1 is visible in the 2 slots
      gsap.set('.card-left-1, .card-right-1', { autoAlpha: 1, y: 0 })
      gsap.set('.card-left-2, .card-right-2', { autoAlpha: 0, y: 30 })
      gsap.set('.spine-draw', { height: '0%' })
      gsap.set('.spine-tip', { top: '0%' })
      gsap.set('.slot-connector', { scaleX: 0 })

      // Pinned scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.6}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      })

      // Draw initial line and connectors to the first two cards
      tl.to('.spine-draw', { height: '50%', ease: 'none', duration: 1 }, 0)
      tl.to('.spine-tip', { top: '50%', ease: 'none', duration: 1 }, 0)
      tl.to('.slot-connector', { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.2)

      // Hold pair 1 so user can read them (0.4 -> 0.8)

      // On scroll: at those two places, first testimonial fades out and next comes in
      // Left place: Card 1 fades out, Card 3 fades in
      tl.to('.card-left-1', { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power2.inOut' }, 0.8)
      tl.to('.card-left-2', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.0)

      // Line draws further down to 100%
      tl.to('.spine-draw', { height: '100%', ease: 'none', duration: 1.2 }, 0.8)
      tl.to('.spine-tip', { top: '100%', ease: 'none', duration: 1.2 }, 0.8)

      // Right place: Card 2 fades out, Card 4 fades in
      tl.to('.card-right-1', { autoAlpha: 0, y: -24, duration: 0.8, ease: 'power2.inOut' }, 0.9)
      tl.to('.card-right-2', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.1)

      // Buffer at end so user can comfortably read the new testimonials
      tl.to({}, { duration: 0.5 })
    }, sectionRef)

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

  return (
    <section className="testimonials-section" ref={sectionRef}>
      <div className="testimonials-header">
        <span className="testimonials-badge">COLLABORATIONS &amp; WORDS</span>
        <h2 className="testimonials-title">Feedback from clients<br />&amp; collaborators.</h2>
      </div>

      <div className="two-slot-stage">
        {/* Central Vertical Line with drawing effect */}
        <div className="center-spine" aria-hidden="true">
          <div className="spine-track-line" />
          <div className="spine-draw" />
          <div className="spine-tip" />
        </div>

        {(([
          'card-left',
          'card-right',
        ]) as const).map((prefix) => {
          const side = prefix === 'card-left' ? 'left' : 'right'
          const slotCards = testimonialsData.filter((t) => t.side === side).slice(0, 2)
          return (
            <div className={`slot-container ${side === 'left' ? 'slot-left' : 'slot-right'}`} key={prefix}>
              <div className={`slot-connector ${side === 'left' ? 'connector-left' : 'connector-right'}`} aria-hidden="true" />
              <div className="slot-cards-frame">
                {slotCards.map((t, i) => (
                  <article className={`slot-card ${prefix}-${i + 1}`} key={t.id}>
                    <div className="card-quote-mark" aria-hidden="true">“</div>
                    <blockquote className="card-quote">{t.quote}</blockquote>
                    <div className="card-meta">
                      <strong className="card-author">~ {t.person}</strong>
                      <span className="card-role">{t.role}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const featuredProjects = stackProjects.filter((p) => p.id !== 'brand-systems')

function Work() {
  return <>
    <h1 className="work-title">Some of the UI/UX and graphic<br className="desktop" /> design projects I’ve worked on.</h1>
    <Texture className="project-area">
      <div className="project-grid">
        {featuredProjects.map((proj, i) => (
          <article className={`project-card project-${i}`} key={proj.id}>
            <span>{proj.category}</span>
            <h2>{proj.title}</h2>
            <p>{proj.desc}</p>
            {proj.behance && (
              <a
                className="project-link"
                href={proj.behance}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Behance <span aria-hidden="true">→</span>
              </a>
            )}
          </article>
        ))}
      </div>
    </Texture>
    <TestimonialsSection />
  </>
}

function Contact() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true) }
  return <><h1 className="contact-title">Have a project, idea, or opportunity?<br className="desktop" /> I’d love to hear from you.</h1><Texture className="contact-area"><form onSubmit={submit}><label>Name<input required placeholder="Jane Smith" /></label><label>Email<input required type="email" placeholder="yourmail@gmail.com" /></label><label>Service<select defaultValue="UI/UX"><option>UI/UX</option><option>Product Design</option><option>Branding</option></select></label><button type="submit">{sent ? 'Thank you!' : 'Submit'}</button></form></Texture></>
}

function App() {
  const [path, setPath] = useState<Route>(routes.includes(window.location.pathname as Route) ? window.location.pathname as Route : '/')
  const contentRef = useRef<HTMLElement>(null)
  useEffect(() => { const handler = () => setPath(window.location.pathname as Route); window.addEventListener('popstate', handler); return () => window.removeEventListener('popstate', handler) }, [])
  useLayoutEffect(() => {
    gsap.fromTo(contentRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .45, ease: 'power2.out', clearProps: 'transform' })
  }, [path])
  const content = path === '/skills' ? <Skills /> : path === '/work' ? <Work /> : path === '/contact' ? <Contact /> : <Home />
  return <main className="container"><Header /><section className="page-content" ref={contentRef}>{content}</section><Footer /></main>
}

export default App
