#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var p = __toESM(require("@clack/prompts"));
var import_minimist = __toESM(require("minimist"));
var import_picocolors = __toESM(require("picocolors"));

// src/copy-template.ts
var import_fs = require("fs");
var import_path = require("path");
async function copyTemplate(template, projectName) {
  const templateDir = (0, import_path.resolve)(__dirname, `../templates/${template}`);
  const targetDir = (0, import_path.resolve)(process.cwd(), projectName);
  if (!(0, import_fs.existsSync)(templateDir)) {
    throw new Error(`Template "${template}" n\xE3o encontrado em ${templateDir}`);
  }
  if ((0, import_fs.existsSync)(targetDir)) {
    throw new Error(`Pasta "${projectName}" j\xE1 existe no diret\xF3rio atual`);
  }
  (0, import_fs.mkdirSync)(targetDir, { recursive: true });
  (0, import_fs.cpSync)(templateDir, targetDir, { recursive: true });
}

// src/install.ts
var import_child_process = require("child_process");
var import_path2 = require("path");
function hasCommand(cmd) {
  const probe = process.platform === "win32" ? "where" : "command -v";
  try {
    (0, import_child_process.execSync)(`${probe} ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function pickPackageManager() {
  return hasCommand("pnpm") ? "pnpm" : "npm";
}
async function installDeps(projectName) {
  const targetDir = (0, import_path2.resolve)(process.cwd(), projectName);
  const pm = pickPackageManager();
  (0, import_child_process.execSync)(`${pm} install`, {
    cwd: targetDir,
    stdio: "pipe"
  });
  return pm;
}

// src/cli.ts
function detectTemplateFromFlags(args) {
  if (args.ddd) return "ddd";
  if (args.react) return "react";
  if (args.monorepo) return "monorepo";
  return null;
}
async function run() {
  const args = (0, import_minimist.default)(process.argv.slice(2));
  console.log();
  p.intro(import_picocolors.default.bgCyan(import_picocolors.default.black(" create-gabryel ")));
  const flagTemplate = detectTemplateFromFlags(args);
  const flagProjectName = args._[0];
  let projectName;
  if (flagProjectName) {
    projectName = flagProjectName;
    p.log.info(`Projeto: ${import_picocolors.default.cyan(projectName)}`);
  } else {
    const answer = await p.text({
      message: "Qual o nome do projeto?",
      placeholder: "meu-projeto",
      validate: (v) => {
        if (!v || v.trim() === "") return "Nome \xE9 obrigat\xF3rio";
        if (/\s/.test(v)) return "Nome n\xE3o pode ter espa\xE7os";
      }
    });
    if (p.isCancel(answer)) {
      p.cancel("Opera\xE7\xE3o cancelada.");
      process.exit(0);
    }
    projectName = answer;
  }
  let template;
  if (flagTemplate) {
    template = flagTemplate;
    p.log.info(`Template: ${import_picocolors.default.cyan(template)}`);
  } else {
    const answer = await p.select({
      message: "Qual template voc\xEA quer usar?",
      options: [
        {
          value: "ddd",
          label: "NestJS + DDD + Drizzle",
          hint: "API backend com arquitetura DDD"
        },
        {
          value: "react",
          label: "React 19 + Vite + TypeScript",
          hint: "Frontend moderno com path aliases"
        },
        {
          value: "monorepo",
          label: "Monorepo (Turborepo + pnpm)",
          hint: "apps/api (DDD) + apps/web (React)"
        }
      ]
    });
    if (p.isCancel(answer)) {
      p.cancel("Opera\xE7\xE3o cancelada.");
      process.exit(0);
    }
    template = answer;
  }
  const spinner2 = p.spinner();
  spinner2.start("Copiando template...");
  try {
    await copyTemplate(template, projectName);
    spinner2.stop(`Template copiado para ${import_picocolors.default.green(`./${projectName}`)}`);
  } catch (err) {
    spinner2.stop(import_picocolors.default.red("Erro ao copiar template"));
    p.log.error(String(err));
    process.exit(1);
  }
  const pm = pickPackageManager();
  const shouldInstall = await p.confirm({
    message: `Instalar depend\xEAncias com ${pm}?`,
    initialValue: true
  });
  if (p.isCancel(shouldInstall)) {
    p.cancel("Opera\xE7\xE3o cancelada.");
    process.exit(0);
  }
  let installedWith = null;
  if (shouldInstall) {
    const installSpinner = p.spinner();
    installSpinner.start(`Instalando depend\xEAncias com ${pm}...`);
    try {
      installedWith = await installDeps(projectName);
      installSpinner.stop(`Depend\xEAncias instaladas com ${installedWith}!`);
    } catch {
      installSpinner.stop(import_picocolors.default.yellow("N\xE3o foi poss\xEDvel instalar automaticamente."));
      p.log.warn(`Rode manualmente: cd ${projectName} && ${pm} install`);
    }
  }
  const runner = installedWith ?? pm;
  p.outro(
    [
      import_picocolors.default.green("\u2705 Projeto pronto!"),
      "",
      "Pr\xF3ximos passos:",
      import_picocolors.default.cyan(`  cd ${projectName}`),
      !shouldInstall ? import_picocolors.default.cyan(`  ${runner} install`) : "",
      template === "ddd" || template === "monorepo" ? import_picocolors.default.cyan("  cp .env.example .env") : "",
      import_picocolors.default.cyan(`  ${runner} run dev`)
    ].filter(Boolean).join("\n")
  );
}

// src/index.ts
run();
