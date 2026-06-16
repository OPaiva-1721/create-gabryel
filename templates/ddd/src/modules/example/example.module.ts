import { Module } from "@nestjs/common";
import { ExampleController } from "./infra/http/controllers/example.controller";
import { CreateExampleUseCase } from "./application/use-cases/create-example.use-case";
import { ExampleRepository } from "./domain/repositories/example.repository";
import { InMemoryExampleRepository } from "./infra/database/in-memory-example.repository";

@Module({
  controllers: [ExampleController],
  providers: [
    CreateExampleUseCase,
    { provide: ExampleRepository, useClass: InMemoryExampleRepository },
  ],
})
export class ExampleModule {}
