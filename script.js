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

const selections = {};
const categoriesRoot = document.getElementById("item-categories");
const summaryRoot = document.getElementById("summary-items");
const totalRoot = document.getElementById("estimate-total");
const floorSelect = document.getElementById("floor-select");

const modal = document.getElementById("estimate-modal");
const flow = document.getElementById("estimate-flow");
const options = document.getElementById("estimate-options");

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function selectTab(tabId) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function showFlow(tabId) {
  flow.classList.remove("hidden");
  options.style.display = "none";
  selectTab(tabId);
}

function renderCategories() {
  categoriesRoot.innerHTML = "";

  Object.entries(itemData).forEach(([category, items]) => {
    const card = document.createElement("article");
    card.className = "category-card";

    const heading = document.createElement("h3");
    heading.textContent = category;
    card.appendChild(heading);

    items.forEach(([name, price]) => {
      const key = `${category}:${name}`;
      selections[key] = selections[key] || { name, category, price, qty: 0 };

      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div>
          <strong>${name}</strong><br>
          <small>${money(price)} each</small>
        </div>
        <div class="item-controls">
          <button class="qty-btn" data-key="${key}" data-delta="-1" aria-label="Decrease ${name}">−</button>
          <button class="qty-btn" data-key="${key}" data-delta="1" aria-label="Increase ${name}">+</button>
        </div>
        <div id="qty-${CSS.escape(key)}">0</div>
      `;
      card.appendChild(row);
    });

    categoriesRoot.appendChild(card);
  });

  categoriesRoot.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key]");
    if (!button) return;

    const key = button.dataset.key;
    const delta = Number(button.dataset.delta);
    const nextQty = Math.max(0, selections[key].qty + delta);
    selections[key].qty = nextQty;

    const qtyLabel = document.getElementById(`qty-${CSS.escape(key)}`);
    if (qtyLabel) qtyLabel.textContent = String(nextQty);

    updateSummary();
  });
}

function updateSummary() {
  summaryRoot.innerHTML = "";
  let subtotal = 0;

  Object.values(selections)
    .filter((item) => item.qty > 0)
    .forEach((item) => {
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;
      const line = document.createElement("div");
      line.className = "summary-line";
      line.innerHTML = `<span>${item.name} x${item.qty}</span><strong>${money(lineTotal)}</strong>`;
      summaryRoot.appendChild(line);
    });

  if (!summaryRoot.children.length) {
    summaryRoot.innerHTML = "<p>No items selected yet.</p>";
  }

  const adjustedTotal = subtotal * Number(floorSelect.value || 1);
  totalRoot.textContent = money(adjustedTotal);
}

floorSelect.addEventListener("change", updateSummary);

document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => selectTab(button.dataset.tab));
});

document.querySelectorAll(".open-estimate").forEach((button) => {
  button.addEventListener("click", () => {
    openModal();
    const targetTab = button.dataset.targetTab;
    if (targetTab) {
      showFlow(targetTab);
      return;
    }
    options.style.display = "grid";
    flow.classList.add("hidden");
  });
});

document.querySelectorAll("[data-open-flow]").forEach((button) => {
  button.addEventListener("click", () => showFlow(button.dataset.openFlow));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const siteNav = document.querySelector(".site-nav");
mobileMenuBtn.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelector(".photo-form").addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Thanks! We received your photo estimate request and will contact you shortly.");
});

renderCategories();
updateSummary();
