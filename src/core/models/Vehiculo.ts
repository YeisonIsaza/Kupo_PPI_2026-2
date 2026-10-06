import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Check } from "typeorm";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";

@Entity("vehiculo")
@Unique("uk_placa", ["placa_veh"])
@Check("ck_cupos", `"total_cupos_veh" >= 1`) // Restricción para asegurar que haya al menos 1 cupo
export class Vehiculo {

    @PrimaryGeneratedColumn({ type: "int", name: "id_veh" })
    id_veh!: number;

    @Column({ type: "varchar", length: 10, nullable: false, name: "placa_veh" })
    placa_veh!: string;

    @Column({ type: "varchar", length: 50, nullable: true, name: "marca_veh" })
    marca_veh!: string;

    @Column({ type: "varchar", length: 50, nullable: true, name: "modelo_veh" })
    modelo_veh!: string;

    @Column({ type: "varchar", length: 30, nullable: true, name: "color_veh" })
    color_veh!: string;

    @Column({ type: "int", nullable: true, name: "anno_creacion_veh" })
    anno_creacion_veh!: number;

    @Column({ type: "varchar", length: 20, nullable: true, name: "numero_soat_veh" })
    numero_soat_veh!: string;

    @Column({ type: "int", nullable: false, name: "total_cupos_veh" })
    total_cupos_veh!: number;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    // Relación obligatoria por: CONSTRAINT NN_USER_VEH CHECK (ID_USER IS NOT NULL)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user" })
    usuario!: Usuario;

    // Relación obligatoria por: CONSTRAINT NN_ESTADO_VEH CHECK (ID_ESTADO IS NOT NULL)
    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;
}