import { run } from "./run"

export async function findPackages(baseDir: string): Promise<string[]> {
  const result = await run(
    `find ${baseDir} \\( -name node_modules -o -name dist -o -name build -o -name .git -o -name coverage -o -name tmp -o -name .cache \\) -prune -o -name package.json -print`,
    {
      cwd: baseDir,
    }
  )
  return result.stdout.split("\n").filter(Boolean)
}
