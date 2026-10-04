import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
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

    @ManyToOne(() => Parada, { nullable: false })
    @JoinColumn({ name: "id_pds" })
    parada!: Parada;
}