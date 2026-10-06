import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity("rol")
@Unique("uk_nombre_rol", ["nombre_rol"]) // Define la restricción UNIQUE con el nombre exacto de tu script
export class Rol {

    @PrimaryGeneratedColumn({ type: "int", name: "id_rol" })
    id_rol!: number;

    @Column({ type: "varchar", length: 20, nullable: false, name: "nombre_rol" })
    nombre_rol!: string;
}
