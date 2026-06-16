import { Injectable } from "@nestjs/common";
import { ExampleRepository } from "../../domain/repositories/example.repository";
import { Example } from "../../domain/entities/example.entity";

export interface CreateExampleDto {
  name: string;
}

@Injectable()
export class CreateExampleUseCase {
  constructor(private readonly exampleRepository: ExampleRepository) {}

  async execute(dto: CreateExampleDto): Promise<{ id: string }> {
    const example = Example.create({ name: dto.name });
    await this.exampleRepository.save(example);
    return { id: example.id };
  }
}
