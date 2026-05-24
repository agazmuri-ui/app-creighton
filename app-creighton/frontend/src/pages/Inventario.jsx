import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function MovimientoModal({ material, onClose, onDone }) {
  const [tipo, setTipo] = useState('entrada');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!cantidad || cantidad < 1) return;
    setLoading(true);
    try {
      await api('/api/movimientos', {
        method: 'POST',
        body: { material_id: material.id, tipo, cantidad: Number(cantidad), motivo },
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
        <h2 className="modal-title">Registrar movimiento</h2>
        <p style={{ marginBottom: 20, color: 'var(--ink-soft)', fontSize: 14 }}>
          Material: <strong>{material.nombre}</strong> — Stock actual: <strong>{material.cantidad}</strong>
        </p>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="entrada">Entrada (compra/recepción)</option>
              <option value="salida">Salida (uso/entrega)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Motivo (opcional)</label>
          <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: compra mensual, entrega a paciente..." />
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

function MaterialModal({ material, onClose, onDone }) {
  const [form, setForm] = useState(material || { nombre: '', cantidad: 0, unidad: 'unidad', stock_minimo: 1 });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.nombre.trim()) return;
    setLoading(true);
    try {
      if (material) {
        await api(`/api/materiales/${material.id}`, { method: 'PUT', body: form });
      } else {
        await api('/api/materiales', { method: 'POST', body: form });
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
        <h2 className="modal-title">{material ? 'Editar material' : 'Nuevo material'}</h2>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>Nombre</label>
          <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del material" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Cantidad inicial</label>
            <input type="number" min="0" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>Unidad</label>
            <input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="unidad, caja, set..." />
          </div>
          <div className="form-group">
            <label>Stock mínimo</label>
            <input type="number" min="0" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: Number(e.target.value) })} />
          </div>
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

export default function Inventario() {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'nuevo' | 'editar' | 'movimiento'
  const [selected, setSelected] = useState(null);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api('/api/materiales');
      setMateriales(data);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function eliminar(id) {
    if (!confirm('¿Eliminar este material?')) return;
    await api(`/api/materiales/${id}`, { method: 'DELETE' });
    cargar();
  }

  const bajoStock = materiales.filter(m => m.cantidad <= m.stock_minimo);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-sub">{materiales.length} materiales registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('nuevo')}>
          + Nuevo material
        </button>
      </div>

      {bajoStock.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {bajoStock.length} material(es) con stock bajo o agotado: {bajoStock.map(m => m.nombre).join(', ')}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty"><div className="empty-text">Cargando...</div></div>
        ) : materiales.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">Sin materiales. Agrega el primero.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {materiales.map(m => {
                  const bajo = m.cantidad <= m.stock_minimo;
                  const agotado = m.cantidad === 0;
                  return (
                    <tr key={m.id}>
                      <td><strong>{m.nombre}</strong></td>
                      <td>{m.cantidad}</td>
                      <td style={{ color: 'var(--ink-soft)' }}>{m.unidad}</td>
                      <td style={{ color: 'var(--ink-soft)' }}>{m.stock_minimo}</td>
                      <td>
                        {agotado
                          ? <span className="badge badge-red">Agotado</span>
                          : bajo
                          ? <span className="badge badge-amber">Stock bajo</span>
                          : <span className="badge badge-green">OK</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(m); setModal('movimiento'); }}>
                            ↕ Mover
                          </button>
                          <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(m); setModal('editar'); }}>
                            ✏️
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => eliminar(m.id)}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'nuevo' && (
        <MaterialModal onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
      {modal === 'editar' && (
        <MaterialModal material={selected} onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
      {modal === 'movimiento' && (
        <MovimientoModal material={selected} onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
    </div>
  );
}
