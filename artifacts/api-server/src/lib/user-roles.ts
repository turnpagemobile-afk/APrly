export const USER_ROLE = "user" as const;
export const ADMIN_ROLE = "admin" as const;

export type AppUserRole = typeof USER_ROLE | typeof ADMIN_ROLE;
