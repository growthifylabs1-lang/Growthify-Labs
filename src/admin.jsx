import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Check,
  ExternalLink,
  Film,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { firebaseConfigured, auth, db } from "./firebase";
import { getAuthErrorMessage } from "./authErrors";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./admin.css";

const defaultProjects = [
  { id: 1, title: "AURA", category: "Skincare", type: "CGI", status: "Published" },
  { id: 2, title: "NOIR", category: "Clothing", type: "Cinematic", status: "Published" },
  { id: 3, title: "FUEL", category: "Food", type: "CGI", status: "Draft" },
];

const defaultServices = [
  { id: 1, title: "CGI Product Ads", description: "Photorealistic 3D product visuals that stop the scroll." },
  { id: 2, title: "UGC Content", description: "Authentic, conversion-focused content that builds trust." },
  { id: 3, title: "Cinematic Brand Films", description: "Premium video ads that make your brand unforgettable." },
  { id: 4, title: "AI Agents", description: "Smart AI agents that automate repetitive work and support your customers." },
  { id: 5, title: "Web Development", description: "Fast, modern websites and web apps built to convert more visitors." },
];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setCheckingSession(false);
      return undefined;
    }
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setCheckingSession(true);
      if (!currentUser) {
        setUser(null);
        setCheckingSession(false);
        return;
      }
      const uid = currentUser.uid;

      const verifyAdminClaim = async () => {
        try {
          const token = await currentUser.getIdTokenResult();
          if (!active || auth.currentUser?.uid !== uid) return;

          if (token.claims.admin !== true) {
            setLoginError("This account is not authorized for the admin workspace.");
            setUser(null);
            try {
              await signOut(auth);
            } catch {
              // Keep the admin workspace locked if sign-out cannot complete.
            }
            return;
          }

          setLoginError("");
          setUser(currentUser);
        } catch {
          if (!active || auth.currentUser?.uid !== uid) return;
          setLoginError("Unable to verify admin access. Please sign in again.");
          setUser(null);
          try {
            await signOut(auth);
          } catch {
            // Keep the admin workspace locked if sign-out cannot complete.
          }
        } finally {
          if (active && auth.currentUser?.uid === uid) {
            setCheckingSession(false);
          }
        }
      };

      void verifyAdminClaim();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = async (event) => {
    event.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      setEmail("");
    } catch (error) {
      setLoginError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      setLoginError("Unable to sign out. Please try again.");
    }
  };

  if (checkingSession) {
    return <div className="admin-login"><p className="admin-loading">Checking secure session…</p></div>;
  }

  if (!user) {

    return (
      <div className="admin-login">
        <div className="login-box">
          <div className="admin-logo"><img className="admin-logo-mark" src="/growthify-mark.jpeg" alt="" /><span>Growthify</span></div>
          <p className="admin-label">ADMIN WORKSPACE</p>
          <h1>Welcome back.</h1>
          <p className="login-copy">Sign in to manage your website content and enquiries.</p>
          {!firebaseConfigured && <p className="login-error">Firebase is not configured. Add the Firebase values from .env.example before deploying.</p>}
          <form onSubmit={login}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setLoginError("");
              }}
              autoComplete="username"
              required
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setLoginError("");
              }}
              autoComplete="current-password"
              required
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="login-button" type="submit" disabled={isLoading || !firebaseConfigured}>{isLoading ? "Signing in…" : "Sign in"} <ExternalLink size={16} /></button>
          </form>
          <a className="back-site" href="/">← Back to website</a>
        </div>
      </div>
    );
  }

  return <AdminWorkspace onLogout={logout} />;
}

