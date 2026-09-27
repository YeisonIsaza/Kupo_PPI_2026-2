import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Rol } from "./Rol"; // Ajusta la ruta según tu estructura

@Entity("PERFIL")
export class Perfil {

    @PrimaryGeneratedColumn({ type: "number", name: "CODIGO_PERFIL" })
    codigo_perfil!: number;

    @Column({ type: "varchar2", length: 30, nullable: true, name: "NOMBRE_PERFIL" })
    nombre_perfil!: string;

    // --- LLAVES FORÁNEAS ---
    @ManyToOne(() => Rol)
    @JoinColumn({ name: "ID_ROL" }) // Mapea la columna física ID_ROL
    rol!: Rol;
}