import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { RutaConductor } from "./RutaConductor";
import { Vehiculo } from "./Vehiculo";
import { Estado } from "./Estado";

@Entity("viaje")
export class Viaje {

    @PrimaryGeneratedColumn({ type: "int", name: "id_vj" })
    id_vj!: number;

    @Column({ type: "date", nullable: false, name: "fecha_vj" })
    fecha_vj!: Date;

    @Column({ type: "date", nullable: true, name: "hora_salida_vj" })
    hora_salida_vj!: Date;

    // true = viaje exclusivo para mujeres (Modo Ella). Se activa al reservar una pasajera con Modo Ella.
    @Column({ type: "boolean", default: false, name: "solo_mujeres_vj" })
    solo_mujeres_vj!: boolean;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => RutaConductor, { nullable: false })
    @JoinColumn({ name: "id_rc" })
    rutaConductor!: RutaConductor;

    @ManyToOne(() => Vehiculo, { nullable: false })
    @JoinColumn({ name: "id_veh" })
    vehiculo!: Vehiculo;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;
}