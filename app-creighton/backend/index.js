require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ─── INVENTARIO ────────────────────────────────────────────────

// GET todos los materiales
app.get('/api/materiales', async (req, res) => {
  const { data, error } = await supabase
    .from('materiales')
    .select('*')
    .order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST crear material
app.post('/api/materiales', async (req, res) => {
  const { nombre, cantidad, unidad, stock_minimo } = req.body;
  const { data, error } = await supabase
    .from('materiales')
    .insert([{ nombre, cantidad, unidad, stock_minimo }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT actualizar material
app.put('/api/materiales/:id', async (req, res) => {
  const { nombre, cantidad, unidad, stock_minimo } = req.body;
  const { data, error } = await supabase
    .from('materiales')
    .update({ nombre, cantidad, unidad, stock_minimo })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE material
app.delete('/api/materiales/:id', async (req, res) => {
  const { error } = await supabase
    .from('materiales')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST movimiento de inventario
app.post('/api/movimientos', async (req, res) => {
  const { material_id, tipo, cantidad, motivo } = req.body;

  // Registrar movimiento
  const { error: errMov } = await supabase
    .from('movimientos_inventario')
    .insert([{ material_id, tipo, cantidad, motivo }]);
  if (errMov) return res.status(500).json({ error: errMov.message });

  // Actualizar cantidad en material
  const { data: mat } = await supabase
    .from('materiales')
    .select('cantidad')
    .eq('id', material_id)
    .single();

  const nuevaCantidad = tipo === 'entrada'
    ? mat.cantidad + cantidad
    : mat.cantidad - cantidad;

  const { data, error } = await supabase
    .from('materiales')
    .update({ cantidad: Math.max(0, nuevaCantidad) })
    .eq('id', material_id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET movimientos de un material
app.get('/api/movimientos/:material_id', async (req, res) => {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('*')
    .eq('material_id', req.params.material_id)
    .order('fecha', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── PACIENTES ─────────────────────────────────────────────────

app.get('/api/pacientes', async (req, res) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('apellido');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/pacientes/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*, sesiones(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/pacientes', async (req, res) => {
  const { nombre, apellido, telefono, email, fecha_inicio, estado, notas } = req.body;
  const { data, error } = await supabase
    .from('pacientes')
    .insert([{ nombre, apellido, telefono, email, fecha_inicio, estado, notas }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/pacientes/:id', async (req, res) => {
  const { nombre, apellido, telefono, email, fecha_inicio, estado, notas } = req.body;
  const { data, error } = await supabase
    .from('pacientes')
    .update({ nombre, apellido, telefono, email, fecha_inicio, estado, notas })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/pacientes/:id', async (req, res) => {
  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── SESIONES ──────────────────────────────────────────────────

app.post('/api/sesiones', async (req, res) => {
  const { paciente_id, fecha, notas, cobro } = req.body;
  const { data, error } = await supabase
    .from('sesiones')
    .insert([{ paciente_id, fecha, notas, cobro }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/sesiones/:id', async (req, res) => {
  const { error } = await supabase
    .from('sesiones')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── CAJA ──────────────────────────────────────────────────────

app.get('/api/caja', async (req, res) => {
  const { mes, anio } = req.query;
  let query = supabase.from('transacciones_caja').select('*');
  if (mes && anio) {
    const desde = `${anio}-${mes.padStart(2, '0')}-01`;
    const hasta = new Date(anio, mes, 0).toISOString().split('T')[0];
    query = query.gte('fecha', desde).lte('fecha', hasta);
  }
  const { data, error } = await query.order('fecha', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/caja', async (req, res) => {
  const { fecha, tipo, monto, categoria, descripcion } = req.body;
  const { data, error } = await supabase
    .from('transacciones_caja')
    .insert([{ fecha, tipo, monto, categoria, descripcion }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/caja/:id', async (req, res) => {
  const { error } = await supabase
    .from('transacciones_caja')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── START ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
