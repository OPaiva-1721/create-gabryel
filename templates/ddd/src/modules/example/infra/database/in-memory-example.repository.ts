import { Injectable } from "@nestjs/common";
import { Example } from "../../domain/entities/example.entity";
import { ExampleRepository } from "../../domain/repositories/example.repository";

@Injectable()
export class InMemoryExampleRepository extends ExampleRepository {
  private items = new Map<string, Example>();

  async findAll(): Promise<Example[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<Example | null> {
    return this.items.get(id) ?? null;
  }

  async save(example: Example): Promise<void> {
    this.items.set(example.id, example);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}
