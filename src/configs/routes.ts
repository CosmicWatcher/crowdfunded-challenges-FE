export const SITE_PAGES = {
  HOME: "/",
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    VERIFY: "/auth/welcome",
  },
  ACCOUNT: "/account",
  TASKS: {
    LIST: "/tasks",
    VIEW: "/tasks/:id",
    CREATE: "/tasks/create",
  },
} as const;

export const API_ROUTES = {
  ACCOUNT: {
    GET: "/users/account",
    UPDATE: "/users",
    CHECK_USERNAME_EXISTS: "/users/check-username-exists",
  },
  TASKS: {
    CREATE: "/tasks/create",
    GET_LIST: "/tasks",
    GET_FEATURED: "/tasks/featured",
    GET_BY_ID: "/tasks/:id",
    END: {
      SUCCESS: "/tasks/:id/success",
      FAIL: "/tasks/:id/fail",
    },
  },
  SOLUTIONS: {
    CREATE: "/solutions/create",
    GET_LIST: "/solutions/:taskId",
  },
  SOLUTION_VOTES: {
    GET_DETAILS: "/solution-votes/details/:solutionId",
    RECORD: "/solution-votes/record",
  },
} as const;
