import { run } from "./run"

export async function findPackages(baseDir: string): Promise<string[]> {
  // List of directories to exclude
  const excludedDirs = [
    "node_modules",
    "dist",
    "build",
    ".git",
    "coverage",
    "tmp",
    ".cache",
  ]

  // Construct the prune expression from the excludedDirs array
  const pruneExpression = excludedDirs.map((dir) => `-name ${dir}`).join(" -o ")

  // Final find command
  const command = `find ${baseDir} \\( ${pruneExpression} \\) -prune -o -name package.json -print`

  const result = await run(command, { cwd: baseDir })

  // Filter out empty lines and trim results
  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}
