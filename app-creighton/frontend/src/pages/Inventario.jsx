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
  const [ajustando, setAjustando] = useState({});

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

  async function ajustar(material, tipo) {
    setAjustando(a => ({ ...a, [material.id]: true }));
    try {
      await api('/api/movimientos', {
        method: 'POST',
        body: { material_id: material.id, tipo, cantidad: 1, motivo: '' },
      });
      // Actualizar cantidad localmente para respuesta inmediata
      setMateriales(mats => mats.map(m =>
        m.id === material.id
          ? { ...m, cantidad: tipo === 'entrada' ? m.cantidad + 1 : Math.max(0, m.cantidad - 1) }
          : m
      ));
    } catch (e) {
      alert(e.message);
    } finally {
      setAjustando(a => ({ ...a, [material.id]: false }));
    }
  }

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

      {loading ? (
        <div className="empty"><div className="empty-text">Cargando...</div></div>
      ) : materiales.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-text">Sin materiales. Agrega el primero.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {materiales.map(m => {
            const bajo = m.cantidad > 0 && m.cantidad <= m.stock_minimo;
            const agotado = m.cantidad === 0;
            return (
              <div key={m.id} style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                padding: '20px 24px',
                borderLeft: `4px solid ${agotado ? 'var(--rose)' : bajo ? 'var(--amber)' : 'var(--sage)'}`,
              }}>
                {/* Nombre y badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>
                    {m.nombre}
                  </div>
                  {agotado
                    ? <span className="badge badge-red">Agotado</span>
                    : bajo
                    ? <span className="badge badge-amber">Stock bajo</span>
                    : <span className="badge badge-green">OK</span>
                  }
                </div>

                {/* Contador */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
                  <button
                    onClick={() => ajustar(m, 'salida')}
                    disabled={ajustando[m.id] || m.cantidad === 0}
                    style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      background: m.cantidad === 0 ? 'var(--cream-dark)' : '#fdecea',
                      color: m.cantidad === 0 ? 'var(--ink-faint)' : 'var(--rose)',
                      fontSize: 22, fontWeight: 700,
                      cursor: m.cantidad === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    −
                  </button>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, lineHeight: 1 }}>
                      {m.cantidad}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 2 }}>{m.unidad}</div>
                  </div>
                  <button
                    onClick={() => ajustar(m, 'entrada')}
                    disabled={ajustando[m.id]}
                    style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      border: 'none',
                      background: '#e6f4ec',
                      color: 'var(--sage-dark)',
                      fontSize: 22, fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--cream-dark)', paddingTop: 12 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => { setSelected(m); setModal('editar'); }}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(m.id)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
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
