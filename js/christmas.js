(() => {
  const grid = document.querySelector("[data-gift-grid]");
  if (!grid) return;

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

  fetch("data/christmas.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      const gifts = Array.isArray(data.gifts) ? data.gifts : [];
      grid.innerHTML = gifts.map(renderGift).join("");
    })
    .catch(() => {
      grid.innerHTML = "<p>The list could not be loaded. Refresh and try again.</p>";
    });
})();
