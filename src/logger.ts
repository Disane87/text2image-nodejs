import PtkDevLogger from "@ptkdev/logger";
import { LOG_DIRECTORY, WORKDIR, WRITE_LOG } from "./constants.js";
import path from "path";
import { PathType } from "./interfaces/path-type.interface.js";
import fs from "fs/promises";
import { exit } from "process";

let logPaths: PathType | undefined = undefined;

export async function initLogger(): Promise<PtkDevLogger> {
  if (WRITE_LOG) {
    logPaths = {
      debug_log: path.join(WORKDIR, "logs/debug.log"),
      error_log: path.join(WORKDIR, "logs/error.log"),
    };
  }

  // Überprüfe, ob das Verzeichnis existiert
  try {
    await fs.access(LOG_DIRECTORY); // Versuche auf das Verzeichnis zuzugreifen
  } catch (error) {
    // Falls das Verzeichnis nicht existiert, erstelle es
    if (error.code === "ENOENT") {
      try {
        await fs.mkdir(LOG_DIRECTORY); // Erstelle das Verzeichnis
      } catch (err) {
        console.error("Error creating log directory:", err);
        exit(1);
      }
    }
  }

  const Logger = new PtkDevLogger({
    write: WRITE_LOG,
    path: logPaths,
  });
  Logger.info("Initialized! 🎉", "Logger");

  return Logger;
}

const Logger = await initLogger();
export default Logger;
