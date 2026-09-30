import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("UNIVERSIDAD")
export class Universidad {

    @PrimaryColumn({ type: "varchar2", length: 20, name: "NIT_UNI" })
    nit_uni!: string;

    @Column({ type: "varchar2", length: 150, nullable: false, name: "NOMBRE_UNI" })
    nombre_uni!: string;

    @Column({ type: "varchar2", length: 50, nullable: true, name: "DOMINIO_CORREO_UNI" })
    dominio_correo_uni!: string;

    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "DIRECCION_LONGITUD_UNI" })
    direccion_longitud_uni!: number;

    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "DIRECCION_LATITUD_UNI" })
    direccion_latitud_uni!: number;
}