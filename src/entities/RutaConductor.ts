import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Universidad } from "./Universidad";
import { Conductor } from "./Conductor";
import { Estado } from "./Estado";
import { OneToMany } from "typeorm";


@Entity("RUTA_CONDUCTOR")
export class RutaConductor {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_RC" })
    id_rc!: number;

   @Column({ type: "varchar2", length: 5, nullable: false, name: "HORA_SALIDA_RC" })
    hora_salida_rc!: string;

    //@Column({ type: "date", nullable: true, name: "HORA_ESTIPULADA_LLEGADA_RC" })
    //hora_estipulada_llegada_rc!: Date;

    @CreateDateColumn({ type: "date", default: () => "SYSDATE", name: "FECHA_PUBLICACION_RC" })
    fecha_publicacion_rc!: Date;

    @Column({ type: "number", precision: 10, scale: 2, nullable: false, name: "TARIFA_RC" })
    tarifa_rc!: number;

    // --- COORDENADAS GEOGRÁFICAS ---
    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "PUNTO_ORIGEN_LATITUD_RC" })
    punto_origen_latitud_rc!: number;

    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "PUNTO_ORIGEN_LONGITUD_RC" })
    punto_origen_longitud_rc!: number;

    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "PUNTO_DESTINO_LATITUD_RC" })
    punto_destino_latitud_rc!: number;

    @Column({ type: "number", precision: 10, scale: 8, nullable: true, name: "PUNTO_DESTINO_LONGITUD_RC" })
    punto_destino_longitud_rc!: number;

    @Column({ type: "varchar2", length: 50, nullable: true, name: "DIAS_SEMANA" })
    dias_semana!: string;

    @Column({ type: "varchar2", length: 300, nullable: true, name: "ORIGEN_NOMBRE" })
    origen_nombre!: string;

    @Column({ type: "varchar2", length: 300, nullable: true, name: "DESTINO_NOMBRE" })
    destino_nombre!: string;

    @OneToMany(() => {
        const { Parada } = require("./Parada");
        return Parada;
    }, (parada: any) => parada.rutaConductor)
    paradas!: any[];

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => Universidad, { nullable: false })
    @JoinColumn({ name: "NIT_UNI" })
    universidad!: Universidad;

    @ManyToOne(() => Conductor, { nullable: false })
    @JoinColumn({ name: "ID_USER" })
    conductor!: Conductor;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;
}