function AdminWorkspace({ onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState(defaultProjects);
  const [services, setServices] = useState(defaultServices);
  const [settings, setSettings] = useState({
    logo: "Growthify",
    instagram: "",
    whatsapp: "",
  });
  const [saved, setSaved] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      getDoc(doc(db, "site", "projects")),
      getDoc(doc(db, "site", "services")),
      getDoc(doc(db, "site", "settings")),
    ])
      .then(([projectSnapshot, serviceSnapshot, settingsSnapshot]) => {
        if (!active) return;
        if (projectSnapshot.exists()) setProjects(projectSnapshot.data().items || []);
        if (serviceSnapshot.exists()) setServices(serviceSnapshot.data().items || []);
        if (settingsSnapshot.exists()) setSettings((current) => ({ ...current, ...settingsSnapshot.data() }));
      })
      .catch(() => active && setContentError("Content could not be loaded. Check your admin permissions."))
      .finally(() => active && setContentLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async () => {
    try {
      await setDoc(doc(db, "site", "settings"), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      setContentError("Settings could not be saved. Check your admin permissions.");
    }
  };

  const saveCollection = async (name, items) => {
    try {
      await setDoc(doc(db, "site", name), { items });
    } catch {
      setContentError("Changes could not be saved. Check your admin permissions.");
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Portfolio", icon: FolderOpen },
    { name: "Services", icon: Film },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="admin-panel">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="admin-logo"><img className="admin-logo-mark" src="/growthify-mark.jpeg" alt="" /><span>Growthify</span></div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ name, icon: Icon }) => (
            <button className={activeTab === name ? "active" : ""} key={name} onClick={() => { setActiveTab(name); setSidebarOpen(false); }}>
              <Icon size={18} /> {name}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" className="view-site"><ExternalLink size={16} /> View website</a>
          <button className="logout" onClick={onLogout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      {sidebarOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <main className="admin-content">
        <header className="admin-top">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <div>
            <p className="eyebrow">CONTROL PANEL / {activeTab.toUpperCase()}</p>
            <h1>{activeTab}</h1>
          </div>
          <div className="top-actions">
            {saved && <span className="saved-message"><Check size={15} /> Saved</span>}
            <span className="status"><i /> Website online</span>
          </div>
        </header>

        {contentError && <p className="login-error admin-content-error">{contentError}</p>}
        {contentLoading ? <div className="admin-section"><p className="admin-loading">Loading content…</p></div> : <>
        {activeTab === "Dashboard" && <Dashboard projects={projects} services={services} setActiveTab={setActiveTab} />}
        {activeTab === "Portfolio" && <Portfolio projects={projects} setProjects={(items) => { setProjects(items); saveCollection("projects", items); }} />}
        {activeTab === "Services" && <Services services={services} setServices={(items) => { setServices(items); saveCollection("services", items); }} />}
        {activeTab === "Settings" && <SettingsPanel settings={settings} setSettings={setSettings} onSave={saveSettings} />}
        </>}
      </main>
    </div>
  );
}

function Dashboard({ projects, services, setActiveTab }) {
  const stats = [
    { label: "Published projects", value: projects.filter((item) => item.status === "Published").length, detail: "Across your portfolio", icon: FolderOpen },
    { label: "Active services", value: services.length, detail: "Visible on your website", icon: BarChart3 },
    { label: "Enquiries", value: "12", detail: "This month", icon: MessageSquare },
  ];
  return (
    <>
      <section className="welcome-banner">
        <div><span className="welcome-icon"><ShieldCheck size={20} /></span><div><h2>Your website is looking good.</h2><p>Manage your content and keep your digital presence up to date.</p></div></div>
        <a href="/" target="_blank" rel="noreferrer">Open website <ExternalLink size={15} /></a>
      </section>
      <section className="admin-cards">{stats.map(({ label, value, detail, icon: Icon }) => <div className="admin-card" key={label}><div className="card-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</section>
      <section className="dashboard-grid">
        <div className="admin-section">
          <div className="section-heading"><div><p className="eyebrow">CONTENT</p><h2>Quick actions</h2></div></div>
          <div className="quick-actions">
            <button onClick={() => setActiveTab("Portfolio")}><Plus size={17} /> Add portfolio project</button>
            <button onClick={() => setActiveTab("Services")}><Film size={17} /> Edit services</button>
            <button onClick={() => setActiveTab("Settings")}><Settings size={17} /> Website settings</button>
          </div>
        </div>
        <div className="admin-section activity"><div className="section-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Recent updates</h2></div></div><p><span className="activity-dot" /> Website published successfully <small>Just now</small></p><p><span className="activity-dot purple" /> Portfolio content synced <small>Today</small></p></div>
      </section>
    </>
  );
}

function Portfolio({ projects, setProjects }) {
  const addProject = () => setProjects([...projects, { id: Date.now(), title: "NEW PROJECT", category: "Ecommerce", type: "CGI", status: "Draft" }]);
  const updateProject = (id, field, value) => setProjects(projects.map((project) => project.id === id ? { ...project, [field]: value } : project));
  return <ContentSection title="Portfolio projects" description="Manage the work displayed on your website." action={<button className="primary-action" onClick={addProject}><Plus size={17} /> Add project</button>}><div className="table-wrap"><table><thead><tr><th>Project</th><th>Category</th><th>Format</th><th>Status</th><th /></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><strong>{project.title}</strong><small>Project #{project.id}</small></td><td><select value={project.category} onChange={(event) => updateProject(project.id, "category", event.target.value)}><option>Skincare</option><option>Clothing</option><option>Food</option><option>Ecommerce</option></select></td><td><select value={project.type} onChange={(event) => updateProject(project.id, "type", event.target.value)}><option>CGI</option><option>UGC</option><option>Cinematic</option></select></td><td><button className={`status-pill ${project.status.toLowerCase()}`} onClick={() => updateProject(project.id, "status", project.status === "Draft" ? "Published" : "Draft")}>{project.status}</button></td><td><button className="icon-button danger" aria-label={`Delete ${project.title}`} onClick={() => setProjects(projects.filter((item) => item.id !== project.id))}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div></ContentSection>;
}

function Services({ services, setServices }) {
  const updateService = (id, field, value) => setServices(services.map((service) => service.id === id ? { ...service, [field]: value } : service));
  const addService = () => setServices([...services, { id: Date.now(), title: "New service", description: "Describe what this service offers." }]);
  return <ContentSection title="Services" description="Update the services your clients see." action={<button className="primary-action" onClick={addService}><Plus size={17} /> Add service</button>}><div className="service-list">{services.map((service, index) => <div className="service-editor" key={service.id}><span className="service-number">0{index + 1}</span><div className="service-fields"><input value={service.title} onChange={(event) => updateService(service.id, "title", event.target.value)} aria-label="Service title" /><textarea value={service.description} onChange={(event) => updateService(service.id, "description", event.target.value)} aria-label="Service description" rows="2" /></div><button className="icon-button danger" aria-label={`Delete ${service.title}`} onClick={() => setServices(services.filter((item) => item.id !== service.id))}><Trash2 size={16} /></button></div>)}</div></ContentSection>;
}

function SettingsPanel({ settings, setSettings, onSave }) {
  return <ContentSection title="Website settings" description="Update your brand contact details."><div className="settings-form"><label>Logo text<input value={settings.logo} onChange={(event) => setSettings({ ...settings, logo: event.target.value })} /></label><label>Instagram username<input value={settings.instagram} onChange={(event) => setSettings({ ...settings, instagram: event.target.value })} /></label><label>WhatsApp number<input value={settings.whatsapp} onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })} /></label><div className="form-footer"><span>Connect the content API to persist these changes.</span><button className="primary-action" onClick={onSave}><Save size={17} /> Save changes</button></div></div></ContentSection>;
}

function ContentSection({ title, description, action, children }) {
  return <section className="content-section"><div className="content-heading"><div><p className="eyebrow">MANAGE CONTENT</p><h2>{title}</h2><p>{description}</p></div>{action}</div>{children}</section>;
}
