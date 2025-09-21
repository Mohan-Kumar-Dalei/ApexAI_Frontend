import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'sonner';

const Login = () => {
    const [apiError, setApiError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();
    const onFormSubmit = async (data) => {
        setApiError(null);
        try {
            await axios.post('/auth/login', data, {
                withCredentials: true
            });
            navigate('/api/chat-panel');
            toast.success('Login successful!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            setApiError(errorMessage);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-950">


            <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 shadow-2xl backdrop-blur-lg md:p-8">
                <h2 className="mb-6 text-center text-3xl font-bold text-white">
                    Login to Apex AI
                </h2>

                <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
                    {apiError && (
                        <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-400">
                            {apiError}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 transition-colors duration-300 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.email ? 'border-red-500' : 'border-slate-600'}`}
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                            </div>
                            <input
                                id="password"
                                type="password"
                                className={`w-full rounded-lg border bg-slate-900/70 px-4 py-3 text-white placeholder-slate-500 transition-colors duration-300 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400 ${errors.password ? 'border-red-500' : 'border-slate-600'}`}
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
                        className="mt-8 w-full rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105 hover:shadow-[0_0_20px_#4ade80] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Don't have an account?{" "}
                    <NavLink to="/auth/register" className="font-semibold text-green-400 hover:underline">
                        Sign Up
                    </NavLink>
                </p>
            </div>
        </div>
    );
};

export default Login;