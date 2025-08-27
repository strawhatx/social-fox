import { useEffect } from 'react';

interface MicroSurveyProps {
	formId?: string; // Tally form ID
	buttonText?: string;
	variant?: 'link' | 'button';
}

const MicroSurvey = ({ formId, buttonText = "Why didn't you sign up?", variant = 'link' }: MicroSurveyProps) => {
	// If no form ID is provided, render nothing
	if (!formId) return null;

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://tally.so/widgets/embed.js';
		document.body.appendChild(script);
		return () => {
			try { document.body.removeChild(script); } catch {}
		};
	}, []);

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


