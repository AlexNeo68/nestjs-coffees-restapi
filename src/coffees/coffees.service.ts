import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';

@Injectable()
export class CoffeesService {
  private logger = new Logger(CoffeesService.name);
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeesRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorsRepository: Repository<Flavor>,
  ) {}

  findAll() {
    return this.coffeesRepository.find({
      relations: ['flavors'],
    });
  }

  async findOne(id: number) {
    const coffee = this.coffeesRepository.findOne({
      where: { id },
      relations: ['flavors'],
    });
    if (!coffee) throw new NotFoundException(`Coffee whith id ${id} not found`);
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((flavorName) =>
        this.preloadFlavor(flavorName),
      ),
    );
    this.logger.debug(flavors);
    const coffee = this.coffeesRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    return this.coffeesRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((flavorName) =>
          this.preloadFlavor(flavorName),
        ),
      ));
    const coffee = await this.coffeesRepository.preload({
      id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee whith id ${id} not found`);
    }
    return this.coffeesRepository.save(coffee);
  }

  async remove(id: number) {
    const coffee = await this.findOne(id);
    if (!coffee) throw new NotFoundException(`Coffee whith id ${id} not found`);
    return this.coffeesRepository.remove(coffee);
  }

  private async preloadFlavor(name: string): Promise<Flavor> {
    this.logger.debug(`Name of flavor = ${name}`);
    const existingFlavor = await this.flavorsRepository.findOneBy({ name });
    if (existingFlavor) return existingFlavor;
    const flavor = this.flavorsRepository.create({ name });
    return await this.flavorsRepository.save(flavor);
  }
}
