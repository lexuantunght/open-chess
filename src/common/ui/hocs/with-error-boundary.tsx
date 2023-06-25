import React from 'react';
import ErrorBoundary from 'common/ui/error-boundary';

function withErrorBoundary<P extends Record<string, unknown>>(Component: React.ComponentType<P>) {
	const enhanced = (props: P) => {
		return (
			<ErrorBoundary>
				<Component {...props} />
			</ErrorBoundary>
		);
	};
	return enhanced;
}

export default withErrorBoundary;
