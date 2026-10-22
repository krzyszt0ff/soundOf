"use client";

import { logout } from "@/src/actions/auth";
import { Field } from "../../molecules/Field/Field";

export function LoginForm(){

    return (
        <form action={logout}>
            <Field label="E-mail" error="none">
                <input type="email" name="email" required/>
            </Field>
        </form>
    );
}