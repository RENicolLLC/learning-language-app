import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getRequiredUserEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  return email ?? null;
}
