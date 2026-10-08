// THIS MIGHT GET CHANGED IN THE FUTURE
// POLYMORPHISM I HATE YOUUUU

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./button.module.css";

type CommonProps = {
    variant?: "primary" | "secondary" | "destructive";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
};

type ButtonAsButton = CommonProps & 
    Omit<ComponentPropsWithoutRef<"button">, "className" | "disabled"> & {
        href?: undefined;
    };

type ButtonAsLink = CommonProps &
    Omit<ComponentPropsWithoutRef<typeof Link>, "className">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
    variant = "primary",
    size = "md",
    className,
    disabled,
    ...props
}: ButtonProps) {
    const classes = [styles.btn, styles[variant], styles[size], className].filter(Boolean).join(" ");

    if (props.href !== undefined) {
        return (
            <Link
            {...props}
            className={classes}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : props.tabIndex}
            />
        );
    }

    const { type = "button", ...rest } = props;
    return <button {...rest} type={type} disabled={disabled} className={classes} />;
}