export type ChildrenProps = Readonly<{ children: React.ReactNode }>;

export type ActionState = {
  error?: string;
};

export type FormAction<TState extends object = ActionState> = (
  prevState: TState,
  formData: FormData,
) => Promise<TState>;
