import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'sonner';

const Register = () => {
    const [apiError, setApiError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const onFormSubmit = async (data) => {
        setApiError(null);
        try {
            await axios.post('/auth/register', data, { withCredentials: true });
            navigate('/auth/login');
            toast.success('Account created successfully! Please log in.');
        } catch (error) {
            console.error("API Error:", error);
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            setApiError(errorMessage);
        }
    };
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950 py-12">

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg md:p-8">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">
                    Create Your Account
                </h2>

                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    {apiError && (
                        <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-400">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* First Name & Last Name */}
                        <div className="flex flex-col gap-6 sm:flex-row">
                            <div className="w-full">
                                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-300">First Name</label>
                                <input
                                    id="firstName" type="text"
                                    className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.firstName ? 'border-red-500' : 'border-slate-600'}`}
                                    placeholder="John"
                                    {...register("fullName.firstName", { required: "First name is required" })}
                                />
                                {errors.firstName && <p className="mt-1.5 text-xs text-red-400">{errors.firstName.message}</p>}
                            </div>
                            <div className="w-full">
                                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-300">Last Name</label>
                                <input
                                    id="lastName" type="text"
                                    className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.lastName ? 'border-red-500' : 'border-slate-600'}`}
                                    placeholder="Doe"
                                    {...register("fullName.lastName", { required: "Last name is required" })}
                                />
                                {errors.lastName && <p className="mt-1.5 text-xs text-red-400">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
                            <input
                                id="email" type="email"
                                className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.email ? 'border-red-500' : 'border-slate-600'}`}
                                placeholder="you@example.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                                })}
                            />
                            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                            <input
                                id="password" type="password"
                                className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.password ? 'border-red-500' : 'border-slate-600'}`}
                                placeholder="••••••••"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters long" }
                                })}
                            />
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-8 w-full cursor-pointer rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105 hover:shadow-[0_0_20px_#4ade80] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <NavLink to="/auth/login" className="font-semibold text-green-400 hover:underline">
                        Login
                    </NavLink>
                </p>
            </div>
        </div>
    );
};
export default Register;