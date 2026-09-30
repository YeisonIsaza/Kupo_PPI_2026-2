import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";
import { Parada } from "./Parada";

@Entity("RESERVA")
export class Reserva {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_RES" })
    id_res!: number;

    @CreateDateColumn({ type: "date", default: () => "SYSDATE", name: "FECHA_RES" })
    fecha_res!: Date;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "ID_VJ" })
    viaje!: Viaje;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER" })
    usuario!: Usuario;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;

    @ManyToOne(() => Parada, { nullable: false })
    @JoinColumn({ name: "ID_PDS" })
    parada!: Parada;
}