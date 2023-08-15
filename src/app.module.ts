import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeesRatingModule } from './coffees-rating/coffees-rating.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_HOST: Joi.required(),
        DB_PORT: Joi.number().default(5432),
      }),
    }),
    CoffeesModule,

    CoffeesRatingModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
