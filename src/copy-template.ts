import { cpSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

export async function copyTemplate(template: string, projectName: string) {
  const templateDir = resolve(__dirname, `../templates/${template}`);
  const targetDir = resolve(process.cwd(), projectName);

  if (!existsSync(templateDir)) {
    throw new Error(`Template "${template}" não encontrado em ${templateDir}`);
  }

  if (existsSync(targetDir)) {
    throw new Error(`Pasta "${projectName}" já existe no diretório atual`);
  }

  mkdirSync(targetDir, { recursive: true });
  cpSync(templateDir, targetDir, { recursive: true });
}
