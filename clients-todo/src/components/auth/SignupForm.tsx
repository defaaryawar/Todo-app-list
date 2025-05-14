import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../hooks/useAuth";
import type { SignupCredentials } from "../../types/auth.types";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

const SignupForm = () => {
    const { signup, isSigningUp, signupError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupCredentials>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    const onSubmit = (data: SignupCredentials) => {
        signup(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                    Full Name
                </Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    {...register("name")}
                />
                {errors.name && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                    Email address
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                        Password
                    </Label>
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "Hide" : "Show"}
                    </Button>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 pr-10"
                        {...register("password")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300 font-medium">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 pr-10"
                        {...register("password_confirmation")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                {errors.password_confirmation && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                        {errors.password_confirmation.message}
                    </p>
                )}
            </div>

            {signupError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800">
                    {signupError instanceof Error
                        ? signupError.message
                        : "Signup failed. Please try again."}
                </div>
            )}

            <div className="pt-2">
                <Button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-gray-800"
                    disabled={isSigningUp}
                >
                    {isSigningUp ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                        </span>
                    ) : (
                        "Create account"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default SignupForm;