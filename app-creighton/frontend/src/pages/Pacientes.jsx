import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

function PacienteModal({ paciente, onClose, onDone }) {
  const [form, setForm] = useState(paciente || {
    nombre: '', apellido: '', telefono: '', email: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    estado: 'No iniciado', notas: ''
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.nombre.trim() || !form.apellido.trim()) return alert('Nombre y apellido son requeridos');
    setLoading(true);
    try {
      if (paciente) {
        await api(`/api/pacientes/${paciente.id}`, { method: 'PUT', body: form });
      } else {
        await api('/api/pacientes', { method: 'POST', body: form });
      }
      onDone();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{paciente ? 'Editar usuaria' : 'Nueva usuaria'}</h2>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
          </div>
          <div className="form-group">
            <label>Apellido *</label>
            <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Teléfono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 xxxx xxxx" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@email.com" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Fecha de inicio</label>
            <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
              <option>No iniciado</option>
              <option>En pausa</option>
              <option>1er año</option>
              <option>Seguimiento LP</option>
              <option>Abandona</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Notas generales</label>
          <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones de la usuaria..." />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState('');
  const navigate = useNavigate();

  async function cargar() {
    setLoading(true);
    try {
      const data = await api('/api/pacientes');
      setPacientes(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function eliminar(id, e) {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta usuaria? Se borrarán todas las sesiones.')) return;
    await api(`/api/pacientes/${id}`, { method: 'DELETE' });
    cargar();
  }

  const estadoBadge = {
    'No iniciado': 'badge-gray',
    'En pausa': 'badge-amber',
    '1er año': 'badge-green',
    'Seguimiento LP': 'badge-blue',
    'Abandona': 'badge-red',
  };

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const activas = pacientes.filter(p => p.estado === '1er año' || p.estado === 'Seguimiento LP').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarias</h1>
          <p className="page-sub">{activas} usuarias activas · {pacientes.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('nuevo')}>
          + Nueva usuaria
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, width: 280, background: 'var(--white)' }}
          placeholder="🔍 Buscar por nombre..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="empty"><div className="empty-text">Cargando...</div></div>
        ) : filtrados.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👩‍⚕️</div>
            <div className="empty-text">{filtro ? 'Sin resultados' : 'Sin usuarias. Agrega la primera.'}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Usuaria</th>
                  <th>Contacto</th>
                  <th>Inicio</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/pacientes/${p.id}`)}>
                    <td>
                      <strong>{p.apellido}, {p.nombre}</strong>
                      {p.notas && <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>{p.notas.slice(0, 50)}{p.notas.length > 50 ? '...' : ''}</div>}
                    </td>
                    <td>
                      {p.telefono && <div>{p.telefono}</div>}
                      {p.email && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{p.email}</div>}
                    </td>
                    <td style={{ color: 'var(--ink-soft)' }}>
                      {new Date(p.fecha_inicio).toLocaleDateString('es-CL')}
                    </td>
                    <td>
                      <span className={`badge ${estadoBadge[p.estado] || 'badge-gray'}`}>{p.estado}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(p); setModal('editar'); }}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={e => eliminar(p.id, e)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'nuevo' && (
        <PacienteModal onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
      {modal === 'editar' && (
        <PacienteModal paciente={selected} onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
    </div>
  );
}
