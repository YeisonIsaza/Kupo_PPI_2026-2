"use client";
import { useState, useEffect } from "react";
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function MenusAdminPage() {
  const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
  const [menus, setMenus] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(false);

  // Form States
  const [codigoMenu, setCodigoMenu] = useState("");
  const [nombreMenu, setNombreMenu] = useState("");
  const [urlMenu, setUrlMenu] = useState("");
  const [codigoPadre, setCodigoPadre] = useState("");

  const cargarMenus = async () => {
    try {
      const res = await fetch("/api/admin/menus");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMenus(data);
    } catch (error) {
      alert("Error al cargar menús");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarMenus(); }, []);

  const abrirModal = (m = null) => {
    if (m) {
      setEditando(true);
      setCodigoMenu(m.codigo_menu);
      setNombreMenu(m.nombre_menu);
      setUrlMenu(m.url_menu);
      setCodigoPadre(m.menuPadre ? m.menuPadre.codigo_menu : "");
    } else {
      setEditando(false);
      setCodigoMenu("");
      setNombreMenu("");
      setUrlMenu("");
      setCodigoPadre("");
    }
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    const url = editando ? `/api/admin/menus/${codigoMenu}` : "/api/admin/menus";
    const metodo = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_menu: codigoMenu,
          nombre_menu: nombreMenu,
          url_menu: urlMenu,
          codigo_padre: codigoPadre || null
        }),
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarMenus();
      } else {
        const err = await res.json();
        alert(err.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const manejarEliminar = async (id) => {
    if (!confirm("¿Deseas eliminar este menú estructural?")) return;
    try {
      const res = await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
      if (res.ok) cargarMenus();
      else {
        const err = await res.json();
        alert(err.error || "Error al eliminar");
      }
    } catch (error) {
      alert("Error del sistema al eliminar");
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
              <h2 style={{ color: "#2c3e50", margin: 0 }}>Menús de Navegación</h2>
              <p style={{ color: "#7f8c8d", margin: "5px 0 0 0" }}>Estructura las rutas y accesos dinámicos del sistema</p>
            </div>
            {puedeCrear && (
              <button onClick={() => abrirModal()} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                + Nuevo Menú
              </button>
            )}
          </div>

          {cargando ? <p>Cargando enrutamiento...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ backgroundColor: "#34495e", color: "white", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Código</th>
                  <th style={{ padding: "12px" }}>Nombre Visible</th>
                  <th style={{ padding: "12px" }}>Ruta (URL)</th>
                  <th style={{ padding: "12px" }}>Sección Padre</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m) => (
                  <tr key={m.codigo_menu} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: "bold" }}>{m.codigo_menu}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{m.nombre_menu}</td>
                    <td style={{ padding: "12px", color: "#e67e22", fontFamily: "monospace" }}>{m.url_menu}</td>
                    <td style={{ padding: "12px" }}>
                      {m.menuPadre ? (
                        <span style={{ backgroundColor: "#d1ecf1", color: "#0c5460", padding: "3px 8px", borderRadius: "4px", fontSize: "13px" }}>
                          {m.menuPadre.nombre_menu}
                        </span>
                      ) : (
                        <span style={{ color: "#95a5a6", fontSize: "13px", italic: "true" }}>Raíz Principal</span>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {puedeActualizar && (
                        <button onClick={() => abrirModal(m)} style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", marginRight: "8px", cursor: "pointer" }}>Editar</button>
                      )}
                      {puedeEliminar && (
                        <button onClick={() => manejarEliminar(m.codigo_menu)} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}>Eliminar</button>
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
                <h3 style={{ marginTop: 0, color: "#2c3e50" }}>{editando ? "Modificar Estructura" : "Crear Ítem de Menú"}</h3>
                <form onSubmit={manejarGuardar}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Código Menú:</label>
                    <input type="text" value={codigoMenu} onChange={(e) => setCodigoMenu(e.target.value)} disabled={editando} placeholder="Ej: MNU_ADMIN_ROLES" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: editando ? "#f5f5f5" : "white" }} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nombre del Menú:</label>
                    <input type="text" value={nombreMenu} onChange={(e) => setNombreMenu(e.target.value)} placeholder="Ej: GESTIONAR ROLES" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Ruta de redirección (URL):</label>
                    <input type="text" value={urlMenu} onChange={(e) => setUrlMenu(e.target.value)} placeholder="Ej: /dashboard/admin/roles" required style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Menú Superior (Padre):</label>
                    <select value={codigoPadre} onChange={(e) => setCodigoPadre(e.target.value)} style={{ width: "98%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
                      <option value="">-- Ninguno (Es menú raíz) --</option>
                      {menus
                        .filter(m => !editando || m.codigo_menu !== codigoMenu) // Previene bucles cíclicos
                        .map(m => (
                          <option key={m.codigo_menu} value={m.codigo_menu}>{m.nombre_menu}</option>
                        ))}
                    </select>
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
  