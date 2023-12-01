import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

@Injectable()
export class AuditMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const { ip, hostname, query } = req;
        Logger.debug(
            `Request received: [${ip} | ${hostname}] ${JSON.stringify(query)}`,
            `Request`,
        );
        // Logger.debug(`Response: ${JSON.stringify(res)}`, "Response");
        next();
    }
}
