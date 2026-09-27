import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("ROL")
@Unique("UK_NOMBRE_ROL", ["nombre_rol"]) // Define la restricción UNIQUE con el nombre exacto de tu script
export class Rol {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_ROL" })
    id_rol!: number;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "NOMBRE_ROL" })
    nombre_rol!: string;
}
