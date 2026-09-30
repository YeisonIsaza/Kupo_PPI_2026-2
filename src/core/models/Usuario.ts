import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Perfil } from "./Perfil";
import { Estado } from "./Estado"; // Asumiendo que la clase de la primera tabla se llama Estado

@Entity("USUARIO")
@Unique("UK_DOC_USER", ["documento_identidad_user"])
@Unique("UK_CORREO_USER", ["correo_personal_user"])
@Unique("UK_CELULAR_USER", ["celular"])
export class Usuario {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_USER" })
    id_user!: number;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "DOCUMENTO_IDENTIDAD_USER" })
    documento_identidad_user!: string;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "NOMBRE_USER" })
    nombre_user!: string;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "PRIMER_APELLIDO" })
    primer_apellido!: string;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "SEGUNDO_APELLIDO" })
    segundo_apellido!: string;

    @Column({ type: "varchar2", length: 20, nullable: false, name: "CELULAR" })
    celular!: string;

    @Column({ type: "date", nullable: true, name: "FECHA_NACIMIENTO_USER" })
    fecha_nacimiento_user!: Date;

    @Column({ type: "varchar2", length: 120, nullable: false, name: "CORREO_PERSONAL_USER" })
    correo_personal_user!: string;

    @Column({ type: "varchar2", length: 100, nullable: false, name: "CONTRASENA" })
    contrasena!: string;

    @CreateDateColumn({ type: "date", default: () => "SYSDATE", name: "FECHA_REGISTRO" })
    fecha_registro!: Date;

    @Column({ type: "varchar2", length: 500, nullable: true, name: "FOTO_PERF" })
    foto_perf!: string; // Los campos BLOB en TypeScript se manejan como Buffer
    // se cambio BLOB por varchar2 para evitar problemas de compatibilidad con Oracle y TypeORM, se guardará la ruta del archivo o un identificador en lugar del contenido binario
    // --- LLAVES FORÁNEAS (RELACIONES) ---

    // Relación obligatoria por: CONSTRAINT NN_PERFIL_USU CHECK (CODIGO_PERFIL IS NOT NULL)
    @ManyToOne(() => Perfil, { nullable: false })
    @JoinColumn({ name: "CODIGO_PERFIL" })
    perfil!: Perfil;

    // Relación obligatoria por: CONSTRAINT NN_EST_CTA_USU CHECK (ID_ESTADO_CUENTA IS NOT NULL)
    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO_CUENTA" })
    estadoCuenta!: Estado;

    // Relación opcional (No tiene restricción NOT NULL en el script SQL)
    @ManyToOne(() => Estado, { nullable: true })
    @JoinColumn({ name: "ID_ESTADO_VERIFICACION" })
    estadoVerificacion!: Estado;
}