import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from "typeorm";
import { RutaConductor } from "./RutaConductor";
import { Usuario } from "./Usuario";
import { Universidad } from "./Universidad";
import { Estado } from "./Estado";

@Entity("parada")
@Check("ck_es_uni_pds", `"es_universidad_pds" IN ('SI', 'NO')`) // Asegura que solo acepte 'SI' o 'NO'
export class Parada {

    @PrimaryGeneratedColumn({ type: "int", name: "id_pds" })
    id_pds!: number;

    @Column({ type: "varchar", length: 200, nullable: false, name: "punto_recogida_pds" })
    punto_recogida_pds!: string;

    @Column({ type: "int", nullable: false, name: "orden_pds" })
    orden_pds!: number;

    @Column({ type: "date", nullable: true, name: "hora_estimada_pds" })
    hora_estimada_pds!: Date;

    @Column({ type: "varchar", length: 2, nullable: false, name: "es_universidad_pds" })
    es_universidad_pds!: string;

    //nuevo campo para costo adicional
    @Column({ type: "numeric", precision: 10, scale: 2, nullable: true, name: "costo_adicional_pds", default: 0 })
    costo_adicional_pds!: number;

    // --- COORDENADAS DE LA PARADA (opcionales: paradas antiguas pueden no tenerlas) ---
    @Column({ type: "numeric", precision: 11, scale: 8, nullable: true, name: "latitud_pds" })
    latitud_pds!: number | null;

    @Column({ type: "numeric", precision: 11, scale: 8, nullable: true, name: "longitud_pds" })
    longitud_pds!: number | null;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => RutaConductor, { nullable: false })
    @JoinColumn({ name: "id_rc" })
    rutaConductor!: RutaConductor;

    // Esta relación es opcional en la BD (NIT_UNI no tiene restricción NOT NULL)
    @ManyToOne(() => Universidad, { nullable: true })
    @JoinColumn({ name: "nit_uni" })
    universidad!: Universidad;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "id_estado" })
    estado!: Estado;
}