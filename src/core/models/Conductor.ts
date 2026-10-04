import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("conductor")
export class Conductor {

    // Al ser PK y FK al mismo tiempo, usamos PrimaryColumn manual con el tipo correspondiente
    @PrimaryColumn({ type: "int", name: "id_user" })
    id_user!: number;

    @Column({ type: "varchar", length: 20, nullable: true, name: "numero_licencia" })
    numero_licencia!: string;

    @Column({ type: "date", nullable: true , name: "fecha_vencimiento_licencia" })
    fecha_vencimiento_licencia!: Date;

    // --- RELACIÓN UNO A UNO (CON EXTENSIÓN DE USUARIO) ---
    @OneToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user" }) // Mapea directamente la relación sobre la PK física
    usuario!: Usuario;
}