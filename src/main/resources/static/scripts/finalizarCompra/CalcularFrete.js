export function calcularFretePorEstado(estado) {
  switch (estado) {
    case "SP":
    case "RJ":
    case "MG":
      return 25;
    case "RS":
    case "PR":
    case "SC":
      return 20;
    default:
      return 30;
  }
}

export function atualizarFrete(estado) {
  const frete = calcularFretePorEstado(estado);
  document.getElementById("valorFreteResumo").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
  document.getElementById("valorFreteResumoTotal").textContent = `R$ ${frete
    .toFixed(2)
    .replace(".", ",")}`;
}
