import { DefaultConfigService } from "./services/default-config.service";
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ImageService } from "./services/image.service";
import { PresetService } from "./services/preset/preset.service";
import { ApiKeyMiddleware } from "./middlewares/api-key/api-key.middleware";
import { AuditMiddleware } from "./middlewares/audit/audit.middleware";
import { HttpModule } from "@nestjs/axios";
import { ImageController } from "./controllers/image/image.controller";
import path from "path";

@Module({
  imports: [HttpModule],
  controllers: [ImageController],
  providers: [
    DefaultConfigService,
    ImageService,
    PresetService,
    {
      provide: `WORK_DIR`,
      useFactory: async () => {
        const workdir = path.join(process.cwd(), `.`);
        return workdir;
      },
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const middleWares = [
      process.env.NODE_ENV == `development` ? null : ApiKeyMiddleware,
      AuditMiddleware,
    ];
    consumer.apply(...middleWares).forRoutes(`*`);
  }
}
