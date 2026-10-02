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
  // Bird-only checkbox options require one selection for birds and are hidden for any other type.
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
    "laying-hens-available": {
      label: "Laying Hens Available",
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
      // Disable bird-only inputs for non-bird types so they never submit values.
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

  const openModal = (breedName, typeName, statusName = "available", titlePhrase = breedName) => {
    if (!modal) return;
    resetWaitlistForm();
    if (modalTitle) {
      modalTitle.textContent = `Get more info about ${titlePhrase}`;
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
      const titlePhrase = button.getAttribute("data-modal-phrase") || breedName;
      openModal(breedName, typeName, statusName, titlePhrase);
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
      button.setAttribute("data-modal-phrase", breed.modalPhrase || breed.name);
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

    const wrapper = image.closest(".frame, .aperture");
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

  // Photos uploaded through the admin screen are stored in the repo and listed in
  // data/farm.json. A breed or slot with no uploaded photo yet falls back to Cloudinary.
  const localPhotoUrl = (path) => (typeof path === "string" && path.trim() ? path.trim().replace(/^\/+/, "") : "");

  const applyPhoto = (image, localPath, cloudinary, imageConfig, options = {}) => {
    if (!image) return;
    const url = localPhotoUrl(localPath);
    if (!url) {
      loadCloudinaryImage(image, cloudinary, imageConfig, options);
      return;
    }
    image.dataset.fallbackSrc = image.dataset.fallbackSrc || image.getAttribute("src") || "";
    image.decoding = "async";
    image.loading = options.eager ? "eager" : "lazy";
    const wrapper = image.closest(".frame, .aperture");
    const handleLoad = () => {
      image.classList.add("is-cloudinary-photo");
      if (wrapper) {
        wrapper.classList.add("has-cloudinary-photo");
      }
    };
    const handleError = () => {
      image.removeEventListener("load", handleLoad);
      loadCloudinaryImage(image, cloudinary, imageConfig, options);
    };
    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });
    image.src = url;
  };

  const fetchJson = async (path) => {
    try {
      const response = await fetch(path, { cache: "no-cache" });
      return response.ok ? await response.json() : null;
    } catch (error) {
      return null;
    }
  };

  const applyFarmConfig = async () => {
    // Static HTML remains accurate if either file cannot be fetched.
    const [config, farm] = await Promise.all([fetchJson("data/breeds.json"), fetchJson("data/farm.json")]);
    if (!config && !farm) return;
    const settings = config || {};
    const statuses = { ...statusFallbacks, ...(settings.statuses || {}) };
    const cloudinary = settings.cloudinary || {};
    const breedList = farm && Array.isArray(farm.breeds) ? farm.breeds : [];
    const breeds = Object.fromEntries(breedList.filter((breed) => breed && breed.id).map((breed) => [breed.id, breed]));
    const slotPhotos = { "home-hero": farm && farm.heroPhoto, "about-image": farm && farm.aboutPhoto };

    document.querySelectorAll(".breed-card[data-breed-id]").forEach((card) => {
      const breedId = card.dataset.breedId;
      const breed = breeds[breedId];
      const imageConfig = normalizeImageConfig((cloudinary.breedImages || {})[breedId], breedId, "breed");
      applyPhoto(card.querySelector("img"), breed && breed.photo, cloudinary, imageConfig);
      if (breed && breed.name && breed.type) {
        applyBreedStatus(card, breed, statuses);
      }
    });

    document.querySelectorAll("[data-cloudinary-slot]").forEach((image) => {
      const slotName = image.dataset.cloudinarySlot;
      const fallbackTransform = slotName === "home-hero" ? "hero" : "feature";
      const imageConfig = normalizeImageConfig((cloudinary.slots || {})[slotName], slotName, fallbackTransform);
      applyPhoto(image, slotPhotos[slotName], cloudinary, imageConfig, { eager: slotName === "home-hero" });
    });

    document.querySelectorAll("[data-facebook-link]").forEach((link) => {
      if (settings.facebookUrl) {
        link.href = settings.facebookUrl;
      }
    });
  };

  // The home opening grows into a frame the shape of its photo, so tell the
  // stylesheet that shape (width / height) whenever a photo loads.
  document.querySelectorAll(".aperture img").forEach((image) => {
    const setShape = () => {
      if (!image.naturalWidth || !image.naturalHeight) return;
      const ratio = Math.min(2.4, Math.max(0.6, image.naturalWidth / image.naturalHeight));
      image.closest(".aperture").style.setProperty("--photo-ar", ratio.toFixed(4));
    };
    image.addEventListener("load", setShape);
    if (image.complete) setShape();
  });

  applyFarmConfig();

  // Scroll controller. CSS draws every scene; this only publishes scroll positions as
  // custom properties (--p per scene or element, --page-p for the shell scale), because
  // scroll-driven CSS timelines are not available in every browser yet. With reduced
  // motion requested it never runs and the page stays in its still layout.
  const root = document.documentElement;
  if (!prefersReducedMotion.matches) {
    root.classList.add("motion");
    const scenes = Array.from(document.querySelectorAll("[data-scene]"));
    const scrubbed = Array.from(document.querySelectorAll("[data-scrub]"));
    const clamp = (value) => Math.min(Math.max(value, 0), 1);

    const measure = () => {
      scenes.forEach((scene) => {
        const track = scene.querySelector("[data-track]");
        if (!track) return;
        const travel = Math.max(track.scrollWidth - track.parentElement.clientWidth, 0);
        scene.style.setProperty("--travel", `${travel}px`);
      });
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      const header = document.querySelector(".site-header");
      const headerHeight = header ? header.offsetHeight : 0;
      root.style.setProperty(
        "--page-p",
        clamp(window.scrollY / Math.max(root.scrollHeight - vh, 1)).toFixed(4)
      );
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) return;
        scene.style.setProperty("--p", clamp(-rect.top / Math.max(rect.height - vh, 1)).toFixed(4));
      });
      scrubbed.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -vh || rect.top > vh * 2) return;
        const progress =
          element.dataset.scrub === "exit"
            ? (headerHeight - rect.top) / Math.max(rect.height, 1)
            : (vh - rect.top) / (vh + rect.height);
        element.style.setProperty("--p", clamp(progress).toFixed(4));
      });
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    const remeasure = () => {
      measure();
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure);
    }
    remeasure();
  }
})();
