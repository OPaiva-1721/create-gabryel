import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateExampleUseCase } from "../../../application/use-cases/create-example.use-case";
import { ExampleRepository } from "../../../domain/repositories/example.repository";

@Controller("examples")
export class ExampleController {
  constructor(
    private readonly createExample: CreateExampleUseCase,
    private readonly exampleRepository: ExampleRepository,
  ) {}

  @Get()
  async findAll() {
    const items = await this.exampleRepository.findAll();
    return items.map((e) => ({ id: e.id, name: e.name, createdAt: e.createdAt }));
  }

  @Post()
  async create(@Body() body: { name: string }) {
    return this.createExample.execute({ name: body.name });
  }
}
