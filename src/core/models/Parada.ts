import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from "typeorm";
import { RutaConductor } from "./RutaConductor";
import { Usuario } from "./Usuario";
import { Universidad } from "./Universidad";
import { Estado } from "./Estado";

@Entity("PARADA")
@Check("CK_ES_UNI_PDS", `"ES_UNIVERSIDAD_PDS" IN ('SI', 'NO')`) // Asegura que solo acepte 'SI' o 'NO'
export class Parada {

    @PrimaryGeneratedColumn({ type: "number", name: "ID_PDS" })
    id_pds!: number;

    @Column({ type: "varchar2", length: 200, nullable: false, name: "PUNTO_RECOGIDA_PDS" })
    punto_recogida_pds!: string;

    @Column({ type: "number", precision: 2, nullable: false, name: "ORDEN_PDS" })
    orden_pds!: number;

    @Column({ type: "date", nullable: true, name: "HORA_ESTIMADA_PDS" })
    hora_estimada_pds!: Date;

    @Column({ type: "varchar2", length: 2, nullable: false, name: "ES_UNIVERSIDAD_PDS" })
    es_universidad_pds!: string;

    //nuevo campo para costo adicional
    @Column({ type: "number", precision: 10, scale: 2, nullable: true, name: "COSTO_ADICIONAL_PDS", default: 0 })
    costo_adicional_pds!: number;

    // --- LLAVES FORÁNEAS (RELACIONES) ---

    @ManyToOne(() => RutaConductor, { nullable: false })
    @JoinColumn({ name: "ID_RC" })
    rutaConductor!: RutaConductor;

    // Esta relación es opcional en la BD (NIT_UNI no tiene restricción NOT NULL)
    @ManyToOne(() => Universidad, { nullable: true })
    @JoinColumn({ name: "NIT_UNI" })
    universidad!: Universidad;

    @ManyToOne(() => Estado, { nullable: false })
    @JoinColumn({ name: "ID_ESTADO" })
    estado!: Estado;
}