import React from 'react';
import withErrorBoundary from 'common/ui/hocs/with-error-boundary';
import Button from 'common/ui/components/button';

const TitleBar = () => {
	const [isMaximize, setIsMaximize] = React.useState(false);

	React.useEffect(() => {
		const onMaximize = () => setIsMaximize(true);
		const onUnmaximize = () => setIsMaximize(false);
		application.windowAPI.addListener('MAXIMIZE', onMaximize);
		application.windowAPI.addListener('UNMAXIMIZE', onUnmaximize);
		return () => {
			application.windowAPI.removeListener('MAXIMIZE', onMaximize);
			application.windowAPI.removeListener('UNMAXIMIZE', onUnmaximize);
		};
	}, []);

	return (
		<div className="x-titlebar bg-slate-100">
			<span className="x-titlebar-name text-xs font-semibold">Open Chess</span>
			{application.__PLATFORM__ === 'win32' && (
				<div className="x-titlebar-control">
					<Button
						onClick={() => application.windowAPI.minimize()}
						className="w-full flex items-center justify-center hover:bg-slate-200"
						color="transparent"
						size="sm">
						<i className="x-icon icon-Minimize_24_Line text-xl" />
					</Button>
					{isMaximize ? (
						<Button
							onClick={() => application.windowAPI.unmaximize()}
							className="w-full flex items-center justify-center hover:bg-slate-200"
							color="transparent"
							size="sm">
							<i className="x-icon icon-Unmaximize_24_Line text-base" />
						</Button>
					) : (
						<Button
							onClick={() => application.windowAPI.maximize()}
							className="w-full flex items-center justify-center hover:bg-slate-200"
							color="transparent"
							size="sm">
							<i className="x-icon icon-Maximize_24_Line text-base" />
						</Button>
					)}
					<Button
						className="w-full flex items-center justify-center hover:bg-red-500 hover:text-white"
						color="transparent"
						onClick={() => application.windowAPI.close()}
						size="sm">
						<i className="x-icon icon-Close_24_Line text-xl" />
					</Button>
				</div>
			)}
		</div>
	);
};

export default withErrorBoundary(TitleBar);
