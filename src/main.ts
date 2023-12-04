import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import winston, { format, transports } from "winston";
import {
    utilities as nestWinstonModuleUtilities,
    WinstonModule,
} from "nest-winston";

async function bootstrap() {
    const winstonLogger = WinstonModule.createLogger({
        transports: [
            // let's log errors into its own file
            new transports.File({
                filename: `logs/error.log`,
                level: `error`,
                format: format.combine(format.timestamp(), format.json()),
            }),
            // logging all level
            new transports.File({
                filename: `logs/combined.log`,
                format: format.combine(format.timestamp(), format.json()),
                level: `silly`,
            }),
            // we also want to see logs in our console
            new transports.Console({
                level: `silly`,
                format: format.combine(
                    winston.format.timestamp(),
                    winston.format.ms(),
                    nestWinstonModuleUtilities.format.nestLike(`text2image`, {
                        colors: true,
                        prettyPrint: true,
                    }),
                ),
            }),
        ],
    });

    const app = await NestFactory.create(AppModule, { logger: winstonLogger });
    await app.listen(3000);
}
bootstrap();
