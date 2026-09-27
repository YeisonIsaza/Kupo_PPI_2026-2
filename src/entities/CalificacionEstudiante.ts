import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";

@Entity("CALIFICACION_ESTUDIANTE")
@Check("CK_PUNT_E", `"PUNTUACION_CALE" BETWEEN 1 AND 5`)
export class CalificacionEstudiante {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_CALE" })
    id_cale!: number;

    @Column({ type: "number", precision: 2, nullable: false, name: "PUNTUACION_CALE" })
    puntuacion_cale!: number;

    @Column({ type: "varchar2", length: 120, nullable: true, name: "COMENTARIO_CALE" })
    comentario_cale!: string;

    @CreateDateColumn({ type: "date", default: () => "SYSDATE", name: "FECHA_CALE" })
    fecha_cale!: Date;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "ID_VJ" })
    viaje!: Viaje;

    // Relación para el Emisor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER_EMISOR" })
    usuarioEmisor!: Usuario;

    // Relación para el Receptor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER_RECEPTOR" })
    usuarioReceptor!: Usuario;
}