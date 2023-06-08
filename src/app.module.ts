import { MiddlewareConsumer, NestModule, BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, RouterModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import type { ValidationError } from 'class-validator';

import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MongoDbConfig } from './config/mongo.config';
import { SectionModule } from './modules/section/section.module';
import { SubsectionModule } from './modules/subsection/subsection.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { WebscraperModule } from './modules/webscraper/webscraper.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(), // Database
    // https://docs.nestjs.com/techniques/database

    MongooseModule.forRoot(MongoDbConfig.MONGO_DB_URL),
    // Service Modules
    CommonModule, // Global

    // Module Router
    // https://docs.nestjs.com/recipes/router-module
    RouterModule.register([]), SectionModule, SubsectionModule, TracksModule, WebscraperModule,

  ],
  providers: [
    // Global Guard, Authentication check on all routers
    // { provide: APP_GUARD, useClass: AuthenticatedGuard },
    // Global Filter, Exception check
    // { provide: APP_FILTER, useClass: ExceptionsFilter },
    // Global Pipe, Validation check
    // https://docs.nestjs.com/pipes#global-scoped-pipes
    // https://docs.nestjs.com/techniques/validation
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        // disableErrorMessages: true,
        transform: true,
        whitelist: true,
        exceptionFactory: (errors: ValidationError[]): BadRequestException => new BadRequestException(errors),
      }),
    },
  ],
})
export class AppModule implements NestModule {
  // Global Middleware, Inbound logging
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
