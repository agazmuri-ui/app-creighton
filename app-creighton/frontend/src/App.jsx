import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Inventario from './pages/Inventario';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Caja from './pages/Caja';
import foto from './CatalinaQuiroga.png';
import './styles.css';

function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
    }}>
      <img
        src={foto}
        alt="Catalina Quiroga"
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          objectFit: 'cover',
          objectPosition: 'top',
          marginBottom: 24,
          border: '3px solid var(--sage-light)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}
      />
      <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, marginBottom: 8 }}>
        Creighton Practitioner
      </h1>
      <p style={{ fontSize: 20, color: 'var(--ink-soft)', marginBottom: 4 }}>
        Catalina Quiroga
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-faint)' }}>
        Santiago, Chile
      </p>
    </div>
  );
}

function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <NavLink to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit', padding: '8px 0' }}>
            <img
              src={foto}
              alt="Catalina Quiroga"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'top',
                marginBottom: 10,
                border: '2px solid var(--sage-light)',
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div className="logo-title">Catalina Quiroga</div>
              <div className="logo-sub">Creighton Practitioner</div>
            </div>
          </NavLink>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/inventario" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📦</span>
            <span>Inventario</span>
          </NavLink>
          <NavLink to="/pacientes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">👩‍⚕️</span>
            <span>Usuarias</span>
          </NavLink>
          <NavLink to="/caja" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">💰</span>
            <span>Caja</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">Método Creighton</div>
          <div className="sidebar-footer-text">Santiago, Chile</div>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/:id" element={<PacienteDetalle />} />
          <Route path="/caja" element={<Caja />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
