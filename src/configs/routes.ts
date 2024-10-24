export const SITE_PAGES = {
  HOME: "/",
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  TASKS: "/tasks",
  VIEW_TASK: "/tasks/:id",
  CREATE_TASK: "/tasks/create",
} as const;

export const API_ROUTES = {
  TASKS: {
    CREATE: "/tasks/create",
    GET_LIST: "/tasks",
    GET_BY_ID: "/tasks/:id",
  },
};
