import { GetAdminMeResponse } from "@workspace/api-zod";
import type { UserRow } from "./subscription-status";

export function buildAdminMeResponse(row: UserRow) {
  return GetAdminMeResponse.parse({
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role,
  });
}
