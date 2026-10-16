// Progressive enhancement: render the product list from the JSON API.
const tbody = document.querySelector("#items tbody");
if (tbody) {
  fetch("/api/items")
    .then((r) => r.json())
    .then(({ data }) => {
      tbody.innerHTML = "";
      for (const it of data) {
        const tr = document.createElement("tr");
        tr.dataset.testid = "item-row";
        for (const v of [it.name, `$${it.price.toFixed(2)}`]) { const td = document.createElement("td"); td.textContent = v; tr.append(td); }
        tbody.append(tr);
      }
    });
}
