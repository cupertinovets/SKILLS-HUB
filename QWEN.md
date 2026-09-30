# QWEN.md

## Обзор проекта

**Трекер доходов и расходов** — SPA для учёта личных финансов, работающее полностью в браузере без серверной части и авторизации. Все данные хранятся локально в `localStorage`.

Реализовано по техническому заданию [`tracker-tz.md`](./tracker-tz.md). Подробности и описание возможностей — в [`README.md`](./README.md).

## Стек

TypeScript (strict) + React 18 + Vite · MUI · Zustand (состояние + persist) · React Hook Form + Zod · Recharts · dayjs · React Router. Тесты — Vitest + Testing Library (jsdom).

## Команды

```bash
npm install        # установка зависимостей
npm run dev        # dev-сервер (http://localhost:5173)
npm run build      # tsc --noEmit + vite build
npm run preview    # предпросмотр production-сборки
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Vitest (запуск один раз)
npm run test:watch # Vitest в watch-режиме
```

## Структура

```
src/
├── app/                # App, providers, router, Layout, snackbar
├── components/         # переиспользуемые UI-компоненты
├── features/           # transactions, categories, budgets, recurring, reports, settings
├── hooks/              # useColorMode
├── lib/                # date, format, analytics, csv, recurring, id
├── models/             # types.ts, schemas.ts (zod), defaults.ts
├── storage/            # DataRepository + localStorageRepository
├── store/              # useAppStore (Zustand)
└── theme/              # настройка MUI-темы
```

Маршруты (React Router, `src/app/router.tsx`): `/` (дашборд), `/transactions`, `/categories`,
`/budgets`, `/recurring`, `/settings`.

## Архитектурные соглашения

- **Слой хранения** инкапсулирован за интерфейсом `DataRepository` (`src/storage/repository.ts`).
  Реализация `localStorage` заменяема (например, на IndexedDB) без изменений в остальном коде;
  в тестах подменяется через `setRepository`.
- **Zustand-хранилище** — единственный источник данных для UI. Все мутации идут через методы
  стора, которые валидируются zod-схемами и сохраняются в репозиторий через `commit()`.
- **Валидация:** zod-схемы в `src/models/schemas.ts` используются и для форм
  (`@hookform/resolvers/zod`), и для проверки импортируемых файлов; повреждённые данные в
  `localStorage` откатываются к пустому состоянию.
- **Аналитика** (`src/lib/analytics.ts`) — чистые функции, покрыты unit-тестами; компоненты
  только отображают результат.
- **Именование/стиль:** файлы компонентов в PascalCase, хуки/утилиты в camelCase; импорты через
  алиас `@/`; в коде комментарии только по существу (на русском).
- **Валюта и локали:** русский интерфейс, форматирование денег через `Intl.NumberFormat('ru-RU')`,
  даты через `dayjs` с локалью `ru`.

## Тестирование

Тесты лежат рядом с исходниками (`*.test.ts`). Покрыты: аналитика, генерация повторяющихся
операций, слой `localStorage`, ключевые операции стора. Новые фичи стоит сопровождать тестами
чистой логики.

## Примечания

- Команда `npm run build` сначала запускает `tsc --noEmit` — типовых ошибок быть не должно.
- ESLint настроен (flat config, `eslint.config.js`); предупреждения `react-refresh/only-export-components`
  ожидаемы для файлов, экспортирующих и компонент, и хелперы.
- Production-сборка разбита на чанки (`react`, `mui`, `charts`) в `vite.config.ts`.
