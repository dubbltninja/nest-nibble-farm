(() => {
  const grid = document.querySelector("[data-gift-grid]");
  const sortBar = document.querySelector("[data-gift-sort]");
  if (!grid) return;

  let gifts = [];
  let sortDir = "asc";

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const renderGift = (gift) => {
    const name = escapeHtml(gift.name);
    const extraLinks = Array.isArray(gift.links)
      ? `<p class="gift-brands">${gift.links
          .map(
            (link) =>
              `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`
          )
          .join("")}</p>`
      : "";
    return `<article class="gift">
      <a class="gift-photo" href="${escapeHtml(gift.url)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(gift.image)}" alt="${name}" loading="lazy" />
      </a>
      <p class="gift-price">${escapeHtml(gift.price)}</p>
      <h2>${name}</h2>
      <p>${escapeHtml(gift.description)}</p>
      ${extraLinks}
      <a class="btn btn-outline" href="${escapeHtml(gift.url)}" target="_blank" rel="noopener">View listing</a>
    </article>`;
  };

  const render = () => {
    const sorted = gifts.slice().sort((a, b) => {
      const left = Number(a.priceValue) || 0;
      const right = Number(b.priceValue) || 0;
      return sortDir === "desc" ? right - left : left - right;
    });
    grid.innerHTML = sorted.map(renderGift).join("");
  };

  sortBar?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    sortDir = button.dataset.sort === "desc" ? "desc" : "asc";
    sortBar.querySelectorAll("[data-sort]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
  });

  fetch("data/christmas.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      gifts = Array.isArray(data.gifts) ? data.gifts : [];
      render();
    })
    .catch(() => {
      grid.innerHTML = "<p>The list could not be loaded. Refresh and try again.</p>";
    });
})();
