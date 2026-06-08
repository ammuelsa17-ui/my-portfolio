import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [activeProject, setActiveProject] = useState(null);
  const [formStatus, setFormStatus] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [welcomeCardVisible, setWelcomeCardVisible] = useState(true);

  // Loading & Page Transition States
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  // Stats Counter States
  const [projectsCount, setProjectsCount] = useState(0);
  const [techsCount, setTechsCount] = useState(0);
  const statsRef = useRef(null);

  // Web Audio chime fallback
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq, time, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playNote(261.63, now, 0.6); // C4
      playNote(329.63, now + 0.15, 0.6); // E4
      playNote(392.00, now + 0.3, 0.6); // G4
      playNote(523.25, now + 0.45, 0.8); // C5
    } catch (err) {
      console.error('AudioContext failed:', err);
    }
  };

  // Speaks friendly greeting via Web Speech API or plays synthesized chime
  const handleGreetingPlay = () => {
    if (audioPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setAudioPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Hi, I am Harshini. Welcome to my portfolio!");
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('female')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onstart = () => setAudioPlaying(true);
      utterance.onend = () => setAudioPlaying(false);
      utterance.onerror = () => setAudioPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      playChime();
      setAudioPlaying(true);
      setTimeout(() => setAudioPlaying(false), 1200);
    }
  };
  

  // Section references for scroll spying
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const contactRef = useRef(null);

  // Preloader progress simulation
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += Math.floor(Math.random() * 8) + 4;
      if (start >= 100) {
        start = 100;
        clearInterval(interval);
        setIsLoaded(true);
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
      setLoadProgress(start);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [loading]);

  // Stats count-up animation observer
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger projects count up (0 to 5)
          let pStart = 0;
          const pEnd = 5;
          const pTimer = setInterval(() => {
            pStart += 1;
            setProjectsCount(pStart);
            if (pStart >= pEnd) clearInterval(pTimer);
          }, 150);

          // Trigger technologies count up (0 to 3)
          let tStart = 0;
          const tEnd = 3;
          const tTimer = setInterval(() => {
            tStart += 1;
            setTechsCount(tStart);
            if (tStart >= tEnd) clearInterval(tTimer);
          }, 180);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (statsRef.current) observer.observe(statsRef.current);

    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, [loading]);

  // Navbar background change on scroll
  useEffect(() => {
    const handleNavbarScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleNavbarScroll);
    return () => window.removeEventListener('scroll', handleNavbarScroll);
  }, []);

  // Scrollspy to detect active section in viewport
  useEffect(() => {
    const sections = [
      { id: 'home', ref: homeRef },
      { id: 'about', ref: aboutRef },
      { id: 'skills', ref: skillsRef },
      { id: 'projects', ref: projectsRef },
      { id: 'contact', ref: contactRef }
    ];

    let currentSection = 'home';

    const handleScroll = () => {
      if (isTransitioningRef.current) return;
      const scrollTop = window.scrollY;
      const scrollPosition = scrollTop + window.innerHeight / 3;
      
      for (const section of sections) {
        if (section.ref.current) {
          const top = section.ref.current.offsetTop;
          const height = section.ref.current.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            if (currentSection !== section.id) {
              currentSection = section.id;
              setActiveSection(section.id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll progress tracker
  useEffect(() => {
    const handleScrollProgress = () => {
      const scrollTop = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (scrollTop / totalHeight) * 100;
        const progressBar = document.getElementById('scroll-progress');
        if (progressBar) progressBar.style.width = `${progress}%`;
      }
    };
    window.addEventListener('scroll', handleScrollProgress);
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);



  // Smooth scroll handler with page transition wipe
  const scrollToSection = (id) => {
    if (activeSection === id) {
      setMobileMenuOpen(false);
      return;
    }
    
    setIsTransitioning(true);
    isTransitioningRef.current = true;
    
    // Halfway through wipe animation (600ms), jump instantly
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const navOffset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'instant'
        });
        setActiveSection(id);
      }
      setMobileMenuOpen(false);
    }, 600);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
      isTransitioningRef.current = false;
    }, 1300);
  };

  // Contact form submit (Web3Forms Integration)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Transmitting signals...');
    
    const formData = new FormData(e.target);
    formData.append("access_key", "YOUR_ACCESS_KEY_HERE");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        setFormStatus('Message received in the cyber realm! 🚀');
        e.target.reset();
      } else {
        setFormStatus('Transmission failed. Direct line: swipeharsh2001@gmail.com');
      }
    } catch (error) {
      setFormStatus('Connection error. Please check your network.');
    }
    
    setTimeout(() => setFormStatus(''), 6000);
  };

  const projects = [
    {
      id: 1,
      num: "01 // WEB PLATFORM",
      title: "Asthra Event Website",
      description: "Official tech-fest platform kitasthra.in, managing registration systems, custom banners, and a Python bulk generator mailing 500+ student certificates.",
      longDescription: "Built the event platform for Asthra, KIT. This web application handled student event registrations, workshop coordination, and live scheduling. To automate logistics, I developed a Python-based certificate generator integrated with pandas and python-pptx, which auto-generated, customized, and dispatched event participation credentials to over 500 participants.",
      skills: ["React", "Python", "Automation", "HTML5", "CSS3", "JavaScript", "Tailwind CSS"],
      image: `${process.env.PUBLIC_URL}/asthra.png`,
      github: "https://github.com",
      demo: "https://kitasthra.in"
    },
    {
      id: 2,
      num: "02 // INSTITUTIONAL DEV",
      title: "EduNexa Platform",
      description: "A comprehensive student-centric learning dashboard with interactive progress analytics, attendance tracker, and course syllabus pathways.",
      longDescription: "EduNexa is a mock educational management dashboard. The frontend is fully responsive and integrates charts, calendar events, grade books, and syllabus progression widgets to streamline administration and learning experiences for universities.",
      skills: ["React", "CSS3", "Charts.js", "Node.js", "State Management", "Tailwind CSS"],
      image: `${process.env.PUBLIC_URL}/edunexa.png`,
      github: "https://github.com",
      demo: "https://github.com"
    },
    {
      id: 3,
      num: "03 // 3D GRAPHICS",
      title: "Nexus 3D Portal",
      description: "An interactive, web-based WebGL experiment featuring a reactive particle field, custom lighting, and morphing wireframe shapes.",
      longDescription: "The Nexus Portal is a showcase of high-end 3D interfaces. Using React Three Fiber and Three.js, it creates interactive WebGL spaces, particle systems that follow cursor physics, and geometric shaders that transition shape based on section scroll events.",
      skills: ["Three.js", "React Three Fiber", "WebGL", "GLSL", "Custom Shaders", "Tailwind CSS"],
      image: null,
      github: "https://github.com",
      demo: "https://github.com"
    }
  ];

  const skillCategories = [
    {
      title: "Programming",
      skills: ["C++", "JavaScript", "Python"]
    },
    {
      title: "Frontend",
      skills: ["HTML", "CSS", "React", "Tailwind CSS"]
    },
    {
      title: "Backend",
      skills: ["Node.js", "Express.js"]
    },
    {
      title: "Tools",
      skills: ["Git", "GitHub", "VS Code"]
    }
  ];

  return (
    <div className="relative min-h-screen bg-brand-creamPrimary text-brand-charcoalDark selection:bg-brand-redAccent selection:text-brand-creamWarm font-body overflow-x-hidden">
      {/* System Loader */}
      {loading && (
        <div 
          className={`fixed inset-0 z-50 bg-[#131313] text-[#fdf6f0] flex flex-col justify-between p-8 md:p-12 font-mono select-none transition-all duration-700 ease-in-out ${
            loadProgress === 100 ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Top header status */}
          <div className="flex justify-between items-center text-[10px] md:text-xs text-[#fdf6f0]/40">
            <div>SYSTEM STATUS: INITIALIZING...</div>
            <div>SWIPE_PORTFOLIO_V2.0</div>
          </div>

          {/* Center progress details */}
          <div className="max-w-xl w-full mx-auto flex flex-col items-start justify-center flex-grow">
            <div className="text-[10px] text-brand-redAccent uppercase tracking-widest mb-2 font-bold animate-pulse">
              + LOADER INITIALIZATION
            </div>
            <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-[#fdf6f0] tracking-tighter uppercase mb-6 leading-none">
              HARSHINI
            </h1>
            <div className="w-full h-[2px] bg-[#fdf6f0]/10 relative overflow-hidden mb-4">
              <div 
                className="h-full bg-brand-redAccent transition-all duration-100 ease-out" 
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <div className="w-full flex justify-between items-center text-xs text-[#fdf6f0]/60">
              <span className="animate-pulse">
                {loadProgress < 30 && "Loading React Core Modules..."}
                {loadProgress >= 30 && loadProgress < 60 && "Injecting WebGL 3D Matrix..."}
                {loadProgress >= 60 && loadProgress < 90 && "Calibrating Neural Interfaces..."}
                {loadProgress >= 90 && loadProgress < 100 && "Establishing Secure Cyberline..."}
                {loadProgress === 100 && "System Ready."}
              </span>
              <span className="font-bold text-[#fdf6f0]">{loadProgress}%</span>
            </div>
          </div>

          {/* Bottom console metadata */}
          <div className="flex justify-between items-center text-[9px] md:text-[10px] text-[#fdf6f0]/30 border-t border-[#fdf6f0]/5 pt-4">
            <div>© 2026 HARSHINI. ALL RIGHTS SECURED.</div>
            <div>IP: REDIRECT_LOCALHOST:3000</div>
          </div>
        </div>
      )}

      {/* Page Wipe Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-brand-charcoalDark animate-wipe-black" />
          <div className="absolute inset-0 bg-brand-redAccent animate-wipe-red" />
        </div>
      )}

      {/* Scroll Progress Bar */}
      <div id="scroll-progress" className="fixed top-0 left-0 h-1 bg-brand-redAccent z-50 transition-all duration-100 ease-out" style={{ width: '0%' }} />




      {/* Glassmorphic Sticky Header */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-6'} px-6 md:px-12 flex justify-between items-center`}>
        <div 
          className="font-heading font-extrabold text-xl tracking-widest text-brand-charcoalDark flex items-center gap-2 cursor-pointer"
          onClick={() => scrollToSection('home')}
        >
          HARSHINI
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8 list-none m-0 p-0">
            {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
              <li key={section} className="relative">
                <button 
                  onClick={() => scrollToSection(section)}
                  className={`font-heading text-xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors duration-200 ${
                    activeSection === section ? 'text-brand-redAccent' : 'text-brand-charcoalMedium hover:text-brand-charcoalDark'
                  }`}
                >
                  {section}
                </button>
                {activeSection === section && (
                  <span className="absolute -top-2.5 left-0 w-full h-[2px] bg-brand-redAccent rounded" />
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Hire Me CTA Button */}
        <div className="hidden md:block">
          <button 
            onClick={() => scrollToSection('contact')}
            className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent border-2 border-brand-redAccent text-brand-redAccent hover:bg-brand-redAccent hover:text-brand-creamPrimary py-2 px-5 rounded-full transition-all duration-300 cursor-pointer"
          >
            HIRE ME
          </button>
        </div>

        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`block w-6 h-[2px] bg-brand-charcoalDark transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-1'}`} />
          <span className={`block w-6 h-[2px] bg-brand-charcoalDark transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100 my-1'}`} />
          <span className={`block w-6 h-[2px] bg-brand-charcoalDark transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[3px]' : 'translate-y-1'}`} />
        </button>

        {/* Mobile Dropdown Menu */}
        <div className={`fixed top-0 left-0 w-full h-screen bg-brand-creamPrimary/98 backdrop-blur-lg flex flex-col justify-center items-center gap-8 transition-transform duration-500 z-40 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <ul className="flex flex-col gap-6 list-none text-center p-0 m-0">
            {['home', 'about', 'skills', 'projects', 'contact'].map((section) => (
              <li key={section}>
                <button 
                  onClick={() => scrollToSection(section)}
                  className={`font-heading text-3xl font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer ${
                    activeSection === section ? 'text-brand-redAccent' : 'text-brand-charcoalDark'
                  }`}
                >
                  {section}
                </button>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => scrollToSection('contact')}
            className="font-mono text-sm font-bold uppercase tracking-wider bg-brand-redAccent text-brand-creamPrimary hover:bg-brand-charcoalDark hover:text-brand-creamPrimary py-3 px-8 rounded-full transition-all duration-300 cursor-pointer mt-4"
          >
            Hire Me
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full pointer-events-none">
        
        {/* Section 1: Hero / Home */}
        <section 
          id="home" 
          ref={homeRef} 
          className="relative min-h-screen text-brand-charcoalDark pt-32 pb-44 px-6 md:px-12 flex flex-col justify-center items-center overflow-visible"
        >
          <div className="absolute inset-0 bg-brand-creamPrimary -z-20 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern-dark grid-mask opacity-50 -z-20 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-brand-redAccent/[0.02] blur-[120px] rounded-full -z-20 pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-brand-creamSecondary/40 blur-[100px] rounded-full -z-20 pointer-events-none" />

          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center relative z-20 overflow-visible">
            
            {/* Left Column Text Info */}
            <div className="text-left pointer-events-auto w-full">
              <div className={`inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-redAccent uppercase tracking-widest mb-4 transition-all duration-700 ease-out transform ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
                + WELCOME TO MY PORTFOLIO
              </div>
              <h1 className={`font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.8rem] xl:text-[4.5rem] whitespace-nowrap tracking-tighter leading-none uppercase mb-4 text-brand-charcoalDark transition-all duration-700 ease-out transform delay-100 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                HARSHINI
              </h1>
              
              {/* Horizontal line with subtitle */}
              <div className={`flex items-center gap-3 mb-6 transition-all duration-700 ease-out transform delay-200 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <span className="w-12 h-[1px] bg-brand-charcoalDark/40" />
                <span className="font-heading font-bold text-[10px] sm:text-xs text-brand-redAccent uppercase tracking-wider">
                  Full Stack Developer & AI Enthusiast
                </span>
              </div>

              <p className={`text-base md:text-lg text-brand-charcoalMedium font-light leading-relaxed max-w-lg mb-8 transition-all duration-700 ease-out transform delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                Building scalable web applications as a C++, React, Node.js, and AI enthusiast. Passionate about creating digital solutions and open to internship and collaboration opportunities.
              </p>

              {/* Skills Tags */}
              <div className={`flex flex-wrap gap-2 mb-8 transition-all duration-700 ease-out transform delay-300 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {["C++", "REACT", "NODE.JS", "AI/ML", "JAVASCRIPT", "MONGODB"].map((tag) => (
                  <span key={tag} className="font-mono text-[10px] sm:text-[11px] font-semibold bg-brand-creamSecondary/80 border border-brand-charcoalDark/5 text-brand-charcoalMedium py-1.5 px-4 rounded-xl">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Primary Action Buttons */}
              <div className={`flex flex-wrap gap-4 transition-all duration-700 ease-out transform delay-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="font-mono text-xs font-bold uppercase tracking-wider bg-brand-redAccent text-brand-creamPrimary hover:bg-brand-charcoalDark hover:text-brand-creamPrimary py-4 px-8 rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-brand-redAccent/10 flex items-center gap-2"
                >
                  VIEW PROJECTS <span>↗</span>
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent border border-brand-charcoalDark/10 text-brand-charcoalDark hover:border-brand-redAccent hover:text-brand-redAccent py-4 px-8 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2"
                >
                  CONTACT ME 
                  <svg className="w-3.5 h-3.5 fill-current transform rotate-45" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                </button>
              </div>

              {/* Let's Connect Links */}
              <div className={`mt-8 pt-6 border-t border-brand-charcoalDark/5 transition-all duration-700 ease-out transform delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <div className="font-mono text-[10px] font-bold text-brand-redAccent uppercase tracking-widest mb-4">
                  + LET'S CONNECT
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-brand-charcoalDark/10 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent flex items-center justify-center transition-all duration-300 bg-brand-creamSecondary/30 hover:bg-brand-redAccent/5">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.338.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl border border-brand-charcoalDark/10 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent flex items-center justify-center transition-all duration-300 bg-brand-creamSecondary/30 hover:bg-brand-redAccent/5">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="mailto:swipeharsh2001@gmail.com" className="w-10 h-10 rounded-xl border border-brand-charcoalDark/10 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent flex items-center justify-center transition-all duration-300 bg-brand-creamSecondary/30 hover:bg-brand-redAccent/5">
                    <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                  
                  <a 
                    href={`${process.env.PUBLIC_URL}/resume.pdf`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent border border-brand-charcoalDark/10 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent py-2.5 px-4 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-2 no-underline"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    RESUME
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right Column Image & Welcome Card */}
            <div className={`relative w-full flex justify-center items-center z-20 pointer-events-auto mt-8 md:mt-0 transition-all duration-1000 ease-out transform delay-300 overflow-visible ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`} style={{ minHeight: '520px' }}>

              {/* Red glow circle behind character */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '480px',
                height: '480px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(220,50,50,0.32) 0%, rgba(230,57,70,0.18) 35%, rgba(255,120,120,0.06) 65%, transparent 80%)',
                pointerEvents: 'none',
                zIndex: 1,
                animation: 'glowPulse 4s ease-in-out infinite',
              }} />

              {/* Floating code snippets */}
              <div style={{ position: 'absolute', top: '10%', left: '5%', zIndex: 3, pointerEvents: 'none', animation: 'float 5s ease-in-out infinite', opacity: 0.45 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#e63946', background: 'rgba(253,240,238,0.7)', padding: '3px 7px', borderRadius: '6px', backdropFilter: 'blur(4px)' }}>{'function() {'}</span>
              </div>
              <div style={{ position: 'absolute', top: '18%', right: '2%', zIndex: 3, pointerEvents: 'none', animation: 'float 4s ease-in-out infinite 1s', opacity: 0.4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e63946', background: 'rgba(253,240,238,0.7)', padding: '3px 7px', borderRadius: '6px' }}>{'return true;'}</span>
              </div>
              <div style={{ position: 'absolute', top: '55%', left: '2%', zIndex: 3, pointerEvents: 'none', animation: 'float 6s ease-in-out infinite 0.5s', opacity: 0.35 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e63946', background: 'rgba(253,240,238,0.7)', padding: '3px 7px', borderRadius: '6px' }}>{'{ } 001'}</span>
              </div>
              <div style={{ position: 'absolute', top: '30%', right: '0%', zIndex: 3, pointerEvents: 'none', animation: 'float 4.5s ease-in-out infinite 2s', opacity: 0.5 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', color: '#e63946', background: 'rgba(253,240,238,0.8)', padding: '4px 9px', borderRadius: '8px' }}>{'</>'}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '10%', right: '0%', zIndex: 3, pointerEvents: 'none', animation: 'float 5.5s ease-in-out infinite 1.5s', opacity: 0.45 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', color: '#e63946', background: 'rgba(253,240,238,0.8)', padding: '4px 9px', borderRadius: '8px' }}>{'</>'}</span>
              </div>

              {/* Hero character image */}
              <div className="hero-image-wrapper" style={{ overflow: 'visible', position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div style={{ animation: 'float 3s ease-in-out infinite', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/hero_illustration.png`}
                    alt="Harshini - Full Stack Developer"
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      height: 'auto',
                      objectFit: 'contain',
                      mixBlendMode: 'multiply',
                      filter: 'drop-shadow(0px 20px 60px rgba(220, 50, 50, 0.35))',
                      background: 'transparent',
                      display: 'block',
                    }}
                  />
                </div>
              </div>



              {/* Floating Welcome Audio Card */}
              {welcomeCardVisible && (
                <div className="absolute bottom-4 right-0 z-30 w-[300px] sm:w-[360px] bg-white/95 backdrop-blur-md border border-brand-charcoalDark/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-fade-in transition-all duration-300">
                  <button 
                    onClick={() => setWelcomeCardVisible(false)}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-brand-creamSecondary/50 hover:bg-brand-redAccent hover:text-brand-creamPrimary border border-brand-charcoalDark/5 flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer z-10"
                    title="Dismiss"
                  >
                    ×
                  </button>

                  {/* Left Waving Illustration Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-creamSecondary/50 border border-brand-charcoalDark/5 flex-shrink-0">
                    <img src={`${process.env.PUBLIC_URL}/waving_avatar.png`} alt="Harshini waving" className="w-full h-full object-cover" />
                  </div>

                  {/* Right Player Content */}
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-heading font-black text-sm text-brand-charcoalDark leading-tight mb-0.5">
                      Hi, I am <span className="text-brand-redAccent">Harshini ❤️</span>
                    </h4>
                    <p className="text-[10px] text-brand-charcoalMedium mb-2 font-medium">
                      Welcome to my portfolio!
                    </p>

                    {/* Audio Controller elements */}
                    <div className="flex items-center gap-3">
                      {/* Interactive Visual Audio Waveform */}
                      <svg className="w-32 h-6 flex items-center" viewBox="0 0 100 30">
                        <rect x="5" y="10" width="4" height="10" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-1" : ""} />
                        <rect x="15" y="5" width="4" height="20" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-2" : ""} />
                        <rect x="25" y="12" width="4" height="6" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-3" : ""} />
                        <rect x="35" y="8" width="4" height="14" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-4" : ""} />
                        <rect x="45" y="3" width="4" height="24" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-5" : ""} />
                        <rect x="55" y="10" width="4" height="10" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-1" : ""} />
                        <rect x="65" y="6" width="4" height="18" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-2" : ""} />
                        <rect x="75" y="12" width="4" height="6" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-3" : ""} />
                        <rect x="85" y="8" width="4" height="14" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-4" : ""} />
                        <rect x="95" y="5" width="4" height="20" fill="#D72638" rx="2" className={audioPlaying ? "animate-wave-bar-5" : ""} />
                      </svg>

                      {/* Play Action Circle Trigger (Speaker Sound Toggle) */}
                      <button 
                        onClick={handleGreetingPlay}
                        className="w-8 h-8 rounded-full bg-brand-redAccent hover:bg-brand-charcoalDark text-brand-creamPrimary flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md hover:shadow-brand-redAccent/20 flex-shrink-0"
                        title={audioPlaying ? "Mute greeting" : "Play voice greeting"}
                      >
                        <svg className="w-4 h-4 fill-current text-brand-creamPrimary" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar at the bottom of the Hero Section */}
          <div ref={statsRef} className="w-full max-w-7xl mx-auto mt-24 bg-brand-charcoalDark text-brand-creamPrimary rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-20 pointer-events-auto shadow-xl reveal-element">
            {/* Stat 1: Projects */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-brand-creamPrimary/5 border border-brand-creamPrimary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-creamWarm/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-heading font-black text-brand-redAccent leading-tight">{projectsCount}+</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white">Projects Completed</span>
              </div>
            </div>
            
            <div className="hidden md:block w-[1px] h-8 bg-brand-creamPrimary/10" />
            
            {/* Stat 2: Technologies */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-creamPrimary/5 border border-brand-creamPrimary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-creamWarm/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-heading font-black text-brand-redAccent leading-tight">{techsCount}+</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white">Technologies Mastered</span>
              </div>
            </div>
            
            <div className="hidden md:block w-[1px] h-8 bg-brand-creamPrimary/10" />
            
            {/* Stat 3: Internships */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-creamPrimary/5 border border-brand-creamPrimary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-creamWarm/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-heading font-black text-brand-redAccent leading-tight">OPEN TO</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white">Internships</span>
              </div>
            </div>
            
            <div className="hidden md:block w-[1px] h-8 bg-brand-creamPrimary/10" />
            
            {/* Stat 4: Developer Role */}
            <div className="flex items-center gap-4 flex-1 justify-center md:justify-end">
              <div className="w-12 h-12 rounded-2xl bg-brand-creamPrimary/5 border border-brand-creamPrimary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand-creamWarm/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
                  <path d="M12 18c-1.5 0-3-1.5-3-3l1-2h4l1 2c0 1.5-1.5 3-3 3z" />
                  <path d="M19 5c-1.5-1.5-4.5-2-7.5-2C8.5 3 5 6.5 5 9.5c0 3 .5 6 2 7.5L12 12l5-5z" />
                  <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-heading font-black text-brand-redAccent leading-tight">AI & FULL STACK</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white">Developer</span>
              </div>
            </div>
          </div>
        </section>


        <section 
          id="about" 
          ref={aboutRef} 
          className="relative min-h-screen text-brand-charcoalDark py-32 px-6 md:px-12 overflow-hidden border-t border-brand-charcoalDark/5"
        >
          <div className="absolute inset-0 bg-brand-creamPrimary -z-20 pointer-events-none" />
          <div className="absolute inset-0 grid-pattern-dark grid-mask opacity-30 -z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand-redAccent/[0.01] blur-[120px] rounded-full -z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-brand-creamSecondary/30 blur-[100px] rounded-full -z-20 pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-30">
            
            {/* Left Column Brand Message */}
            <div className="lg:col-span-6 text-left pointer-events-auto flex flex-col justify-start reveal-element">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-brand-redAccent uppercase tracking-widest mb-4">
                <span>✦</span> 01 // PROFILE
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tighter leading-none uppercase mb-8 text-brand-charcoalDark">
                Engineering with passion and precision
              </h2>
              <p className="text-brand-charcoalMedium text-base md:text-lg leading-relaxed mb-6">
                I am a Software Engineer and Full Stack Developer specializing in C++, React, Node.js, and AI. I build web applications and focus on creating scalable digital solutions.
              </p>
              <p className="text-brand-charcoalMedium text-base md:text-lg leading-relaxed mb-8">
                Rather than years of experience, I position my personal brand around core technical skills, verified projects, and my ability to solve complex logical problems. I focus on high-impact work, a rapid learning mindset, and are open to internship and collaboration opportunities.
              </p>
            </div>
            
            {/* Right Column Brand Process Timeline */}
            <div className="lg:col-span-6 pointer-events-auto relative flex flex-col justify-center items-center py-6">
              
              {/* Responsive SVG Connecting Timeline Path */}
              <div className="absolute left-[39px] top-12 bottom-12 w-[2px] pointer-events-none hidden md:block">
                <svg className="w-20 h-full overflow-visible" fill="none">
                  <path 
                    d="M 1,0 C 40,80 40,220 1,300 C -38,380 -38,520 1,600" 
                    stroke="#D72638" 
                    strokeWidth="2.5" 
                    className="animate-dash"
                  />
                </svg>
              </div>
              
              {/* Process Steps */}
              <div className="flex flex-col gap-10 w-full relative z-10 pl-0 md:pl-16">
                
                {/* Step 1 */}
                <div className="relative group w-full flex flex-col md:flex-row gap-6 md:items-center glass-card-dark p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 reveal-element">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-redAccent text-brand-creamPrimary flex items-center justify-center font-mono font-bold text-sm z-20 border-4 border-brand-creamPrimary shadow-md relative md:absolute md:-left-[64px] md:top-1/2 md:-translate-y-1/2">
                    01
                  </div>
                  <div className="flex-1 md:pl-0">
                    <h3 className="font-heading font-black text-xl md:text-2xl uppercase text-brand-charcoalDark mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                      Plan & Design
                      <span className="text-xs font-mono font-bold text-brand-redAccent py-0.5 px-2 bg-brand-redAccent/10 rounded">Strategy</span>
                    </h3>
                    <p className="text-sm text-brand-charcoalMedium leading-relaxed">
                      Analyzing logic constraints, data structures, and user interfaces to draft clean structural solutions.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative group w-full flex flex-col md:flex-row gap-6 md:items-center glass-card-dark border border-brand-redAccent/30 p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 reveal-element reveal-delay-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-redAccent text-brand-creamPrimary flex items-center justify-center font-mono font-bold text-sm z-20 border-4 border-brand-creamPrimary shadow-md relative md:absolute md:-left-[64px] md:top-1/2 md:-translate-y-1/2">
                    02
                  </div>
                  <div className="flex-1 md:pl-0">
                    <h3 className="font-heading font-black text-xl md:text-2xl uppercase text-brand-charcoalDark mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                      Develop & Program
                      <span className="text-xs font-mono font-bold bg-brand-redAccent text-brand-creamPrimary py-0.5 px-2 rounded">Codebase</span>
                    </h3>
                    <p className="text-sm text-brand-charcoalMedium leading-relaxed">
                      Writing modular C++ structures, clean React frontend interfaces, and robust Node.js APIs.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative group w-full flex flex-col md:flex-row gap-6 md:items-center glass-card-dark p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 reveal-element reveal-delay-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-redAccent text-brand-creamPrimary flex items-center justify-center font-mono font-bold text-sm z-20 border-4 border-brand-creamPrimary shadow-md relative md:absolute md:-left-[64px] md:top-1/2 md:-translate-y-1/2">
                    03
                  </div>
                  <div className="flex-1 md:pl-0">
                    <h3 className="font-heading font-black text-xl md:text-2xl uppercase text-brand-charcoalDark mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                      Optimize & Deploy
                      <span className="text-xs font-mono font-bold text-brand-redAccent py-0.5 px-2 bg-brand-redAccent/10 rounded">Launch</span>
                    </h3>
                    <p className="text-sm text-brand-charcoalMedium leading-relaxed">
                      Running performance benchmarks, debugging, and hosting applications on cloud servers.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Section 3: Technical Skills Dashboard */}
        <section 
          id="skills" 
          ref={skillsRef} 
          className="relative min-h-screen text-brand-charcoalDark py-32 px-6 md:px-12 border-t border-brand-charcoalDark/5"
        >
          <div className="absolute inset-0 bg-brand-creamPrimary -z-20 pointer-events-none" />

          <div className="w-full max-w-7xl mx-auto relative z-30">
            <div className="text-center md:text-left mb-16 pointer-events-auto reveal-element">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-redAccent uppercase tracking-widest mb-4">
                <span>✦</span> 02 // SKILLSET
              </div>
              <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none mb-4">
                Technical Skillset
              </h2>
              <p className="text-brand-charcoalMedium max-w-lg text-base md:text-lg">
                A structured matrix of my programming languages, frameworks, backend capabilities, and development tools.
              </p>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pointer-events-auto">
              {skillCategories.map((category, idx) => (
                <div 
                  key={idx} 
                  className={`glass-card-dark border-l-4 border-l-brand-crimsonAccent p-6 hover:transform hover:-translate-y-2 transition-all duration-300 reveal-element ${
                    idx === 0 ? '' : idx === 1 ? 'reveal-delay-75' : idx === 2 ? 'reveal-delay-150' : 'reveal-delay-200'
                  }`}
                >
                  <h3 className="font-heading font-extrabold text-base md:text-lg text-brand-charcoalDark uppercase mb-6 tracking-tight">
                    {category.title}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {category.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center border-b border-brand-charcoalDark/5 pb-2">
                        <span className="text-brand-charcoalDark/80 font-medium text-sm">{skill}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-redAccent" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Projects Grid */}
        <section 
          id="projects" 
          ref={projectsRef} 
          className="relative min-h-screen text-brand-charcoalDark py-32 px-6 md:px-12 border-t border-brand-charcoalDark/5"
        >
          <div className="absolute inset-0 bg-brand-creamPrimary -z-20 pointer-events-none" />
          <div className="w-full max-w-7xl mx-auto relative z-30">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pointer-events-auto reveal-element">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-redAccent uppercase tracking-widest mb-4">
                  <span>✦</span> 03 // PORTFOLIO
                </div>
                <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter uppercase leading-none">
                  Featured Projects
                </h2>
              </div>
              <p className="text-brand-charcoalMedium max-w-sm text-sm md:text-base mt-4 md:mt-0 text-left md:text-right">
                Select case studies demonstrating full stack system integration, performance scale, and custom WebGL experiments.
              </p>
            </div>

            {/* Grid of Projects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pointer-events-auto">
              {projects.map((project, idx) => (
                <div 
                  key={project.id} 
                  onClick={() => setActiveProject(project)}
                  className={`glass-card-dark flex flex-col overflow-hidden rounded-3xl group border border-brand-charcoalDark/10 hover:border-brand-redAccent/50 hover:shadow-brand-redAccent/[0.02] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-brand-creamSecondary/70 cursor-pointer reveal-element ${
                    idx === 0 ? '' : idx === 1 ? 'reveal-delay-150' : 'reveal-delay-300'
                  }`}
                >
                  {/* Image/Placeholder container */}
                  <div className="relative h-48 overflow-hidden w-full bg-brand-creamSecondary border-b border-brand-charcoalDark/5">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand-redAccent/10 via-brand-creamSecondary to-brand-creamPrimary flex items-center justify-center relative">
                        <div className="absolute inset-0 grid-pattern-dark grid-mask opacity-30" />
                        <span className="font-heading font-black text-xs uppercase tracking-wider text-brand-charcoalDark/25">3D Graphic Experiment</span>
                      </div>
                    )}
                    {/* Floating category badge */}
                    <div className="absolute top-4 left-4 font-mono text-[9px] font-bold text-brand-redAccent bg-brand-creamPrimary/90 backdrop-blur-md py-1 px-2.5 rounded-full border border-brand-charcoalDark/5 tracking-widest uppercase">
                      {project.num.split(" // ")[1]}
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-7 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-xl uppercase text-brand-charcoalDark mb-3 group-hover:text-brand-redAccent transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-brand-charcoalMedium leading-relaxed mb-5">
                        {project.description}
                      </p>
                      
                      {/* Inline Tech Stack Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {project.skills.slice(0, 4).map((skill, sIdx) => (
                          <span key={sIdx} className="bg-brand-creamPrimary border border-brand-charcoalDark/5 text-brand-charcoalMedium font-mono text-[10px] py-1 px-3 rounded">
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 4 && (
                          <span className="bg-brand-creamPrimary border border-brand-charcoalDark/5 text-brand-redAccent/80 font-mono text-[10px] py-1 px-3 rounded">
                            +{project.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer Row */}
                    <div className="flex items-center justify-between border-t border-brand-charcoalDark/5 pt-4 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProject(project);
                        }}
                        className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-charcoalDark/80 hover:text-brand-redAccent flex items-center gap-1 transition-colors duration-200"
                      >
                        Details ↗
                      </button>
                      
                      <div className="flex items-center gap-3">
                        {project.github && (
                          <a 
                            href={project.github} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full border border-brand-charcoalDark/15 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent flex items-center justify-center transition-all duration-300 bg-brand-creamPrimary/40 hover:bg-brand-redAccent/5"
                            title="GitHub Repository"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                          </a>
                        )}
                        {project.demo && (
                          <a 
                            href={project.demo} 
                            target="_blank" 
                            rel="noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-full border border-brand-charcoalDark/15 hover:border-brand-redAccent text-brand-charcoalDark hover:text-brand-redAccent flex items-center justify-center transition-all duration-300 bg-brand-creamPrimary/40 hover:bg-brand-redAccent/5"
                            title="Live Demo"
                          >
                            <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Contact & Custom Form */}
        <section 
          id="contact" 
          ref={contactRef} 
          className="relative min-h-screen text-brand-charcoalDark pt-32 pb-16 px-6 md:px-12 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-brand-creamPrimary -z-20 pointer-events-none" />
          {/* Giant Watermark Text Background */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading font-black text-[15vw] leading-none tracking-widest text-outline-white text-center w-full z-0 select-none pointer-events-none opacity-5">
            CONTACT
          </div>

          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 pointer-events-auto">
            
            {/* Left side details */}
            <div className="lg:col-span-6 text-left reveal-element">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-brand-redAccent uppercase tracking-widest mb-4">
                <span>✦</span> 04 // CONNECTIONS
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tighter uppercase leading-none mb-6">
                Let's build <br />
                <span className="text-brand-redAccent">something new.</span>
              </h2>
              <p className="text-brand-charcoalMedium mb-8 max-w-md">
                Looking for a dedicated Software Engineer, a collaborative partner, or want to discuss internship opportunities? Let's connect and build something impactful.
              </p>

              {/* Direct coordinates list */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-creamSecondary border border-brand-charcoalDark/5 text-brand-redAccent flex items-center justify-center font-bold">✉</div>
                  <div>
                    <div className="font-mono text-[10px] text-brand-charcoalMedium/60">DIRECT LINK</div>
                    <div className="font-bold text-sm">swipeharsh2001@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-creamSecondary border border-brand-charcoalDark/5 text-brand-redAccent flex items-center justify-center font-bold">🌐</div>
                  <div>
                    <div className="font-mono text-[10px] text-brand-charcoalMedium/60">COORDINATES</div>
                    <div className="font-bold text-sm">Coimbatore, India</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side normalized Light Glassmorphic Contact Form Card */}
            <div className="lg:col-span-6 glass-card-dark p-8 md:p-12 shadow-xl relative rounded-3xl overflow-hidden border border-brand-charcoalDark/10 bg-brand-creamSecondary/70 reveal-element reveal-delay-150">
              {/* Corner decorative tag */}
              <div className="absolute top-0 right-0 bg-brand-redAccent/15 text-brand-redAccent border-l border-b border-brand-charcoalDark/10 font-mono text-[9px] uppercase font-bold tracking-widest py-1.5 px-4 rounded-bl-xl">
                Secure Portal
              </div>
              
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoalDark/70">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="John Doe" 
                      className="bg-brand-creamWarm border border-brand-charcoalDark/10 focus:border-brand-redAccent/50 rounded-xl p-3.5 text-brand-charcoalDark placeholder:text-brand-charcoalDark/40 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoalDark/70">Your Email</label>
                    <input 
                      required 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="john@example.com" 
                      className="bg-brand-creamWarm border border-brand-charcoalDark/10 focus:border-brand-redAccent/50 rounded-xl p-3.5 text-brand-charcoalDark placeholder:text-brand-charcoalDark/40 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoalDark/70">Subject</label>
                  <input 
                    required 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    placeholder="Project Collaboration" 
                    className="bg-brand-creamWarm border border-brand-charcoalDark/10 focus:border-brand-redAccent/50 rounded-xl p-3.5 text-brand-charcoalDark placeholder:text-brand-charcoalDark/40 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoalDark/70">Message</label>
                  <textarea 
                    required 
                    id="message" 
                    name="message" 
                    placeholder="Describe your web objectives..." 
                    rows="4" 
                    className="bg-brand-creamWarm border border-brand-charcoalDark/10 focus:border-brand-redAccent/50 rounded-xl p-3.5 text-brand-charcoalDark placeholder:text-brand-charcoalDark/40 focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3 mt-2">
                  <input 
                    required 
                    type="checkbox" 
                    id="consent" 
                    className="mt-1 accent-brand-redAccent w-4 h-4 cursor-pointer" 
                  />
                  <label htmlFor="consent" className="text-xs text-brand-charcoalMedium/80 leading-snug cursor-pointer select-none">
                    I consent to the collection and transmission of this data array for the sole purpose of portfolio inquiry communication.
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="bg-brand-redAccent text-brand-creamPrimary font-mono text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-brand-charcoalDark hover:text-brand-creamPrimary transition-all duration-300 cursor-pointer shadow-md hover:shadow-brand-redAccent/20 mt-2"
                >
                  Transmit Signals
                </button>
                
                {formStatus && (
                  <div className="text-center font-mono text-sm font-bold text-brand-charcoalDark bg-brand-creamSecondary/40 p-2 border border-brand-charcoalDark/10">
                    {formStatus}
                  </div>
                )}
              </form>
            </div>

          </div>

          {/* Footer Area */}
          <footer className="w-full mt-24 border-t border-brand-charcoalDark/10 pt-16 pointer-events-auto">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left mb-16">
              <div>
                <h4 className="font-mono text-xs font-bold text-brand-charcoalDark uppercase tracking-wider mb-4">Creative Production</h4>
                <p className="text-xs text-brand-charcoalMedium leading-relaxed">
                  React & Frontend Architectures <br />
                  Interactive 3D WebGL Spaces <br />
                  Python Automation Systems
                </p>
              </div>
              <div>
                <h4 className="font-mono text-xs font-bold text-brand-charcoalDark uppercase tracking-wider mb-4">Availability Matrix</h4>
                <p className="text-xs text-brand-charcoalMedium leading-relaxed">
                  Open to internship & collaboration <br />
                  Worldwide availability (2026) <br />
                  Secure line: swipeharsh2001@gmail.com
                </p>
              </div>
              <div>
                <h4 className="font-mono text-xs font-bold text-brand-charcoalDark uppercase tracking-wider mb-4">Social Coordinates</h4>
                <div className="flex gap-4">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-brand-charcoalMedium hover:text-brand-redAccent transition-colors duration-200">GitHub</a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-xs text-brand-charcoalMedium hover:text-brand-redAccent transition-colors duration-200">LinkedIn</a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-xs text-brand-charcoalMedium hover:text-brand-redAccent transition-colors duration-200">Twitter</a>
                </div>
              </div>
            </div>

            {/* Giant Stylized Watermark Logo scrolling at the bottom */}
            <div className="w-full overflow-hidden border-t border-brand-charcoalDark/5 py-4 select-none pointer-events-none">
              <div className="flex whitespace-nowrap animate-marquee">
                {Array(6).fill("HARSHINI • FULL STACK DEVELOPER • CREATIVE CODER • ").map((text, idx) => (
                  <span key={idx} className="font-heading font-black text-[12vw] leading-none text-brand-charcoalDark opacity-[0.04] tracking-tighter mr-8">
                    {text}
                  </span>
                ))}
              </div>
            </div>
          </footer>
        </section>

      </main>

      {/* Project Details Modal Overlay */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-creamPrimary/80 backdrop-blur-md animate-modal-fade-in" onClick={() => setActiveProject(null)}>
          <div className="relative w-full max-w-4xl bg-brand-creamWarm border border-brand-charcoalDark/15 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] animate-modal-scale-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-brand-creamSecondary/50 hover:bg-brand-redAccent hover:text-brand-creamPrimary border border-brand-charcoalDark/10 text-brand-charcoalDark flex items-center justify-center font-bold rounded-full transition-all duration-200 cursor-pointer"
              onClick={() => setActiveProject(null)}
            >
              ×
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-16 pb-8 px-8 md:p-12">
              {/* Left Column: Media Showcase */}
              <div className="md:col-span-5 flex flex-col justify-start">
                {activeProject.image ? (
                  <div 
                    className="w-full h-56 md:h-80 bg-cover bg-center rounded-2xl border border-brand-charcoalDark/10 grayscale-[10%]" 
                    style={{ backgroundImage: `url(${activeProject.image})` }}
                  />
                ) : (
                  <div className="w-full h-56 md:h-80 bg-gradient-to-br from-brand-redAccent to-brand-creamSecondary flex items-center justify-center rounded-2xl border border-brand-charcoalDark/10">
                    <span className="font-heading font-black text-sm uppercase tracking-wider text-brand-charcoalDark opacity-25">Creative Experiment</span>
                  </div>
                )}
                
                <div className="mt-4 inline-flex self-start font-mono text-[10px] font-bold text-brand-redAccent bg-brand-creamSecondary/50 py-1 px-3 rounded-full border border-brand-charcoalDark/5 tracking-widest uppercase">
                  {activeProject.num}
                </div>
              </div>

              {/* Right Column: Detailed copy */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-2xl md:text-3xl text-brand-charcoalDark uppercase mb-4 tracking-tight leading-tight pr-6 md:pr-12">
                    {activeProject.title}
                  </h3>
                  <p className="text-xs md:text-sm text-brand-charcoalMedium leading-loose max-w-prose mb-6">
                    {activeProject.longDescription}
                  </p>
                  
                  {/* Tech Stack Deployed */}
                  <div className="mb-6">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-charcoalMedium/60 mb-2.5">
                      Technologies Deployed
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-brand-creamSecondary border border-brand-charcoalDark/5 text-brand-redAccent font-mono text-[9px] font-bold py-1 px-2.5 rounded-full uppercase"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-end gap-3 border-t border-brand-charcoalDark/10 pt-5 mt-4">
                  <button 
                    className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent border border-brand-charcoalDark/20 text-brand-charcoalDark hover:bg-brand-creamSecondary/50 py-2.5 px-5 rounded-full transition-all duration-200 cursor-pointer"
                    onClick={() => setActiveProject(null)}
                  >
                    Close
                  </button>
                  {activeProject.github && (
                    <a 
                      href={activeProject.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent border-2 border-brand-charcoalDark/20 text-brand-charcoalDark hover:border-brand-redAccent hover:text-brand-redAccent py-2.5 px-5 rounded-full transition-all duration-200 cursor-pointer no-underline flex items-center justify-center gap-1.5"
                    >
                      GitHub Code ↗
                    </a>
                  )}
                  {activeProject.demo && (
                    <a 
                      href={activeProject.demo} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-mono text-xs font-bold uppercase tracking-wider bg-brand-redAccent text-brand-creamPrimary hover:bg-brand-charcoalDark hover:text-brand-creamPrimary py-2.5 px-5 rounded-full transition-all duration-200 cursor-pointer no-underline flex items-center justify-center gap-1.5"
                    >
                      Live Demo 🚀
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
