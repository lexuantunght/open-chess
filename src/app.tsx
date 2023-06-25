import React from 'react';
import TitleBar from 'common/ui/title-bar';

const App = () => {
	return (
		<div>
			<nav></nav>
			<main>{application.__PLATFORM__ !== 'web' && <TitleBar />}</main>
		</div>
	);
};

export default App;
