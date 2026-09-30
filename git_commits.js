const { execSync } = require('child_process');

try {
  // 1. Reset the last commit but keep changes in the working directory
  console.log("Resetting last commit...");
  execSync('git reset HEAD~1');

  // 2. Get list of all changed files (unstaged)
  const statusOutput = execSync('git status --porcelain').toString();
  
  // Parse the output to get filenames
  // Example output:
  //  M .gitignore
  // ?? src/core/
  // D  src/entities/
  
  // Wait, `git status --porcelain` shows renamed files as R or if we reset, it might show them as Untracked (??) and Deleted ( D).
  // Actually, `git add -A` followed by a commit per file is easier if we stage everything first, but we want one commit per file.
  // The safest way is to add everything first, then commit them one by one. But wait, `git add .` stages all.
  // Then `git diff --cached --name-only` lists all staged files (which includes renamed files correctly).
  
  console.log("Staging all files temporarily to get a clean list...");
  execSync('git add -A');
  const stagedFiles = execSync('git diff --cached --name-only').toString().split('\n').filter(Boolean);
  
  console.log(`Found ${stagedFiles.length} files to commit separately.`);
  
  // 3. Unstage all files so we can stage them one by one
  console.log("Unstaging files...");
  execSync('git reset');
  
  // 4. Loop through each file, add it, and commit it
  for (const file of stagedFiles) {
    console.log(`Committing: ${file}`);
    try {
      // Add the file
      execSync(`git add "${file}"`);
      // Commit the file
      const commitMsg = `Refactor: move/update ${file}`;
      execSync(`git commit -m "${commitMsg}"`);
    } catch (err) {
      console.log(`Could not commit ${file}, maybe it was deleted or already committed. Moving on.`);
    }
  }

  // Note: if there are deletions, `git add "deleted_file"` will stage the deletion.
  // We might still have unstaged deletions if the original filename is different.
  // To ensure we don't leave things behind, any remaining unstaged changes can be added in a final cleanup commit.
  
  const remaining = execSync('git status --porcelain').toString();
  if (remaining.trim().length > 0) {
      console.log("Committing remaining cleanup changes (like pure deletions)...");
      execSync('git add -A');
      execSync('git commit -m "Refactor: cleanup remaining deletions and moves"');
  }

  // 5. Force push to the branch
  console.log("Force pushing to GitHub...");
  execSync('git push -f origin HEAD');
  
  console.log("Done!");
} catch (error) {
  console.error("An error occurred:", error.message);
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
}
