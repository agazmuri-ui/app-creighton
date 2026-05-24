import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Inventario from './pages/Inventario';
import Pacientes from './pages/Pacientes';
import PacienteDetalle from './pages/PacienteDetalle';
import Caja from './pages/Caja';
import './styles.css';

function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✦</div>
          <div>
            <div className="logo-title">Creighton</div>
            <div className="logo-sub">Practitioner</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">📦</span>
            <span>Inventario</span>
          </NavLink>
          <NavLink to="/pacientes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">👩‍⚕️</span>
            <span>Casos</span>
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
          <Route path="/" element={<Inventario />} />
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
