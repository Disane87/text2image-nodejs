import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
    OnApplicationBootstrap,
} from "@nestjs/common";
import { Preset, Presets } from "src/interfaces/presets.interface";
import fs from "fs";
import path from "path";

@Injectable()
export class PresetService implements OnApplicationBootstrap {
    constructor(@Inject(`WORK_DIR`) private readonly workdir: string) {}

    private readonly presetPath = path.join(
        this.workdir,
        `config`,
        `presets.json`,
    );

    private readonly templatePath = path.join(
        this.workdir,
        `config`,
        `templates`,
    );

    private presets: Presets;

    public async onApplicationBootstrap() {
        this.presets = this.readPresets();
    }

    private readPresets(): Presets {
        const configPresets = fs.readFileSync(this.presetPath, `utf-8`);
        return JSON.parse(configPresets) as Presets;
    }

    public async getPreset(presetName: string): Promise<Preset> {
        const preset = this.presets[presetName];

        if (preset && !preset) {
            throw new HttpException(`Invalid preset`, HttpStatus.BAD_REQUEST);
        }

        return preset;
    }

    public async getPresetTemplateAsHtml(preset: Preset): Promise<string> {
        const sizes = preset.sizes;
        const headTemplate = fs.readFileSync(
            `${this.templatePath}/head.hbs`,
            `utf8`,
        );
        const templateContent = fs.readFileSync(
            `${this.templatePath}/${preset.template}`,
            `utf8`,
        );

        const htmlContent = `
        <html class="h-[${sizes.height}px] w-[${sizes.width}px]">
            <head>${headTemplate}</head>
            <body class="h-[${sizes.height}px] w-[${sizes.width}px]">${templateContent}</body>
        </html>
        `.replace(/\r?\n|\r/g, ``);

        Logger.debug(`HTML content: ${htmlContent}`, `HTML`);
        return htmlContent;
    }
}
