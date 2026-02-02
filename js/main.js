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
  const modalBreedInput = modal ? modal.querySelector("[data-modal-breed-input]") : null;
  const modalTypeInput = modal ? modal.querySelector("[data-modal-type-input]") : null;
  const modalClose = document.querySelectorAll("[data-modal-close]");
  const openButtons = document.querySelectorAll("[data-waitlist]");
  const waitlistForm = modal ? modal.querySelector("[data-waitlist-form]") : null;
  const waitlistFields = modal ? modal.querySelector("[data-waitlist-fields]") : null;
  const waitlistStatus = modal ? modal.querySelector("[data-waitlist-status]") : null;
  const birdOptions = modal ? modal.querySelector("[data-bird-options]") : null;
  const eggCheckbox = modal ? modal.querySelector("[data-egg-checkbox]") : null;
  const liveCheckbox = modal ? modal.querySelector("[data-live-checkbox]") : null;
  const liveLabel = modal ? modal.querySelector("[data-live-label]") : null;
  // Bird-only checkbox options are hidden for goats and require one selection for birds.
  const birdTypes = new Set(["chicken", "ducks", "geese"]);
  const liveLabelMap = {
    chicken: "Chicks",
    ducks: "Ducklings",
    geese: "Goslings",
  };
  let currentType = "";

  const resetWaitlistForm = () => {
    if (waitlistForm) {
      waitlistForm.reset();
    }
    if (waitlistStatus) {
      waitlistStatus.textContent = "";
      waitlistStatus.classList.remove("is-visible");
    }
    if (waitlistFields) {
      waitlistFields.removeAttribute("hidden");
    }
  };

  const updateBirdValidity = () => {
    if (!birdTypes.has(currentType)) {
      if (eggCheckbox) {
        eggCheckbox.setCustomValidity("");
      }
      return;
    }
    const isChecked = [eggCheckbox, liveCheckbox].some((checkbox) => checkbox && checkbox.checked);
    const message = isChecked ? "" : "Select at least one request option.";
    if (eggCheckbox) {
      eggCheckbox.setCustomValidity(message);
    }
  };

  const updateBirdOptions = (typeName) => {
    currentType = typeName;
    if (!birdOptions) return;
    if (!birdTypes.has(typeName)) {
      birdOptions.setAttribute("hidden", "");
      // Disable bird-only inputs for goats so they never submit values.
      if (eggCheckbox) {
        eggCheckbox.disabled = true;
      }
      if (liveCheckbox) {
        liveCheckbox.disabled = true;
      }
      updateBirdValidity();
      return;
    }
    birdOptions.removeAttribute("hidden");
    if (eggCheckbox) {
      eggCheckbox.disabled = false;
    }
    if (liveCheckbox) {
      liveCheckbox.disabled = false;
    }
    if (liveLabel) {
      liveLabel.textContent = liveLabelMap[typeName] || "Live birds";
    }
    updateBirdValidity();
  };

  const openModal = (breedName, typeName) => {
    if (!modal) return;
    resetWaitlistForm();
    if (modalTitle) {
      modalTitle.textContent = `Join the ${breedName} waitlist`;
    }
    if (modalBreed) {
      modalBreed.textContent = breedName;
    }
    // Hidden fields help Formspree group submissions by breed and type.
    if (modalBreedInput) {
      modalBreedInput.value = breedName;
    }
    if (modalTypeInput) {
      modalTypeInput.value = typeName;
    }
    updateBirdOptions(typeName);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstInput = modal.querySelector('input:not([type="hidden"])');
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
      const typeName = button.getAttribute("data-type") || "";
      openModal(breedName, typeName);
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

  [eggCheckbox, liveCheckbox].forEach((checkbox) => {
    if (checkbox) {
      checkbox.addEventListener("change", updateBirdValidity);
    }
  });

  if (waitlistForm) {
    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      updateBirdValidity();
      if (!waitlistForm.checkValidity()) {
        waitlistForm.reportValidity();
        return;
      }
      if (waitlistStatus) {
        waitlistStatus.textContent = "Sending your request...";
        waitlistStatus.classList.add("is-visible");
      }
      const submittedBreed = modalBreedInput ? modalBreedInput.value : "your waitlist request";
      try {
        const response = await fetch(waitlistForm.action, {
          method: "POST",
          body: new FormData(waitlistForm),
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          if (waitlistFields) {
            waitlistFields.setAttribute("hidden", "");
          }
          if (waitlistStatus) {
            waitlistStatus.textContent = `Thanks! We'll follow up about ${submittedBreed}.`;
            waitlistStatus.classList.add("is-visible");
          }
          waitlistForm.reset();
        } else if (waitlistStatus) {
          waitlistStatus.textContent = "Something went wrong. Please try again.";
          waitlistStatus.classList.add("is-visible");
        }
      } catch (error) {
        if (waitlistStatus) {
          waitlistStatus.textContent = "Something went wrong. Please try again.";
          waitlistStatus.classList.add("is-visible");
        }
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
      element.style.setProperty("--delay", `${index * 80}ms`);
    });
    const heroActions = hero.querySelector(".hero-actions");
    if (heroActions) {
      Array.from(heroActions.children).forEach((action, index) => {
        registerReveal(action, "up");
        action.style.setProperty("--delay", `${index * 80}ms`);
      });
    }
    const heroCard = hero.querySelector(".hero-card");
    registerReveal(heroCard, "up");
    if (heroCard) {
      heroCard.style.setProperty("--delay", "90ms");
    }
    const heroImage = hero.querySelector(".hero-card img");
    registerReveal(heroImage, "zoom");
    if (heroImage) {
      heroImage.style.setProperty("--delay", "140ms");
    }
  }

  document.querySelectorAll(".section-header").forEach((header) => {
    staggerChildren(header, 60, "fade");
  });

  document.querySelectorAll(".page-hero").forEach((heroSection) => {
    const inner = heroSection.querySelector(".container");
    staggerChildren(inner, 70, "fade");
  });

  document.querySelectorAll(".value-grid").forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".value-card"));
    cards.forEach((card, index) => {
      registerReveal(card, "up");
      card.style.setProperty("--delay", `${index * 70}ms`);
    });
  });

  document.querySelectorAll(".breed-grid").forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".breed-card"));
    cards.forEach((card, index) => {
      registerReveal(card, "up");
      card.style.setProperty("--delay", `${index * 70}ms`);
      const image = card.querySelector("img");
      registerReveal(image, "zoom");
      if (image) {
        image.style.setProperty("--delay", `${index * 70 + 70}ms`);
      }
    });
  });

  document.querySelectorAll(".cta, .waitlist-section").forEach((block, index) => {
    registerReveal(block, "up");
    block.style.setProperty("--delay", `${index * 60}ms`);
  });

  document.querySelectorAll(".footer-grid").forEach((grid) => {
    staggerChildren(grid, 80, "fade");
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
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
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
