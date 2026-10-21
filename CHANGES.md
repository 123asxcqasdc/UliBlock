# UliBlock — отличия от upstream TurboWarp Desktop

UliBlock — форк [TurboWarp Desktop](https://github.com/TurboWarp/desktop) (GPL-3.0).
GUI — форк [TurboWarp scratch-gui](https://github.com/TurboWarp/scratch-gui) (GPL-3.0),
ветка `uliblock`. Этот файл — список всех отличий, чтобы редкие мёржи upstream
(только багфиксы и мажорные изменения) было дёшево делать.

## Решения пользователя (зафиксированы)

- Галерея расширений: своя — https://github.com/123asxcqasdc/turbowarp-extensions
  (каталог `extensions.json` на GitHub Pages). Клик по карточке = импорт расширения
  в проект, кнопки «скачать .js» нет.
- Упаковщик: свой — https://github.com/123asxcqasdc/packager (Uli Packager).
- Расширения: без подтверждения, для всех URL, unsandboxed.
- Paint: редактор из PenguinMod (в этом цикле).
- Библиотека: все спрайты убрать; звуки — только инструменты (`instruments`) и циклы (`loops`).
- Бренд: UliBlock, тёмная тема, минимум цветов. Платформы: только Windows + Linux.

## Desktop (`uliblock/`, ветка `uliblock`)

1. **Бренд**: `package.json` (`name: uliblock`, `productName: UliBlock`,
   `appId: org.uliblock.desktop`, linux `executableName: uliblock`),
   `src-main/brand.js`, About (`src-renderer/about/about.html`, есть предупреждение
   про unsandboxed). Иконки в `build/` и `art/` пока upstream — заменить перед релизом.
2. **Без подтверждения + unsandboxed** (`src-renderer-webpack/editor/gui/desktop-hoc.jsx`):
   в `securityManager` добавлены `canLoadExtensionFromProject: () => true` и
   `getSandboxMode: () => 'unsandboxed'`. Остальные методы (fetch/embed/…) не ослаблены.
3. **Расширения: кеш → сеть** (`src-main/protocols.js`): для схемы `tw-extensions`
   добавлены `remoteOrigin: https://extensions.turbowarp.org` и кеш
   `<userData>/extension-cache`. Порядок: вшитый `.br` → файл кеша → сеть → запись в кеш
   (атомарно через temp+rename). Вшитая галерея при этом остаётся для офлайна/документации.
   Код расширений из пользовательской галереи (сторонние хосты) грузится VM напрямую по
   https и кешируется HTTP-кешем Chromium в userData.
4. **Галерея расширений** — в форке scratch-gui, см. ниже.
5. **Упаковщик**: `src-renderer/packager/standalone.html` — собран из
   `123asxcqasdc/packager` (`npm run build-standalone-prod`, 6.4 MB, внутри бренд
   Uli Packager), файл убран из `.gitignore` и вендорится. `scripts/packager.json`
   указывает на будущий релиз форка и sha256 вшитого файла, поэтому
   `scripts/download-packager.mjs` пропускает скачивание («Packager already updated»).
   Пересборка: собрать standalone в форке packager, заменить файл, обновить sha256.
6. **Библиотека (вес)**: `scripts/library-files.json` урезан 1304 → 131 ассет
   (только звуки инструментов и циклов, сверено по `md5ext` с GUI; хэши MD5/SHA256
   проверены скачиванием). Ассеты костюмов/фонов в бандл не входят — онлайн подгрузятся
   с CDN, офлайн библиотека костюмов не сработает (дефолтный проект не страдает:
   его кот и фон встроены в GUI инлайн).
7. **Платформы**: из `package.json` build удалены `appx`, `mac`, `mas`, snap.
   Windows: nsis x64 + portable. Linux: deb + appimage + tar.gz.
   CI (`.github/workflows/build.yml`, `release.yml`): убраны mac-джобы,
   `--microsoft-store`, `--windows-legacy`, ia32/arm64 для Windows; релизные загрузки
   переведены на `123asxcqasdc/UliBlock`, `TurboWarp-Setup` → `UliBlock-Setup`.
   `release-automation/build.mjs` не урезан по коду — лишние цели просто не вызываются.

## scratch-gui (`scratch-gui/`, ветка `uliblock`)

1. **Галерея расширений** (`src/containers/extension-library.jsx`): вместо
   `extensions.turbowarp.org/generated-metadata/extensions-v0.json` грузится
   `https://123asxcqasdc.github.io/turbowarp-extensions/extensions.json`.
   Маппинг: один merged-элемент каталога = одна карточка; вариант выбирается
   `pickBestVariant` (не-deprecated official → не-deprecated → первый).
   Клик = `vm.extensionManager.loadExtensionURL(url)` (кнопки скачивания .js нет).
   У 26 из 402 расширений в каталоге нет зарегистрированного `ext_id` — после загрузки
   id определяется по `vm.extensionManager.loadedExtensions` (поиск по URL).
2. **Paint из PenguinMod** (`package.json`): `scratch-paint` →
   `github:PenguinMod/PenguinMod-Paint#develop`, добавлен
   `scratch-render-fonts`: `github:PenguinMod/penguinmod-render-fonts#master`,
   overrides: `@turbowarp/paper: ^0.12…`, `scratch-render-fonts` → PM-форк (его требует
   и `@turbowarp/scratch-svg-renderer` peer), `scratch-paint.react-responsive: ^5.0.0`.
   Те же overrides продублированы в корневом `package.json` Desktop (overrides работают
   только из корня). Статически совместимо: PM Paint экспортирует `default` +
   `ScratchPaintReducer`, контракт пропсов обёртки совпал. ⚠️ Полная проверка —
   только реальной сборкой (см. «Что не проверено»).
3. **Лоадер проекта** (`src/components/loader/loader.jsx/.css`): улитка 🐌 на тёмном
   фоне вместо стека блоков. Контракт `ASSET_PROGRESS` / `PROJECT_LOADED` и прогресс-бар
   сохранены.
4. **Библиотека**: `sprites.json` → `[]` (все спрайты убраны);
   `sounds.json` 353 → 131 (теги `instruments` или `loops`).
5. **Тема/бренд**: `src/lib/themes/index.js` — `GUI_DEFAULT = GUI_DARK`;
   `src/lib/brand.js` — `APP_NAME: 'UliBlock'`.

## Что НЕ проверено в песочнице (важно)

Полная сборка здесь не запускалась: в песочнице 2 GB RAM, `npm install` scratch-gui
умирает по OOM (exit 137), Electron GUI запустить негде. Проверено статически:
синтаксис всех изменённых JS/JSX (node --check + Babel parser), валидность JSON,
маппинг галереи на реальном каталоге (402/402), скачивание и хэши 131 ассета
библиотеки, сборка standalone упаковщика, `download-packager` (hash match), YAML CI.

## Порядок публикации и первой настоящей сборки

1. Форкнуть на GitHub `TurboWarp/scratch-gui` → `123asxcqasdc/scratch-gui`
   (кнопка Fork; нужен именно форк, а не пустой репозиторий — в локальном клоне
   уже есть remote `uliblock-fork` и ветка `uliblock`).
2. `cd scratch-gui && git push uliblock-fork uliblock`
3. Создать репозиторий `123asxcqasdc/UliBlock`, затем
   `cd uliblock && git push uliblock uliblock:main`
4. В `uliblock/`: `npm install` (перегенерирует `package-lock.json` под
   `github:123asxcqasdc/scratch-gui#uliblock` и overrides Paint; при ERESOLVE —
   `npm install --legacy-peer-deps`), закоммитить обновлённый `package-lock.json`.
   Без этого CI (`npm ci`) не пройдёт.
5. `npm run fetch && npm run webpack:prod && npm run electron:start` — ручная проверка:
   редактор, галерея расширений (клик = импорт, без диалога), Paint (vector/bitmap),
   лоадер-улитка, библиотека звуков (131), пустая библиотека спрайтов, упаковщик.
6. Дальше работает GitHub Actions: push → Build (Auto); тег `v*` → Release (win+linux).

## Известные риски

- PenguinMod Paint против TurboWarp VM/paper: возможны рантайм-нюансы (шрифты,
  градиенты). Fallback — вернуть `scratch-paint: github:TurboWarp/scratch-paint#develop`
  и убрать overrides.
- 26 расширений каталога без `ext_id`: если VM API `loadedExtensions` поменяется,
  после загрузки не переключится категория блоков (само расширение загрузится).
- Каталог галереи и код расширений требуют сеть при первом использовании;
  офлайн доступны вшитые официальные расширения и HTTP-кеш уже загруженного.
