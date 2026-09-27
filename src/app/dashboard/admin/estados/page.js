"use client";
import { useState, useEffect } from "react";
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';



export default function EstadosAdminPage() {
  const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Form States
  const [nombreEstado, setNombreEstado] = useState("");
  const [categoria, setCategoria] = useState("");

  const cargarEstados = async () => {
    try {
      const res = await fetch("/api/admin/estados");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEstados(data);
    } catch (error) {
      alert("Error al cargar los estados");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarEstados(); }, []);

  const abrirModal = (est = null) => {
    if (est) {
      setEditandoId(est.id_estado);
      setNombreEstado(est.nombre_estado);
      setCategoria(est.categoria);
    } else {
      setEditandoId(null);
      setNombreEstado("");
      setCategoria("");
    }
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    const url = editandoId ? `/api/admin/estados/${editandoId}` : "/api/admin/estados";
    const metodo = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_estado: nombreEstado, categoria: categoria }),
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarEstados();
      } else {
        const err = await res.json();
        alert(err.error || "Ocurrió un error");
      }
    } catch (error) {
      alert("Error de comunicación con el servidor");
    }
  };

  const manejarEliminar = async (id) => {
    if (!confirm("¿Deseas eliminar este estado? Fallará si hay usuarios, viajes o rutas usándolo.")) return;
    try {
      const res = await fetch(`/api/admin/estados/${id}`, { method: "DELETE" });
      if (res.ok) cargarEstados();
      else alert("No se puede borrar: El estado está asignado actualmente a registros activos.");
    } catch (error) {
      alert("Error al eliminar");
    }
  };
  if(!listo) return null; // O un spinner de carga
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
      
      {/* 3. Contenido principal con margen izquierdo para no tapar el sidebar */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
        <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>
          ¡Hola, {nombre}! 👋
        </h1> 
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#2c3e50", margin: 0 }}>Gestión de Estados</h2>
                <p style={{ color: "#7f8c8d", margin: "5px 0 0 0" }}>Controla los estados lógicos de la plataforma FastDrive</p>
              </div>
            {puedeCrear && (
              <button onClick={() => abrirModal()} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                + Nuevo Estado
              </button>
              )}
            </div>

            {cargando ? <p>Cargando estados...</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#34495e", color: "white", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>ID</th>
                    <th style={{ padding: "12px" }}>Nombre Estado</th>
                    <th style={{ padding: "12px" }}>Categoría de Uso</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
          {estados.map((est) => (
              <tr key={est.id_estado} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px" }}>{est.id_estado}</td>
                  <td style={{ padding: "12px" }}>
                      <span style={{ backgroundColor: "#ecf0f1", padding: "4px 8px", borderRadius: "4px", fontWeight: "600" }}>
                          {est.nombre_estado} {/* ← verifica que diga nombre_estado */}
                      </span>
                  </td>
                  <td style={{ padding: "12px", color: "#2980b9", fontWeight: "500" }}>{est.categoria}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    {puedeActualizar && (
                      <button onClick={() => abrirModal(est)} style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", marginRight: "8px", cursor: "pointer" }}>Editar</button>
                    )}
                    {puedeEliminar && (
                      <button onClick={() => manejarEliminar(est.id_estado)} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>Eliminar</button>
                    )}
                  </td>
              </tr>
          ))}
      </tbody>
              </table>
            )}

            {modalAbierto && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "400px" }}>
                  <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{editandoId ? "Editar Estado" : "Crear Estado"}</h3>
                  <form onSubmit={manejarGuardar}>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nombre del Estado:</label>
                      <input type="text" value={nombreEstado} onChange={(e) => setNombreEstado(e.target.value)} placeholder="Ej: PENDIENTE, ACTIVO, CANCELADO" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Categoría:</label>
                      <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: VERIFICACION, CUENTA, VIAJE" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "end", gap: "10px" }}>
                      <button type="button" onClick={() => setModalAbierto(false)} style={{ backgroundColor: "#95a5a6", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                      <button type="submit" style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            </main>
          </div>
        );
      }