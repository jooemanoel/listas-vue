// Gera os ícones do PWA a partir do símbolo "checklist" do Material Symbols (Google).
// Fonte: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:checklist:FILL@1
// Uso: npm run icones   (grava em public/, que o Vite copia para o build)
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

// Mesma cor de destaque do estilo.css (ciano do tema Material do app original).
// Branco sobre #006a6a tem contraste de 6,4:1 (WCAG AA exige 3:1 para ícones).
const COR_FUNDO = "#006a6a";
const COR_SIMBOLO = "#ffffff";

// Desenho original do símbolo (viewBox 0 -960 960 960).
const SIMBOLO_CHECKLIST =
  "m221-313 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-228q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm0-320 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-548q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm339 353q-17 0-28.5-11.5T520-320q0-17 11.5-28.5T560-360h280q17 0 28.5 11.5T880-320q0 17-11.5 28.5T840-280H560Zm0-320q-17 0-28.5-11.5T520-640q0-17 11.5-28.5T560-680h280q17 0 28.5 11.5T880-640q0 17-11.5 28.5T840-600H560Z";

/**
 * Monta o SVG do ícone: fundo colorido com o símbolo branco centralizado.
 * @param tamanho      lado do ícone em pixels
 * @param proporcao    fração do lado ocupada pelo símbolo
 * @param cantos       raio dos cantos (0 = quadrado, para ícones "maskable")
 */
function montarSvg(tamanho, proporcao, cantos) {
  const lado = tamanho * proporcao;
  const margem = (tamanho - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">
  <rect width="${tamanho}" height="${tamanho}" rx="${cantos}" fill="${COR_FUNDO}"/>
  <svg x="${margem}" y="${margem}" width="${lado}" height="${lado}" viewBox="0 -960 960 960">
    <path d="${SIMBOLO_CHECKLIST}" fill="${COR_SIMBOLO}"/>
  </svg>
</svg>`;
}

async function gerarPng(arquivo, svg) {
  await sharp(Buffer.from(svg)).png().toFile(arquivo);
  console.log("gerado:", arquivo);
}

mkdirSync("public/icones", { recursive: true });

// Ícone da aba do navegador (vetorial, cantos arredondados).
writeFileSync("public/favicon.svg", montarSvg(64, 0.72, 14));
console.log("gerado: public/favicon.svg");

// Ícones "any": usados como estão, com cantos arredondados.
await gerarPng("public/icones/icone-192.png", montarSvg(192, 0.62, 42));
await gerarPng("public/icones/icone-512.png", montarSvg(512, 0.62, 112));

// Ícone "maskable": o Android recorta no formato do aparelho (círculo, gota...).
// Fundo sem cantos e símbolo menor, dentro da "zona segura" central de 80%.
await gerarPng("public/icones/icone-maskable-512.png", montarSvg(512, 0.5, 0));

// iOS: o próprio sistema arredonda os cantos; tamanho padrão de 180 px.
await gerarPng("public/icones/apple-touch-icon.png", montarSvg(180, 0.58, 0));
