import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const MATERIALES_FIJOS = [
  '1.Manual de usuario',
  '2.Diccionario ilustrado',
  '3.Set de Estampas iniciales',
  '4.Gráficas',
  '5.Formulario general de inicio',
  '6.Estampas amarillas con bebé',
  '7.Estampas amarillas lisas',
  '8.Spice Index',
  '9.Revisión de ciclos para categorías reproductivas',
  '10.Forma de seguimiento',
];

function AjusteRapidoModal({ materiales, onClose, onDone }) {
  const [lista, setLista] = useState(materiales);
  const [ajustando, setAjustando] = useState({});

  async function ajustar(m, tipo) {
    setAjustando(a => ({ ...a, [m.id]: true }));
    try {
      await api('/api/movimientos', {
        method: 'POST',
        body: { material_id: m.id, tipo, cantidad: 1, motivo: '' },
      });
      setLista(l => l.map(x =>
        x.id === m.id
          ? { ...x, cantidad: tipo === 'entrada' ? x.cantidad + 1 : Math.max(0, x.cantidad - 1) }
          : x
      ));
    } catch (e) {
      alert(e.message);
    } finally {
      setAjustando(a => ({ ...a, [m.id]: false }));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Ajustar stock</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {lista.map(m => {
            const agotado = m.cantidad === 0;
            const bajo = m.cantidad > 0 && m.cantidad <= m.stock_minimo;
            return (
              <div key={m.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--cream)',
                borderRadius: 10,
                borderLeft: `3px solid ${agotado ? 'var(--rose)' : bajo ? 'var(--amber)' : 'var(--sage)'}`,
              }}>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{m.nombre}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => ajustar(m, 'salida')}
                    disabled={ajustando[m.id] || m.cantidad === 0}
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: m.cantidad === 0 ? 'var(--cream-dark)' : '#fdecea',
                      color: m.cantidad === 0 ? 'var(--ink-faint)' : 'var(--rose)',
                      fontSize: 20, fontWeight: 700,
                      cursor: m.cantidad === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <div style={{ 
                    width: 36, 
                    textAlign: 'center', 
                    fontFamily: 'DM Serif Display, serif', 
                    fontSize: 22,
                    color: agotado ? 'var(--rose)' : bajo ? 'var(--amber)' : 'var(--ink)',
                  }}>
                    {m.cantidad}
                  </div>
                  <button
                    onClick={() => ajustar(m, 'entrada')}
                    disabled={ajustando[m.id]}
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: '#e6f4ec',
                      color: 'var(--sage-dark)',
                      fontSize: 20, fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => { onDone(); onClose(); }}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

function MaterialModal({ material, onClose, onDone }) {
  const [form, setForm] = useState(material || { nombre: MATERIALES_FIJOS[0], cantidad: 0, unidad: 'unidad', stock_minimo: 1 });
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
          <label>Material</label>
          {material ? (
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          ) : (
            <select value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}>
              {MATERIALES_FIJOS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
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
  const [modal, setModal] = useState(null);
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
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setModal('ajuste')}>
            ↕ Ajustar stock
          </button>
          <button className="btn btn-primary" onClick={() => setModal('nuevo')}>
            + Nuevo material
          </button>
        </div>
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
                  const bajo = m.cantidad > 0 && m.cantidad <= m.stock_minimo;
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
                          <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(m); setModal('editar'); }}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={() => eliminar(m.id)}>🗑</button>
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

      {modal === 'ajuste' && (
        <AjusteRapidoModal
          materiales={materiales}
          onClose={() => setModal(null)}
          onDone={cargar}
        />
      )}
      {modal === 'nuevo' && (
        <MaterialModal onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
      {modal === 'editar' && (
        <MaterialModal material={selected} onClose={() => setModal(null)} onDone={() => { setModal(null); cargar(); }} />
      )}
    </div>
  );
}
