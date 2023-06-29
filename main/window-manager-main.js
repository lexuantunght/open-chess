const { BrowserWindow, app, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const { WindowOperationAPI } = require('./ipc/window-operation');

const __DEV__ = process.env.NODE_ENV === 'development';

class WindowManagerMain {
	constructor() {
		this.windowOptions = {
			width: 960,
			minWidth: 400,
			height: 640,
			minHeight: 500,
			title: 'Open WebGL',
			icon: __DEV__
				? path.join(__dirname, '/../public/favicon.ico')
				: path.join(__dirname, `/../build/favicon.ico`),
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				devTools: __DEV__,
				webSecurity: true,
				webgl: true,
				partition: 'persist:app',
				preload: path.join(__dirname, 'preload.js'),
			},
			maximizable: true,
			resizable: true,
			show: false,
			frame: false,
		};
	}

	_getAppStartUrl() {
		if (__DEV__) {
			return `http://localhost:${process.env.PORT}/index.html`;
		}
		return url.format({
			pathname: path.join(__dirname, `/../build/index.html`),
			protocol: 'file:',
			slashes: true,
		});
	}

	createMainWindow() {
		this.mainWindow = new BrowserWindow(this.windowOptions);
		if (!__DEV__) {
			this.mainWindow.removeMenu();
		}
		this.mainWindow.loadURL(this._getAppStartUrl());
		this.mainWindow.on('ready-to-show', () => this.mainWindow.show());
		this._setUpEvents();
	}

	_setUpEvents() {
		this.mainWindow.on('close', () => {
			this.mainWindow.webContents.send(WindowOperationAPI.CLOSE);
		});
		this.mainWindow.on('maximize', () => {
			this.mainWindow.webContents.send(WindowOperationAPI.MAXIMIZE);
		});
		this.mainWindow.on('minimize', () => {
			this.mainWindow.webContents.send(WindowOperationAPI.MINIMIZE);
		});
		this.mainWindow.on('restore', () => {
			this.mainWindow.webContents.send(WindowOperationAPI.RESTORE);
		});
		this.mainWindow.on('unmaximize', () => {
			this.mainWindow.webContents.send(WindowOperationAPI.UNMAXIMIZE);
		});
	}

	run() {
		app.disableHardwareAcceleration();
		app.on('ready', () => {
			if (process.platform === 'win32') {
				app.setAppUserModelId('Open Chess');
			}
			this.createMainWindow();
		});
		app.on('activate', function () {
			if (this.mainWindow === null) {
				this.createMainWindow();
			}
		});
		ipcMain
			.on(WindowOperationAPI.MINIMIZE, (e) => {
				BrowserWindow.fromWebContents(e.sender)?.minimize();
			})
			.on(WindowOperationAPI.MAXIMIZE, (e) => {
				BrowserWindow.fromWebContents(e.sender)?.maximize();
			})
			.on(WindowOperationAPI.RESTORE, (e) => {
				BrowserWindow.fromWebContents(e.sender)?.restore();
			})
			.on(WindowOperationAPI.CLOSE, (e) => {
				BrowserWindow.fromWebContents(e.sender)?.close();
			})
			.on(WindowOperationAPI.UNMAXIMIZE, (e) => {
				BrowserWindow.fromWebContents(e.sender)?.unmaximize();
			});
	}
}

const windowManagerMain = new WindowManagerMain();
module.exports = windowManagerMain;
