import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Check } from "typeorm";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";

@Entity("VEHICULO")
@Unique("UK_PLACA", ["placa_veh"])
@Check("CK_CUPOS", `"TOTAL_CUPOS_VEH" >= 1`) // Restricción para asegurar que haya al menos 1 cupo
export class Vehiculo {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_VEH" })
    id_veh!: number;

    @Column({ type: "varchar2", length: 10, nullable: false, name: "PLACA_VEH" })
    placa_veh!: string;

    @Column({ type: "varchar2", length: 50, nullable: true, name: "MARCA_VEH" })
    marca_veh!: string;

    @Column({ type: "varchar2", length: 50, nullable: true, name: "MODELO_VEH" })
    modelo_veh!: string;

    @Column({ type: "varchar2", length: 30, nullable: true, name: "COLOR_VEH" })
    color_veh!: string;

    @Column({ type: "number", precision: 4, nullable: true, name: "ANNO_CREACION_VEH" })
    anno_creacion_veh!: number;

    @Column({ type: "varchar2", length: 20, nullable: true, name: "NUMERO_SOAT_VEH" })
    numero_soat_veh!: string;

    @Column({ type: "number", precision: 1, nullable: false, name: "TOTAL_CUPOS_VEH" })
    total_cupos_veh!: number;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    // Relación obligatoria por: CONSTRAINT NN_USER_VEH CHECK (ID_USER IS NOT NULL)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER" })
    usuario!: Usuario;

    // Relación obligatoria por: CONSTRAINT NN_ESTADO_VEH CHECK (ID_ESTADO IS NOT NULL)
    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;
}