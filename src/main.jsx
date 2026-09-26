import Admin from "./admin";

const baseUrl = import.meta.env.BASE_URL;
const appPath = window.location.pathname.startsWith(baseUrl)
  ? `/${window.location.pathname.slice(baseUrl.length)}`
  : window.location.pathname;
const normalizedAppPath = appPath.replace(/\/$/, "") || "/";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowUpRight,
  Menu,
  X,
  Box,
  Smartphone,
  Clapperboard,
  Bot,
  Code2,
  Play,
  Instagram,
  MessageCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { firebaseConfigured, auth, db } from "./firebase";
import { getAuthErrorMessage } from "./authErrors";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import "./styles.css";

/* ========================================
   WEBSITE CONFIGURATION
======================================== */

const WEBSITE_CONFIG = {
  logo: "Growthify",
  backgroundVideo: "/WhatsApp Video 2026-06-23 at 08.31.57.mp4",
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || "",
  instagramUsername: import.meta.env.VITE_INSTAGRAM_USERNAME || "",
};

/* ========================================
   SERVICES
======================================== */

const services = [
  {
    number: "01",
    title: "CGI Product Ads",
    description:
      "Photorealistic 3D product visuals that stop the scroll and make your product stand out.",
    icon: <Box size={28} />,
    backgroundVideo: "/cgi-product-background.mp4",
  },
  {
    number: "02",
    title: "UGC Content",
    description:
      "Authentic, conversion-focused content that builds trust and connects with your audience.",
    icon: <Smartphone size={28} />,
    backgroundVideo: "/ugc-content-background.mp4",
  },
  {
    number: "03",
    title: "Cinematic Brand Films",
    description:
      "Premium video ads that make your brand unforgettable and impossible to ignore.",
    icon: <Clapperboard size={28} />,
    backgroundVideo: "/cinematic-brand-background.mp4",
  },
  {
    number: "04",
    title: "AI Agents",
    description:
      "Smart AI agents that automate repetitive work, support your customers, and help your business move faster.",
    icon: <Bot size={28} />,
    backgroundVideo: "/ai-agents-background.mp4",
  },
  {
    number: "05",
    title: "Web Development",
    description:
      "Fast, modern websites and web apps built to look premium, feel effortless, and convert more visitors.",
    icon: <Code2 size={28} />,
    backgroundVideo: "/web-development-background.mp4",
  },
];

/* ========================================
   PORTFOLIO
======================================== */

const projects = [
  {
    id: 1,
    title: "AURA",
    category: "Skincare",
    type: "CGI",
    description: "Premium skincare product visual",
    video: "",
    color: "#91bfff",
  },
  {
    id: 2,
    title: "NOIR",
    category: "Clothing",
    type: "Cinematic",
    description: "Cinematic fashion campaign",
    video: "",
    color: "#d7c7ff",
  },
  {
    id: 3,
    title: "FUEL",
    category: "Food",
    type: "CGI",
    description: "Creative food advertisement",
    video: "",
    color: "#ffb88c",
  },
  {
    id: 4,
    title: "FORM",
    category: "Ecommerce",
    type: "UGC",
    description: "Conversion-focused ecommerce content",
    video: "",
    color: "#b6efc5",
  },
  {
    id: 5,
    title: "LUMI",
    category: "Skincare",
    type: "Cinematic",
    description: "Cinematic beauty campaign",
    video: "",
    color: "#f0b9db",
  },
  {
    id: 6,
    title: "VOLT",
    category: "Ecommerce",
    type: "CGI",
    description: "Next-level product animation",
    video: "",
    color: "#f1dc8c",
  },
];

/* ========================================
   STATS
======================================== */

const stats = [
  {
    value: "10+",
    label: "Brands Served",
  },
  {
    value: "100%",
    label: "Client Satisfaction",
  },
  {
    value: "48hr",
    label: "Turnaround",
  },
  {
    value: "3x",
    label: "Average ROI*",
  },
];

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({ status: "idle", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (!firebaseConfigured) {
      setState({ status: "error", message: "Authentication is not configured yet." });
      return;
    }
    if (mode === "signup" && form.password.length < 8) {
      setState({ status: "error", message: "Use a password with at least 8 characters." });
      return;
    }
    setState({ status: "loading", message: "" });
    try {
      if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(result.user, { displayName: form.name });
        setState({ status: "success", message: "Account created. You can now access your workspace." });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        setState({ status: "success", message: "Signed in successfully." });
      }
    } catch (error) {
      setState({ status: "error", message: getAuthErrorMessage(error) });
    }
  };

  return (
    <main className="auth-page">
      <a className="auth-brand" href={baseUrl}><img src={`${baseUrl}growthify-mark.jpeg`} alt="" />Growthify</a>
      <section className="auth-card">
        <p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "JOIN GROWTHIFY"}</p>
        <h1>{mode === "login" ? "Make your brand matter." : "Build what’s next."}</h1>
        <p className="auth-copy">{mode === "login" ? "Sign in to continue your creative journey." : "Create an account for your Growthify workspace."}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoComplete="name" /></label>}
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" /></label>
          <label>Password<span className="auth-password"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          {state.message && <p className={`auth-status ${state.status}`}>{state.message}</p>}
          <button className="auth-submit" disabled={state.status === "loading" || !firebaseConfigured}>{state.status === "loading" ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowUpRight size={17} /></button>
        </form>
        <p className="auth-switch">{mode === "login" ? "New to Growthify?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setState({ status: "idle", message: "" }); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p>
      </section>
    </main>
  );
}

