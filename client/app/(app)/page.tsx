import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Hub from "./hub/page";

export default async function Home() {
  const session = (await cookies()).get("token");
  if (!session) {
    redirect("/auth");
  }

  return (
    <Hub/>
  )
}
