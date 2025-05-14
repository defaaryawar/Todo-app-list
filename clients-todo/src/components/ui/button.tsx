import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/utils";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm", // Biru keunguan yang modern
                destructive: "bg-red-700 text-white hover:bg-red-800 shadow-sm", // Merah yang kuat untuk tindakan berbahaya
                outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-800", // Abu-abu netral dengan efek hover halus
                secondary: "bg-teal-500 text-white hover:bg-teal-600 shadow-sm", // Hijau kebiruan yang segar
                ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900", // Teks abu-abu dengan latar belakang hover lembut
                link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700", // Biru cerah untuk tautan
                green: "bg-green-500 text-white hover:bg-green-600 shadow-sm",
                yellow: "bg-amber-500 text-black hover:bg-amber-600 shadow-sm", // Kuning keemasan yang menarik
                blue: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'green' | 'yellow' | 'blue';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    children?: ReactNode;
    icon?: ReactNode;
    asChild?: boolean;
    iconPosition?: 'left' | 'right';
    color?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'green' | 'yellow' | 'blue';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, icon, iconPosition = "left", children, color, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        const buttonContent = (
            <>
                {icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
                {children}
                {icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
            </>
        );

        return (
            <Comp
                className={cn(
                    buttonVariants({ variant: color || variant, size, className }),
                    "flex items-center justify-center"
                )}
                ref={ref}
                {...props}
            >
                {buttonContent}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };