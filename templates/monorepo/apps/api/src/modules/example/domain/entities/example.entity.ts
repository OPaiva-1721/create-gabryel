import { Entity } from "../../../../shared/domain/entity.base";

export interface ExampleProps {
  name: string;
  createdAt: Date;
}

export class Example extends Entity<ExampleProps> {
  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(props: Omit<ExampleProps, "createdAt">, id?: string): Example {
    return new Example(
      {
        ...props,
        createdAt: new Date(),
      },
      id
    );
  }
}
