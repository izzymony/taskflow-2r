import z from "zod";
export const registerSchema = z.object({
  body: z.object({
    fullname: z.string().min(2, "Full name must be at least 2 characters long"),
    email: z.string().email("Please provide a valid email structure"),
    password: z.string().min(8, "Password must contain at least 8 elements"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid credential format"),
    password: z.string().min(1, "Password requirement cannot be empty"),
  }),
});
