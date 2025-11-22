# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration.

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # M4tteM4gix – Matematikregler och Övningar

    En React + TypeScript + Vite applikation som visar potens- och rotlagar, samband mellan rötter och bråkpotenser samt övningsfrågor (quiz). MathML används för tydlig visning av matematiska uttryck.

    ## Utvecklingsstack
    - React 19
    - TypeScript
    - Vite
    - MathML (direkt i DOM)

    ## Scripts
    | Kommando | Beskrivning |
    |----------|-------------|
    | `npm run dev` | Startar utvecklingsserver med HMR |
    | `npm run build` | Kompilerar TypeScript och bygger produktion (`dist/`) + skapar `404.html` |
    | `npm run preview` | Förhandsgranskar produktionen lokalt |
    | `npm run lint` | Kör ESLint |

    ## ESLint (Type-aware exempel)
    För att aktivera type-aware regler kan du utgå från följande (exempel från Vite mall):

    ```js
    export default defineConfig([
      globalIgnores(['dist']),
      {
        files: ['**/*.{ts,tsx}'],
        extends: [
          tseslint.configs.recommendedTypeChecked,
          // tseslint.configs.strictTypeChecked,
          // tseslint.configs.stylisticTypeChecked,
        ],
        languageOptions: {
          parserOptions: {
            project: ['./tsconfig.node.json', './tsconfig.app.json'],
            tsconfigRootDir: import.meta.dirname,
          },
        },
      },
    ])
    ```

    Tillägg: `eslint-plugin-react-x` och `eslint-plugin-react-dom` kan ge extra React-specifika regler.

    ## Deployment (GitHub Pages)

    Projektet är konfigurerat för GitHub Pages med Actions.

    ### 1. Repository
    Skapa ett publikt repo med namnet `m4ttem4gix` (eller justera `base` om du väljer ett annat).

    ### 2. Vite `base`
    I `vite.config.ts` används:
    ```ts
    export default defineConfig({
      base: '/m4ttem4gix/',
      plugins: [react()],
    })
    ```
    Byt strängen om repo-namnet ändras. För användarsidor (`username.github.io`) tar du bort `base` helt.

    ### 3. SPA 404 fallback
    `postbuild` scriptet kopierar `dist/index.html` till `dist/404.html` så att direktladdning av djupa länkar fungerar.

    ### 4. Actions workflow
    Finns i `.github/workflows/deploy.yml` och bygger + publicerar `dist/` vid push på `main`.

    ### 5. Första deploy
    1. Commit + push till `main`.
    2. Aktivera Pages (Settings → Pages; källa blir Actions automatiskt).
    3. Vänta tills workflow är klart: sidan nås på `https://<användarnamn>.github.io/m4ttem4gix/`.

    ### 6. Lokalt test
    ```bash
    npm run build
    npm run preview
    ```

    ### 7. Felsökning
    - Saknade resurser (404): Kontrollera `base` i `vite.config.ts`.
    - Djup länk 404: Säkerställ att `404.html` skapats i `dist/`.
    - Actions fel på `npm ci`: Se till att `package-lock.json` är committad (skapa genom `npm install` lokalt om den saknas).

    ### 8. Ändra repo-namn
    Uppdatera `base: '/nytt-namn/'` och kör om build + push.

    ### 9. Rekommenderade förbättringar (frivilligt)
    - Lägg till `LICENSE` i roten.
    - Skapa `.nojekyll` i `dist/` (oftast inte nödvändigt med hashade Vite-filer).
    - Lägg till mer robust testning innan deploy (t.ex. CI steg för `npm run lint`).

    ## Matematikinnehåll (Översikt)
    - Potenslagar
    - Rötter (kvadrat-, kub-, fjärde rötter)
    - Bråkpotenser och samband: \( a^{p/q} = \sqrt[q]{a^p} \)
    - Quiz med progressiv svårighetsgrad

    ## Licens
    Lägg till en licensfil (t.ex. MIT) om du vill göra projektet öppet och tydligt.

    ---
    För frågor eller idéer: öppna ett issue.
