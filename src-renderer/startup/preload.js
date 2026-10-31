const {contextBridge} = require('electron');

// Прелоад для стартового окна (renderer)
// Он просто экспортирует функции из window.startup (которые мы определили в index.js)
// Но в Electron 43+ прелоад должен быть отдельным файлом.
// Мы используем тот же механизм, что и в src-preload/editor.js, но для startup.

contextBridge.exposeInMainWorld('StartupPreload', {
  // Здесь мы можем добавить специфичные для стартового окна функции, если нужно
  // Но в данном случае мы используем window.startup из index.js (который загружается напрямую)
  // Однако, чтобы electron разрешил доступ к window.startup, мы должны экспортировать функции
  // через contextBridge.
  
  // На самом деле, в index.js мы уже экспортируем window.startup через contextBridge
  // в файле src-renderer/startup/index.js.
  // Этот файл (preload) нужен только для того, чтобы electron разрешил доступ к ipcRenderer.
  
  // Но в UliBlock прелоадеры обычно находятся в src-preload/.
  // Давайте создадим простую обертку, которая просто передает управление в index.js.
  
  // В данном случае, так как index.js уже содержит contextBridge.exposeInMainWorld('startup', ...),
  // этот файл может быть пустым или содержать общие функции.
  
  getInitialFile: () => window.startup.getInitialFile(),
  getFile: (id) => window.startup.getFile(id),
  openedFile: (id) => window.startup.openedFile(id),
  closedFile: () => window.startup.closedFile(),
  showSaveFilePicker: (suggestedName) => window.startup.showSaveFilePicker(suggestedName),
  showOpenFilePicker: () => window.startup.showOpenFilePicker(),
  setLocale: (locale) => window.startup.setLocale(locale),
  setChanged: (changed) => window.startup.setChanged(changed),
  openNewWindow: () => window.startup.openNewWindow(),
  openAddonSettings: (search) => window.startup.openAddonSettings(search),
  openPackager: () => window.startup.openPackager(),
  openDesktopSettings: () => window.startup.openDesktopSettings(),
  openPrivacy: () => window.startup.openPrivacy(),
  openAbout: () => window.startup.openAbout(),
  getPreferredMediaDevices: () => window.startup.getPreferredMediaDevices(),
  getAdvancedCustomizations: () => window.startup.getAdvancedCustomizations(),
  setExportForPackager: (callback) => {
    window.startup.setExportForPackager(callback);
  },
  setIsFullScreen: (isFullScreen) => window.startup.setIsFullScreen(isFullScreen),
  
  // Специальные функции для стартового окна
  getRecentProjects: () => window.startup.getRecentProjects(),
  openRecent: (id) => window.startup.openRecent(id)
});
