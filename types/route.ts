export type Params<T extends Record<string, unknown>> = {
  params: Promise<T>;
};
