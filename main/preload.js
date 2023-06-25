const { contextBridge, ipcRenderer } = require('electron');

const WindowOperationAPI = {
	MAXIMIZE: 'MAXIMIZE',
	MINIMIZE: 'MINIMIZE',
	CLOSE: 'CLOSE',
	RESTORE: 'RESTORE',
	UNMAXIMIZE: 'UNMAXIMIZE',
};

contextBridge.exposeInMainWorld('application', {
	__PLATFORM__: process.platform,
	windowAPI: {
		maximize() {
			ipcRenderer.send(WindowOperationAPI.MAXIMIZE);
		},
		minimize() {
			ipcRenderer.send(WindowOperationAPI.MINIMIZE);
		},
		close() {
			ipcRenderer.send(WindowOperationAPI.CLOSE);
		},
		restore() {
			ipcRenderer.send(WindowOperationAPI.RESTORE);
		},
		unmaximize() {
			ipcRenderer.send(WindowOperationAPI.UNMAXIMIZE);
		},
		addListener(event, callback) {
			if (WindowOperationAPI[event]) {
				ipcRenderer.addListener(event, callback);
			}
		},
		removeListener(event, callback) {
			ipcRenderer.removeListener(event, callback);
		},
	},
});
