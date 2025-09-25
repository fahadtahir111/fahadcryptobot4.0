"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FeatureSteps } from "@/components/ui/feature-section";
import { Features } from "@/components/ui/features-8";
import Image from "next/image";
import { ScrollVelocity } from "@/components/ui/scroll-velocity";
import { Bitcoin, LineChart, Shield, Zap, Globe, TrendingUp, Users, Brain, Target } from "lucide-react";

export function HeroScrollDemo() {
	return (
		<div className="flex flex-col overflow-hidden pb-16 md:pb-32 pt-16 md:pt-32">
			<ContainerScroll
				titleComponent={
					<>
						<h1 className="text-2xl sm:text-3xl md:text-6xl font-bold text-black dark:text-white leading-tight px-4">
							SignalX AI — Smart Crypto Signals
						</h1>
						<p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto px-4">
							Upload your chart and let our AI detect patterns, momentum shifts, and optimal entry/exit levels. Real-time insights. Risk-aware execution.
						</p>
					</>
				}
			>
				<Image
					src="/assets/hero.png"
					alt="SignalX AI Crypto Bot"
					height={720}
					width={1400}
					className="mx-auto rounded-xl md:rounded-2xl object-cover h-full object-left-top max-w-full"
					draggable={false}
				/>
			</ContainerScroll>
		</div>
	);
}

const features = [
	{
		step: "Step 1",
		title: "Upload Your Chart",
		content: "Drop your trading screenshot. We preprocess, denoise and detect key structures.",
		image: "/how/chartupload.png",
	},
	{
		step: "Step 2",
		title: "AI Pattern Recognition",
		content: "Our models scan for trend shifts, breakouts, divergences and liquidity zones.",
		image: "/how/anaylize.png",
	},
	{
		step: "Step 3",
		title: "Actionable Signals",
		content: "Get entries, exits, and risk levels tailored to your strategy in real time.",
		image: "/how/signal.png",
	},
];

export function FeatureStepsDemo() {
	return (
		<FeatureSteps
			features={features}
			title="How SignalX Works"
			autoPlayInterval={4000}
			imageHeight="h-[300px] md:h-[500px]"
		/>
	);
}

export const Features8Demo = () => {
	return <Features />
}

export function ScrollVelocityIconsDemo() {
	const rows = [3, -3];
	const icons = [Bitcoin, LineChart, Shield, Zap, Globe, TrendingUp, Users];
	return (
		<div className="w-full">
			<div className="flex flex-col space-y-6 py-10">
				{/* Top marquee */}
				<ScrollVelocity velocity={rows[0]}>
					{icons.map((Icon, i) => (
						<div key={i} className="flex items-center justify-center h-[3rem] w-[6rem] md:h-[3.5rem] md:w-[7rem] xl:h-[4rem] xl:w-[8rem]">
							<Icon className="text-white/80" />
						</div>
					))}
				</ScrollVelocity>

				{/* Bottom marquee */}
				<ScrollVelocity velocity={rows[1]}>
					{icons.map((Icon, i) => (
						<div key={i} className="flex items-center justify-center h-[3rem] w-[6rem] md:h-[3.5rem] md:w-[7rem] xl:h-[4rem] xl:w-[8rem]">
							<Icon className="text-white/80" />
						</div>
					))}
				</ScrollVelocity>
			</div>
		</div>
	);
}

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const signalXTimelineData = [
  {
    id: 1,
    title: "AI Training",
    date: "Q1 2024",
    content: "Advanced machine learning models trained on 50M+ crypto charts for pattern recognition.",
    category: "Development",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Signal Generation",
    date: "Q2 2024",
    content: "Real-time signal generation with 94.7% accuracy across major crypto pairs.",
    category: "Core Features",
    icon: Target,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Risk Management",
    date: "Q3 2024",
    content: "Built-in portfolio protection with dynamic stop-loss and position sizing.",
    category: "Security",
    icon: Shield,
    relatedIds: [1, 5],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 4,
    title: "Community Platform",
    date: "Q4 2024",
    content: "Social trading features with pro trader insights and community signals.",
    category: "Community",
    icon: Users,
    relatedIds: [2, 6],
    status: "pending" as const,
    energy: 60,
  },
  {
    id: 5,
    title: "Portfolio Analytics",
    date: "Q1 2025",
    content: "Advanced portfolio tracking with performance analytics and optimization.",
    category: "Analytics",
    icon: TrendingUp,
    relatedIds: [3, 6],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 6,
    title: "API Launch",
    date: "Q2 2025",
    content: "Public API for institutional traders and third-party integrations.",
    category: "Enterprise",
    icon: Zap,
    relatedIds: [4, 5],
    status: "pending" as const,
    energy: 20,
  },
];

export function SignalXTimelineDemo() {
  return (
    <>
      <RadialOrbitalTimeline timelineData={signalXTimelineData} />
    </>
  );
}


