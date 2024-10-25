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
});

export const submissionFormSchema = z.object({
  description: z
    .string()
    .min(FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MIN, {
      message: `Description must at least ${FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MIN} characters`,
    })
    .max(FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MAX, {
      message: `Description must be less than ${FORM_LIMITS.TASK_SUBMISSION.DESCRIPTION.MAX} characters`,
    }),
});
