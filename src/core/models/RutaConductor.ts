import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Universidad } from "./Universidad";
import { Conductor } from "./Conductor";
import { Estado } from "./Estado";
import { OneToMany } from "typeorm";


@Entity("ruta_conductor")
export class RutaConductor {

    @PrimaryGeneratedColumn({ type: "int", name: "id_rc" })
    id_rc!: number;

   @Column({ type: "varchar", length: 5, nullable: false, name: "hora_salida_rc" })
    hora_salida_rc!: string;

    //@Column({ type: "date", nullable: true, name: "hora_estipulada_llegada_rc" })
    //hora_estipulada_llegada_rc!: Date;

    @CreateDateColumn({ type: "date", default: () => "CURRENT_TIMESTAMP", name: "fecha_publicacion_rc" })
    fecha_publicacion_rc!: Date;

    @Column({ type: "numeric", precision: 10, scale: 2, nullable: false, name: "tarifa_rc" })
    tarifa_rc!: number;

    // --- COORDENADAS GEOGRÁFICAS ---
    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "punto_origen_latitud_rc" })
    punto_origen_latitud_rc!: number;

    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "punto_origen_longitud_rc" })
    punto_origen_longitud_rc!: number;

    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "punto_destino_latitud_rc" })
    punto_destino_latitud_rc!: number;

    @Column({ type: "numeric", precision: 10, scale: 8, nullable: true, name: "punto_destino_longitud_rc" })
    punto_destino_longitud_rc!: number;

    @Column({ type: "varchar", length: 50, nullable: true, name: "dias_semana" })
    dias_semana!: string;

    @Column({ type: "varchar", length: 300, nullable: true, name: "origen_nombre" })
    origen_nombre!: string;

    @Column({ type: "varchar", length: 300, nullable: true, name: "destino_nombre" })
    destino_nombre!: string;

    // --- GEOMETRÍA DE LA RUTA (trazado real calculado con Google Directions) ---
    // JSON con [[lat,lng], ...] simplificado. Se usa para coincidencias por corredor.
    @Column({ type: "text", nullable: true, name: "ruta_path_rc" })
    ruta_path_rc!: string | null;

    @Column({ type: "numeric", precision: 8, scale: 2, nullable: true, name: "distancia_km_rc" })
    distancia_km_rc!: number | null;

    @Column({ type: "int", nullable: true, name: "duracion_min_rc" })
    duracion_min_rc!: number | null;

    @OneToMany(() => {
        const { Parada } = require("./Parada");
        return Parada;
    }, (parada: any) => parada.rutaConductor)
    paradas!: any[];

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => Universidad, { nullable: false })
    @JoinColumn({ name: "nit_uni" })
    universidad!: Universidad;

    @ManyToOne(() => Conductor, { nullable: false })
    @JoinColumn({ name: "id_user" })
    conductor!: Conductor;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;
}