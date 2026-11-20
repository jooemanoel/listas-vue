// Mensagem curta no rodapé da tela (substitui o "snackbar" do Angular Material).
import { ref } from "vue";

export const aviso = ref(null); // { texto, tipo: "info" | "erro" }
let temporizador;

export function avisar(texto, tipo = "info", duracao = 4000) {
  clearTimeout(temporizador);
  aviso.value = { texto, tipo };
  temporizador = setTimeout(() => (aviso.value = null), duracao);
}

/** Mostra o erro de uma chamada à API (exceto 401: a sessão já foi encerrada). */
export function avisarErro(erro) {
  if (erro?.status === 401 && erro.message.startsWith("Sessão")) {
    avisar("Sua sessão expirou. Entre novamente.", "erro");
  } else {
    avisar(erro?.message || "Algo deu errado.", "erro");
  }
}
