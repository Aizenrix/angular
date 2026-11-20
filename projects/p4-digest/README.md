# Модуль 4. Дайджест новостей

- [Дайджест на React](https://aizenrix.github.io/digest/)
- [Дайджест на Angular](https://aizenrix.github.io/digest/angular/)
- [Репозиторий проекта](https://github.com/Aizenrix/digest)
- [Правила для агента](https://github.com/Aizenrix/digest/blob/main/AGENTS.md) · [Пять заданий](https://github.com/Aizenrix/digest/tree/main/tasks) · [Журнал Р2](https://github.com/Aizenrix/digest/blob/main/ai-log.md)

Лента загружает реальные новости из Google Таблицы через Apps Script. Поиск, тег и фильтр непрочитанных сочетаются друг с другом. Отметки сохраняются в браузере, фильтры передаются в ссылке, карточки сгруппированы по московской дате.

Утренний процесс n8n собирает новости Хабра, GitHub Changelog и Cloudflare Blog, пересказывает через Ollama и записывает итог в таблицу. Вечерний процесс отправляет в Telegram новости с выбранными тегами. Проверены ручные запуски и защита от повторной записи.

Сборка, строгий линтер и 12 тестов прошли. В опубликованных версиях проверены работа с клавиатуры и мобильная ширина. Доступность React и Angular по Lighthouse — 100. [Отчёт](https://github.com/Aizenrix/digest/blob/main/evidence/lighthouse.json) · [Публикация](https://github.com/Aizenrix/digest/actions/workflows/deploy.yml).
