import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";

@Entity("MENU")
export class Menu {

    @PrimaryColumn({ type: "varchar2", length: 5, name: "CODIGO_MENU" })
    codigo_menu!: string;

    @Column({ type: "varchar2", length: 200, nullable: false, name: "URL_MENU" })
    url_menu!: string;

    @Column({ type: "varchar2", length: 30, nullable: false, name: "NOMBRE_MENU" })
    nombre_menu!: string;

    // --- RELACIÓN REFLEXIVA (MENU PADRE) ---
    @ManyToOne(() => Menu)
    @JoinColumn({ name: "MENU_PADRE_CODIGO" }) // Apunta a la PK de esta misma tabla
    menuPadre!: Menu;
}