import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const CATEGORIAS_INGRESO = ['Consulta', 'Material', 'Otro'];
const CATEGORIAS_EGRESO = ['Insumo', 'Capacitación', 'Otro'];

function TransaccionModal({ onClose, onDone }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'ingreso',
    monto: '',
    categoria: 'Consulta',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);

  const categorias = form.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;

  function handleTipo(t) {
    setForm({ ...form, tipo: t, categoria: t === 'ingreso' ? 'Consulta' : 'Insumo' });
  }

  async function handleSubmit() {
    if (!form.monto || Number(form.monto) <= 0) return alert('Ingresa un monto válido');
    setLoading(true);
    try {
      await api('/api/caja', { method: 'POST', body: { ...form, monto: Number(form.monto) } });
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
        <h2 className="modal-title">Nueva transacción</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={`btn ${form.tipo === 'ingreso' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleTipo('ingreso')}
          >
            ↑ Ingreso
          </button>
          <button
            className={`btn ${form.tipo === 'egreso' ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => handleTipo('egreso')}
          >
            ↓ Egreso
          </button>
        </div>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Monto (CLP)</label>
            <input type="number" min="0" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} placeholder="0" />
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Opcional..." />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Caja() {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api(`/api/caja?mes=${mes}&anio=${anio}`);
      setTransacciones(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, [mes, anio]);

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta transacción?')) return;
    await api(`/api/caja/${id}`, { method: 'DELETE' });
    cargar();
  }

  const ingresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
  const egresos = transacciones.filter(t => t.tipo === 'egreso').reduce((s, t) => s + t.monto, 0);
  const balance = ingresos - egresos;

  const meses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  const años = [String(now.getFullYear() - 1), String(now.getFullYear()), String(now.getFullYear() + 1)];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Caja</h1>
          <p className="page-sub">{meses[Number(mes) - 1]} {anio}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, background: 'var(--white)' }} value={mes} onChange={e => setMes(e.target.value)}>
            {meses.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
          </select>
          <select style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--cream-dark)', fontSize: 14, background: 'var(--white)' }} value={anio} onChange={e => setAnio(e.target.value)}>
            {años.map(a => <option key={a}>{a}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            + Registrar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Ingresos</div>
          <div className="stat-value" style={{ color: 'var(--sage-dark)' }}>
            ${ingresos.toLocaleString('es-CL')}
          </div>
          <div className="stat-sub">CLP</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Egresos</div>
          <div className="stat-value" style={{ color: 'var(--rose)' }}>
            ${egresos.toLocaleString('es-CL')}
          </div>
          <div className="stat-sub">CLP</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--sage-dark)' : 'var(--rose)' }}>
            {balance >= 0 ? '+' : ''}${balance.toLocaleString('es-CL')}
          </div>
          <div className="stat-sub">CLP</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transacciones</div>
          <div className="stat-value">{transacciones.length}</div>
          <div className="stat-sub">en el mes</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        {loading ? (
          <div className="empty"><div className="empty-text">Cargando...</div></div>
        ) : transacciones.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">💰</div>
            <div className="empty-text">Sin transacciones en este período.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.fecha).toLocaleDateString('es-CL')}</td>
                    <td>
                      <span className={`badge ${t.tipo === 'ingreso' ? 'badge-green' : 'badge-red'}`}>
                        {t.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{t.categoria}</span>
                    </td>
                    <td style={{ color: 'var(--ink-soft)' }}>{t.descripcion || '—'}</td>
                    <td>
                      <strong style={{ color: t.tipo === 'ingreso' ? 'var(--sage-dark)' : 'var(--rose)' }}>
                        {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.monto).toLocaleString('es-CL')}
                      </strong>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminar(t.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <TransaccionModal onClose={() => setModal(false)} onDone={() => { setModal(false); cargar(); }} />
      )}
    </div>
  );
}
