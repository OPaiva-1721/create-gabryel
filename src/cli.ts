import * as p from "@clack/prompts";
import minimist from "minimist";
import pc from "picocolors";
import { copyTemplate } from "./copy-template";
import { installDeps, pickPackageManager } from "./install";

type Template = "ddd" | "react" | "monorepo";

function detectTemplateFromFlags(args: minimist.ParsedArgs): Template | null {
  if (args.ddd) return "ddd";
  if (args.react) return "react";
  if (args.monorepo) return "monorepo";
  return null;
}

export async function run() {
  const args = minimist(process.argv.slice(2));

  console.log();
  p.intro(pc.bgCyan(pc.black(" create-gabryel ")));

  const flagTemplate = detectTemplateFromFlags(args);
  const flagProjectName = args._[0] as string | undefined;

  // ── Nome do projeto ──────────────────────────────────────────────
  let projectName: string;

  if (flagProjectName) {
    projectName = flagProjectName;
    p.log.info(`Projeto: ${pc.cyan(projectName)}`);
  } else {
    const answer = await p.text({
      message: "Qual o nome do projeto?",
      placeholder: "meu-projeto",
      validate: (v) => {
        if (!v || v.trim() === "") return "Nome é obrigatório";
        if (/\s/.test(v)) return "Nome não pode ter espaços";
      },
    });

    if (p.isCancel(answer)) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }

    projectName = answer as string;
  }

  // ── Template ─────────────────────────────────────────────────────
  let template: Template;

  if (flagTemplate) {
    template = flagTemplate;
    p.log.info(`Template: ${pc.cyan(template)}`);
  } else {
    const answer = await p.select({
      message: "Qual template você quer usar?",
      options: [
        {
          value: "ddd",
          label: "NestJS + DDD + Drizzle",
          hint: "API backend com arquitetura DDD",
        },
        {
          value: "react",
          label: "React 19 + Vite + TypeScript",
          hint: "Frontend moderno com path aliases",
        },
        {
          value: "monorepo",
          label: "Monorepo (Turborepo + pnpm)",
          hint: "apps/api (DDD) + apps/web (React)",
        },
      ],
    });

    if (p.isCancel(answer)) {
      p.cancel("Operação cancelada.");
      process.exit(0);
    }

    template = answer as Template;
  }

  // ── Copia o template ─────────────────────────────────────────────
  const spinner = p.spinner();
  spinner.start("Copiando template...");

  try {
    await copyTemplate(template, projectName);
    spinner.stop(`Template copiado para ${pc.green(`./${projectName}`)}`);
  } catch (err) {
    spinner.stop(pc.red("Erro ao copiar template"));
    p.log.error(String(err));
    process.exit(1);
  }

  // ── Instalar dependências ─────────────────────────────────────────
  const pm = pickPackageManager();

  const shouldInstall = await p.confirm({
    message: `Instalar dependências com ${pm}?`,
    initialValue: true,
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel("Operação cancelada.");
    process.exit(0);
  }

  let installedWith: "pnpm" | "npm" | null = null;
  if (shouldInstall) {
    const installSpinner = p.spinner();
    installSpinner.start(`Instalando dependências com ${pm}...`);

    try {
      installedWith = await installDeps(projectName);
      installSpinner.stop(`Dependências instaladas com ${installedWith}!`);
    } catch {
      installSpinner.stop(pc.yellow("Não foi possível instalar automaticamente."));
      p.log.warn(`Rode manualmente: cd ${projectName} && ${pm} install`);
    }
  }

  // ── Mensagem final ────────────────────────────────────────────────
  const runner = installedWith ?? pm;
  p.outro(
    [
      pc.green("✅ Projeto pronto!"),
      "",
      "Próximos passos:",
      pc.cyan(`  cd ${projectName}`),
      !shouldInstall ? pc.cyan(`  ${runner} install`) : "",
      template === "ddd" || template === "monorepo"
        ? pc.cyan("  cp .env.example .env")
        : "",
      pc.cyan(`  ${runner} run dev`),
    ]
      .filter(Boolean)
      .join("\n")
  );
}
