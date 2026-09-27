"use client";
import { useState, useEffect } from "react";
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function UniversidadesAdminPage() {
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [unis, setUnis] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({
        nit_uni: '', nombre_uni: '', dominio_correo_uni: '',
        direccion_latitud_uni: '', direccion_longitud_uni: ''
    });

    useEffect(() => { cargarUniversidades(); }, []);

    async function cargarUniversidades() {
        try {
            const res = await fetch("/api/admin/universidades");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUnis(data);
        } catch (error) {
            alert("Error al cargar universidades");
        } finally {
            setCargando(false);
        }
    }

    function abrirModal(uni = null) {
        if (uni) {
            setEditando(true);
            setForm({
                nit_uni: uni.nit_uni,
                nombre_uni: uni.nombre_uni,
                dominio_correo_uni: uni.dominio_correo_uni || '',
                direccion_latitud_uni: uni.direccion_latitud_uni || '',
                direccion_longitud_uni: uni.direccion_longitud_uni || ''
            });
        } else {
            setEditando(false);
            setForm({ nit_uni: '', nombre_uni: '', dominio_correo_uni: '', direccion_latitud_uni: '', direccion_longitud_uni: '' });
        }
        setModalAbierto(true);
    }

    async function manejarGuardar(e) {
        e.preventDefault();
        const url = editando ? `/api/admin/universidades/${encodeURIComponent(form.nit_uni)}` : "/api/admin/universidades";
        const metodo = editando ? "PUT" : "POST";
        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    direccion_latitud_uni: parseFloat(form.direccion_latitud_uni),
                    direccion_longitud_uni: parseFloat(form.direccion_longitud_uni),
                }),
            });
            if (res.ok) { setModalAbierto(false); cargarUniversidades(); }
            else { const err = await res.json(); alert(err.error || "Error al guardar"); }
        } catch { alert("Error de conexión"); }
    }

    async function manejarEliminar(id) {
        if (!confirm("¿Eliminar esta universidad?")) return;
        try {
            const res = await fetch(`/api/admin/universidades/${encodeURIComponent(id)}`, { method: "DELETE" });
            if (res.ok) cargarUniversidades();
            else alert("No se puede eliminar: tiene estudiantes asociados.");
        } catch { alert("Error de comunicación"); }
    }

    if (!listo) return null;
    if (!acceso) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <main style={{ marginLeft: '240px', flex: 1, background: '#f8fafc' }}>
            <SinPermiso />
        </main>
    </div>
);

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <h2 style={{ color: "#1e293b", margin: 0 }}>Universidades</h2>
                        <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Instituciones autorizadas para el carpooling</p>
                    </div>
                    {puedeCrear && (
                        <button onClick={() => abrirModal()} style={{ background: '#4f46e5', color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                            + Nueva Universidad
                        </button>
                    )}
                </div>

                {cargando ? <p>Cargando...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'auto' }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: "12px 16px" }}>NIT</th>
                                    <th style={{ padding: "12px 16px" }}>Nombre</th>
                                    <th style={{ padding: "12px 16px" }}>Dominio Correo</th>
                                    <th style={{ padding: "12px 16px" }}>Latitud</th>
                                    <th style={{ padding: "12px 16px" }}>Longitud</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unis.map(uni => (
                                    <tr key={uni.nit_uni} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                        <td style={{ padding: "12px 16px", fontFamily: 'monospace', fontSize: '0.8rem' }}>{uni.nit_uni}</td>
                                        <td style={{ padding: "12px 16px", fontWeight: 500 }}>{uni.nombre_uni}</td>
                                        <td style={{ padding: "12px 16px", color: '#4f46e5' }}>@{uni.dominio_correo_uni}</td>
                                        <td style={{ padding: "12px 16px", color: '#64748b', fontSize: '0.8rem' }}>{uni.direccion_latitud_uni}</td>
                                        <td style={{ padding: "12px 16px", color: '#64748b', fontSize: '0.8rem' }}>{uni.direccion_longitud_uni}</td>
                                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                            {puedeActualizar && (
                                                <button onClick={() => abrirModal(uni)} style={{ background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>✏️ Editar</button>
                                            )}
                                            {puedeEliminar && (
                                                <button onClick={() => manejarEliminar(uni.nit_uni)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Eliminar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {modalAbierto && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                        <div style={{ background: "white", padding: "28px", borderRadius: "12px", width: "480px" }}>
                            <h3 style={{ marginTop: 0 }}>{editando ? "Editar Universidad" : "Nueva Universidad"}</h3>
                            <form onSubmit={manejarGuardar}>
                                {!editando && (
                                    <div style={{ marginBottom: "12px" }}>
                                        <label style={{ display: "block", marginBottom: "4px", fontSize: '0.85rem', fontWeight: 600 }}>NIT</label>
                                        <input type="text" value={form.nit_uni} onChange={e => setForm({ ...form, nit_uni: e.target.value })} required
                                            placeholder="Ej: 890.980.040-8"
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: 'border-box' }} />
                                    </div>
                                )}
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: '0.85rem', fontWeight: 600 }}>Nombre</label>
                                    <input type="text" value={form.nombre_uni} onChange={e => setForm({ ...form, nombre_uni: e.target.value })} required
                                        placeholder="Ej: Universidad de Antioquia"
                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "4px", fontSize: '0.85rem', fontWeight: 600 }}>Dominio de Correo</label>
                                    <input type="text" value={form.dominio_correo_uni} onChange={e => setForm({ ...form, dominio_correo_uni: e.target.value })} required
                                        placeholder="Ej: udea.edu.co"
                                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: "20px" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "4px", fontSize: '0.85rem', fontWeight: 600 }}>Latitud</label>
                                        <input type="number" step="any" value={form.direccion_latitud_uni} onChange={e => setForm({ ...form, direccion_latitud_uni: e.target.value })} required
                                            placeholder="Ej: 6.268397"
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "4px", fontSize: '0.85rem', fontWeight: 600 }}>Longitud</label>
                                        <input type="number" step="any" value={form.direccion_longitud_uni} onChange={e => setForm({ ...form, direccion_longitud_uni: e.target.value })} required
                                            placeholder="Ej: -75.567208"
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                    <button type="button" onClick={() => setModalAbierto(false)} style={{ padding: "10px 16px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
                                    <button type="submit" style={{ padding: "10px 16px", background: '#4f46e5', color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}