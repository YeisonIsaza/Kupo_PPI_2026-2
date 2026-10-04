const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/core/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Reemplazos de Entity("UPPER") a Entity("lower")
    content = content.replace(/@Entity\(\s*["']([^"']+)["']\s*\)/g, (match, p1) => {
        return `@Entity("${p1.toLowerCase()}")`;
    });

    // Reemplazos de name: "UPPER" a name: "lower"
    content = content.replace(/name:\s*["']([^"']+)["']/g, (match, p1) => {
        return `name: "${p1.toLowerCase()}"`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Lowercased: ${file}`);
}
console.log('Todos los modelos han sido convertidos a minúsculas.');
