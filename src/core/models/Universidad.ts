import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("universidad")
export class Universidad {

    @PrimaryColumn({ type: "varchar", length: 20, name: "nit_uni" })
    nit_uni!: string;

    @Column({ type: "varchar", length: 150, nullable: false, name: "nombre_uni" })
    nombre_uni!: string;

    @Column({ type: "varchar", length: 50, nullable: true, name: "dominio_correo_uni" })
    dominio_correo_uni!: string;

    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "direccion_longitud_uni" })
    direccion_longitud_uni!: number;

    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "direccion_latitud_uni" })
    direccion_latitud_uni!: number;
}