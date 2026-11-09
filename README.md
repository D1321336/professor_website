# professor_website

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Start the API in another terminal:

```sh
copy .env.example .env
npm run server
```

Set a long, unique `ADMIN_PASSWORD` in `.env` before starting the server. The content
management page is available at `http://localhost:5173/admin` during development and
at `/admin` in the production build. Navigation, branding, and contact fields are not
editable from the administration page.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Cloudflare 部署（Workers + D1 + R2）

目前的 Cloudflare 版本使用：

- Workers Static Assets 提供 Vue 網站
- Worker 提供 `/api/*`
- D1 儲存網站內容
- R2 儲存後台上傳圖片

### 1. 登入並建立資源

```sh
npx wrangler login
npx wrangler d1 create professor-website-db
npx wrangler r2 bucket create professor-website-media
```

把 D1 建立指令回傳的 `database_id` 填入 `wrangler.jsonc`，取代全為零的暫存 ID。

### 2. 匯出目前資料並套用 D1 migrations

```sh
npm run cf:export
npm run cf:migrate:remote
```

`cf:export` 會從 `server/sqlite.db` 產生 `migrations/0002_content.sql`。正式資料若已經套用過，不要重複執行內容 migration。

### 3. 設定管理員機密

以下兩個指令會安全地提示輸入值，不要把正式密碼寫入 Git：

```sh
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
```

密碼建議至少 16 個字元，混合大小寫、數字及符號。

### 4. 搬移現有圖片

```sh
npm run cf:upload-media
```

這會把 `public/uploads` 內的現有圖片上傳至 R2；重複上傳同名物件不會產生重複網址。

### 5. 部署

```sh
npm run cf:deploy
```

Wrangler 完成後會顯示 `workers.dev` 網址。確認首頁與 `/admin` 後，再到 Cloudflare Dashboard 的 Workers & Pages → Custom Domains 綁定正式網域。

### 本機 Cloudflare 測試

先套用本機 D1 migration，再以測試帳密啟動：

```sh
npm run cf:migrate:local
npm run cf:dev -- --var ADMIN_USERNAME:test --var ADMIN_PASSWORD:test-password
```
