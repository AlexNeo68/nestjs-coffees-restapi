import { Module, Scope } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constant';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    ConfigService,
    {
      provide: COFFEE_BRANDS,
      useFactory: async (connection: Connection): Promise<string[]> => {
        const brands = await Promise.resolve(['milagro', 'grand']);
        return brands;
      },
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [CoffeesService],
})
export class CoffeesModule {}
