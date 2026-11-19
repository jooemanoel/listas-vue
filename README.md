# Listas (Vue)

Listas de propósito geral (compras, tarefas, desejos, lembretes), instalável como PWA.
Reescrita em Vue 3 + Vite do [listas-estatico](https://github.com/jooemanoel/listas-estatico) (Angular).
Os dados ficam na [listas-api](../listas-api), que é a única a falar com o Firestore.

## Comandos

```bash
npm install
npm run dev       # desenvolvimento (API em http://localhost:3000)
npm run build     # gera docs/ (publicado pelo GitHub Pages)
npm run icones    # gera favicon e ícones do PWA (public/icones) a partir do símbolo "checklist"
```

Para testar sem credenciais do Firebase, rode a API com dados em memória:
`cd ../listas-api && npm run dev:memoria`.

O endereço da API publicada fica em [.env.production](.env.production)
(`https://listas-api.vercel.app`); ajuste se o projeto na Vercel tiver outro nome.

## Telas

A barra superior tem três botões com ícones, no lugar do antigo menu lateral:

| Ícone | Ação |
|---|---|
| `playlist_add` | Nova lista |
| `format_list_bulleted` | Minhas listas |
| `logout` | Sair |

- **Minhas listas**: nome e contagem de marcados (`2/3`); tocar abre a lista, a lixeira exclui a lista com todos os itens (com confirmação).
- **Lista**: campo fixo no topo para adicionar (Enter adiciona e mantém o foco para o próximo item); marcar risca o item e o leva para o fim.
- A navegação usa o `#` do endereço (`#/`, `#/nova`, `#/lista/<id>`): o botão voltar do Android funciona e recarregar a página mantém a tela.

## Estrutura

```
public/sw.js                     service worker (cache só dos arquivos do app, nunca da API)
public/manifest.webmanifest      PWA
scripts/gerar-icones.js          ícones a partir do Material Symbol "checklist"
src/services/api.js              chamadas à listas-api (token no cabeçalho Authorization)
src/composables/useSessao.js     token JWT e nome do usuário (localStorage)
src/composables/useListas.js     estado das listas e ações (marcar/remover com resposta imediata)
src/composables/useRota.js       navegação por hash
src/composables/useAviso.js      mensagens no rodapé
src/components/                  barra superior, telas e ícones SVG
src/estilo.css                   todo o CSS (sem Bootstrap/Material); tema claro/escuro do sistema
```

## O que mudou em relação à versão Angular

| | Angular | Vue |
|---|---|---|
| Acesso aos dados | SDK do Firebase no navegador, banco aberto | só pela listas-api, com token |
| Login | baixava todos os usuários e senhas e comparava no navegador | feito na API (bcrypt); o navegador recebe só o token |
| Sessão no aparelho | usuário com senha em texto puro no `localStorage` | apenas o token assinado (e o nome para exibir) |
| Menu | hambúrguer com 3 opções | 3 botões de ícone na barra |
| Itens | identificados pelo nome; a lista inteira era regravada a cada clique | `id` próprio; cada ação altera só o necessário |
| Excluir lista | sem confirmação | pede confirmação |
| JS + CSS | Angular + Material + Bootstrap + Firebase | 36 KB + 2 KB (gzip) |
| Fontes externas | Roboto + Material Icons (Google Fonts) | nenhuma (fontes do sistema, ícones SVG) |
| Ícone | genérico | Material Symbol `checklist` |
