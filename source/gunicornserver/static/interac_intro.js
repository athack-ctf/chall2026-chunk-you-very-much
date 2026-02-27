  (() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.getElementById("sponsor-pill");
    if (!target || prefersReduced) return;

    const RUN_ONCE = false;
    if (RUN_ONCE) {
      if (sessionStorage.getItem("interacPillIntroSeen") === "1") return;
      sessionStorage.setItem("interacPillIntroSeen", "1");
    }

    const FADE_IN_MS = 240;
    const HOLD_MS = 1000;
    const TRAVEL_MS = 1100;
    const START_SCALE = 3.5;

    function runSponsorIntro() {
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      target.classList.add("sponsor-pill-hidden");

      const blur = document.createElement("div");
      blur.className = "sponsor-intro-blur";
      document.body.appendChild(blur);

      const clone = target.cloneNode(true);
      clone.removeAttribute("id");
      clone.classList.add("sponsor-pill-fly");
      clone.classList.remove("sponsor-pill-hidden");
      document.body.appendChild(clone);

      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const tx = cx - (rect.left + rect.width / 2);
      const ty = cy - (rect.top + rect.height / 2);

      clone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${START_SCALE})`;
      clone.style.opacity = "0";
      clone.style.boxShadow =
        "inset 0 0 0 1px rgba(240,181,28,0.14), 0 0 30px rgba(240,181,28,0.20)";

      clone.getBoundingClientRect();

      requestAnimationFrame(() => {
        blur.style.opacity = "1";
        clone.style.transition = `opacity ${FADE_IN_MS}ms ease-out`;
        clone.style.opacity = "1";
      });

      setTimeout(() => {
        blur.style.opacity = "0";
        clone.style.transition = [
          `transform ${TRAVEL_MS}ms cubic-bezier(0.20, 0.90, 0.20, 1.00)`,
          `opacity ${TRAVEL_MS}ms ease`,
          `box-shadow ${TRAVEL_MS}ms ease`
        ].join(", ");

        clone.style.transform = "translate3d(0,0,0) scale(1)";
        clone.style.opacity = "0.98";
        clone.style.boxShadow =
          "inset 0 0 0 1px rgba(240,181,28,0.08), 0 0 10px rgba(240,181,28,0.08)";
      }, FADE_IN_MS + HOLD_MS);

      setTimeout(() => {
        target.classList.remove("sponsor-pill-hidden");
        clone.remove();
        blur.remove();
      }, FADE_IN_MS + HOLD_MS + TRAVEL_MS + 50);
    }

    window.addEventListener("load", () => {
      setTimeout(runSponsorIntro, 120);
    }, { once: true });
  })();