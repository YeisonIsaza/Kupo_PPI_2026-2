import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";

@Entity("CONDUCTOR")
export class Conductor {

    // Al ser PK y FK al mismo tiempo, usamos PrimaryColumn manual con el tipo correspondiente
    @PrimaryColumn({ type: "number", name: "ID_USER" })
    id_user!: number;

    @Column({ type: "varchar2", length: 20, nullable: true, name: "NUMERO_LICENCIA" })
    numero_licencia!: string;

    @Column({ type: "date", nullable: true , name: "FECHA_VENCIMIENTO_LICENCIA" })
    fecha_vencimiento_licencia!: Date;

    // --- RELACIÓN UNO A UNO (CON EXTENSIÓN DE USUARIO) ---
    @OneToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER" }) // Mapea directamente la relación sobre la PK física
    usuario!: Usuario;
}