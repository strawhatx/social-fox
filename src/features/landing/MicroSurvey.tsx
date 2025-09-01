import { useEffect, useRef } from 'react';

interface MicroSurveyProps {
	formId?: string; // Tally form ID
	buttonText?: string;
	variant?: 'link' | 'button';
	autoOpenOnExit?: boolean; // open survey on exit-intent
	showOnceKey?: string; // sessionStorage key to show once per session
}

const MicroSurvey = ({ formId, buttonText = "Why didn't you sign up?", variant = 'link', autoOpenOnExit = false, showOnceKey = 'tally_exit_shown' }: MicroSurveyProps) => {
	// If no form ID is provided, render nothing
	if (!formId) return null;

	useEffect(() => {
		if (typeof window === 'undefined') return;
		// Ensure Tally embed script is present
		const existing = document.querySelector('script[src^="https://tally.so/widgets/embed.js"]') as HTMLScriptElement | null;
		const script = existing ?? document.createElement('script');
		if (!existing) {
			script.async = true;
			script.src = 'https://tally.so/widgets/embed.js';
			document.body.appendChild(script);
		}
		return () => {
			// Keep script loaded if it existed before to avoid breaking other instances
			if (!existing) {
				try { document.body.removeChild(script); } catch {}
			}
		};
	}, []);

	// Exit-intent auto open
	const openedRef = useRef(false);
	useEffect(() => {
		if (!autoOpenOnExit || !formId || typeof window === 'undefined') return;
		if (sessionStorage.getItem(showOnceKey) === '1') return;

		const openSurvey = () => {
			if (openedRef.current) return;
			openedRef.current = true;
			sessionStorage.setItem(showOnceKey, '1');
			const w = window as unknown as { Tally?: any };
			if (w.Tally && typeof w.Tally.openPopup === 'function') {
				w.Tally.openPopup(formId, { layout: 'modal', hideTitle: true });
				return;
			}
			// Fallback: click the trigger element rendered by this component
			try {
				const trigger = document.querySelector(`[data-tally-open="${formId}"]`) as HTMLElement | null;
				trigger?.click();
			} catch {}
		};

		let mouseY = 0;
		const onMouseMove = (e: MouseEvent) => {
			mouseY = e.clientY;
		};
		const onMouseOut = (e: MouseEvent) => {
			// If leaving viewport towards the top and not moving to another element
			const to = e.relatedTarget as Node | null;
			if (!to && (e.clientY <= 0 || mouseY <= 10)) {
				openSurvey();
			}
		};

		window.addEventListener('mousemove', onMouseMove, { passive: true });
		window.addEventListener('mouseout', onMouseOut, { passive: true });

		return () => {
			window.removeEventListener('mousemove', onMouseMove as EventListener);
			window.removeEventListener('mouseout', onMouseOut as EventListener);
		};
	}, [autoOpenOnExit, formId, showOnceKey]);

	if (variant === 'button') {
		return (
			<button
				data-tally-open={formId}
				data-tally-layout="modal"
				data-tally-hide-title="1"
				className="border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm hover:border-orange-400 hover:text-orange-600 transition-all"
			>
				{buttonText}
			</button>
		);
	}

	return (
		<a
			data-tally-open={formId}
			data-tally-layout="modal"
			data-tally-hide-title="1"
			className="text-gray-500 hover:text-orange-600 underline cursor-pointer"
		>
			{buttonText}
		</a>
	);
};

export default MicroSurvey;


