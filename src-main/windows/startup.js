const {BrowserWindow} = require('electron');
const AbstractWindow = require('./abstract');
const EditorWindow = require('./editor');
const path = require('path');
const settings = require('../settings');

class StartupWindow extends AbstractWindow {
  constructor () {
    super();
    
    // Слушаем события от стартового окна (renderer)
    this.ipc.on('startup-new-project', () => {
      EditorWindow.newWindow();
      this.window.close(); // Закрываем стартовое окно
    });

    this.ipc.on('startup-open-file', () => {
      this.ipc.send('show-open-file-picker-startup');
    });

    this.ipc.on('startup-download-scratch', () => {
      // Открываем диалог ввода ID проекта
      const {dialog} = require('electron');
      const result = dialog.showMessageBoxSync(this.window, {
        type: 'question',
        title: 'Скачать со Скреча',
        message: 'Введите ID проекта (например, 123456789)',
        buttons: ['Отмена', 'Открыть'],
        defaultId: 1,
        input: { type: 'text', placeholder: 'ID проекта' } // В Electron 43+ есть поддержка ввода, но проще через prompt или отдельное окно
      });
      // Для простоты в этом примере используем просто ввод через диалог (или можно вызвать EditorWindow.openFiles)
      // В реальном UliBlock есть логика загрузки по URL.
      // Давайте просто вызовем EditorWindow.openFiles с URL
      const id = dialog.input; // Если есть ввод
      if (id) {
        EditorWindow.openFiles([`https://scratch.mit.edu/projects/${id}/`], false, process.cwd());
        this.window.close();
      }
    });

    this.ipc.on('startup-open-recent', (event, id) => {
      // Получаем путь по ID из настроек
      const recent = settings.recentProjects || [];
      const project = recent.find(p => p.id === id);
      if (project) {
        EditorWindow.openFiles([project.path], false, process.cwd());
        this.window.close();
      }
    });

    // Обработка выбора файла из стартового окна
    this.ipc.handle('show-open-file-picker-startup', async () => {
      const {dialog} = require('electron');
      const result = await dialog.showOpenDialog(this.window, {
        properties: ['openFile'],
        filters: [{name: 'Scratch Project', extensions: ['sb3', 'sb2', 'sb']}]
      });
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        // Сохраняем в недавние через настройки
        let recent = settings.recentProjects || [];
        recent = recent.filter(p => p.path !== filePath);
        recent.unshift({ id: Date.now().toString(), path: filePath, name: path.basename(filePath) });
        recent = recent.slice(0, 10);
        settings.recentProjects = recent;
        await settings.save();
        
        EditorWindow.openFiles([filePath], false, process.cwd());
        this.window.close();
      }
      return null;
    });

    // Загрузка недавних проектов
    this.ipc.handle('startup-get-recent-projects', () => {
      return settings.recentProjects || [];
    });

    // Загружаем стартовую страницу
    this.loadURL(`file://${path.resolve(__dirname, '../../src-renderer/startup/index.html')}`);
    this.show();
  }

  // Переопределяем методы, чтобы они не мешали стартовому окну
  handleWillNavigate (event, url) {
    event.preventDefault();
  }
}

module.exports = StartupWindow;
