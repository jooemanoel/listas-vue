// Navegação pelo "#" do endereço (funciona no GitHub Pages sem configuração).
//   #/            -> minhas listas
//   #/nova        -> criar lista
//   #/lista/<id>  -> itens de uma lista
// O botão "voltar" do navegador/Android e o recarregamento da página mantêm a tela.
import { computed, ref } from "vue";

const hash = ref(location.hash);
window.addEventListener("hashchange", () => (hash.value = location.hash));

export const rota = computed(() => {
  const partes = hash.value.replace(/^#\/?/, "").split("/");
  if (partes[0] === "nova") return { tela: "nova" };
  if (partes[0] === "lista" && partes[1]) return { tela: "lista", id: decodeURIComponent(partes[1]) };
  return { tela: "listas" };
});

/** Vai para outra tela, criando uma entrada no histórico. */
export function ir(caminho) {
  location.hash = caminho;
}

/** Troca a tela atual sem criar entrada no histórico (ex.: depois de criar uma lista). */
export function substituir(caminho) {
  location.replace("#" + caminho.replace(/^#/, ""));
}
