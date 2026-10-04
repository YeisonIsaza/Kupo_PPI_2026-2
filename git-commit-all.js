const { execSync } = require('child_process');

try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const lines = status.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
        // Extract the filename (handling spaces or renames if needed)
        // A typical line: " M path/to/file" or "?? newfile"
        const file = line.substring(3).trim();
        if (!file) continue;
        
        console.log(`Committing: ${file}`);
        execSync(`git add "${file}"`);
        execSync(`git commit -m "Refactor ${file} to support Supabase migration"`);
    }
    
    console.log("Pushing to remote...");
    execSync('git push');
    console.log("All files committed and pushed successfully.");
} catch (error) {
    console.error("Error during git operations:", error.message);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
}
