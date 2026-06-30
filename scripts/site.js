const pageBody = document.body;

function initMobileNav() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-nav]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    pageBody.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "✕" : "☰";
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      pageBody.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    });
  });
}

function initHorseCarousel() {
  const root = document.querySelector("[data-horse-carousel]");
  if (!root) return;

  const frameImage = root.querySelector("[data-horse-image]");
  const dots = Array.from(root.querySelectorAll("[data-horse-dot]"));
  const slides = dots.map((dot) => ({
    src: dot.getAttribute("data-src"),
    alt: dot.getAttribute("data-alt") || "horse",
  }));

  let index = 0;
  let timer = null;

  function render(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    const slide = slides[index];
    frameImage.src = slide.src;
    frameImage.alt = slide.alt;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
      dot.setAttribute("aria-pressed", String(dotIndex === index));
    });
  }

  function restart() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => render(index + 1), 5000);
  }

  root.querySelector("[data-horse-prev]")?.addEventListener("click", () => {
    render(index - 1);
    restart();
  });
  root.querySelector("[data-horse-next]")?.addEventListener("click", () => {
    render(index + 1);
    restart();
  });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      render(dotIndex);
      restart();
    });
  });

  render(0);
  restart();
}

function initGallery() {
  const root = document.querySelector("[data-gallery]");
  if (!root) return;

  const track = root.querySelector("[data-gallery-track]");
  const slides = Array.from(root.querySelectorAll("[data-gallery-slide]"));
  const thumbs = Array.from(root.querySelectorAll("[data-gallery-thumb]"));
  const imageModal = document.querySelector("[data-image-modal]");
  const imageModalImg = imageModal?.querySelector("[data-image-modal-img]");
  let index = 0;

  function perView() {
    if (window.innerWidth <= 520) return 1;
    if (window.innerWidth <= 1040) return window.innerWidth <= 760 ? 2 : 3;
    return 4;
  }

  function render(nextIndex) {
    const maxIndex = Math.max(0, slides.length - perView());
    index = Math.min(Math.max(nextIndex, 0), maxIndex);
    const step = 100 / perView();
    track.style.transform = `translateX(-${index * step}%)`;
    thumbs.forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("active", active);
      if (active) {
        thumb.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    });
  }

  root.querySelector("[data-gallery-prev]")?.addEventListener("click", () => render(index - 1));
  root.querySelector("[data-gallery-next]")?.addEventListener("click", () => render(index + 1));
  root.querySelector("[data-thumbs-prev]")?.addEventListener("click", () => {
    root.querySelector("[data-thumb-scroller]")?.scrollBy({ left: -200, behavior: "smooth" });
  });
  root.querySelector("[data-thumbs-next]")?.addEventListener("click", () => {
    root.querySelector("[data-thumb-scroller]")?.scrollBy({ left: 200, behavior: "smooth" });
  });

  slides.forEach((slide, slideIndex) => {
    slide.addEventListener("click", () => {
      if (!imageModal || !imageModalImg) return;
      imageModalImg.src = slide.getAttribute("data-full");
      imageModalImg.alt = slide.getAttribute("data-alt") || "gallery image";
      imageModal.classList.add("open");
      pageBody.classList.add("modal-open");
      render(slideIndex);
    });
  });

  thumbs.forEach((thumb, thumbIndex) => {
    thumb.addEventListener("click", () => render(thumbIndex));
  });

  window.addEventListener("resize", () => render(index));
  render(0);
}

function initModals() {
  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest("[data-modal]");
      modal?.classList.remove("open");
      pageBody.classList.remove("modal-open");
    });
  });

  document.querySelectorAll("[data-modal]").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("open");
        pageBody.classList.remove("modal-open");
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-modal].open").forEach((modal) => {
      modal.classList.remove("open");
    });
    pageBody.classList.remove("modal-open");
  });
}

function initLoreModal() {
  const modal = document.querySelector("[data-lore-modal]");
  if (!modal) return;

  const typeNode = modal.querySelector("[data-lore-type]");
  const titleNode = modal.querySelector("[data-lore-title]");
  const taglineNode = modal.querySelector("[data-lore-tagline]");
  const copyNode = modal.querySelector("[data-lore-copy]");

  document.querySelectorAll("[data-lore-entry]").forEach((button) => {
    button.addEventListener("click", () => {
      const template = button.parentElement?.querySelector("template");
      typeNode.textContent = button.getAttribute("data-type") || "";
      titleNode.textContent = button.getAttribute("data-name") || "";
      taglineNode.textContent = button.getAttribute("data-tagline") || "";
      copyNode.innerHTML = template ? template.innerHTML : "";
      modal.classList.add("open");
      pageBody.classList.add("modal-open");
    });
  });
}

function initControlsFilters() {
  const root = document.querySelector("[data-controls]");
  if (!root) return;

  const input = root.querySelector("[data-controls-search]");
  const buttons = Array.from(root.querySelectorAll("[data-filter]"));
  const sections = Array.from(root.querySelectorAll("[data-category]"));
  let activeFilter = "all";

  function apply() {
    const query = String(input?.value || "").trim().toLowerCase();

    sections.forEach((section) => {
      const category = section.getAttribute("data-category");
      const cards = Array.from(section.querySelectorAll("[data-key-card]"));
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = card.textContent.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesCategory = activeFilter === "all" || activeFilter === category;
        const show = matchesQuery && matchesCategory;
        card.classList.toggle("hidden", !show);
        if (show) visibleCount += 1;
      });

      section.classList.toggle("hidden", visibleCount === 0 || (activeFilter !== "all" && activeFilter !== category));
      const countNode = section.querySelector("[data-category-count]");
      if (countNode) countNode.textContent = String(visibleCount).padStart(2, "0");
    });

    const empty = root.querySelector("[data-controls-empty]");
    const hasVisible = sections.some((section) => !section.classList.contains("hidden"));
    empty?.classList.toggle("hidden", hasVisible);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.getAttribute("data-filter") || "all";
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      apply();
    });
  });

  input?.addEventListener("input", apply);
  apply();
}

initMobileNav();
initHorseCarousel();
initGallery();
initModals();
initLoreModal();
initControlsFilters();