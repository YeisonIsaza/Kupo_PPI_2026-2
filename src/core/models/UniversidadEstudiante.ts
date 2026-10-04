import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Universidad } from "./Universidad";
import { Usuario } from "./Usuario";
import { Estado } from "./Estado";

@Entity("universidad_estudiante")
export class UniversidadEstudiante {

    // --- CLAVE PRIMARIA COMPUESTA ---
    @PrimaryColumn({ type: "varchar", length: 20, name: "nit_uni" })
    nit_uni!: string;

    @PrimaryColumn({ type: "int", name: "id_user" })
    id_user!: number;

    // --- COLUMNAS ESTÁNDAR ---
    @Column({ type: "varchar", length: 120, nullable: false, name: "correo_institucional_une" })
    correo_institucional_une!: string;

    @Column({ type: "varchar", length: 500, nullable: true, name: "certificado_estudio_une" })
    certificado_estudio_une!: string; // Los BLOB se manipulan como instancias de Buffer en Node.js/TS
    // se cambio BLOB por varchar2 para evitar problemas de compatibilidad con Oracle y TypeORM, se guardará la ruta del archivo o un identificador en lugar del contenido binario

    // --- LLAVES FORÁNEAS QUE MAPEAN LAS RELACIONES ---

    @ManyToOne(() => Universidad, { nullable: false })
    @JoinColumn({ name: "nit_uni" })
    universidad!: Universidad;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user" })
    usuario!: Usuario;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;
}