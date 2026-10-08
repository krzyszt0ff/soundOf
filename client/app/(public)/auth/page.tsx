import { Button } from "@/src/components/atoms/Button/Button";

export default function AuthPage() {
  return (
    <div className="">
      <main className="">
        <h1>Sounding</h1>
        <h2>to jak robisz nwm w sumie co</h2>
        <Button variant="primary" href={"/auth/login"}>Zaloguj sb</Button>
        <Button variant="secondary" href={"/auth/register"}>Zarejestruj sb</Button>
      </main>
    </div>
  );
}