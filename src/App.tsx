import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
    </section>
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

const projects = [['CyberSec', 'A UI/UX case study for a clearer, calmer approach to cybersecurity.'], ['Himalaya', 'A mobile app redesign built around thoughtful, friendly rituals.']]
const quotes = [['Harshita is a very talented designer with a strong command of UI design. She has a great eye for layout, usability, and clean visual structure.', 'Akash Choudhary'], ['Harshita has been a great part of our Skedio team. She brings strong UI skills, a thoughtful design approach, and a good sense of structure.', 'Skedio'], ['Harshita served as our Designer at NeuroBots Robotics Club and consistently delivered outstanding work. Her reliability and creativity made a real impact.', 'Aman Raj, NeuroBots'], ['Harshita successfully completed her internship with FinnAI as a Marketing Communication Intern, demonstrating strong communication skills and creativity.', 'Digvijay Singh Shekhawat']]

function Work() {
  return <><h1 className="work-title">Some of the UI/UX and graphic<br className="desktop" /> design projects I’ve worked on.</h1><Texture className="project-area"><div className="project-grid">{projects.map(([title, text], i) => <article className={`project-card project-${i}`} key={title}><span>UI/UX CASE STUDY</span><h2>{title}</h2><p>{text}</p></article>)}</div></Texture><section className="feedback"><h2>Feedback from clients<br />&amp; collaborators.</h2><div className="quote-grid">{quotes.map(([quote, person]) => <blockquote key={person}>{quote}<cite>~ {person}</cite></blockquote>)}</div></section></>
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
