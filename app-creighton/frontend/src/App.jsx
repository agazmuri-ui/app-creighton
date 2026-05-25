import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Inventario from './pages/Inventario';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Caja from './pages/Caja';
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
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'var(--cream-dark)',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 48,
        border: '3px solid var(--sage-light)',
      }}>
        👩‍⚕️
      </div>
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
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
            <div className="logo-icon">✦</div>
            <div>
              <div className="logo-title">Creighton</div>
              <div className="logo-sub">Practitioner</div>
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
