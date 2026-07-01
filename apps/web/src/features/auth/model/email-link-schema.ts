import { z } from "zod";

export const emailLinkSchema = z.object({
  email: z.string().email()
});

export type EmailLinkInput = z.infer<typeof emailLinkSchema>;
