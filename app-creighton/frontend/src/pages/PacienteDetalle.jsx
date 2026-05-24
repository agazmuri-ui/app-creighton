import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

function SesionModal({ pacienteId, onClose, onDone }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
    cobro: 0,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api('/api/sesiones', {
        method: 'POST',
        body: { ...form, paciente_id: pacienteId, cobro: Number(form.cobro) },
      });
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
        <h2 className="modal-title">Nueva sesión</h2>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cobro (CLP)</label>
            <input type="number" min="0" value={form.cobro} onChange={e => setForm({ ...form, cobro: e.target.value })} placeholder="0" />
          </div>
        </div>
        <div className="form-group">
          <label>Notas de la sesión</label>
          <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Observaciones, avances, indicaciones..." />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

const estadoBadge = {
  'Activo': 'badge-green',
  'En pausa': 'badge-amber',
  'Cerrado': 'badge-gray',
};

export default function PacienteDetalle() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api(`/api/pacientes/${id}`);
      setPaciente(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [id]);

  async function eliminarSesion(sesionId) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    await api(`/api/sesiones/${sesionId}`, { method: 'DELETE' });
    cargar();
  }

  if (loading) return <div className="empty"><div className="empty-text">Cargando...</div></div>;
  if (!paciente) return <div className="empty"><div className="empty-text">Paciente no encontrado</div></div>;

  const sesiones = (paciente.sesiones || []).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const totalCobrado = sesiones.reduce((sum, s) => sum + (s.cobro || 0), 0);

  return (
    <div>
      <Link to="/pacientes" className="back-link">← Volver a Casos</Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">{paciente.nombre} {paciente.apellido}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
            <span className={`badge ${estadoBadge[paciente.estado]}`}>{paciente.estado}</span>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
              Desde {new Date(paciente.fecha_inicio).toLocaleDateString('es-CL')}
            </span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Nueva sesión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* Info del paciente */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Información</h3>
            {paciente.telefono && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 2 }}>Teléfono</div>
                <div>{paciente.telefono}</div>
              </div>
            )}
            {paciente.email && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 2 }}>Email</div>
                <div>{paciente.email}</div>
              </div>
            )}
            {paciente.notas && (
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 2 }}>Notas generales</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{paciente.notas}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Resumen</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 2 }}>Total sesiones</div>
              <div style={{ fontSize: 24, fontFamily: 'DM Serif Display, serif' }}>{sesiones.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 2 }}>Total cobrado</div>
              <div style={{ fontSize: 24, fontFamily: 'DM Serif Display, serif' }}>
                ${totalCobrado.toLocaleString('es-CL')}
              </div>
            </div>
          </div>
        </div>

        {/* Sesiones */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Historial de sesiones</h3>
          {sesiones.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Sin sesiones registradas aún.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sesiones.map(s => (
                <div key={s.id} style={{
                  padding: '16px',
                  background: 'var(--cream)',
                  borderRadius: 10,
                  borderLeft: '3px solid var(--sage)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {new Date(s.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      {s.notas && <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{s.notas}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.cobro > 0 && (
                        <span className="badge badge-green">${Number(s.cobro).toLocaleString('es-CL')}</span>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => eliminarSesion(s.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <SesionModal
          pacienteId={id}
          onClose={() => setModal(false)}
          onDone={() => { setModal(false); cargar(); }}
        />
      )}
    </div>
  );
}
