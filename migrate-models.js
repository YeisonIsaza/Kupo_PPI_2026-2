const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/core/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Reemplazos de Oracle a Postgres
    content = content.replace(/type:\s*["']varchar2["']/gi, 'type: "varchar"');
    content = content.replace(/type:\s*["']number["']/gi, 'type: "int"');
    content = content.replace(/=>\s*["']SYSDATE["']/gi, '=> "CURRENT_TIMESTAMP"');
    
    // TypeORM PrimaryGeneratedColumn usually doesn't need "type: 'int'" in Postgres, but leaving it as int is fine.

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Migrado: ${file}`);
}
console.log('Todos los modelos han sido adaptados para PostgreSQL.');
