// =======================
// EMAILJS CONFIG
// =======================
const EMAILJS_PUBLIC_KEY = "PtXTxlI5wOohMZTz5";
const EMAILJS_SERVICE_ID = "service_r9xbav2";
const EMAILJS_CLIENT_TEMPLATE_ID = "template_cv3ngtc";
const EMAILJS_OWNER_TEMPLATE_ID = "template_jc3rf4i";

if (window.emailjs) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// =======================
// DATA
// =======================
const itemData = {
  Furniture: [
    ["Mattress", 15],
    ["Box Spring", 6],
    ["Sofa", 18],
    ["Loveseat", 12],
    ["Sectional Couch", 30],
    ["Recliner", 10],
    ["Dresser", 15],
    ["Bed Frame", 12],
    ["Headboard", 6],
    ["Chairs", 4],
    ["Dining Table", 14],
    ["Coffee Table", 7],
    ["TV Stand", 10],
    ["Nightstand", 5],
    ["Bookshelf", 10],
    ["Desk", 12]
  ],
  Appliances: [
    ["Refrigerator", 25],
    ["Washer", 18],
    ["Dryer", 18],
    ["Stove", 18],
    ["Dishwasher", 12],
    ["Microwave", 5],
    ["TV", 6]
  ],
  General: [
    ["Boxes", 3],
    ["Trash Bags", 3],
    ["Misc Items", 5],
    ["Small Rug", 4],
    ["Large Rug", 8],
    ["Toys / Small Household Items", 3]
  ],
  Debris: [
    ["Yard Waste", 10],
    ["Construction Debris", 15],
    ["Wood / Lumber", 15],
    ["Drywall", 18],
    ["Tile / Concrete", 25],
    ["Tires", 6]
  ],
  "Large Items": [
    ["Hot Tub", 60],
    ["Shed Removal", 70],
    ["Piano", 50],
    ["Pool Table", 50],
    ["Exercise Equipment", 25],
    ["Patio Set", 22],
    ["Grill", 10]
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

function getTrailerEstimate(volume) {
  if (volume <= 0) {
    return {
      load: "No items selected",
      range: "$0",
      label: "$0",
      low: 0,
      high: 0
    };
  }

  if (volume <= 25) {
    return {
      load: "Minimum Load",
      range: "$90 – $140",
      label: "Minimum Load ($90 – $140)",
      low: 90,
      high: 140
    };
  }

  if (volume <= 40) {
    return {
      load: "¼ Trailer",
      range: "$180 – $280",
      label: "¼ Trailer ($180 – $280)",
      low: 180,
      high: 280
    };
  }

  if (volume <= 60) {
    return {
      load: "½ Trailer",
      range: "$350 – $450",
      label: "½ Trailer ($350 – $450)",
      low: 350,
      high: 450
    };
  }

  if (volume <= 80) {
    return {
      load: "¾ Trailer",
      range: "$500 – $650",
      label: "¾ Trailer ($500 – $650)",
      low: 500,
      high: 650
    };
  }

  if (volume <= 100) {
    return {
      load: "Full Trailer",
      range: "$700 – $800",
      label: "Full Trailer ($700 – $800)",
      low: 700,
      high: 800
    };
  }

  return {
    load: "Multiple Loads",
    range: "Custom Quote",
    label: "Multiple Loads (Custom Quote)",
    low: 0,
    high: 0
  };
}

function selectedVolume(items = selectedEstimateItems()) {
  const baseVolume = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const multiplier = Number(floorSelect?.value || 1);
  return Math.round(baseVolume * multiplier);
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

  Object.entries(itemData).forEach(([category, items], index) => {
    const card = document.createElement("article");
    card.className = "category-card";
    card.innerHTML = `
      <button class="category-toggle" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
        <span>${category}</span>
        <span class="category-arrow" aria-hidden="true">⌄</span>
      </button>
      <div class="category-items" ${index === 0 ? "" : "hidden"}></div>
    `;

    const itemsWrap = card.querySelector(".category-items");
    const toggle = card.querySelector(".category-toggle");

    if (index === 0) {
      card.classList.add("open");
    }

    items.forEach(([name, price]) => {
      const key = `${category}:${name}`;
      const id = safeId(key);

      selections[key] = selections[key] || { name, category, price, qty: 0, id };

      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div>
          <strong>${name}</strong><br />
          <small class="item-hint">Estimated trailer space: ${price}%</small>
        </div>
        <div class="item-controls" aria-label="${name} quantity controls">
          <button class="qty-btn" type="button" data-key="${key}" data-delta="-1" aria-label="Decrease ${name}">−</button>
          <button class="qty-btn" type="button" data-key="${key}" data-delta="1" aria-label="Increase ${name}">+</button>
        </div>
        <div class="qty-display" id="qty-${id}" aria-live="polite">0</div>
      `;
      itemsWrap.appendChild(row);
    });

    toggle?.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      itemsWrap.hidden = isOpen;
      card.classList.toggle("open", !isOpen);
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

  const selectedItems = Object.values(selections).filter((item) => item.qty > 0);

  if (!selectedItems.length) {
    summaryRoot.innerHTML = `<p class="summary-empty">No items selected yet.</p>`;
    totalRoot.textContent = "$0";
    totalRoot.dataset.estimateValue = "0";
    totalRoot.dataset.loadSize = "No items selected";
    totalRoot.dataset.priceRange = "$0";
    return;
  }

  selectedItems.forEach((item) => {
    const line = document.createElement("div");
    line.className = "summary-line";
    line.innerHTML = `<span>${item.name} × ${item.qty}</span><strong>${item.price * item.qty}%</strong>`;
    summaryRoot.appendChild(line);
  });

  const volume = selectedVolume(selectedItems);
  const estimate = getTrailerEstimate(volume);

  totalRoot.textContent = estimate.label;
  totalRoot.dataset.estimateValue = estimate.range;
  totalRoot.dataset.loadSize = estimate.load;
  totalRoot.dataset.priceRange = estimate.range;
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
// SEND ESTIMATE BY EMAILJS
// =======================
const estimateEmailForm = document.getElementById("estimateEmailForm");
const estimateEmailBtn = document.getElementById("estimateEmailBtn");
const estimateEmailStatus = document.getElementById("estimateEmailStatus");

function selectedEstimateItems() {
  return Object.values(selections).filter((item) => item.qty > 0);
}

function calculateEstimate() {
  const selectedItems = selectedEstimateItems();
  const volume = selectedVolume(selectedItems);
  const estimate = getTrailerEstimate(volume);
  const access = floorSelect?.options[floorSelect.selectedIndex]?.text || "Ground floor";

  return {
    selectedItems,
    volume,
    loadSize: estimate.load,
    priceRange: estimate.range,
    totalLabel: estimate.label,
    access
  };
}

function buildEstimateRows(items) {
  return items.map((item) => {
    const lineVolume = item.qty * item.price;
    return `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:center;">${item.qty}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:right;">${lineVolume}%</td>
      </tr>
    `;
  }).join("");
}

function setEstimateEmailStatus(message, type = "info") {
  if (!estimateEmailStatus) return;
  estimateEmailStatus.textContent = message;
  estimateEmailStatus.className = `form-status ${type}`;
}

estimateEmailForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!window.emailjs) {
    setEstimateEmailStatus("Email service is not loaded. Please check your internet connection and try again.", "error");
    return;
  }

  const { selectedItems, volume, loadSize, priceRange, totalLabel, access } = calculateEstimate();

  if (!selectedItems.length) {
    setEstimateEmailStatus("Please select at least one item first.", "error");
    return;
  }

  const formData = new FormData(estimateEmailForm);

  const customerName = String(formData.get("customer_name") || "").trim();
  const customerEmail = String(formData.get("customer_email") || "").trim();
  const customerPhone = String(formData.get("customer_phone") || "").trim();
  const customerAddress = String(formData.get("customer_address") || "").trim();
  const preferredDate = String(formData.get("preferred_date") || "").trim() || "Not selected";
  const notes = String(formData.get("notes") || "").trim() || "No notes provided.";

  const quoteId = "BJ-" + Math.floor(10000 + Math.random() * 90000);

  const templateParams = {
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    preferred_date: preferredDate,
    access: access,
    estimate_table: buildEstimateRows(selectedItems),
    subtotal: `${volume}% estimated trailer space`,
    discount: "$0",
    total: totalLabel,
    notes: `${notes}\n\nEstimated Load: ${loadSize}\nEstimated Price Range: ${priceRange}`,
    quote_id: quoteId,
    load_size: loadSize,
    price_range: priceRange,
    trailer_volume: `${volume}%`
  };

  try {
    if (estimateEmailBtn) {
      estimateEmailBtn.disabled = true;
      estimateEmailBtn.textContent = "Sending...";
    }

    setEstimateEmailStatus("Sending estimate...", "info");

    await Promise.all([
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CLIENT_TEMPLATE_ID, templateParams),
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_OWNER_TEMPLATE_ID, templateParams)
    ]);

    estimateEmailForm.reset();
    setEstimateEmailStatus("Success! Your estimate was sent by email.", "success");
  } catch (error) {
    console.error("EmailJS error:", error);
    setEstimateEmailStatus("Something went wrong sending the estimate. Please try again or text us.", "error");
  } finally {
    if (estimateEmailBtn) {
      estimateEmailBtn.disabled = false;
      estimateEmailBtn.textContent = "Send Estimate by Email";
    }
  }
});
