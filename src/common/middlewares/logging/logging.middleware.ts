import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.time('Время запроса-ответа');
    res.on('finish', () => console.timeEnd('Время запроса-ответа'));
    next();
  }
}
