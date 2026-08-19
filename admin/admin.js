const api = '/api/admin/promos';
const keyInput = document.querySelector('#admin-key');
const panel = document.querySelector('#panel');
const authMessage = document.querySelector('#auth-message');
const list = document.querySelector('#promo-list');
const headers = () => ({ 'Content-Type': 'application/json', 'X-Admin-Key': keyInput.value });

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function loadPromos() {
  try {
    const data = await request(api);
    panel.classList.remove('hidden');
    authMessage.textContent = '';
    list.innerHTML = data.promos.map(promo => `<div class="promo-row"><strong>${promo.code}</strong><span class="discount">${promo.type === 'percent' ? `${promo.value}% off` : `$${promo.value} off`}</span><span>${promo.plans.join(' + ')}</span><span class="status ${promo.active ? '' : 'off'}">${promo.active ? 'Active' : 'Paused'}</span><div class="row-actions"><button data-action="toggle" data-code="${promo.code}">${promo.active ? 'Pause' : 'Enable'}</button><button class="delete" data-action="delete" data-code="${promo.code}">Delete</button></div></div>`).join('') || '<span>No promo codes yet.</span>';
    document.querySelector('#active-count').textContent = data.promos.filter(promo => promo.active).length;
    document.querySelector('#use-count').textContent = data.promos.reduce((total, promo) => total + promo.uses, 0);
  } catch (error) { panel.classList.add('hidden'); authMessage.textContent = error.message; }
}

document.querySelector('#load-button').addEventListener('click', loadPromos);
document.querySelector('#refresh-button').addEventListener('click', loadPromos);
document.querySelector('#promo-form').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.querySelector('#form-message');
  try {
    const plans = [...document.querySelector('#plans').selectedOptions].map(option => option.value);
    await request(api, { method: 'POST', body: JSON.stringify({ code: document.querySelector('#code').value, type: document.querySelector('#type').value, value: Number(document.querySelector('#value').value), plans, expiresAt: document.querySelector('#expiresAt').value, maxUses: Number(document.querySelector('#maxUses').value || 0) }) });
    event.target.reset(); message.className = 'promo-success'; message.textContent = 'Promo code created.'; await loadPromos();
  } catch (error) { message.className = 'promo-error'; message.textContent = error.message; }
});
list.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  try { await request(`${api}/${encodeURIComponent(button.dataset.code)}`, { method: button.dataset.action === 'delete' ? 'DELETE' : 'PATCH', body: button.dataset.action === 'toggle' ? JSON.stringify({ active: button.textContent === 'Enable' }) : undefined }); await loadPromos(); } catch (error) { authMessage.textContent = error.message; }
});
