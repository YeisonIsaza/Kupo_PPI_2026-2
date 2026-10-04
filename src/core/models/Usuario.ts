import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Perfil } from "./Perfil";
import { Estado } from "./Estado"; // Asumiendo que la clase de la primera tabla se llama Estado

@Entity("usuario")
@Unique("UK_DOC_USER", ["documento_identidad_user"])
@Unique("UK_CORREO_USER", ["correo_personal_user"])
@Unique("UK_CELULAR_USER", ["celular"])
export class Usuario {

    @PrimaryGeneratedColumn({ type: "int", name: "id_user" })
    id_user!: number;

    @Column({ type: "varchar", length: 20, nullable: false, name: "documento_identidad_user" })
    documento_identidad_user!: string;

    @Column({ type: "varchar", length: 20, nullable: false, name: "nombre_user" })
    nombre_user!: string;

    @Column({ type: "varchar", length: 20, nullable: false, name: "primer_apellido" })
    primer_apellido!: string;

    @Column({ type: "varchar", length: 20, nullable: false, name: "segundo_apellido" })
    segundo_apellido!: string;

    @Column({ type: "varchar", length: 20, nullable: false, name: "celular" })
    celular!: string;

    @Column({ type: "date", nullable: true, name: "fecha_nacimiento_user" })
    fecha_nacimiento_user!: Date;

    @Column({ type: "varchar", length: 120, nullable: false, name: "correo_personal_user" })
    correo_personal_user!: string;

    @Column({ type: "varchar", length: 100, nullable: false, name: "contrasena" })
    contrasena!: string;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", name: "fecha_registro" })
    fecha_registro!: Date;

    @Column({ type: "varchar", length: 500, nullable: true, name: "foto_perf" })
    foto_perf!: string; // Los campos BLOB en TypeScript se manejan como Buffer
    // se cambio BLOB por varchar2 para evitar problemas de compatibilidad con Oracle y TypeORM, se guardará la ruta del archivo o un identificador en lugar del contenido binario
    // --- LLAVES FORÁNEAS (RELACIONES) ---

    // Relación obligatoria por: CONSTRAINT NN_PERFIL_USU CHECK (CODIGO_PERFIL IS NOT NULL)
    @ManyToOne(() => Perfil, { nullable: false })
    @JoinColumn({ name: "codigo_perfil" })
    perfil!: Perfil;

    // Relación obligatoria por: CONSTRAINT NN_EST_CTA_USU CHECK (ID_ESTADO_CUENTA IS NOT NULL)
    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado_cuenta" })
    estadoCuenta!: Estado;

    // Relación opcional (No tiene restricción NOT NULL en el script SQL)
    @ManyToOne(() => Estado, { nullable: true })
    @JoinColumn({ name: "id_estado_verificacion" })
    estadoVerificacion!: Estado;
}