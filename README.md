# lais-boss (Boss admin panel)

Reconstructed from the production build in `build/` using its source maps.

## Running

```sh
npm install --legacy-peer-deps
npm start        # dev server
npm run build    # production build (writes to build/ - move the original first if you still need it)
```

Create React App 4 (webpack 4), React 17. The scripts set `NODE_OPTIONS=--openssl-legacy-provider` so it runs on modern Node.
API endpoints live in `src/config.js`.

## How it was reconstructed

- `src/` comes from `sourcesContent` in the source maps of the build listed in `build/asset-manifest.json` (`main.70cbb139`). Those files are the exact original sources.
- `build/` also contains leftover files from about 30 older builds. They were only used to fill gaps (see below). `main.2620c094.js` is from a different app (the chat client), and only a few small API helpers were taken from it.
- `src/locales/{en,de,fr}.json` were extracted from the bundle, because JSON modules aren't included in source maps.
- `public/` was copied from the non-hashed assets in `build/`.
- Dependency versions are pinned where the bundle shows them (React 17.0.2, @material-ui/core 5.0.0-beta.5, @mui 5.16.6, react-router 6.26.0, apexcharts 3.52.0, axios 0.21.4). The other versions are best guesses that work with these.

### Not exact originals

Some modules are imported in the source but contributed no code to the shipped bundle (dead code or pure re-exports), so they aren't in its source map.

Recovered from older builds of this app (they may differ slightly from the version that was last deployed):
`actions/editarCliente`, `actions/clientes/{actionAlterarPodCliente,actionEditarResposta,cadastrarRespostaRapida,deletarRespostaRapida,cadastrarFunil,editarFunil}`,
`components/MyAvatar`, `utils/createAvatar`, `pages/dashboard/{AplicativoPage,RespostasList,FunilList}`,
`components/_dashboard/admin/clientes/funis/list/FunilMoreMenu`, `components/_dashboard/user/list/UsuariosMoreMenu`.

Recovered from the chat-app build: `api/{nodes,scraper}`, `actions/v2/ai/{v2_actionAiNodes,v2_actionCriarTreinamento,v2_actionDeletarAgente,v2_actionDeletarTreinamento,v2_actionEditarAgenteAi}`.

Stubs (no source found anywhere; none of them ran in the shipped build):
- `src/actions/addSetor.js`
- `src/actions/clientes/usuariosByCodigoCliente.js`
- `src/actions/clientes/usuariosById.js`
- `src/actions/clientes/v2_actionListaFlows.js`
- `src/actions/getListaUsuariosByCliente.js`
- `src/actions/getSetoresByClient.js`
- `src/actions/v2/ai/v2_actionCalendarios.js`
- `src/components/_dashboard/user/account/AccountBilling.js`
- `src/components/_dashboard/user/account/AccountNotifications.js`
- `src/components/_dashboard/user/list/ClientsMoreMenu.js`
- `src/components/nav-section/vertical/NavList.js`
- `src/components/settings/SettingDirection.js`
- `src/components/settings/SettingFullscreen.js`
- `src/components/settings/SettingStretch.js`
- `src/layouts/dashboard/ContactsPopover.js`
- `src/layouts/dashboard/LanguagePopover.js`
- `src/pages/dashboard/Agentes.js`
- `src/pages/dashboard/Consumo.js`
- `src/sections/dashboard/clientes/aplicativo/index.js`

Barrel files rebuilt from how they are used:
- `src/assets/index.js`
- `src/components/_dashboard/feedback/list/index.js`
- `src/components/_dashboard/general-app/index.js`
- `src/components/_dashboard/user/account/index.js`
- `src/components/_dashboard/user/list/index.js`
- `src/components/@material-extend/index.js`
- `src/components/animate/index.js`
- `src/components/animate/variants/index.js`
- `src/components/authentication/login/index.js`
- `src/components/carousel/controls/index.js`
- `src/components/carousel/index.js`
- `src/components/charts/index.js`
- `src/components/upload/index.js`
