(() => {
  const grid = document.querySelector("[data-gift-grid]");
  const sortBar = document.querySelector("[data-gift-sort]");
  if (!grid) return;

  let gifts = [];
  let sortDir = "asc";
  let picksOnly = false;
  const pickLabel = (grid.getAttribute("data-pick-label") || "Tim's pick").trim() || "Tim's pick";
  const picksLabel = /picks$/i.test(pickLabel) ? pickLabel : `${pickLabel}s`;

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const formatMoney = (value) => `$${Number(value).toFixed(2)}`;

  const renderPrice = (gift) => {
    const listPrice = Number(gift.listPrice);
    const discount = Number(gift.discountPercent);
    const onSale = Number.isFinite(listPrice) && listPrice > 0 && Number.isFinite(discount) && discount > 0;
    if (!onSale) {
      return `<p class="gift-price">${escapeHtml(gift.price)}</p>`;
    }
    const coupon = gift.coupon ? `<span class="gift-coupon">with coupon</span>` : "";
    return `<p class="gift-price gift-price--sale">
      <span class="gift-deal">
        <span class="gift-discount">-${Math.round(discount)}%</span>
        <span class="gift-current">${escapeHtml(formatMoney(gift.priceValue))}</span>
        ${coupon}
      </span>
      <span class="gift-list">List: <s>${escapeHtml(formatMoney(listPrice))}</s></span>
    </p>`;
  };

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
    const optionText = typeof gift.options === "string" ? gift.options.trim() : "";
    const options = optionText
      ? `<p class="gift-options">${escapeHtml(optionText)}</p>`
      : "";
    const picked = gift.pick === true;
    const pickBadge = picked
      ? `<span class="gift-pick">★ ${escapeHtml(pickLabel)}</span>`
      : "";
    return `<article class="gift${picked ? " is-pick" : ""}">
      <a class="gift-photo" href="${escapeHtml(gift.url)}" target="_blank" rel="noopener" aria-label="View listing: ${name}">
        ${pickBadge}
        <img src="${escapeHtml(gift.image)}" alt="" loading="lazy" />
      </a>
      ${renderPrice(gift)}
      <h2>${name}</h2>
      <p>${escapeHtml(gift.description)}</p>
      ${options}
      ${extraLinks}
    </article>`;
  };

  const render = () => {
    const visible = picksOnly ? gifts.filter((gift) => gift.pick === true) : gifts;
    const sorted = visible.slice().sort((a, b) => {
      const left = Number(a.priceValue) || 0;
      const right = Number(b.priceValue) || 0;
      return sortDir === "desc" ? right - left : left - right;
    });
    grid.innerHTML = sorted.map(renderGift).join("");
  };

  const syncPickFilter = () => {
    if (!sortBar) return;
    const existing = sortBar.querySelector("[data-pick-filter]");
    const hasPicks = gifts.some((gift) => gift.pick === true);
    if (!hasPicks) {
      existing?.remove();
      picksOnly = false;
      return;
    }
    if (existing) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gift-sort-btn";
    button.dataset.pickFilter = "true";
    button.setAttribute("aria-pressed", "false");
    button.textContent = picksLabel;
    sortBar.appendChild(button);
  };

  sortBar?.addEventListener("click", (event) => {
    const pickButton = event.target.closest("[data-pick-filter]");
    if (pickButton) {
      picksOnly = pickButton.getAttribute("aria-pressed") !== "true";
      pickButton.classList.toggle("is-active", picksOnly);
      pickButton.setAttribute("aria-pressed", String(picksOnly));
      render();
      return;
    }
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

  const dataUrl = grid.getAttribute("data-gifts") || "data/christmas.json";

  fetch(dataUrl, { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      gifts = Array.isArray(data.gifts) ? data.gifts : [];
      syncPickFilter();
      render();
    })
    .catch(() => {
      grid.innerHTML = "<p>The list could not be loaded. Refresh and try again.</p>";
    });
})();
