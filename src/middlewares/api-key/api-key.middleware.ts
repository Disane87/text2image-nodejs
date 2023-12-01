import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestMiddleware,
} from "@nestjs/common";

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
    constructor() {
        Logger.log(`🔑 API key middleware enabled`, `Auth`);
    }
    use(req: any, res: any, next: () => void) {
        const apiKeyQS = req.query.apiKey;
        const apiKeyEnv = process.env.API_KEY;

        if (apiKeyQS !== apiKeyEnv) {
            // res
            //   .status(402)
            //   .send('⚠️ Invalid API key. Please provide a valid API key. ');
            throw new HttpException(`⚠️ Invalid API key`, HttpStatus.FORBIDDEN);
        }
        next();
    }
}
