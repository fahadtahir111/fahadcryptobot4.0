"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import Link from "next/link";

function Header1() {
    const navigationItems = [
        {
            title: "Features",
            href: "#features",
        },
        {
            title: "How It Works",
            href: "#how-it-works",
        },
        {
            title: "Pricing",
            href: "#pricing",
        },
        {
            title: "Reviews",
            href: "#reviews",
        },
    ];

    const [isOpen, setOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId.replace('#', ''));
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setOpen(false);
    };

    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-black/80 backdrop-blur-md border-b border-gray-800">
            <div className="container relative mx-auto min-h-16 md:min-h-20 flex gap-2 md:gap-4 flex-row lg:grid lg:grid-cols-3 items-center px-4">
                <div className="justify-start items-center gap-2 md:gap-4 lg:flex hidden flex-row">
                    <nav className="flex justify-start items-start">
                        <ul className="flex justify-start gap-2 md:gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <li key={item.title}>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => scrollToSection(item.href)}
                                        className="text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm md:text-base px-2 md:px-4"
                                    >
                                        {item.title}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="flex lg:justify-center">
                    <Link href="/" className="font-semibold text-white text-lg md:text-xl">
                        SignalX
                    </Link>
                </div>
                <div className="flex justify-end w-full gap-2 md:gap-4">
                    <Button 
                        variant="ghost" 
                        className="hidden sm:inline text-gray-300 hover:text-white hover:bg-gray-800/50 text-sm md:text-base px-2 md:px-4"
                        onClick={() => { setAuthMode('login'); setAuthOpen(true); }}
                    >
                        Sign In
                    </Button>
                    <div className="border-r border-gray-700 hidden sm:inline"></div>
                    <Button 
                        className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white text-sm md:text-base px-3 md:px-6"
                        onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
                    >
                        Get Started
                    </Button>
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-16 md:top-20 left-0 right-0 border-t border-gray-800 flex flex-col w-full bg-black/95 backdrop-blur-md shadow-lg py-4 px-4 gap-2">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.title}
                                    variant="ghost"
                                    onClick={() => scrollToSection(item.href)}
                                    className="justify-start text-gray-300 hover:text-white hover:bg-gray-800/50 text-left"
                                >
                                    {item.title}
                                </Button>
                            ))}
                            <div className="border-t border-gray-800 pt-4 mt-2 space-y-2">
                                <Button 
                                    variant="ghost" 
                                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800/50"
                                    onClick={() => { setAuthMode('login'); setAuthOpen(true); }}
                                >
                                    Sign In
                                </Button>
                                <Button 
                                    className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white"
                                    onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
                                >
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
            </div>
        </header>
    );
}

export { Header1 };
