import React from 'react';
import clsx from 'clsx';
import TitleBar from 'common/ui/title-bar';
import { Game, Director } from 'titan3d';
import MagicForestScene from 'ui/scene/magic-forest';

const App = () => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	React.useEffect(() => {
		const game = new Game(canvasRef.current);
		Director.getInstance().bindGame(game);
		game.run();
		Director.getInstance()
			.preloadResources(['/res/magic_forest_skybox.obj', '/res/book.obj'])
			.then(() => {
				Director.getInstance().runScene(new MagicForestScene());
			});
	}, []);

	return (
		<div className="h-screen w-screen">
			{application.__PLATFORM__ !== 'web' && <TitleBar />}
			<main className={clsx('app-main', application.__PLATFORM__ !== 'web' && '--title-bar')}>
				<canvas ref={canvasRef} id="game" />
			</main>
		</div>
	);
};

export default App;