/* ========================================
   APP
======================================== */

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [contactState, setContactState] = useState({ status: "idle", message: "" });

  const closeMenu = () => {
    setMenuOpen(false);
  };

  /* Cursor glow effect */
  useEffect(() => {
    const handleMouseMove = (event) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`
      );

      document.documentElement.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* Portfolio filter */
  const filteredProjects =
    activeFilter === "All"
      ? projects
      : projects.filter(
          (project) => project.category === activeFilter
        );

  const submitContact = async (event) => {
    event.preventDefault();
    setContactState({ status: "loading", message: "" });
    if (!firebaseConfigured) {
      setContactState({
        status: "error",
        message: "Contact submissions are not configured yet. Please reach out through WhatsApp or Instagram.",
      });
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...Object.fromEntries(form.entries()),
        createdAt: serverTimestamp(),
      });
      event.currentTarget.reset();
      setContactState({ status: "success", message: "Thanks — your message has been sent." });
    } catch (error) {
      setContactState({ status: "error", message: error.message });
    }
  };

  return (
    <div className="app">
      {/* ========================================
          NAVIGATION
      ======================================== */}

      <header className="navbar">
        <a href="#home" className="logo" onClick={closeMenu}>
          <img className="logo-mark" src={`${baseUrl}growthify-mark.jpeg`} alt="" />
          <span className="logo-wordmark">Growthify</span>
        </a>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={closeMenu}>
            Home
          </a>

          <a href="#work" onClick={closeMenu}>
            Work
          </a>

          <a href="#services" onClick={closeMenu}>
            Services
          </a>

          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </nav>

        <a href="#contact" className="nav-button">
          Get in touch <ArrowUpRight size={17} />
        </a>

        <button
          className="menu-button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </header>

      <main>
        {/* ========================================
            HERO SECTION
        ======================================== */}

        <section className="hero section" id="home">
          {WEBSITE_CONFIG.backgroundVideo && (
            <video
              className="hero-background-video"
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src={WEBSITE_CONFIG.backgroundVideo}
                type="video/mp4"
              />
            </video>
          )}

          <div className="hero-overlay"></div>

          <div className="hero-label">
            <span className="status-dot"></span>
            Independent creative ad agency
          </div>

          <h1>
            We Make Brands
            <br />
            <span className="outline-text">Impossible</span> To Ignore.
          </h1>

          <p className="hero-subtitle">
            CGI <span>•</span> UGC <span>•</span> Cinematic Ads
          </p>

          <div className="hero-bottom">
            <p>
              We create next-level product advertisements that combine
              creative direction, visual storytelling, and technology.
            </p>

            <div className="hero-actions">
              <a href="#work" className="primary-button">
                See Our Work <ArrowUpRight size={19} />
              </a>

              <a href="#contact" className="secondary-button">
                Let's Talk <ArrowUpRight size={19} />
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>

            <div className="visual-center">
              <span>G</span>
              <small>MAKE IT UNMISSABLE</small>
            </div>

            <div className="visual-text">
              CGI × UGC × CINEMATIC
            </div>
          </div>

          <div className="scroll-label">
            <span>Scroll to explore</span>
            <span className="scroll-line"></span>
          </div>
        </section>

        {/* ========================================
            MARQUEE
        ======================================== */}

        <div className="marquee">
          <div className="marquee-track">
            <span>MAKE IT BOLD</span>
            <b>✳</b>
            <span>STOP THE SCROLL</span>
            <b>✳</b>
            <span>CREATE IMPACT</span>
            <b>✳</b>
            <span>MAKE IT BOLD</span>
            <b>✳</b>
            <span>STOP THE SCROLL</span>
            <b>✳</b>
          </div>
        </div>

        {/* ========================================
            SERVICES SECTION
        ======================================== */}

        <section className="section services-section" id="services">
          <div className="section-heading">
            <span className="eyebrow">[ What we do ]</span>

            <h2>
              We create
              <br />
              <em>visual impact.</em>
            </h2>

            <p className="section-description">
              From realistic CGI to authentic UGC and cinematic brand films,
              we create content designed to make people stop and look.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article
                className={`service-card${service.backgroundVideo ? " has-background-video" : ""}`}
                key={service.number}
              >
                {service.backgroundVideo && (
                  <video
                    className="service-background-video"
                    src={service.backgroundVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  />
                )}

                <span className="service-number">
                  {service.number}
                </span>

                <div className="service-icon">
                  {service.icon}
                </div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a href="#contact">
                  Start a project <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* ========================================
            PORTFOLIO SECTION
        ======================================== */}

        <section className="section work-section" id="work">
          <div className="section-heading work-heading">
            <span className="eyebrow">[ Selected work ]</span>

            <h2>
              Our
              <br />
              <em>Work.</em>
            </h2>

            <p className="section-description">
              A selection of creative concepts and advertising visuals
              built for ambitious brands.
            </p>
          </div>

          <div className="filter-buttons">
            {[
              "All",
              "Skincare",
              "Clothing",
              "Food",
              "Ecommerce",
            ].map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <article className="project-card" key={project.id}>
                <div
                  className="project-image"
                  style={{
                    "--project-color": project.color,
                  }}
                >
                  {project.video ? (
                    <video
                      className="project-video"
                      src={project.video}
                      muted
                      loop
                      playsInline
                      controls
                    />
                  ) : (
                    <div
                      className={`project-art art-${
                        (index % 3) + 1
                      }`}
                    >
                      <span>{project.title}</span>
                    </div>
                  )}

                  <div className="project-play">
                    <Play size={22} fill="currentColor" />
                  </div>

                  <span className="project-type">
                    {project.type}
                  </span>
                </div>

                <div className="project-info">
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ========================================
            WHY GROWTHIFY
        ======================================== */}

        <section className="section stats-section" id="about">
          <div className="section-heading">
            <span className="eyebrow">[ Why Growthify ]</span>

            <h2>
              Built for brands
              <br />
              <em>with ambition.</em>
            </h2>

            <p className="section-description">
              We combine creative thinking with production quality to help
              brands stand out in a crowded digital world.
            </p>
          </div>

          <div className="stats-grid">
            {stats.map((stat) => (
              <div className="stat-box" key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="stats-note">
            *Publish performance metrics only after verifying actual client
            results.
          </p>
        </section>

        {/* ========================================
            CONTACT SECTION
        ======================================== */}

        <section className="contact-section section" id="contact">
          <span className="eyebrow">[ Let's work together ]</span>

          <h2>
            Let's Build
            <br />
            <em>Something Great.</em>
          </h2>

          <p className="contact-subtext">
            Ready to make your brand impossible to ignore?
          </p>

          <div className="contact-actions">
            {WEBSITE_CONFIG.whatsappNumber && (
              <a
                href={`https://wa.me/${WEBSITE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button"
              >
                <MessageCircle size={19} />
                WhatsApp
                <ArrowUpRight size={19} />
              </a>
            )}

            {WEBSITE_CONFIG.instagramUsername && (
              <a
                href={`https://www.instagram.com/${WEBSITE_CONFIG.instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-button"
              >
                <Instagram size={19} />
                Instagram
                <ArrowUpRight size={19} />
              </a>
            )}
          </div>

          <form
            className="contact-form"
            onSubmit={submitContact}
          >
            <input
              type="text"
              placeholder="Your Name"
              name="name"
              aria-label="Your name"
              required
            />

            <input
              type="text"
              placeholder="Brand Name"
              name="brand"
              aria-label="Brand name"
              required
            />

            <input
              type="email"
              placeholder="Your Email"
              name="email"
              aria-label="Your email"
              autoComplete="email"
              required
            />

            <textarea
              placeholder="Tell us about your project"
              name="message"
              aria-label="Project details"
              rows="5"
              required
            ></textarea>

            {contactState.message && (
              <p className={`contact-status ${contactState.status}`}>{contactState.message}</p>
            )}
            <button type="submit" className="primary-button" disabled={contactState.status === "loading"}>
              {contactState.status === "loading" ? "Sending…" : "Send Message"} <ArrowUpRight size={19} />
            </button>
          </form>
        </section>
      </main>

      {/* ========================================
          FOOTER
      ======================================== */}

      <footer className="footer">
        <a href="#home" className="logo">
          <img className="logo-mark" src={`${baseUrl}growthify-mark.jpeg`} alt="" />
          <span className="logo-wordmark">Growthify</span>
        </a>

        <p>
          © {new Date().getFullYear()} Growthify. All rights reserved.
        </p>

        <a href="#home" className="back-top">
          Back to top ↑
        </a>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {normalizedAppPath === "/admin" ? <Admin /> : normalizedAppPath === "/login" ? <AuthPage /> : <App />}
  </React.StrictMode>
);
