import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity("menu")
export class Menu {

    @PrimaryColumn({ type: "varchar", length: 5, name: "codigo_menu" })
    codigo_menu!: string;

    @Column({ type: "varchar", length: 200, nullable: false, name: "url_menu" })
    url_menu!: string;

    @Column({ type: "varchar", length: 30, nullable: false, name: "nombre_menu" })
    nombre_menu!: string;

    // --- RELACIÓN REFLEXIVA (MENU PADRE) ---
    @ManyToOne(() => Menu)
    @JoinColumn({ name: "menu_padre_codigo" }) // Apunta a la PK de esta misma tabla
    menuPadre!: Menu;
}