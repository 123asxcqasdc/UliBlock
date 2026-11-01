const {app} = require('electron');
const fs = require('fs');
const path = require('path');

const MAX_RECENT = 12;

const getRecentPath = () => path.join(app.getPath('userData'), 'uliblock-recent.json');

const load = () => {
  try {
    const raw = fs.readFileSync(getRecentPath(), 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && typeof item.path === 'string');
    }
  } catch (e) {
    // ignore
  }
  return [];
};

const save = (list) => {
  try {
    fs.writeFileSync(getRecentPath(), JSON.stringify(list.slice(0, MAX_RECENT), null, 2));
  } catch (e) {
    // ignore
  }
};

module.exports = {
  getRecent: () => load(),
  addRecent: (filePath, name) => {
    if (!filePath) return;
    const normalized = path.resolve(filePath);
    let list = load().filter(item => path.resolve(item.path) !== normalized);
    list.unshift({
      path: normalized,
      name: name || path.basename(normalized),
      time: Date.now()
    });
    save(list);
  },
  removeRecent: (filePath) => {
    if (!filePath) return;
    const normalized = path.resolve(filePath);
    const list = load().filter(item => path.resolve(item.path) !== normalized);
    save(list);
  },
  clearRecent: () => {
    save([]);
  }
};
