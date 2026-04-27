const rows = [...document.querySelectorAll('.item-row')];
const totalEl = document.getElementById('estimateTotal');
const estimatorForm = document.getElementById('estimatorForm');
const yearEl = document.getElementById('year');
const photoForm = document.getElementById('photoForm');
const uploadInput = document.getElementById('photoUpload');
const uploadStatus = document.getElementById('uploadStatus');

function updateTotal() {
  let total = 0;

  rows.forEach((row) => {
    const count = Number(row.querySelector('.count').textContent);
    const price = Number(row.dataset.price);
    total += count * price;
  });

  totalEl.textContent = `$${total}`;
}

rows.forEach((row) => {
  const countEl = row.querySelector('.count');
  const plus = row.querySelector('.plus');
  const minus = row.querySelector('.minus');

  plus.addEventListener('click', () => {
    countEl.textContent = Number(countEl.textContent) + 1;
    updateTotal();
  });

  minus.addEventListener('click', () => {
    const nextValue = Math.max(0, Number(countEl.textContent) - 1);
    countEl.textContent = nextValue;
    updateTotal();
  });
});

estimatorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  alert('Thanks! We received your estimate request and will contact you shortly.');
});

photoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!uploadInput.files.length) {
    uploadStatus.textContent = 'Please select a photo first.';
    return;
  }

  uploadStatus.textContent = `Uploaded: ${uploadInput.files[0].name}`;
  photoForm.reset();
});

yearEl.textContent = new Date().getFullYear();
updateTotal();
