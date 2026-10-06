const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src/core/models');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

for(const f of files) {
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, 'utf8');
  let changed = false;

  // lowercase all constraint names in @Check and @Unique
  let newC = c.replace(/@(Check|Unique)\(\s*["']([A-Z_]+)["']/g, (m, dec, name) => {
    return `@${dec}("${name.toLowerCase()}"`;
  });

  // lowercase any remaining uppercase string keys in @Unique columns
  newC = newC.replace(/@Unique\("([^"]+)",\s*\["([A-Z_]+)"\]\)/g, (m, name, col) => {
    return `@Unique("${name}", ["${col.toLowerCase()}"])`;
  });

  if (newC !== c) {
    fs.writeFileSync(p, newC, 'utf8');
    console.log('Fixed:', f);
  }
}
console.log("Terminado!");
