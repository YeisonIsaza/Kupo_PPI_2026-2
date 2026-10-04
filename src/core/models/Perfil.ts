import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Rol } from "./Rol"; // Ajusta la ruta según tu estructura

@Entity("perfil")
export class Perfil {

    @PrimaryGeneratedColumn({ type: "int", name: "codigo_perfil" })
    codigo_perfil!: number;

    @Column({ type: "varchar", length: 30, nullable: true, name: "nombre_perfil" })
    nombre_perfil!: string;

    // --- LLAVES FORÁNEAS ---
    @ManyToOne(() => Rol)
    @JoinColumn({ name: "id_rol" }) // Mapea la columna física ID_ROL
    rol!: Rol;
}