export type ChildrenProps = Readonly<{ children: React.ReactNode }>;

export type AppointmentFormError = {
  patient: string[];
  date: string[];
  teeth: string[];
};

export type OperationFormError = {
  name: string[];
  price: string[];
};

export type ActionState<TError> = {
  error?: TError;
  message?: string;
};

export type FormAction<TState> = (
  prevState: TState,
  formData: FormData,
) => Promise<TState> | TState;

export type CreateOperationState = ActionState<OperationFormError>;
export type CreateAppointmentState = ActionState<AppointmentFormError>;
