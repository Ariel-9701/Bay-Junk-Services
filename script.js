// =======================
// DATA
// =======================
const itemData = {
  Furniture: [
    ["Mattress", 85],
    ["Sofa", 115],
    ["Sectional Couch", 185],
    ["Dresser", 90],
    ["Bed Frame", 70],
    ["Chairs", 25],
    ["Table", 65]
  ],
  Appliances: [
    ["Refrigerator", 110],
    ["Washer", 95],
    ["Dryer", 95],
    ["Stove", 95],
    ["TV", 45]
  ],
  General: [
    ["Boxes", 12],
    ["Trash Bags", 10],
    ["Misc Items", 20]
  ],
  Debris: [
    ["Yard Waste", 35],
    ["Construction Debris", 60],
    ["Tires", 25]
  ],
  "Large Items": [
    ["Hot Tub", 350],
    ["Shed Removal", 420]
  ]
};

// =======================
// SAFE DOM HELPERS
// =======================
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function safeId(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

// =======================
// VIEW / PAGE LAYERS
// =======================
const views = $$("[data-view]");
const viewLinks = $$("[data-view-link]");
const siteNav = $("#siteNav");
const mobileMenuBtn = $("#mobileMenuBtn");

function showView(viewName) {
  views.forEach((view) => view.classList.toggle("active", view.dataset.view === viewName));

  viewLinks.forEach((link) => {
    const isActive = link.dataset.viewLink === viewName;
    link.classList.toggle("active", isActive);
  });

  siteNav?.classList.remove("open");
  mobileMenuBtn?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showView(link.dataset.viewLink);
  });
});

mobileMenuBtn?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

// =======================
// ESTIMATOR
// =======================
const selections = {};
const categoriesRoot = $("#item-categories");
const summaryRoot = $("#summary-items");
const totalRoot = $("#estimate-total");
const floorSelect = $("#floor-select");

