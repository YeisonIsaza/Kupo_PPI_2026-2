import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";
import { Parada } from "./Parada";

@Entity("reserva")
export class Reserva {

    @PrimaryGeneratedColumn({ type: "int", name: "id_res" })
    id_res!: number;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", name: "fecha_res" })
    fecha_res!: Date;

    // Aporte calculado dinámicamente según la parada (tramo recorrido + costo adicional)
    @Column({ type: "numeric", precision: 10, scale: 2, nullable: true, name: "aporte_res" })
    aporte_res!: number | null;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "id_vj" })
    viaje!: Viaje;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user" })
    usuario!: Usuario;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;

    @ManyToOne(() => Parada, { nullable: true })
    @JoinColumn({ name: "id_pds" })
    parada?: Parada;
}