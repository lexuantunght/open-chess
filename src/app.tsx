import React from 'react';
import TitleBar from 'common/ui/title-bar';
import { Game, Director } from 'titan3d';

const App = () => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	React.useEffect(() => {
		const game = new Game(canvasRef.current);
		Director.getInstance().bindGame(game);
	}, []);

	return (
		<div className="h-screen w-screen">
			{application.__PLATFORM__ !== 'web' && <TitleBar />}
			<main className="app-main">
				<canvas ref={canvasRef} id="game" />
			</main>
		</div>
	);
};

export default App;
