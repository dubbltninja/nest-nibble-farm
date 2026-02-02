(() => {
  // Mobile nav toggle.
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Shared waitlist modal behavior.
  const modal = document.querySelector("[data-modal]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalBreed = document.querySelector("[data-modal-breed]");
  const modalInput = document.querySelector("[data-modal-input]");
  const modalClose = document.querySelectorAll("[data-modal-close]");
  const openButtons = document.querySelectorAll("[data-waitlist]");

  const openModal = (breedName) => {
    if (!modal) return;
    if (modalTitle) {
      modalTitle.textContent = `Join the ${breedName} waitlist`;
    }
    if (modalBreed) {
      modalBreed.textContent = breedName;
    }
    if (modalInput) {
      modalInput.value = breedName;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstInput = modal.querySelector("input");
    if (firstInput) {
      firstInput.focus();
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const breedName = button.getAttribute("data-breed") || "this breed";
      openModal(breedName);
    });
  });

  modalClose.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Progressive reveal animations using IntersectionObserver.
  const revealTargets = new Set();

  const registerReveal = (element, type) => {
    if (!element || revealTargets.has(element)) return;
    element.classList.add("reveal");
    if (type) {
      element.dataset.reveal = type;
    }
    revealTargets.add(element);
  };

  const staggerChildren = (container, step = 80, type = "fade") => {
    if (!container) return;
    const children = Array.from(container.children);
    children.forEach((child, index) => {
      registerReveal(child, type);
      child.style.setProperty("--delay", `${index * step}ms`);
    });
  };

  const hero = document.querySelector(".hero");
  if (hero) {
    const heroElements = [hero.querySelector("h1"), hero.querySelector("p")].filter(Boolean);
    heroElements.forEach((element, index) => {
      registerReveal(element, "fade");
      element.style.setProperty("--delay", `${index * 120}ms`);
    });
    const heroActions = hero.querySelector(".hero-actions");
    if (heroActions) {
      Array.from(heroActions.children).forEach((action, index) => {
        registerReveal(action, "up");
        action.style.setProperty("--delay", `${index * 120}ms`);
      });
    }
    const heroCard = hero.querySelector(".hero-card");
    registerReveal(heroCard, "up");
    if (heroCard) {
      heroCard.style.setProperty("--delay", "140ms");
    }
    const heroImage = hero.querySelector(".hero-card img");
    registerReveal(heroImage, "zoom");
    if (heroImage) {
      heroImage.style.setProperty("--delay", "220ms");
    }
  }

  document.querySelectorAll(".section-header").forEach((header) => {
    staggerChildren(header, 90, "fade");
  });

  document.querySelectorAll(".page-hero").forEach((heroSection) => {
    const inner = heroSection.querySelector(".container");
    staggerChildren(inner, 120, "fade");
  });

  document.querySelectorAll(".value-grid").forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".value-card"));
    cards.forEach((card, index) => {
      registerReveal(card, "up");
      card.style.setProperty("--delay", `${index * 90}ms`);
    });
  });

  document.querySelectorAll(".breed-grid").forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".breed-card"));
    cards.forEach((card, index) => {
      registerReveal(card, "up");
      card.style.setProperty("--delay", `${index * 90}ms`);
      const image = card.querySelector("img");
      registerReveal(image, "zoom");
      if (image) {
        image.style.setProperty("--delay", `${index * 90 + 90}ms`);
      }
    });
  });

  document.querySelectorAll(".cta, .waitlist-section").forEach((block, index) => {
    registerReveal(block, "up");
    block.style.setProperty("--delay", `${index * 80}ms`);
  });

  document.querySelectorAll(".footer-grid").forEach((grid) => {
    staggerChildren(grid, 120, "fade");
  });

  const revealList = Array.from(revealTargets);
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealList.forEach((element) => element.classList.add("is-visible"));
  } else if (revealList.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    revealList.forEach((element) => revealObserver.observe(element));
  }

  // Lightweight parallax for hero and category transitions.
  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallaxElements.length && !prefersReducedMotion.matches) {
    const items = parallaxElements.map((element) => ({
      element,
      speed: Number.parseFloat(element.dataset.speed || "0.2"),
      parent: element.closest(".parallax-section") || element.parentElement,
      active: false,
    }));

    const itemMap = new Map(items.map((item) => [item.element, item]));
    const activeItems = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = itemMap.get(entry.target);
          if (!item) return;
          item.active = entry.isIntersecting;
          if (item.active) {
            activeItems.add(item);
          } else {
            activeItems.delete(item);
          }
        });
      },
      { rootMargin: "200px 0px" }
    );

    items.forEach((item) => observer.observe(item.element));

    let ticking = false;
    const updateParallax = () => {
      ticking = false;
      const baseDistance =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--parallax-distance")
        ) || 40;

      activeItems.forEach((item) => {
        if (!item.parent) return;
        const rect = item.parent.getBoundingClientRect();
        const offset = Math.max(
          Math.min(rect.top * item.speed, baseDistance),
          -baseDistance
        );
        item.element.style.setProperty("--parallax-offset", `${offset}px`);
      });
    };

    const requestParallaxUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    requestParallaxUpdate();
  }
})();
