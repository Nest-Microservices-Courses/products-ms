import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger: Logger = new Logger(ProductsService.name);
  onModuleInit() {
    this.$connect();
    this.logger.log(`Database Connected`);
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        page,
        total: totalPages,
        lastPage,
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id }});

    if(!product) {
      throw new NotFoundException(`The Product with the id: ${id} not found`)
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    return this.product.update({
      where: { id, available: true },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    /* return this.product.delete({
      where: {id}
    }); */
    const product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    })
    return product;
  }
}
