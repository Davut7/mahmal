import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './utils/sentry.filter';
import CustomLogger from './logger/helpers/customLogger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme } from 'swagger-themes';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['log', 'debug', 'error', 'warn'],
  });

  const config = new DocumentBuilder()
    .setTitle('Mahmal server')
    .setDescription('Mahmal server api documentation')
    .setVersion('1.0')
    .addTag('Mahmal')
    .addServer('/api')
    .addBearerAuth()
    .build();

  const theme = new SwaggerTheme('v3');

  const optionsV1 = {
    explorer: true,
    useGlobalPrefix: true,
    // customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK)
  };

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/docs', app, document, optionsV1);

  const port = process.env.PORT;
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin: '*',
  });
  app.use(cookieParser(`${process.env.COOKIE_SECRET}`));
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  Sentry.init({
    dsn: process.env.SENTRY_DNS,
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  await app.listen(port, () => {
    console.log(`Your server is listening on port ${port}`);
  });
  app.useLogger(app.get(CustomLogger));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
