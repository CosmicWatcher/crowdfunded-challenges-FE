export const FORM_LIMITS = {
  TASK_CREATION: {
    TITLE: { MIN: 3, MAX: 200 },
    DESCRIPTION: { MAX: 20000 },
    MAX_WINNERS: { MIN: 1, MAX: 10 },
  },
  TASK_SOLUTION: {
    TITLE: { MIN: 3, MAX: 200 },
    DESCRIPTION: { MIN: 50, MAX: 10000 },
  },
} as const;

export const NO_USERNAME = "No-Name";
