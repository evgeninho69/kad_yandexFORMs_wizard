# 2KAD yandexFORMs wizard — красивая пошаговая форма заявки

См. <https://forms.2kad.ru> (production URL после deploy).

## Что внутри

- `index.html` — пошаговый wizard (5 шагов: тип → заказчик → объект → работы → документы/согласие).
- `style.css` — Manrope, brand-цвет 2КАД, адаптив до 360px.
- `app.js` — клиентская валидация, маски телефона/СНИЛС/кадастрового, отправка в `kad_yandexFORMs_leads/webhook/yandex`.
- `Dockerfile` — nginx:1.27-alpine, статический сайт, gzip + cache-control.

## Деплой

Dokploy, buildType=dockerfile, port=80. Подробности — `references/operations.md#fastapi-deploy` в skill `kad-it-serv-ii4ki`.

## Endpoint

`app.js` → `https://kad-yandexFORMs-leads.dev.ii4ki.ru/webhook/yandex` (поменять `ENDPOINT` в начале `app.js` если backend переедет).
