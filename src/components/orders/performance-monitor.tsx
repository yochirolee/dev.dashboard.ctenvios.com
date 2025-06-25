import React, { useRef, useEffect } from "react";

interface PerformanceMonitorProps {
	name: string;
	children: React.ReactNode;
	enabled?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
	name,
	children,
	enabled = process.env.NODE_ENV === "development",
}) => {
	const renderCount = useRef(0);
	const lastRenderTime = useRef(Date.now());

	useEffect(() => {
		if (enabled) {
			renderCount.current += 1;
			const now = Date.now();
			const timeSinceLastRender = now - lastRenderTime.current;

			console.log(
				`🔄 ${name} rendered ${renderCount.current} times (${timeSinceLastRender}ms since last render)`,
			);
			lastRenderTime.current = now;
		}
	});

	return <>{children}</>;
};

// Hook to track component re-renders
export const useRenderTracker = (
	componentName: string,
	enabled = process.env.NODE_ENV === "development",
) => {
	const renderCount = useRef(0);
	const lastRenderTime = useRef(Date.now());

	useEffect(() => {
		if (enabled) {
			renderCount.current += 1;
			const now = Date.now();
			const timeSinceLastRender = now - lastRenderTime.current;

			if (renderCount.current > 1) {
				console.log(
					`🔄 ${componentName} re-rendered (${renderCount.current} total, ${timeSinceLastRender}ms since last)`,
				);
			}
			lastRenderTime.current = now;
		}
	});

	return renderCount.current;
};
