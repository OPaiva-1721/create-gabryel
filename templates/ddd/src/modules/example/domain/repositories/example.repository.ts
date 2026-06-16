import { Example } from "../entities/example.entity";

export abstract class ExampleRepository {
  abstract findAll(): Promise<Example[]>;
  abstract findById(id: string): Promise<Example | null>;
  abstract save(example: Example): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
