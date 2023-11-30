/*
https://docs.nestjs.com/providers#services
*/

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from "@nestjs/common";
import fs from "fs";
import path from "path";

@Injectable()
export class DefaultConfigService implements OnApplicationBootstrap {
  constructor(@Inject(`WORK_DIR`) private readonly workdir: string) {}
  public async onApplicationBootstrap() {
    await this.checkAndCopyFolders();
  }
  private async checkAndCopyFolders() {
    // Check if config folder and template are empty, of so, copy the contents from ./.tmp/config and ./.tmp/template
    const foldersToCheck = [`config`];

    Logger.debug(
      `Checking folders for config files and templates`,
      `Bootstrap`,
    );

    foldersToCheck.forEach(async (folder) => {
      const workdir = this.workdir;

      Logger.debug(`Checking folder: ` + folder, `Bootstrap`);
      try {
        let files = fs.readdirSync(path.join(workdir, folder));

        if (files.length === 0) {
          Logger.debug(
            `Folder is empty, copying files from ".config_default/${folder}"`,
            `Bootstrap`,
          );

          fs.cpSync(
            path.join(workdir, `.config_default/`),
            path.join(workdir, folder),
            { recursive: true },
          );
        }

        files = fs.readdirSync(path.join(workdir, folder));
        Logger.debug(
          `Folder "${folder}" exists and is not empty. Contains ${files.length} files`,
          `Bootstrap`,
        );
      } catch (err) {
        Logger.error(err.message, `Bootstrap`);
        throw new HttpException(
          `Error checking folders for config files and templates`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          {
            cause: err.message,
          },
        );
      }
    });

    return true;
  }
}
