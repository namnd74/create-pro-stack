'use server';

import { loginSchema, type LoginFormData } from '../schemas/auth.schema';

export interface ActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData: LoginFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    rememberMe: formData.get('rememberMe') === 'true',
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: 'Invalid input data',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Process server-side authentication logic here
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Successfully authenticated via Server Action!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Authentication failed',
    };
  }
}
