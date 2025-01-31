import { z } from "zod";

import { FORM_LIMITS } from "@/configs/constants";

export const taskCreationFormSchema = z.object({
  title: z
    .string()
    .min(FORM_LIMITS.TASK_CREATION.TITLE.MIN, {
      message: `Title must be at least ${FORM_LIMITS.TASK_CREATION.TITLE.MIN} characters`,
    })
    .max(FORM_LIMITS.TASK_CREATION.TITLE.MAX, {
      message: `Title must be less than ${FORM_LIMITS.TASK_CREATION.TITLE.MAX} characters`,
    }),
  description: z.string().max(FORM_LIMITS.TASK_CREATION.DESCRIPTION.MAX, {
    message: `Description must be less than ${FORM_LIMITS.TASK_CREATION.DESCRIPTION.MAX} characters`,
  }),
  maxWinners: z.number(),
  endedAt: z.string().datetime(),
});

export const solutionFormSchema = z.object({
  title: z
    .string()
    .min(FORM_LIMITS.TASK_SOLUTION.TITLE.MIN, {
      message: `Title must be at least ${FORM_LIMITS.TASK_SOLUTION.TITLE.MIN} characters`,
    })
    .max(FORM_LIMITS.TASK_SOLUTION.TITLE.MAX, {
      message: `Title must be less than ${FORM_LIMITS.TASK_SOLUTION.TITLE.MAX} characters`,
    }),
  description: z
    .string()
    .min(FORM_LIMITS.TASK_SOLUTION.DESCRIPTION.MIN, {
      message: `Description must be at least ${FORM_LIMITS.TASK_SOLUTION.DESCRIPTION.MIN} characters`,
    })
    .max(FORM_LIMITS.TASK_SOLUTION.DESCRIPTION.MAX, {
      message: `Description must be less than ${FORM_LIMITS.TASK_SOLUTION.DESCRIPTION.MAX} characters`,
    }),
});

export const updateUserProfileSchema = z.object({
  username: z
    .string()
    .min(FORM_LIMITS.ACCOUNT.USERNAME.MIN, {
      message: `Username must be at least ${FORM_LIMITS.ACCOUNT.USERNAME.MIN} characters`,
    })
    .max(FORM_LIMITS.ACCOUNT.USERNAME.MAX, {
      message: `Username must be less than ${FORM_LIMITS.ACCOUNT.USERNAME.MAX} characters`,
    })
    .refine((value) => /^[a-zA-Z0-9_.]+$/.test(value), {
      message: "Username can only contain letters, numbers, _ , and .",
    })
    .refine((value) => /^[a-zA-Z].*$/.test(value), {
      message: "Username must start with a letter.",
    })
    .refine((value) => /^.*[a-zA-Z0-9]$/.test(value), {
      message: "Username must end with a letter or number.",
    }),
  depositAddress: z.string(),
});
