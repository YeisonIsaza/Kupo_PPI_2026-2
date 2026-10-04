import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";
import { Conductor } from "./Conductor";

@Entity("calificacion_conductor")
@Check("CK_PUNT_C", `"PUNTUACION_CALCON" BETWEEN 1 AND 5`)
export class CalificacionConductor {

    @PrimaryGeneratedColumn({ type: "int", name: "id_calcon" })
    id_calcon!: number;

    @Column({ type: "int", nullable: false, name: "puntuacion_calcon" })
    puntuacion_calcon!: number;

    @Column({ type: "varchar", length: 120, nullable: true, name: "comentario_calcon" })
    comentario_calcon!: string;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", name: "fecha_calcon" })
    fecha_calcon!: Date;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "id_vj" })
    viaje!: Viaje;

    // Relación para el Emisor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "id_user_emisor" })
    usuarioEmisor!: Usuario;

    // Relación para el Receptor (Conductor - fíjate que apunta a la tabla Conductor)
    @ManyToOne(() => Conductor, { nullable: false })
    @JoinColumn({ name: "id_user_receptor" })
    conductorReceptor!: Conductor;
}