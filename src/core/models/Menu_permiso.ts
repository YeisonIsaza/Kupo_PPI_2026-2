import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Menu } from "./Menu";
import { Perfil } from "./Perfil";

@Entity("menu_permiso")
export class MenuPermiso {

    @PrimaryColumn({ type: "varchar", length: 5, name: "codigo_menu" })
    codigo_menu!: string;

    @PrimaryColumn({ type: "int", name: "codigo_perfil" })
    codigo_perfil!: number;

    // --- COLUMNAS DE PERMISOS ---
    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "puede_crear" })
    puede_crear!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "puede_leer" })
    puede_leer!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "puede_actualizar" })
    puede_actualizar!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "puede_eliminar" })
    puede_eliminar!: string;

    // --- RELACIONES ---
    @ManyToOne(() => Menu)
    @JoinColumn({ name: "codigo_menu" })
    menu!: Menu;

    @ManyToOne(() => Perfil)
    @JoinColumn({ name: "codigo_perfil" })
    perfil!: Perfil;
}