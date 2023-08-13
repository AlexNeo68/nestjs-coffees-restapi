import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Arabika',
      brand: 'Brazil',
      flavors: ['Zerno', 'Choco'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findOne(id: number) {
    const coffee = this.coffees.find((c) => c.id === id);
    if (!coffee) throw new NotFoundException(`Coffee whith id ${id} not found`);
    return coffee;
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
    return this.coffees;
  }

  update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const coffeeIndex = this.coffees.findIndex((c) => c.id === id);
    if (coffeeIndex === -1) {
      throw new NotFoundException(`Coffee whith id ${id} not found`);
    }
    this.coffees[coffeeIndex] = {
      ...this.coffees[coffeeIndex],
      ...updateCoffeeDto,
    };
    return this.coffees[coffeeIndex];
  }

  remove(id: number) {
    this.coffees = this.coffees.filter((c) => c.id !== id);
    return this.coffees;
  }
}
