import { ShellRunner, ShellRunnerOptions } from "../shell/runner"

const excludedDirs = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "coverage",
  "tmp",
  ".cache",
  "System Volume Information",
]

const pruneExpression = excludedDirs.map((dir) => `-name '${dir}'`).join(" -o ")

export function createFindPackagesRunner(
  baseDir: string,
  options?: ShellRunnerOptions
): ShellRunner {
  // Final find command
  const command = `find ${baseDir} \\( ${pruneExpression} \\) -prune -o -name 'package.json' -print | while IFS= read -r line; do
  echo "$line"
  sleep 0.001
done`

  const _options: ShellRunnerOptions = {
    ...options,
    spawnOpts: {
      ...options?.spawnOpts,
      cwd: baseDir,
    },
  }
  return new ShellRunner(command, _options)
}
