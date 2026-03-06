import { z } from "zod";

export const regSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .min(3, { message: "Name must be at least 3 characters long" }),

    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address format" }),

    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must contain at least one special character (@$!%*?&)",
      }),

    repassword: z.string().min(1, { message: "Confirm Password is required" }),

    dateOfBirth: z
      .string()
      .date({
        required_error: "Date of birth is required",
        invalid_type_error: "That's not a date!",
      })
      .refine((date) => {
        const today = new Date().getFullYear();
        const ageYear = new Date(date).getFullYear();
        const eighteenYearsAgo = today - ageYear;

        return eighteenYearsAgo >= 18;
      }, "You must be at least 18 years old"),
    gender: z.string().min(1, { message: "Gender is required" }),
  })
  .refine((data) => data.password === data.repassword, {
    message: "Passwords do not match",
    path: ["repassword"],
  });

  export const signInSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address format" }),

    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must contain at least one special character (@$!%*?&)",
      }),
  })