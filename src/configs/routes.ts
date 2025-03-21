export const SITE_PAGES = {
  HOME: "/",
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    VERIFY: "/auth/welcome",
    UPDATE_PASSWORD: "/auth/update-password",
    CODE_LOGIN: "/auth/code-login/:id",
  },
  ACCOUNT: "/account",
  TASKS: {
    LIST: "/tasks",
    VIEW: "/tasks/:id",
    CREATE: "/tasks/create",
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    CODE_LOGIN: {
      GET_VERIFIER: "/code-login/verifier",
      CREATE_INTENT: "/code-login/create-intent",
      SUCCESS: "/code-login/success/:id",
    },
  },
  ACCOUNT: {
    GET: "/users/account",
    UPDATE: "/users",
    CHECK_USERNAME_EXISTS: "/users/check-username-exists",
    VALIDATE_SOLANA_ADDRESS: "/users/validate-solana-address",
  },
  TASKS: {
    CREATE: "/tasks/create",
    GET_LIST: "/tasks",
    GET_FEATURED: "/tasks/featured",
    GET_BY_ID: "/tasks/:id",
    SETTLE: {
      SUCCESS: "/tasks/:id/success",
      FAIL: "/tasks/:id/fail",
    },
    FUNDING: {
      CREATE_INTENT: "/task-funds/create-intent/:id",
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
