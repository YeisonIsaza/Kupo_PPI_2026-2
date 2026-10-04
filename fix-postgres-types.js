const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/core/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Reemplazar type: "int" con type: "numeric" si tiene scale
    content = content.replace(/type:\s*["']int["'](.*?)scale:/gi, 'type: "numeric"$1scale:');
    
    // Eliminar precision de los campos que quedaron como "int"
    content = content.replace(/(type:\s*["']int["'].*?)precision:\s*\d+,?/gi, (match, p1) => {
        // Asegurarse de que no haya comas dobles, etc.
        let result = p1.trim();
        if (result.endsWith(',')) {
            // Se quita la precisión, pero p1 ya tiene la coma anterior si la hubiera
            return result;
        }
        return p1;
    });

    // Limpiar comas sobrantes dentro de @Column({ ... , }) que puedan quedar
    content = content.replace(/,\s*}/g, ' }');
    
    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Tipos numéricos corregidos para PostgreSQL.');
