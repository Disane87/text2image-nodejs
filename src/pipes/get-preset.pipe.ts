// parse-token.pipe.ts
import { Injectable, PipeTransform } from "@nestjs/common";
import { Preset } from "src/interfaces/presets.interface";
import { PresetService } from "src/services/preset/preset.service";

@Injectable()
export class GetPresetPipe implements PipeTransform {
  // inject any dependency
  constructor(private presetService: PresetService) {}

  async transform(value: string): Promise<Preset> {
    return this.presetService.getPreset(value);
  }
}
