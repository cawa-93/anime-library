interface HTMLElement {
  scrollIntoViewIfNeeded(): void
}

interface Error {
  name: string;
  message: string;
  stack?: string;
  cause?: string;
}

interface ErrorConstructor {
  new(message?: string, options: {cause?: string}): Error;
  (message?: string, options: {cause?: string}): Error;
  readonly prototype: Error;
}
