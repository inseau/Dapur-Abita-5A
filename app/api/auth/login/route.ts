import { apiError, assertSameOrigin, createSession, verifyPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { account_role } from "@/app/generated/prisma/enums";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Data masuk tidak valid.", 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("username" in body) ||
    !("password" in body) ||
    !("role" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string" ||
    typeof body.role !== "string" ||
    !Object.values(account_role).some((role) => role === body.role)
  ) {
    return apiError("Username, password, dan jenis akun wajib diisi.", 400);
  }
  if (body.username.length > 50 || body.password.length > 128) {
    return apiError("Username atau password tidak valid.", 400);
  }

  const account = await getPrismaClient().account.findUnique({
    where: { username: body.username.trim().toLowerCase() },
    select: { id_account: true, password_hash: true, role: true },
  });
  const passwordIsValid = account
    ? await verifyPassword(body.password, account.password_hash)
    : false;
  if (
    !account ||
    !passwordIsValid ||
    account.role !== body.role
  ) {
    return apiError("Username atau password salah.", 401);
  }

  await createSession(account.id_account);
  return Response.json(
    { role: account.role },
    { headers: { "Cache-Control": "no-store" } },
  );
}