function renderCategories() {
  if (!categoriesRoot) return;

  categoriesRoot.innerHTML = "";

  Object.entries(itemData).forEach(([category, items]) => {
    const card = document.createElement("article");
    card.className = "category-card";
    card.innerHTML = `<h3>${category}</h3>`;

    items.forEach(([name, price]) => {
      const key = `${category}:${name}`;
      const id = safeId(key);

      selections[key] = selections[key] || { name, category, price, qty: 0, id };

      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div>
          <strong>${name}</strong><br />
          <small>${money(price)} each</small>
        </div>
        <div class="item-controls" aria-label="${name} quantity controls">
          <button class="qty-btn" type="button" data-key="${key}" data-delta="-1" aria-label="Decrease ${name}">−</button>
          <button class="qty-btn" type="button" data-key="${key}" data-delta="1" aria-label="Increase ${name}">+</button>
        </div>
        <div class="qty-display" id="qty-${id}" aria-live="polite">0</div>
      `;
      card.appendChild(row);
    });

    categoriesRoot.appendChild(card);
  });
}

categoriesRoot?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (!button) return;

  const key = button.dataset.key;
  const delta = Number(button.dataset.delta);

  if (!selections[key]) return;

  selections[key].qty = Math.max(0, selections[key].qty + delta);

  const qtyLabel = document.getElementById(`qty-${selections[key].id}`);
  if (qtyLabel) qtyLabel.textContent = String(selections[key].qty);

  updateSummary();
});

function updateSummary() {
  if (!summaryRoot || !totalRoot) return;

  summaryRoot.innerHTML = "";
  let subtotal = 0;

  const selectedItems = Object.values(selections).filter((item) => item.qty > 0);

  if (!selectedItems.length) {
    summaryRoot.innerHTML = `<p class="summary-empty">No items selected yet.</p>`;
  } else {
    selectedItems.forEach((item) => {
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;

      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = `<span>${item.name} × ${item.qty}</span><strong>${money(lineTotal)}</strong>`;
      summaryRoot.appendChild(line);
    });
  }

  const multiplier = Number(floorSelect?.value || 1);
  totalRoot.textContent = money(subtotal * multiplier);
}

floorSelect?.addEventListener("change", updateSummary);

// =======================
// MODAL
// =======================
const modal = $("#estimateModal");
const estimateChoice = $("#estimateChoice");
const estimateWorkspace = $("#estimateWorkspace");
const openButtons = $$("[data-open-estimate]");
const closeButtons = $$("[data-close-modal]");
const choiceButtons = $$("[data-show-estimate-tab]");
const backChoice = $("[data-back-choice]");
const tabButtons = $$(".tab-btn");
const tabPanels = $$(".tab-panel");

function setTab(tabName) {
  const panelId = `${tabName}-panel`;

  tabButtons.forEach((button) => {
    const active = button.dataset.tab === panelId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === panelId);
  });
}

function showWorkspace(tabName = "items") {
  if (estimateChoice) estimateChoice.style.display = "none";
  if (estimateWorkspace) estimateWorkspace.hidden = false;
  setTab(tabName);
}

function showChoice() {
  if (estimateChoice) estimateChoice.style.display = "block";
  if (estimateWorkspace) estimateWorkspace.hidden = true;
}

function openModal(startTab = null) {
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  siteNav?.classList.remove("open");
  mobileMenuBtn?.setAttribute("aria-expanded", "false");

  if (startTab) {
    showWorkspace(startTab);
  } else {
    showChoice();
  }
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  showChoice();
}

openButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openModal(button.dataset.startTab || null);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showWorkspace(button.dataset.showEstimateTab || "items");
  });
});

backChoice?.addEventListener("click", showChoice);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab.replace("-panel", "");
    showWorkspace(tabName);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

// =======================
// LEAD FORM - FREE PHOTO FLOW
// =======================
const photoForm = $("#photoForm");
const formStatus = $("#formStatus");
const photoSubmitBtn = $("#photoSubmitBtn");

function setFormStatus(message, type = "info") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
}

photoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const endpoint = photoForm.getAttribute("action") || "";

  if (!endpoint || endpoint.includes("PASTE-YOUR-CODE-HERE")) {
    setFormStatus("Almost ready: paste your real Formspree link in the form action first.", "error");
    return;
  }

  if (photoSubmitBtn) {
    photoSubmitBtn.disabled = true;
    photoSubmitBtn.textContent = "Sending...";
  }

  setFormStatus("Sending your details...", "info");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(photoForm),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) throw new Error("Form submission failed");

    photoForm.reset();
    setFormStatus("Success! Your details were sent. You can now text photos for a faster quote.", "success");
  } catch (error) {
    setFormStatus("Something went wrong. Check your Formspree link and try again.", "error");
  } finally {
    if (photoSubmitBtn) {
      photoSubmitBtn.disabled = false;
      photoSubmitBtn.textContent = "Send My Details";
    }
  }
});

// =======================
// INIT
// =======================
renderCategories();
updateSummary();

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();


// =======================
// SEND ESTIMATE: SMS OR WHATSAPP
// =======================
const estimateSmsBtn = document.getElementById("estimateSmsBtn");
const estimateWhatsAppBtn = document.getElementById("estimateWhatsAppBtn");
const businessPhoneNumber = "18136255172";

function selectedEstimateItems() {
  return Object.values(selections).filter((item) => item.qty > 0);
}

function buildEstimateMessage() {
  const selectedItems = selectedEstimateItems();

  if (!selectedItems.length) {
    alert("Please select at least one item before sending your estimate.");
    return null;
  }

  let message = "Hi, I need a junk removal estimate:\n\n";

  selectedItems.forEach((item) => {
    message += `- ${item.name} x${item.qty} (${money(item.qty * item.price)})\n`;
  });

  const floorText = floorSelect?.options[floorSelect.selectedIndex]?.text || "Ground floor";
  const total = totalRoot?.textContent || "$0";

  message += `\nAccess: ${floorText}`;
  message += `\nEstimated total: ${total}`;
  message += "\n\nI would like to schedule this pickup.";

  return encodeURIComponent(message);
}

estimateSmsBtn?.addEventListener("click", () => {
  const message = buildEstimateMessage();
  if (!message) return;
  window.location.href = `sms:+${businessPhoneNumber}?body=${message}`;
});

estimateWhatsAppBtn?.addEventListener("click", () => {
  const message = buildEstimateMessage();
  if (!message) return;
  window.open(`https://wa.me/${businessPhoneNumber}?text=${message}`, "_blank");
});
