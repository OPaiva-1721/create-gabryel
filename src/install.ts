import { execSync } from "child_process";
import { resolve } from "path";

function hasCommand(cmd: string): boolean {
  const probe = process.platform === "win32" ? "where" : "command -v";
  try {
    execSync(`${probe} ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function pickPackageManager(): "pnpm" | "npm" {
  return hasCommand("pnpm") ? "pnpm" : "npm";
}

export async function installDeps(projectName: string): Promise<"pnpm" | "npm"> {
  const targetDir = resolve(process.cwd(), projectName);
  const pm = pickPackageManager();

  execSync(`${pm} install`, {
    cwd: targetDir,
    stdio: "pipe",
  });

  return pm;
}
