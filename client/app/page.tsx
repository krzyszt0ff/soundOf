import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = (await cookies()).get("token");
  if (!session) {
    redirect("/auth");
  }

  return (
    <main>
      TBA: Hub for logged in users
    </main>
  )
}
