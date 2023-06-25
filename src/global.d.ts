declare module '*.module.scss';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

declare const __DEV__: boolean;
declare const application: {
	__PLATFORM__: 'win32' | 'darwin' | 'web';
	windowAPI: {
		maximize(): void;
		unmaximize(): void;
		minimize(): void;
		restore(): void;
		close(): void;
		addListener(event: string, callback: CallableFunction): void;
		removeListener(event: string, callback: CallableFunction): void;
	};
};
