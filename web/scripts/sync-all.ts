/**
 * Node/TypeScript wrapper to trigger the full sync pipeline.
 * Runs Python sync_data.py or falls back to prepare-data.ts.
 */

import { spawn } from "child_process";
import path from "path";

const rootDir = path.resolve(__dirname, "../..");
const syncScript = path.join(rootDir, "sync_data.py");
const userArgs = process.argv.slice(2);

console.log("=================================================");
console.log("Starting End-to-End Leaderboard Sync...");
console.log(`Working directory: ${rootDir}`);
console.log(`Script: sync_data.py ${userArgs.join(" ")}`);
console.log("=================================================\n");

const pythonCommands = ["python", "python3", "py"];

function tryRunPython(cmdIndex: number) {
  if (cmdIndex >= pythonCommands.length) {
    console.error("Error: Python executable not found in PATH.");
    console.log("Running local TypeScript data preparation fallback...");
    require("./prepare-data");
    return;
  }

  const pythonCmd = pythonCommands[cmdIndex];
  const proc = spawn(pythonCmd, [syncScript, ...userArgs], {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  proc.on("error", () => {
    tryRunPython(cmdIndex + 1);
  });

  proc.on("exit", (code) => {
    if (code !== 0 && cmdIndex < pythonCommands.length - 1) {
      tryRunPython(cmdIndex + 1);
    }
  });
}

tryRunPython(0);
