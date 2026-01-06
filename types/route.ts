export type Params<T extends Record<string, string>> = {
  params: Promise<T>;
};
