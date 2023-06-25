import React from 'react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isError: false,
		};
	}

	componentDidCatch() {
		this.setState({ isError: true });
	}

	render() {
		if (this.state.isError) {
			return null;
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
