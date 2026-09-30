import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Check } from "typeorm";
import { Viaje } from "./Viaje";
import { Usuario } from "./Usuario";
import { Conductor } from "./Conductor";

@Entity("CALIFICACION_CONDUCTOR")
@Check("CK_PUNT_C", `"PUNTUACION_CALCON" BETWEEN 1 AND 5`)
export class CalificacionConductor {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_CALCON" })
    id_calcon!: number;

    @Column({ type: "number", precision: 2, nullable: false, name: "PUNTUACION_CALCON" })
    puntuacion_calcon!: number;

    @Column({ type: "varchar2", length: 120, nullable: true, name: "COMENTARIO_CALCON" })
    comentario_calcon!: string;

    @CreateDateColumn({ type: "date", default: () => "SYSDATE", name: "FECHA_CALCON" })
    fecha_calcon!: Date;

    // --- LLAVES FORÁNEAS ---

    @ManyToOne(() => Viaje, { nullable: false })
    @JoinColumn({ name: "ID_VJ" })
    viaje!: Viaje;

    // Relación para el Emisor (Usuario)
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: "ID_USER_EMISOR" })
    usuarioEmisor!: Usuario;

    // Relación para el Receptor (Conductor - fíjate que apunta a la tabla Conductor)
    @ManyToOne(() => Conductor, { nullable: false })
    @JoinColumn({ name: "ID_USER_RECEPTOR" })
    conductorReceptor!: Conductor;
}