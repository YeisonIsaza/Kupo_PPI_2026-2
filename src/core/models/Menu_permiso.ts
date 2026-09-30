import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Menu } from "./Menu";
import { Perfil } from "./Perfil";

@Entity("MENU_PERMISO")
export class MenuPermiso {

    @PrimaryColumn({ type: "varchar2", length: 5, name: "CODIGO_MENU" })
    codigo_menu!: string;

    @PrimaryColumn({ type: "number", name: "CODIGO_PERFIL" })
    codigo_perfil!: number;

    // --- COLUMNAS DE PERMISOS ---
    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "PUEDE_CREAR" })
    puede_crear!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "PUEDE_LEER" })
    puede_leer!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "PUEDE_ACTUALIZAR" })
    puede_actualizar!: string;

    @Column({ type: "char", length: 1, nullable: false, default: 'N', name: "PUEDE_ELIMINAR" })
    puede_eliminar!: string;

    // --- RELACIONES ---
    @ManyToOne(() => Menu)
    @JoinColumn({ name: "CODIGO_MENU" })
    menu!: Menu;

    @ManyToOne(() => Perfil)
    @JoinColumn({ name: "CODIGO_PERFIL" })
    perfil!: Perfil;
}