import { AppDataSource } from "../lib/db";
import { Usuario } from "../entities/Usuario";

export class UsuarioService {
    async registrar(datos: any) {
        const repo = AppDataSource.getRepository(Usuario);
        const nuevo = repo.create(datos);
        return await repo.save(nuevo); // Esto hace el INSERT en Oracle
    }
}