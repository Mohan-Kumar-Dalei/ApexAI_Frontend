import React, { useLayoutEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { gsap } from 'gsap';

const Home = () => {
    const glowRef = useRef(null);
    const contentRef = useRef(null);
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            tl.from(glowRef.current, {
                opacity: 0,
                duration: 2.5,
                ease: 'power3.inOut',
            });
            tl.from(['.title', '.subtitle', '.buttons'], {
                opacity: 0,
                filter: 'blur(12px)',
                y: 30, 
                duration: 1,
                stagger: 0.2, 
                ease: 'power2.out',
            }, "-=2"); 
        }, contentRef); 

        return () => ctx.revert();
    }, []);


    return (
        <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4" ref={contentRef}>
            {/* --- Glowing Arc Background --- */}
            <div className="absolute inset-0 z-0" ref={glowRef}>
                {/* Mobile Glow */}
                <div className="block sm:hidden">
                    <div className="absolute inset-[-100%] animate-spin-slow blur-[100px]" style={{ background: `conic-gradient(from 0deg at 50% 0%, #06b6d4 0%, #3b82f6 50%, #10b981 100%)`, opacity: '0.25' }}></div>
                    <div className="absolute inset-0 blur-[60px] scale-[1.3]" style={{ background: `radial-gradient(circle at 50% 0%, white 30%, #ec4899 30%, transparent 40%)`, opacity: '1' }}></div>
                </div>
                {/* Desktop Glow */}
                <div className="hidden sm:block">
                    <div className="absolute inset-[-100%] animate-spin-slow blur-[150px]" style={{ background: `conic-gradient(from 180deg at 50% 100%, #06b6d4 0%, #3b82f6 50%, #10b981 100%)`, opacity: '0.10' }}></div>
                    <div className="absolute inset-0 blur-[100px] scale-[1.9]" style={{ background: `radial-gradient(circle at 50% 100%, white 30%, #ec4899 30%, transparent 40%)`, opacity: '1' }}></div>
                </div>
            </div>

            {/* --- Content --- */}
            <div className="relative z-10 text-center">
                {/* Added "title" class for GSAP targeting */}
                <h1 className="title text-6xl font-bold bg-gradient-to-t from-slate-400 to-white bg-clip-text text-transparent md:text-8xl">
                    Apex AI
                </h1>

                {/* Added "subtitle" class for GSAP targeting */}
                <p className="subtitle mx-auto mt-6 max-w-xl text-lg text-slate-300">
                    Your personal AI companion. Get started by logging in or creating a new account.
                </p>

                {/* Added "buttons" class for GSAP targeting */}
                <div className="buttons mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <NavLink to="/auth/login" className="w-full sm:w-auto rounded-full bg-green-500 px-8 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105 hover:shadow-[0_0_20px_#4ade80] active:scale-95">
                        Login
                    </NavLink>
                    <NavLink to="/auth/register" className="w-full sm:w-auto rounded-full border border-slate-700 bg-slate-950/50 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:border-slate-500 hover:text-slate-200">
                        Sign Up
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Home;