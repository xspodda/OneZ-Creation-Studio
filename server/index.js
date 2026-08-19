import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scryptSync, timingSafeEqual } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const plans = {
  Pro: { price: 1, currency: 'usd', gpu: false },
  MAX: { price: 8, currency: 'usd', gpu: true },
};

const rootDir = dirname(fileURLToPath(import.meta.url));
const promoFile = join(rootDir, '..', 'data', 'promo-codes.json');
const promoCodes = Object.fromEntries((existsSync(promoFile) ? JSON.parse(readFileSync(promoFile, 'utf8')) : []).map(promo => [promo.code, promo]));
const accessAttempts = new Map();
const aiJobs = new Map();

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '32kb' }));
app.use('/admin', express.static(join(rootDir, '..', 'admin')));

function savePromos() {
  writeFileSync(promoFile, `${JSON.stringify(Object.values(promoCodes), null, 2)}\n`, 'utf8');
}

function adminGuard(request, response, next) {
  const configuredKey = process.env.ADMIN_KEY || '';
  if (!configuredKey || request.get('X-Admin-Key') !== configuredKey) return response.status(401).json({ error: 'Admin key required.' });
  next();
}

function getQuote(planName, code = '') {
  const plan = plans[planName];
  if (!plan) return { error: 'Unknown plan.' };
  const promo = code ? promoCodes[code.trim().toUpperCase()] : null;
  if (code && (!promo || !promo.active || !promo.plans.includes(planName))) return { error: 'That promo code is not valid for this plan.' };
  if (promo?.expiresAt && Date.now() > Date.parse(promo.expiresAt)) return { error: 'That promo code has expired.' };
  if (promo?.maxUses && promo.uses >= promo.maxUses) return { error: 'That promo code has reached its usage limit.' };
  const discount = promo ? promo.type === 'percent' ? plan.price * promo.value / 100 : Math.min(plan.price, promo.value) : 0;
  return { plan: planName, currency: plan.currency, subtotal: plan.price, discount, total: Math.max(0, plan.price - discount), promo: promo ? { code: code.trim().toUpperCase(), label: promo.label, type: promo.type, value: promo.value } : null };
}

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'onez-billing' }));
app.get('/api/billing/plans', (_request, response) => response.json({ plans }));
app.post('/api/ai/jobs', (request, response) => {
  const { tool, fileName = '', plan = 'Pro', gpuRequested = false } = request.body || {};
  const allowedTools = ['Auto captions', 'AI enhance', 'AI repair', 'AI clip maker'];
  if (!allowedTools.includes(tool)) return response.status(400).json({ error: 'Unsupported AI tool.' });
  const planConfig = plans[plan];
  if (!planConfig) return response.status(400).json({ error: 'Unknown plan.' });
  if (gpuRequested && !planConfig.gpu) return response.status(403).json({ error: 'GPU processing is available on the MAX plan.' });
  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const gpu = Boolean(gpuRequested && planConfig.gpu);
  const job = { id, tool, fileName, plan, processing: gpu ? 'gpu' : 'cpu', status: 'queued', progress: 0, createdAt: new Date().toISOString() };
  aiJobs.set(id, job);
  response.status(202).json({ job });
});
app.get('/api/ai/jobs/:id', (request, response) => {
  const job = aiJobs.get(request.params.id);
  if (!job) return response.status(404).json({ error: 'AI job not found.' });
  response.json({ job });
});
app.post('/api/promo/validate', (request, response) => {
  const quote = getQuote(request.body?.plan, request.body?.code || '');
  if (quote.error) return response.status(400).json(quote);
  response.json(quote);
});

app.get('/api/admin/promos', adminGuard, (_request, response) => response.json({ promos: Object.values(promoCodes) }));
app.post('/api/admin/promos', adminGuard, (request, response) => {
  const body = request.body || {};
  const code = String(body.code || '').trim().toUpperCase();
  const type = body.type === 'fixed' ? 'fixed' : 'percent';
  const value = Number(body.value);
  const plansForCode = Array.isArray(body.plans) ? body.plans.filter(plan => plans[plan]) : [];
  if (!/^[A-Z0-9_-]{4,32}$/.test(code) || !Number.isFinite(value) || value <= 0 || !plansForCode.length) return response.status(400).json({ error: 'Code, positive value, and at least one valid plan are required.' });
  if (promoCodes[code]) return response.status(409).json({ error: 'That promo code already exists.' });
  if (type === 'percent' && value > 100) return response.status(400).json({ error: 'Percentage discount cannot exceed 100.' });
  promoCodes[code] = { code, type, value, plans: plansForCode, label: type === 'percent' ? `${value}% off applied` : `$${value} off applied`, active: true, expiresAt: body.expiresAt || '', maxUses: Math.max(0, Number(body.maxUses || 0)), uses: 0 };
  savePromos();
  response.status(201).json({ promo: promoCodes[code] });
});
app.patch('/api/admin/promos/:code', adminGuard, (request, response) => {
  const code = request.params.code.toUpperCase();
  if (!promoCodes[code]) return response.status(404).json({ error: 'Promo code not found.' });
  if (typeof request.body?.active === 'boolean') promoCodes[code].active = request.body.active;
  savePromos();
  response.json({ promo: promoCodes[code] });
});
app.delete('/api/admin/promos/:code', adminGuard, (request, response) => {
  const code = request.params.code.toUpperCase();
  if (!promoCodes[code]) return response.status(404).json({ error: 'Promo code not found.' });
  delete promoCodes[code];
  savePromos();
  response.status(204).end();
});

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (accessAttempts.get(ip) || []).filter(timestamp => now - timestamp < 15 * 60 * 1000);
  recent.push(now);
  accessAttempts.set(ip, recent);
  return recent.length > 5;
}

function verifyAccessCode(code) {
  const stored = process.env.ACCESS_CODE_HASH || '';
  const [salt, expected] = stored.split(':');
  if (!salt || !expected || !code) return false;
  const actual = scryptSync(code, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return expectedBuffer.length === actual.length && timingSafeEqual(actual, expectedBuffer);
}

app.post('/api/access/redeem', (request, response) => {
  const ip = request.ip || 'unknown';
  if (isRateLimited(ip)) return response.status(429).json({ error: 'Too many attempts. Try again later.' });
  if (!verifyAccessCode(request.body?.code)) return response.status(401).json({ error: 'That access code is invalid.' });
  const expiresAt = process.env.ACCESS_CODE_EXPIRES || null;
  if (expiresAt && Date.now() > Date.parse(expiresAt)) return response.status(410).json({ error: 'That access code has expired.' });
  response.json({ granted: true, plan: process.env.ACCESS_CODE_PLAN || 'Pro', expiresAt });
});

app.post('/api/checkout/session', (request, response) => {
  const { plan, provider, promoCode = '', email = '' } = request.body || {};
  const quote = getQuote(plan, promoCode);
  if (quote.error) return response.status(400).json(quote);
  if (provider !== 'card') return response.status(400).json({ error: 'Only card payments are enabled right now.' });
  if (!email || !email.includes('@')) return response.status(400).json({ error: 'A valid account email is required.' });

  const providerConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  if (!providerConfigured) return response.status(503).json({ error: `${provider} payments are not configured yet. Add the provider keys to the server environment.` });

  response.status(501).json({ error: 'Provider credentials detected, but the provider adapter still needs to be enabled for live charging.', quote });
});

app.listen(port, () => console.log(`OneZ billing API listening on http://localhost:${port}`));
