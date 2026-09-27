import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("ESTADO")
export class Estado {
    @PrimaryGeneratedColumn({ type: "number", name: "ID_ESTADO" })
    id_estado!: number;

    @Column({ 
        type: "varchar2", 
        length: 30, 
        nullable: false, // Esto cumple con el CONSTRAINT NN_NOM_ESTADO
        name: "NOMBRE_ESTADO" 
    })
    nombre_estado!: string;

    @Column({ 
        type: "varchar2", 
        length: 30, 
        nullable: true, 
        name: "CATEGORIA" 
    })
    categoria!: string;
}