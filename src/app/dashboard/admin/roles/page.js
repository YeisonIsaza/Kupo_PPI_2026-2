"use client";
import { useState, useEffect } from "react";
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function RolesAdminPage() {
  const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = Crear, número = Editar
  const [nombreRol, setNombreRol] = useState("");

  const cargarRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) throw new Error("Error al traer los datos");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      alert("No se pudieron cargar los roles");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);


  const abrirModal = (rol = null) => {
    if (rol) {
      setEditandoId(rol.id_rol); // Si pasamos un rol, estamos editando
      setNombreRol(rol.nombre_rol);
    } else {
      setEditandoId(null); // Si no, es un rol nuevo
      setNombreRol("");
    }
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    
    const url = editandoId ? `/api/admin/roles/${editandoId}` : "/api/admin/roles";
    const metodo = editandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_rol: nombreRol.toUpperCase() }), // Uppercase para estandarizar en BD
      });

      if (res.ok) {
        setModalAbierto(false);
        cargarRoles(); // Recarga la tabla en tiempo real
      } else {
        const errData = await res.json();
        alert(errData.error || "Ocurrió un error al guardar");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    }
  };


  const manejarEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este rol? Al ser una tabla fuerte podría fallar si ya está asignado a un perfil.")) return;

    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
      if (res.ok) {
        cargarRoles();
      } else {
        alert("No se puede eliminar: El rol está siendo usado por un perfil existente.");
      }
    } catch (error) {
      alert("Error al intentar eliminar");
    }
  };

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
              <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>
                ¡Hola, {nombre}! 👋
              </h1>
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ color: "#2c3e50", margin: 0 }}>Gestión de Roles</h2>
                    <p style={{ color: "#7f8c8d", margin: "5px 0 0 0" }}>Configura los roles principales del sistema</p>
                  </div>
                  {puedeCrear && (
                    <button 
                      onClick={() => abrirModal()}
                      style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      + Nuevo Rol
                    </button>
                  )}
                </div>

                {/* TABLA DE DATOS */}
                {cargando ? (
                  <p>Cargando roles...</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#34495e", color: "white", textAlign: "left" }}>
                        <th style={{ padding: "12px" }}>ID</th>
                        <th style={{ padding: "12px" }}>Nombre del Rol</th>
                        <th style={{ padding: "12px", textAlign: "center" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((rol) => (
                        <tr key={rol.id_rol} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px" }}>{rol.id_rol}</td>
                          <td style={{ padding: "12px", fontWeight: "500" }}>{rol.nombre_rol}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            {puedeActualizar && (
                              <button 
                                onClick={() => abrirModal(rol)}
                                style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", marginRight: "8px", cursor: "pointer" }}
                              >
                                Editar
                              </button>
                            )}
                            {puedeEliminar && (
                              <button 
                                onClick={() => manejarEliminar(rol.id_rol)}
                                style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                              >
                              Eliminar
                            </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* WINDOW MODAL (FORMULARIO FLOTANTE) */}
                {modalAbierto && (
                  <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "8px", width: "400px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
                      <h3 style={{ marginTop: 0, color: "#2c3e50" }}>
                        {editandoId ? "Editar Rol" : "Crear Nuevo Rol"}
                      </h3>
                      
                      <form onSubmit={manejarGuardar}>
                        <div style={{ marginBottom: "15px" }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#34495e", fontWeight: "500" }}>Nombre del Rol:</label>
                          <input 
                            type="text" 
                            value={nombreRol}
                            onChange={(e) => setNombreRol(e.target.value)}
                            placeholder="Ej: PASAJERO, CONDUCTOR"
                            required
                            style={{ width: "93%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "end", gap: "10px" }}>
                          <button 
                            type="button" 
                            onClick={() => setModalAbierto(false)}
                            style={{ backgroundColor: "#95a5a6", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer" }}
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                          >
                            {editandoId ? "Actualizar" : "Guardar"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                </main>
              </div>
            );
          }