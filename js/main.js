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

  // Shared interest modal behavior. Internal data names stay stable for existing markup.
  const modal = document.querySelector("[data-modal]");
  const modalTitle = document.querySelector("[data-modal-title]");
  const modalBreed = document.querySelector("[data-modal-breed]");
  const modalBreedInput = modal ? modal.querySelector("[data-modal-breed-input]") : null;
  const modalTypeInput = modal ? modal.querySelector("[data-modal-type-input]") : null;
  const modalStatusInput = modal ? modal.querySelector("[data-modal-status-input]") : null;
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
  const statusFallbacks = {
    available: {
      label: "Available",
      cta: "I'm interested",
      note: "",
    },
    "coming-soon": {
      label: "Coming soon",
      cta: "Get updates",
      note: "",
    },
    limited: {
      label: "Limited availability",
      cta: "Contact for info",
      note: "Availability is limited and changes with the season. Please contact us for the most current information.",
    },
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
    const message = isChecked ? "" : "Select at least one interest option.";
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

  const openModal = (breedName, typeName, statusName = "available") => {
    if (!modal) return;
    resetWaitlistForm();
    if (modalTitle) {
      modalTitle.textContent = `Tell us about ${breedName}`;
    }
    if (modalBreed) {
      modalBreed.textContent = breedName;
    }
    // Hidden fields help Formspree group submissions by breed, type, and availability status.
    if (modalBreedInput) {
      modalBreedInput.value = breedName;
    }
    if (modalTypeInput) {
      modalTypeInput.value = typeName;
    }
    if (modalStatusInput) {
      modalStatusInput.value = statusName;
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
      const statusName = button.getAttribute("data-status") || "available";
      openModal(breedName, typeName, statusName);
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
      const submittedBreed = modalBreedInput ? modalBreedInput.value : "your interest request";
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

  const applyBreedStatus = (card, breed, statuses) => {
    const statusName = breed.status || "available";
    const status = statuses[statusName] || statusFallbacks[statusName] || statusFallbacks.available;
    card.dataset.status = statusName;
    card.classList.add(`is-${statusName}`);

    const badge = card.querySelector("[data-breed-status]");
    if (badge) {
      badge.textContent = status.label;
      badge.className = `breed-status status-${statusName}`;
    }

    const note = card.querySelector("[data-status-note]");
    if (note) {
      if (status.note) {
        note.textContent = status.note;
      } else {
        note.remove();
      }
    }

    const button = card.querySelector("[data-waitlist]");
    if (button) {
      button.textContent = status.cta;
      button.setAttribute("data-status", statusName);
      button.setAttribute("data-breed", breed.name);
      button.setAttribute("data-type", breed.type);
    }
  };

  const normalizeImageConfig = (entry, fallbackPublicId, fallbackTransform = "breed") => {
    if (entry === false || entry === null) return null;
    if (typeof entry === "string") {
      return {
        publicId: entry,
        transform: fallbackTransform,
      };
    }
    return {
      publicId: entry && entry.publicId ? entry.publicId : fallbackPublicId,
      transform: entry && entry.transform ? entry.transform : fallbackTransform,
    };
  };

  const buildCloudinaryUrl = (cloudinary, imageConfig) => {
    if (!cloudinary || !cloudinary.baseUrl || !imageConfig || !imageConfig.publicId) return "";
    const publicId = imageConfig.publicId;
    if (/^https?:\/\//i.test(publicId)) return publicId;

    const extension = cloudinary.extension || "jpg";
    const hasExtension = /\.[a-z0-9]+$/i.test(publicId);
    const fileName = hasExtension ? publicId : `${publicId}.${extension}`;
    const transforms = cloudinary.transforms || {};
    const transform = transforms[imageConfig.transform] || imageConfig.transform || "";
    const baseUrl = cloudinary.baseUrl.replace(/\/$/, "");

    return [baseUrl, transform, fileName].filter(Boolean).join("/");
  };

  const loadCloudinaryImage = (image, cloudinary, imageConfig, options = {}) => {
    const url = buildCloudinaryUrl(cloudinary, imageConfig);
    if (!image || !url) return;

    const wrapper = image.closest(".specimen-card, .hero-card, .farm-stage");
    const fallbackSrc = image.dataset.fallbackSrc || image.getAttribute("src") || "";
    image.dataset.fallbackSrc = fallbackSrc;
    image.decoding = "async";
    image.loading = options.eager ? "eager" : "lazy";
    if (options.eager) {
      image.setAttribute("fetchpriority", "high");
    }

    const handleLoad = () => {
      image.classList.add("is-cloudinary-photo");
      if (wrapper) {
        wrapper.classList.add("has-cloudinary-photo");
      }
    };

    const handleError = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      image.classList.remove("is-cloudinary-photo");
      if (wrapper) {
        wrapper.classList.remove("has-cloudinary-photo");
      }
      if (fallbackSrc && image.getAttribute("src") !== fallbackSrc) {
        image.removeAttribute("fetchpriority");
        image.src = fallbackSrc;
      }
    };

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });
    image.src = url;
  };

  const applyCloudinaryImages = (cloudinary) => {
    if (!cloudinary || !cloudinary.baseUrl) return;
    const breedImages = cloudinary.breedImages || {};
    const slots = cloudinary.slots || {};

    document.querySelectorAll(".breed-card[data-breed-id]").forEach((card) => {
      const breedId = card.dataset.breedId;
      const image = card.querySelector("img");
      const imageConfig = normalizeImageConfig(breedImages[breedId], breedId, "breed");
      loadCloudinaryImage(image, cloudinary, imageConfig);
    });

    document.querySelectorAll("[data-cloudinary-slot]").forEach((image) => {
      const slotName = image.dataset.cloudinarySlot;
      const fallbackTransform = slotName === "home-hero" ? "hero" : "feature";
      const imageConfig = normalizeImageConfig(slots[slotName], slotName, fallbackTransform);
      loadCloudinaryImage(image, cloudinary, imageConfig, {
        eager: slotName === "home-hero",
      });
    });
  };

  const applyFarmConfig = async () => {
    try {
      const response = await fetch("data/breeds.json", { cache: "no-cache" });
      if (!response.ok) return;
      const config = await response.json();
      const statuses = { ...statusFallbacks, ...(config.statuses || {}) };
      const breeds = config.breeds || {};

      applyCloudinaryImages(config.cloudinary);

      document.querySelectorAll(".breed-card[data-breed-id]").forEach((card) => {
        const breed = breeds[card.dataset.breedId];
        if (breed) {
          applyBreedStatus(card, breed, statuses);
        }
      });

      document.querySelectorAll("[data-waitlist][data-breed-id]").forEach((button) => {
        if (button.closest(".breed-card")) return;
        const breed = breeds[button.dataset.breedId];
        if (!breed) return;
        const statusName = breed.status || "available";
        const status = statuses[statusName] || statusFallbacks[statusName] || statusFallbacks.available;
        button.textContent = status.cta;
        button.setAttribute("data-status", statusName);
        button.setAttribute("data-breed", breed.name);
        button.setAttribute("data-type", breed.type);
      });

      document.querySelectorAll("[data-facebook-link]").forEach((link) => {
        if (config.facebookUrl) {
          link.href = config.facebookUrl;
        }
      });
    } catch (error) {
      // Static HTML remains accurate if local JSON cannot be fetched.
    }
  };

  applyFarmConfig();

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

  document.querySelectorAll(".story-scene").forEach((scene) => {
    registerReveal(scene.querySelector(".sticky-visual"), "zoom");
    scene.querySelectorAll("[data-story-step]").forEach((chapter, index) => {
      registerReveal(chapter, "up");
      chapter.style.setProperty("--delay", `${index * 90}ms`);
    });
  });

  document.querySelectorAll(".palette-card:not(.story-palette-card)").forEach((card, index) => {
    registerReveal(card, "up");
    card.style.setProperty("--delay", `${index * 80}ms`);
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

  // Apple-inspired sticky story progress. Uses CSS custom properties so the
  // scene remains static and readable if JavaScript is unavailable.
  const storyScenes = Array.from(document.querySelectorAll("[data-story-scene]"));
  if (storyScenes.length && !prefersReducedMotion.matches) {
    const activeScenes = new Set();
    const storyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeScenes.add(entry.target);
          } else {
            activeScenes.delete(entry.target);
          }
        });
      },
      { rootMargin: "160px 0px" }
    );

    storyScenes.forEach((scene) => storyObserver.observe(scene));

    let storyTicking = false;
    const updateStories = () => {
      storyTicking = false;
      const viewportHeight = window.innerHeight || 1;
      activeScenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const travel = Math.max(rect.height - viewportHeight, viewportHeight * 0.7);
        const rawProgress = (viewportHeight * 0.35 - rect.top) / travel;
        const progress = Math.min(Math.max(rawProgress, 0), 1);
        const step = Math.min(Math.floor(progress * 4) + 1, 4);
        scene.style.setProperty("--story-progress", progress.toFixed(3));
        scene.style.setProperty("--story-step", String(step));
        scene.querySelectorAll("[data-story-step]").forEach((chapter) => {
          chapter.classList.toggle("is-current", chapter.dataset.storyStep === String(step));
        });
        scene.style.setProperty("--story-spin", `${(progress * 140).toFixed(2)}deg`);
        scene.style.setProperty("--story-spin-reverse", `${(progress * -190).toFixed(2)}deg`);
        scene.style.setProperty("--story-one-x", `${(-138 + progress * 88).toFixed(2)}px`);
        scene.style.setProperty("--story-one-y", `${(-30 + progress * -64).toFixed(2)}px`);
        scene.style.setProperty("--story-one-rotate", `${(-18 + progress * 40).toFixed(2)}deg`);
        scene.style.setProperty("--story-two-x", `${(118 + progress * -44).toFixed(2)}px`);
        scene.style.setProperty("--story-two-y", `${(-72 + progress * 86).toFixed(2)}px`);
        scene.style.setProperty("--story-two-rotate", `${(16 + progress * -55).toFixed(2)}deg`);
        scene.style.setProperty("--story-three-x", `${(-28 + progress * 48).toFixed(2)}px`);
        scene.style.setProperty("--story-three-y", `${(128 + progress * -44).toFixed(2)}px`);
        scene.style.setProperty("--story-three-rotate", `${(progress * 35).toFixed(2)}deg`);
      });
    };

    const requestStoryUpdate = () => {
      if (!storyTicking) {
        storyTicking = true;
        window.requestAnimationFrame(updateStories);
      }
    };

    window.addEventListener("scroll", requestStoryUpdate, { passive: true });
    window.addEventListener("resize", requestStoryUpdate);
    requestStoryUpdate();
  }

  // Subtle spotlight for premium specimen cards.
  if (!prefersReducedMotion.matches && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".specimen-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--card-x", `${x.toFixed(1)}%`);
        card.style.setProperty("--card-y", `${y.toFixed(1)}%`);
      });
    });
  }
})();
