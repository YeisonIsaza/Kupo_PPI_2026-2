import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("estado")
export class Estado {
    @PrimaryGeneratedColumn({ type: "int", name: "id_estado" })
    id_estado!: number;

    @Column({ 
        type: "varchar", 
        length: 30, 
        nullable: false, // Esto cumple con el CONSTRAINT NN_NOM_ESTADO
        name: "nombre_estado" 
    })
    nombre_estado!: string;

    @Column({ 
        type: "varchar", 
        length: 30, 
        nullable: true, 
        name: "categoria" 
    })
    categoria!: string;
}