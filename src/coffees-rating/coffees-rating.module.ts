import { Module } from '@nestjs/common';
import { CoffeesModule } from 'src/coffees/coffees.module';
import { CoffeesRatingService } from './coffees-rating.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    CoffeesModule,
    DatabaseModule.register({
      type: 'postgres',
      host: 'localhost',
      username: 'postgres',
      password: '',
      database: 'coffees',
      port: 5432,
    }),
  ],
  providers: [CoffeesRatingService],
})
export class CoffeesRatingModule {}
