import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  passphrase: z.string().min(8)
});

export const signUpSchema = signInSchema.extend({
  displayName: z.string().min(2).max(80)
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
