const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('startup', {
  newProject: () => ipcRenderer.send('startup-new-project'),
  openFile: () => ipcRenderer.send('startup-open-file'),
  downloadFromScratch: () => ipcRenderer.send('startup-download-scratch'),
  openRecent: (id) => ipcRenderer.send('startup-open-recent', id),
  
  // Получение списка недавних проектов
  getRecentProjects: () => ipcRenderer.invoke('startup-get-recent-projects'),
  
  // Обновление списка в DOM
  setRecentList: (html) => {
    const list = document.getElementById('recent-list');
    if (list) list.innerHTML = html;
  }
});

// Загрузка списка при старте
(async () => {
  try {
    const projects = await window.startup.getRecentProjects();
    const list = document.getElementById('recent-list');
    if (!projects || projects.length === 0) {
      list.innerHTML = '<div class="recent-item" style="opacity: 0.5;">Нет недавних проектов</div>';
      return;
    }
    
    list.innerHTML = projects.map(p => `
      <div class="recent-item" onclick="window.startup.openRecent('${p.id}')">
        <span>${p.name}</span>
        <span style="color: #888; font-size: 12px;">${p.path}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading recent projects:', e);
  }
})();
