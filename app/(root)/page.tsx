import { auth } from "@/auth";
import MainClient from "./MainClient";

export default async function Main() {
  const session = await auth();

  return <MainClient session={session} />;
}
