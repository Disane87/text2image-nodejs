import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// import { GetPresetHtmlPipe } from "src/pipes/get-preset.html.pipe";
import { GetPresetPipe } from "src/pipes/get-preset.pipe";

const getPreset = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return await request.params.preset;
    },
);

export const Preset = (additionalOptions?: any) => {
    return getPreset(additionalOptions, GetPresetPipe);
};
