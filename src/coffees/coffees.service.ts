import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.constant';

@Injectable()
export class CoffeesService {
  private logger = new Logger(CoffeesService.name);
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeesRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorsRepository: Repository<Flavor>,
    private readonly connection: Connection,
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
  ) {
    console.log(coffeeBrands);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeesRepository.find({
      relations: ['flavors'],
      take: limit,
      skip: offset,
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

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recomendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavor(name: string): Promise<Flavor> {
    this.logger.debug(`Name of flavor = ${name}`);
    const existingFlavor = await this.flavorsRepository.findOneBy({ name });
    if (existingFlavor) return existingFlavor;
    const flavor = this.flavorsRepository.create({ name });
    return await this.flavorsRepository.save(flavor);
  }
}
