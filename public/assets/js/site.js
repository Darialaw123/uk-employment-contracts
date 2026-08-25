/**
 * Shared site behaviour: the mobile navigation toggle and the catalogue
 * rendering used by the homepage and the templates listing.
 *
 * Everything here degrades gracefully — the pages are readable and navigable
 * with JavaScript disabled, and only the catalogue grids and the builder need
 * it to fill in.
 */
(function (global) {
  "use strict";

  const UK = global.UK;
  const doc = global.document;

  /* ------------------------------------------------------------------ nav */

  const navToggle = doc.querySelector(".nav__toggle");
  const nav = doc.querySelector(".nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  /* Mark the current page in the navigation without hard-coding it per page. */
  const here = global.location.pathname.replace(/\/$/, "") || "/";
  doc.querySelectorAll(".nav a").forEach((link) => {
    const target = new URL(link.href, global.location.origin).pathname.replace(/\/$/, "") || "/";
    if (target === here) link.setAttribute("aria-current", "page");
  });

  /* ------------------------------------------------------------ catalogue */

  function cardMarkup(template) {
    return `
      <a class="card card--link" href="/build?template=${template.slug}">
        ${template.badge ? `<span class="badge">${template.badge}</span>` : ""}
        <h3>${template.name}</h3>
        <p>${template.summary}</p>
        <span class="card__meta">
          <span class="card__price">${UK.price(template.price)}</span>
          <span>${template.time}</span>
        </span>
      </a>`;
  }

  const featured = doc.getElementById("featured-templates");
  if (featured) {
    featured.innerHTML = UK.TEMPLATES.slice(0, 6).map(cardMarkup).join("");
  }

  const full = doc.getElementById("all-templates");
  if (full) {
    full.innerHTML = UK.CATEGORIES.map(
      (category) => `
      <section class="section section--tight" id="${category.slug}">
        <h2>${category.name}</h2>
        <p class="prose" style="color:var(--slate)">${category.blurb}</p>
        <div class="grid" style="margin-top:1.5rem">
          ${UK.byCategory(category.slug).map(cardMarkup).join("")}
        </div>
      </section>`
    ).join("");
  }

  const count = doc.getElementById("template-count");
  if (count) count.textContent = String(UK.TEMPLATES.length);
})(window);
