import "reflect-metadata";
import { AppDataSource } from "./db";

async function runMigration() {
    try {
        console.log("Conectando con Oracle...");
        await AppDataSource.initialize();

        console.log("Agregando columnas a MENU_PERMISO...");
        
        await AppDataSource.query(`ALTER TABLE MENU_PERMISO ADD PUEDE_CREAR CHAR(1) DEFAULT 'N' NOT NULL`);
        console.log("PUEDE_CREAR agregada");
        
        await AppDataSource.query(`ALTER TABLE MENU_PERMISO ADD PUEDE_LEER CHAR(1) DEFAULT 'N' NOT NULL`);
        console.log("PUEDE_LEER agregada");
        
        await AppDataSource.query(`ALTER TABLE MENU_PERMISO ADD PUEDE_ACTUALIZAR CHAR(1) DEFAULT 'N' NOT NULL`);
        console.log("PUEDE_ACTUALIZAR agregada");
        
        await AppDataSource.query(`ALTER TABLE MENU_PERMISO ADD PUEDE_ELIMINAR CHAR(1) DEFAULT 'N' NOT NULL`);
        console.log("PUEDE_ELIMINAR agregada");

        await AppDataSource.query(`ALTER TABLE USUARIO MODIFY FOTO_PERF VARCHAR2(500)`);
        console.log("FOTO_PERF cambiada a VARCHAR2");

        await AppDataSource.query(`ALTER TABLE UNIVERSIDAD_ESTUDIANTE MODIFY CERTIFICADO_ESTUDIO_UNE VARCHAR2(500)`);
        console.log("CERTIFICADO_ESTUDIO_UNE cambiada a VARCHAR2");

        console.log(" Migración ejecutada con éxito!");

    } catch (error: any) {
        if (error?.errorNum === 1430) {
            console.log(" Las columnas ya existen, continuando...");
        } else {
            console.error(" Error:", error);
        }
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("Conexión cerrada.");
        }
    }
}

runMigration();