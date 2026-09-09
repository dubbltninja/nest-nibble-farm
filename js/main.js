(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navToggleLabel = document.querySelector(".nav-toggle-label");
  const header = document.querySelector(".site-header");

  const setNavOpen = (isOpen) => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
    if (navToggleLabel) {
      navToggleLabel.textContent = isOpen ? "Close" : "Menu";
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      setNavOpen(!navMenu.classList.contains("is-open"));
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });
  }

  document.querySelectorAll("[data-nav-flyout]").forEach((item) => {
    const toggle = item.querySelector("[data-nav-flyout-toggle]");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

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
    if (waitlistForm) waitlistForm.reset();
    if (waitlistStatus) {
      waitlistStatus.textContent = "";
      waitlistStatus.classList.remove("is-visible");
    }
    if (waitlistFields) waitlistFields.removeAttribute("hidden");
  };

  const updateBirdValidity = () => {
    if (!birdTypes.has(currentType)) {
      if (eggCheckbox) eggCheckbox.setCustomValidity("");
      return;
    }
    const isChecked = [eggCheckbox, liveCheckbox].some((checkbox) => checkbox && checkbox.checked);
    const message = isChecked ? "" : "Select at least one interest option.";
    if (eggCheckbox) eggCheckbox.setCustomValidity(message);
  };

  const updateBirdOptions = (typeName) => {
    currentType = typeName;
    if (!birdOptions) return;
    if (!birdTypes.has(typeName)) {
      birdOptions.setAttribute("hidden", "");
      if (eggCheckbox) eggCheckbox.disabled = true;
      if (liveCheckbox) liveCheckbox.disabled = true;
      updateBirdValidity();
      return;
    }
    birdOptions.removeAttribute("hidden");
    if (eggCheckbox) eggCheckbox.disabled = false;
    if (liveCheckbox) liveCheckbox.disabled = false;
    if (liveLabel) liveLabel.textContent = liveLabelMap[typeName] || "Live birds";
    updateBirdValidity();
  };

  const openModal = (breedName, typeName, statusName = "available", titlePhrase = breedName) => {
    if (!modal) return;
    resetWaitlistForm();
    if (modalTitle) {
      modalTitle.textContent =
        typeName === "farm" ? "Tell us what you're looking for" : `Get more info about ${titlePhrase}`;
    }
    if (modalBreed) modalBreed.textContent = breedName;
    if (modalBreedInput) modalBreedInput.value = breedName;
    if (modalTypeInput) modalTypeInput.value = typeName;
    if (modalStatusInput) modalStatusInput.value = statusName;
    updateBirdOptions(typeName);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setNavOpen(false);
      const breedName = button.getAttribute("data-breed") || "this breed";
      const typeName = button.getAttribute("data-type") || "";
      const statusName = button.getAttribute("data-status") || "available";
      const titlePhrase = button.getAttribute("data-modal-phrase") || breedName;
      openModal(breedName, typeName, statusName, titlePhrase);
    });
  });

  modalClose.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeModal();
    setNavOpen(false);
  });

  [eggCheckbox, liveCheckbox].forEach((checkbox) => {
    if (checkbox) checkbox.addEventListener("change", updateBirdValidity);
  });

  const submitFormspree = async (form, statusEl, fieldsEl, successMessage) => {
    if (statusEl) {
      statusEl.textContent = "Sending your request...";
      statusEl.classList.add("is-visible");
    }
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        if (fieldsEl) fieldsEl.setAttribute("hidden", "");
        if (statusEl) {
          statusEl.textContent = successMessage;
          statusEl.classList.add("is-visible");
        }
        form.reset();
      } else if (statusEl) {
        statusEl.textContent = "Something went wrong. Please try again.";
        statusEl.classList.add("is-visible");
      }
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = "Something went wrong. Please try again.";
        statusEl.classList.add("is-visible");
      }
    }
  };

  if (waitlistForm) {
    waitlistForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      updateBirdValidity();
      if (!waitlistForm.checkValidity()) {
        waitlistForm.reportValidity();
        return;
      }
      const submittedBreed = modalBreedInput ? modalBreedInput.value : "your interest request";
      await submitFormspree(
        waitlistForm,
        waitlistStatus,
        waitlistFields,
        `Thanks! We'll follow up about ${submittedBreed}.`
      );
    });
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const contactStatus = contactForm.querySelector("[data-contact-status]");
    const contactFields = contactForm.querySelector("[data-contact-fields]");
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      await submitFormspree(
        contactForm,
        contactStatus,
        contactFields,
        "Thanks! We'll be in touch shortly."
      );
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

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
      if (status.note) note.textContent = status.note;
      else note.remove();
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
      return { publicId: entry, transform: fallbackTransform };
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

  const eagerSlots = new Set([
    "home-hero",
    "home-dawn",
    "page-chickens",
    "page-ducks",
    "page-geese",
    "cashmere-goats",
  ]);

  const loadCloudinaryImage = (image, cloudinary, imageConfig, options = {}) => {
    const url = buildCloudinaryUrl(cloudinary, imageConfig);
    if (!image || !url) return;

    const wrapper = image.closest(
      ".specimen-card, .hero-card, .farm-stage, .about-image-card, .breed-visual, .dawn, .page-dawn, .world-portal, .chapter"
    );
    const fallbackSrc = image.dataset.fallbackSrc || image.getAttribute("src") || "";
    image.dataset.fallbackSrc = fallbackSrc;
    image.decoding = "async";
    image.loading = options.eager ? "eager" : "lazy";
    if (options.eager) image.setAttribute("fetchpriority", "high");

    const handleLoad = () => {
      image.classList.add("is-cloudinary-photo");
      if (wrapper) wrapper.classList.add("has-cloudinary-photo");
    };

    const handleError = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      image.classList.remove("is-cloudinary-photo");
      if (wrapper) wrapper.classList.remove("has-cloudinary-photo");
      if (fallbackSrc && image.getAttribute("src") !== fallbackSrc) {
        image.removeAttribute("fetchpriority");
        image.src = fallbackSrc;
      }
    };

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });
    if (image.getAttribute("src") !== url) image.src = url;
    else if (image.complete && image.naturalWidth) handleLoad();
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
      const fallbackTransform = eagerSlots.has(slotName) ? "wide" : "feature";
      const imageConfig = normalizeImageConfig(slots[slotName], slotName, fallbackTransform);
      loadCloudinaryImage(image, cloudinary, imageConfig, {
        eager: eagerSlots.has(slotName),
      });
    });
  };

  const applyGoatGalleryImages = (cloudinary) => {
    if (!cloudinary || !cloudinary.baseUrl) return;
    document.querySelectorAll("[data-goat-photo]").forEach((image) => {
      const publicId = image.dataset.goatPhoto;
      if (!publicId) return;
      const fallbackSrc = image.dataset.fallbackSrc || image.getAttribute("src") || "";
      image.dataset.fallbackSrc = fallbackSrc;
      image.dataset.lightboxSrc =
        buildCloudinaryUrl(cloudinary, { publicId, transform: "lightbox" }) || fallbackSrc;
      image.addEventListener(
        "error",
        () => {
          image.dataset.lightboxSrc = fallbackSrc;
        },
        { once: true }
      );
      loadCloudinaryImage(image, cloudinary, { publicId, transform: "gallery" });
    });
  };

  const initGoatGalleries = () => {
    document.querySelectorAll("[data-goat-gallery]").forEach((gallery) => {
      if (gallery.dataset.goatInitialized) return;
      gallery.dataset.goatInitialized = "true";

      const track = gallery.querySelector("[data-goat-track]");
      const slides = Array.from(gallery.querySelectorAll(".goat-gallery-slide"));
      const dots = Array.from(gallery.querySelectorAll("[data-goat-dot]"));
      const prevButton = gallery.querySelector("[data-goat-prev]");
      const nextButton = gallery.querySelector("[data-goat-next]");
      const openButtons = Array.from(gallery.querySelectorAll("[data-goat-open]"));
      const lightbox = document.querySelector("[data-goat-lightbox]");
      const lightboxImage = lightbox ? lightbox.querySelector("[data-goat-lightbox-image]") : null;
      const lightboxCaption = lightbox ? lightbox.querySelector("[data-goat-lightbox-caption]") : null;
      const lightboxPrev = lightbox ? lightbox.querySelector("[data-goat-lightbox-prev]") : null;
      const lightboxNext = lightbox ? lightbox.querySelector("[data-goat-lightbox-next]") : null;
      const lightboxClose = lightbox ? lightbox.querySelectorAll("[data-goat-close]") : [];
      let activeIndex = 0;

      if (!track || !slides.length) return;

      const normalizeIndex = (index) => (index + slides.length) % slides.length;

      const updateLightboxImage = () => {
        if (!lightboxImage) return;
        const image = slides[activeIndex].querySelector("img");
        if (!image) return;
        lightboxImage.src = image.dataset.lightboxSrc || image.currentSrc || image.src;
        lightboxImage.alt = image.alt || "Cashmere goat photo";
        if (lightboxCaption) lightboxCaption.textContent = image.dataset.goatCaption || "";
      };

      const setIndex = (index) => {
        activeIndex = normalizeIndex(index);
        gallery.style.setProperty("--goat-index", String(activeIndex));
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
        if (lightbox && lightbox.classList.contains("is-open")) updateLightboxImage();
      };

      const openLightbox = (index) => {
        if (!lightbox) return;
        setIndex(index);
        updateLightboxImage();
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        const closeButton = lightbox.querySelector("[data-goat-close]");
        if (closeButton) closeButton.focus();
      };

      const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };

      prevButton?.addEventListener("click", () => setIndex(activeIndex - 1));
      nextButton?.addEventListener("click", () => setIndex(activeIndex + 1));
      lightboxPrev?.addEventListener("click", () => setIndex(activeIndex - 1));
      lightboxNext?.addEventListener("click", () => setIndex(activeIndex + 1));
      lightboxClose.forEach((button) => button.addEventListener("click", closeLightbox));
      openButtons.forEach((button, index) => {
        button.addEventListener("click", () => openLightbox(index));
      });

      document.addEventListener("keydown", (event) => {
        if (!lightbox || !lightbox.classList.contains("is-open")) return;
        if (event.key === "Escape") closeLightbox();
        else if (event.key === "ArrowLeft") setIndex(activeIndex - 1);
        else if (event.key === "ArrowRight") setIndex(activeIndex + 1);
      });

      setIndex(0);
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
      applyGoatGalleryImages(config.cloudinary);

      document.querySelectorAll(".breed-card[data-breed-id]").forEach((card) => {
        const breed = breeds[card.dataset.breedId];
        if (breed) applyBreedStatus(card, breed, statuses);
      });

      document.querySelectorAll("[data-waitlist][data-breed-id]").forEach((button) => {
        if (button.closest(".breed-card") || button.classList.contains("btn-nav")) return;
        const breed = breeds[button.dataset.breedId];
        if (!breed) return;
        const statusName = breed.status || "available";
        const status = statuses[statusName] || statusFallbacks[statusName] || statusFallbacks.available;
        button.textContent = status.cta;
        button.setAttribute("data-status", statusName);
        button.setAttribute("data-breed", breed.name);
        button.setAttribute("data-type", breed.type);
        button.setAttribute("data-modal-phrase", breed.modalPhrase || breed.name);
      });

      document.querySelectorAll("[data-facebook-link]").forEach((link) => {
        if (config.facebookUrl) link.href = config.facebookUrl;
      });
    } catch (error) {
      // Static HTML remains accurate if local JSON cannot be fetched.
    }
  };

  applyFarmConfig();
  initGoatGalleries();

  const lerp = (a, b, t) => a + (b - a) * t;
  const hexToRgb = (hex) => {
    const value = hex.replace("#", "");
    return [
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    ];
  };
  const rgbToCss = (rgb) => `rgb(${rgb[0].toFixed(0)}, ${rgb[1].toFixed(0)}, ${rgb[2].toFixed(0)})`;

  const eggWorld = document.querySelector("[data-egg-world]");
  if (eggWorld) {
    const steps = Array.from(eggWorld.querySelectorAll("[data-egg-step]"));
    const photos = Array.from(eggWorld.querySelectorAll("[data-egg-photo]"));
    const dots = Array.from(eggWorld.querySelectorAll(".egg-progress span"));
    const washes = ["#10262c", "#18261a", "#2a1814", "#2a2418"].map(hexToRgb);
    const glows = [
      "rgba(155, 199, 199, 0.34)",
      "rgba(159, 181, 150, 0.34)",
      "rgba(157, 91, 57, 0.38)",
      "rgba(241, 220, 193, 0.28)",
    ];

    const setStep = (step) => {
      eggWorld.dataset.step = String(step);
      eggWorld.style.setProperty("--egg-step", String(step));
      steps.forEach((chapter) => {
        chapter.classList.toggle("is-current", chapter.dataset.eggStep === String(step));
      });
      photos.forEach((photo) => {
        photo.classList.toggle("is-current", photo.dataset.eggPhoto === String(step));
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === step - 1);
      });
    };

    if (prefersReducedMotion.matches) {
      eggWorld.classList.add("is-static");
      steps.forEach((chapter) => chapter.classList.add("is-current"));
      photos.forEach((photo) => photo.classList.add("is-current"));
    } else {
      let ticking = false;
      const updateEggWorld = () => {
        ticking = false;
        const rect = eggWorld.getBoundingClientRect();
        const travel = Math.max(eggWorld.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
        const scaled = progress * (washes.length - 1);
        const index = Math.min(Math.floor(scaled), washes.length - 2);
        const local = scaled - index;
        const wash = [
          lerp(washes[index][0], washes[index + 1][0], local),
          lerp(washes[index][1], washes[index + 1][1], local),
          lerp(washes[index][2], washes[index + 1][2], local),
        ];
        eggWorld.style.setProperty("--wash", rgbToCss(wash));
        eggWorld.style.setProperty("--glow", glows[Math.round(scaled)] || glows[0]);
        const pin = eggWorld.querySelector(".egg-world-pin");
        if (pin) pin.style.background = rgbToCss(wash);
        setStep(Math.min(Math.floor(progress * 4) + 1, 4));
      };
      const requestUpdate = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateEggWorld);
        }
      };
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
      requestUpdate();
    }
  }
})();
