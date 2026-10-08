import { Button } from "@/src/components/atoms/Button/Button";
import { logout } from "@/src/actions/auth";

export default async function Hub() {
    return (
        <div>
            Hejka, to hub, mozesz sie tu wylogowac jak chcesz ogolem.
            <form action={logout}>
                <Button type="submit">Wyloguj</Button>
            </form>
        </div>
    );
}