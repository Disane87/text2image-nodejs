import { WORKDIR } from "./constants.js";
import Logger from "./logger.js";
import path from "path";
import fs from "fs/promises";
import { Presets } from "./interfaces/presets.interface.js";

export async function checkAndCopyFolders() {
  // Check if config folder and template are empty, of so, copy the contents from ./.tmp/config and ./.tmp/template
  const foldersToCheck = ["./config", "./templates"];

  foldersToCheck.forEach(async (folder) => {
    Logger.debug("Checking folder: " + folder, "Folder check");
    try {
      const files = await fs.readdir(path.join(WORKDIR, folder));

      if (files.length === 0) {
        Logger.debug(
          "Folder is empty, copying files from ./.tmp/" + folder,
          "Folder check"
        );

        await fs.cp(
          path.join(WORKDIR, ".tmp", folder),
          path.join(WORKDIR, folder)
        );
      }
      Logger.debug(`Folder ${folder} exists and is not empty`, "Folder check");
      Logger.debug(
        `Folder ${folder} contains ${files.length} files`,
        `Folder check`
      );
    } catch (err) {
      Logger.error(err.message, "Folder check");
    }
  });
}

export async function getPresets(): Promise<Presets> {
  return JSON.parse(
    await fs.readFile(path.join(WORKDIR, "config", "presets.json"), "utf-8")
  );
}
