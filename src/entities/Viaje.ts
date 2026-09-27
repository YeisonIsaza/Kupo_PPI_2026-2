import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { RutaConductor } from "./RutaConductor";
import { Vehiculo } from "./Vehiculo";
import { Estado } from "./Estado";

@Entity("VIAJE")
export class Viaje {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_VJ" })
    id_vj!: number;

    @Column({ type: "date", nullable: false, name: "FECHA_VJ" })
    fecha_vj!: Date;

    @Column({ type: "date", nullable: true, name: "HORA_SALIDA_VJ" })
    hora_salida_vj!: Date;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => RutaConductor, { nullable: false })
    @JoinColumn({ name: "ID_RC" })
    rutaConductor!: RutaConductor;

    @ManyToOne(() => Vehiculo, { nullable: false })
    @JoinColumn({ name: "ID_VEH" })
    vehiculo!: Vehiculo;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;
}