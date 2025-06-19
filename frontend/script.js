const spinner = document.getElementById('spinner');
const toastEl = document.getElementById('uploadToast');
const toastMsg = document.getElementById('toastMsg');
const uploadBtn = document.getElementById('uploadBtn');
const validateBtn = document.getElementById('validateBtn');
const inputError = document.getElementById('inputError');

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('excelFile');
  const formData = new FormData();
  formData.append('excel', fileInput.files[0]);

  spinner.style.display = 'block';
  uploadBtn.disabled = true;

  try {
    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      toastMsg.innerText = `✅ Upload successful. Batch ID: ${data.batchId}`;
      new bootstrap.Toast(toastEl).show();

      // Auto-collapse the accordion panel
      const collapse = bootstrap.Collapse.getInstance(document.getElementById('uploadPanel'));
      collapse?.hide();
    }
  } catch (err) {
    alert('Upload failed.');
  } finally {
    spinner.style.display = 'none';
    uploadBtn.disabled = false;
    fileInput.value = ''; // clear selected file
  }
});

function showModal(message) {
  const icon = document.getElementById('resultIcon');
  const messageEl = document.getElementById('modalMessage');

  if (message.includes('Authentic product')) {
    icon.className = 'bi bi-check-circle-fill text-success fs-3';
  } else if (message.includes('already used')) {
    icon.className = 'bi bi-exclamation-circle-fill text-warning fs-3';
  } else {
    icon.className = 'bi bi-x-circle-fill text-danger fs-3';
  }

  messageEl.innerText = message;
  new bootstrap.Modal(document.getElementById('resultModal')).show();
}

document.getElementById('validateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('authCode').value.trim();

  if (!code || code.length < 3) {
    inputError.style.display = 'block';
    return;
  }

  inputError.style.display = 'none';
  validateBtn.disabled = true;
  spinner.style.display = 'block';

  try {
    const res = await fetch('/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    showModal(data.message);
  } catch (err) {
    showModal('An error occurred.');
  } finally {
    spinner.style.display = 'none';
    validateBtn.disabled = false;
  }
});
