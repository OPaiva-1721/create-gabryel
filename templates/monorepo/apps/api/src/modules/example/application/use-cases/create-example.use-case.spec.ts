import { CreateExampleUseCase } from "./create-example.use-case";
import { InMemoryExampleRepository } from "../../infra/database/in-memory-example.repository";

describe("CreateExampleUseCase", () => {
  it("creates an example and persists it in the repository", async () => {
    const repository = new InMemoryExampleRepository();
    const useCase = new CreateExampleUseCase(repository);

    const result = await useCase.execute({ name: "Test Example" });

    expect(result.id).toBeDefined();
    const saved = await repository.findById(result.id);
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("Test Example");
  });
});
