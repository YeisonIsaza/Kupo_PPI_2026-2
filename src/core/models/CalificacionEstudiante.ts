import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";

@Entity("calificacion_estudiante")
@Check("CK_PUNT_E", `"PUNTUACION_CALE" BETWEEN 1 AND 5`)
export class CalificacionEstudiante {

    @PrimaryGeneratedColumn({ type: "int", name: "id_cale" })
    id_cale!: number;

    @Column({ type: "int", nullable: false, name: "puntuacion_cale" })
    puntuacion_cale!: number;

    @Column({ type: "varchar", length: 120, nullable: true, name: "comentario_cale" })
    comentario_cale!: string;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", name: "fecha_cale" })
    fecha_cale!: Date;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "id_vj" })
    viaje!: Viaje;

    // Relación para el Emisor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user_emisor" })
    usuarioEmisor!: Usuario;

    // Relación para el Receptor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user_receptor" })
    usuarioReceptor!: Usuario;
}