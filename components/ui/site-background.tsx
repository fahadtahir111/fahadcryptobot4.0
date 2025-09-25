"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function FloatingShape({
	className,
	delay = 0,
	width = 400,
	height = 100,
	rotate = 0,
	gradient = "from-white/[0.08]",
}: {
	className?: string;
	delay?: number;
	width?: number;
	height?: number;
	rotate?: number;
	gradient?: string;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
			animate={{ opacity: 1, y: 0, rotate }}
			transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
			className={cn("absolute", className)}
		>
			<motion.div
				animate={{ y: [0, 15, 0] }}
				transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				style={{ width, height }}
				className="relative"
			>
				<div
					className={cn(
						"absolute inset-0 rounded-full",
						"bg-gradient-to-r to-transparent",
						gradient,
						"backdrop-blur-[2px] border-2 border-white/[0.15]",
						"shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
						"after:absolute after:inset-0 after:rounded-full",
						"after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
					)}
				/>
			</motion.div>
		</motion.div>
	);
}

export function SiteBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden bg-[#030303]">
			{/* Base gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />
			<div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.03] via-transparent to-cyan-500/[0.03] blur-2xl" />
			
			{/* Floating shapes layer */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Large shapes */}
				<FloatingShape delay={0.3} width={600} height={140} rotate={12} gradient="from-indigo-500/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
				<FloatingShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-rose-500/[0.15]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
				<FloatingShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-violet-500/[0.15]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
				<FloatingShape delay={0.6} width={200} height={60} rotate={20} gradient="from-amber-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
				<FloatingShape delay={0.7} width={150} height={40} rotate={-25} gradient="from-cyan-500/[0.15]" className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]" />
				
				{/* Additional medium shapes */}
				<FloatingShape delay={0.8} width={350} height={90} rotate={35} gradient="from-emerald-500/[0.12]" className="left-[60%] md:left-[65%] top-[25%] md:top-[30%]" />
				<FloatingShape delay={0.9} width={280} height={70} rotate={-40} gradient="from-orange-500/[0.12]" className="right-[30%] md:right-[35%] top-[45%] md:top-[50%]" />
				<FloatingShape delay={1.0} width={400} height={100} rotate={55} gradient="from-pink-500/[0.12]" className="left-[40%] md:left-[45%] bottom-[20%] md:bottom-[25%]" />
				
				{/* Small accent shapes */}
				<FloatingShape delay={1.1} width={120} height={30} rotate={-60} gradient="from-blue-500/[0.1]" className="left-[80%] md:left-[85%] top-[60%] md:top-[65%]" />
				<FloatingShape delay={1.2} width={180} height={45} rotate={70} gradient="from-green-500/[0.1]" className="right-[70%] md:right-[75%] top-[35%] md:top-[40%]" />
				<FloatingShape delay={1.3} width={160} height={40} rotate={-30} gradient="from-yellow-500/[0.1]" className="left-[15%] md:left-[20%] top-[60%] md:top-[65%]" />
				<FloatingShape delay={1.4} width={140} height={35} rotate={45} gradient="from-red-500/[0.1]" className="right-[50%] md:right-[55%] bottom-[40%] md:bottom-[45%]" />
				
				{/* Extra small floating particles */}
				<FloatingShape delay={1.5} width={80} height={20} rotate={-80} gradient="from-purple-500/[0.08]" className="left-[70%] md:left-[75%] top-[80%] md:top-[85%]" />
				<FloatingShape delay={1.6} width={100} height={25} rotate={85} gradient="from-teal-500/[0.08]" className="right-[10%] md:right-[15%] top-[40%] md:top-[45%]" />
				<FloatingShape delay={1.7} width={90} height={22} rotate={-50} gradient="from-indigo-500/[0.08]" className="left-[50%] md:left-[55%] top-[15%] md:top-[20%]" />
			</div>
			
			{/* Subtle grid pattern overlay */}
			<div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
			
			{/* Final gradient overlay for depth */}
			<div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
		</div>
	);
}
