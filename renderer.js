document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') document.getElementById('dev-popup-overlay').classList.remove('dev-open');
});

/* ══ BLOOD SUGAR SYNC ══ */
function bsf(id) {
  return document.getElementById(id).value.trim();
}
function fmtBSL(v) {
  if (!v) return '';
  const n = parseFloat(v);
  return isNaN(n) ? v : n.toFixed(1);
}

function syncKetoneDefault(valueId, ketoneId) {
  const ketone = document.getElementById(ketoneId);
  if (bsf(valueId) && !ketone.value) {
    ketone.value = 'Absent';
    ketone.dataset.autoAbsent = 'true';
  } else if (!bsf(valueId) && ketone.dataset.autoAbsent === 'true') {
    ketone.value = '';
    delete ketone.dataset.autoAbsent;
  }
}
function bsKetoneChanged(id) {
  delete document.getElementById(id).dataset.autoAbsent;
  bsSync();
}

function bsSync() {
  syncKetoneDefault('bsf-r-val', 'bsf-r-ket');
  syncKetoneDefault('bsf-f-val', 'bsf-f-ket');
  syncKetoneDefault('bsf-p-val', 'bsf-p-ket');
  document.getElementById('bsr-name').textContent = toTitleCase(bsf('bsf-name')) || '—';
  autoShrinkName('bsr-name');
  document.getElementById('bsr-ref').textContent = bsf('bsf-ref') || '—';
  document.getElementById('bsr-date').textContent =
    document.getElementById('bsf-date')?.value || today;

  const sections = [];

  // Random
  const rVal = bsf('bsf-r-val'),
    rUsg = bsf('bsf-r-usg'),
    rKet = bsf('bsf-r-ket');
  if (rVal || rUsg || rKet)
    sections.push({
      title: 'BSL  (Random)',
      normal: 'Normal 70 to 140 mg/dl',
      val: rVal,
      usg: rUsg,
      ket: rKet,
    });

  // Fasting
  const fVal = bsf('bsf-f-val'),
    fUsg = bsf('bsf-f-usg'),
    fKet = bsf('bsf-f-ket');
  if (fVal || fUsg || fKet)
    sections.push({
      title: 'BSL  (Fasting)',
      normal: 'Normal 70 to 110 mg/dl',
      val: fVal,
      usg: fUsg,
      ket: fKet,
    });

  // Post-Prandial
  const pVal = bsf('bsf-p-val'),
    pUsg = bsf('bsf-p-usg'),
    pKet = bsf('bsf-p-ket');
  if (pVal || pUsg || pKet)
    sections.push({
      title: 'BSL  (Post - Prandial)',
      normal: 'Normal 70 to 140 mg/dl',
      val: pVal,
      usg: pUsg,
      ket: pKet,
    });

  document.getElementById('bs-sections').innerHTML = sections
    .map((s) => {
      const numVal = s.val ? fmtBSL(s.val) : '&#8230;&#8230;&#8230;&#8230;';
      const mgVal = 'mg/dl';
      const urineVal = s.usg || '&#8230;&#8230;&#8230;.';
      const ketoneVal = s.val ? s.ket || 'Absent' : s.ket && s.ket !== 'Absent' ? s.ket : '-';

      return `<div class="bs-section">
      <div class="bs-row1">
        <span class="bs-section-title">${s.title}</span>
        <span class="bs-val-num">${numVal}</span>
        <span class="bs-val-mg">${mgVal}</span>
      </div>
      <div class="bs-section-normal">(${s.normal})</div>
      <div class="bs-urine-row"><div class="bs-urine-tr">
        <span class="bs-u-label">Urine Sugar</span>
        <span class="bs-u-colon">&nbsp;:</span>
        <span class="bs-u-val">&nbsp;${urineVal}</span>
        <span class="bs-u-gap"></span>
        <span class="bs-k-label">Ketone</span>
        <span class="bs-k-colon">&nbsp;:</span>
        <span class="bs-k-val">&nbsp;&nbsp;${ketoneVal}</span>
      </div></div>
    </div>`;
    })
    .join('');
}

function buildBSRec() {
  return {
    type: 'bs',
    name: bsf('bsf-name') || 'Unknown',
    date: bsf('bsf-date'),
    ref: bsf('bsf-ref'),
    rVal: bsf('bsf-r-val'),
    rUsg: bsf('bsf-r-usg'),
    rKet: bsf('bsf-r-ket'),
    fVal: bsf('bsf-f-val'),
    fUsg: bsf('bsf-f-usg'),
    fKet: bsf('bsf-f-ket'),
    pVal: bsf('bsf-p-val'),
    pUsg: bsf('bsf-p-usg'),
    pKet: bsf('bsf-p-ket'),
    savedAt: new Date().toISOString(),
  };
}
function loadBSRec(r) {
  const f = (id, v) => {
    if (v !== undefined && document.getElementById(id)) document.getElementById(id).value = v || '';
  };
  ['bsf-r-ket', 'bsf-f-ket', 'bsf-p-ket'].forEach(
    (id) => delete document.getElementById(id).dataset.autoAbsent,
  );
  f('bsf-name', r.name);
  f('bsf-date', r.date);
  f('bsf-ref', r.ref);
  f('bsf-r-val', r.rVal);
  f('bsf-r-usg', r.rUsg);
  f('bsf-r-ket', r.rKet);
  f('bsf-f-val', r.fVal);
  f('bsf-f-usg', r.fUsg);
  f('bsf-f-ket', r.fKet);
  f('bsf-p-val', r.pVal);
  f('bsf-p-usg', r.pUsg);
  f('bsf-p-ket', r.pKet);
  bsSync();
}

/* ══ BS Print ══ */
async function bsPrint() {
  if (!requireName('bsf-name')) return;
  try {
    await saveReportForPrint('bs', buildBSRec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  printOnly('bs-report', getTabPageSize('bs', 'A5'));
}
const bsPrintStyle = document.createElement('style');
document.head.appendChild(bsPrintStyle);

/* ══ BS Share ══ */
async function bsShare() {
  if (!requireName('bsf-name')) return;
  const btn = document.getElementById('bs-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const blob = await captureEl(document.getElementById('bs-report'));
    await saveRec(buildBSRec());
    await doShare(blob, bsf('bsf-name'));
  } catch (e) {
    if (!handleSaveError(e) && e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

/* ══ IndexedDB ══ */
let db;
const DB_NAME = 'pitrubhakta_lab',
  DB_VERSION = 2,
  STORE = 'reports';
let loadedRecordId = null,
  loadedRecordType = null,
  loadedRecordEditSession = null;
const EDITABLE_REPORT_FORMS = {
  sero: { form: 'sero-form', date: 'sf-date' },
  haemo: { form: 'haemo-form', date: 'hf-date' },
  bs: { form: 'bs-form', date: 'bsf-date' },
  biochem: { form: 'biochem-form', date: 'bcf-date' },
  crpra: { form: 'crpra-form', date: 'cf-date' },
  bill: { form: 'bill-form', date: 'bf-date' },
};
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        const s = d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        s.createIndex('name', 'name', { unique: false });
        s.createIndex('savedAt', 'savedAt', { unique: false });
        s.createIndex('type', 'type', { unique: false });
      } else if (e.oldVersion < 2) {
        // add type index if upgrading
        try {
          e.target.transaction.objectStore(STORE).createIndex('type', 'type', { unique: false });
        } catch (ex) {}
      }
    };
    r.onsuccess = (e) => {
      db = e.target.result;
      res(db);
    };
    r.onerror = (e) => rej(e.target.error);
  });
}
function saveRec(rec) {
  return new Promise(async (res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    const r = tx.objectStore(STORE).add(rec);
    r.onsuccess = () => res(r.result);
    r.onerror = (e) => rej(e.target.error);
  });
}
function updateRec(rec) {
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    const request = tx.objectStore(STORE).put(rec);
    request.onsuccess = () => res(request.result);
    request.onerror = (e) => rej(e.target.error);
  });
}
function markLoadedRecordEdited(event) {
  const target = event.target;
  if (!target?.matches?.('input,select,textarea,.btn-del-row')) return;
  const config = EDITABLE_REPORT_FORMS[loadedRecordType];
  if (loadedRecordId == null || !config || !target.closest('#' + config.form)) return;
  document.getElementById(config.date).value = fmtDate(new Date());
}
document.addEventListener('input', markLoadedRecordEdited, true);
document.addEventListener('change', markLoadedRecordEdited, true);
document.addEventListener(
  'click',
  (event) => {
    if (event.target.closest('.btn-del-row'))
      markLoadedRecordEdited({ target: event.target.closest('.btn-del-row') });
  },
  true,
);

async function saveReportForPrint(type, record) {
  if (loadedRecordId == null || loadedRecordType !== type) {
    await saveRec(record);
    return;
  }
  const session = loadedRecordEditSession;
  if (!session) {
    await saveRec(record);
    return;
  }
  record.savedAt = new Date().toISOString();
  session.queue = session.queue
    .catch(() => {})
    .then(async () => {
      if (session.copyId == null) {
        session.copyId = await saveRec(record);
        if (loadedRecordEditSession === session) loadedRecordId = session.copyId;
        showToast('Saved to history', '#1a3a5c');
      } else {
        record.id = session.copyId;
        await updateRec(record);
      }
    });
  await session.queue;
}

function showToast(msg, bg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:20px;right:20px;background:${bg};color:#fff;padding:10px 18px;border-radius:8px;font-size:.85rem;z-index:9999;opacity:0;transition:opacity .3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = '1'), 10);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 2500);
}
function getAllRecs() {
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = (e) => rej(e.target.error);
  });
}
function delRec(id) {
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    const r = tx.objectStore(STORE).delete(id);
    r.onsuccess = () => res();
    r.onerror = (e) => rej(e.target.error);
  });
}

/* ══ Date helpers ══ */
function fmtDate(d) {
  return (
    String(d.getDate()).padStart(2, '0') +
    '/' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '/' +
    d.getFullYear()
  );
}
function fmtDT(iso) {
  const d = new Date(iso);
  return (
    fmtDate(d) +
    ' ' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0')
  );
}
function buildFN(name) {
  const n = name.trim().replace(/\s+/g, '_') || 'Patient';
  const now = new Date();
  return `${n}_${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
}

const today = fmtDate(new Date());
function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v;
}
setVal('sf-date', today);
setVal('hf-date', today);
setVal('bsf-date', today);
setVal('cf-date', today);
setVal('bcf-date', today);

/* ══ Tab switching ══ */
function switchMain(tab, btn) {
  loadedRecordId = null;
  loadedRecordType = null;
  loadedRecordEditSession = null;
  document.querySelectorAll('.main-tab-page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.main-tab-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById('main-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab === 'allhistory') {
    document.getElementById('all-hist-content').innerHTML = '';
    renderHistory('all', 'all-hist-content');
  }
  if (tab === 'bill') {
    initBill();
  }
  if (tab === 'crpra') {
    crpraSync();
  }
  if (tab === 'biochem') {
    biochemSync();
  }
  if (tab === 'settings') {
    buildSettingsCards();
  }
}
function switchSub(prefix, sub, btn) {
  const parent = btn.closest('.main-tab-page');
  parent.querySelectorAll('.sub-tab-page').forEach((p) => p.classList.remove('active'));
  parent.querySelectorAll('.sub-tab-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById(prefix + '-' + sub).classList.add('active');
  if (btn) btn.classList.add('active');
  if (sub === 'hist') {
    if (prefix === 'sero') {
      document.getElementById('sero-hist-content').innerHTML = '';
      renderHistory('sero', 'sero-hist-content');
    }
    if (prefix === 'haemo') {
      document.getElementById('haemo-hist-content').innerHTML = '';
      renderHistory('haemo', 'haemo-hist-content');
    }
    if (prefix === 'bs') {
      document.getElementById('bs-hist-content').innerHTML = '';
      renderHistory('bs', 'bs-hist-content');
    }
    if (prefix === 'bill') {
      document.getElementById('bill-hist-content').innerHTML = '';
      renderHistory('bill', 'bill-hist-content');
    }
    if (prefix === 'crpra') {
      document.getElementById('crpra-hist-content').innerHTML = '';
      renderHistory('crpra', 'crpra-hist-content');
    }
    if (prefix === 'biochem') {
      document.getElementById('biochem-hist-content').innerHTML = '';
      renderHistory('biochem', 'biochem-hist-content');
    }
  }
}

/* ══ Name autocomplete ══ */
async function showSug(inputId, sugId, type) {
  const val = document.getElementById(inputId).value.trim().toLowerCase();
  const box = document.getElementById(sugId);
  if (!val || !db) {
    box.classList.remove('open');
    return;
  }
  let all = await getAllRecs();
  all.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  const seen = new Map();
  all.forEach((r) => {
    const k = r.name.toLowerCase();
    if (k.includes(val) && !seen.has(k)) seen.set(k, r);
  });
  if (seen.size === 0) {
    box.classList.remove('open');
    return;
  }
  box.innerHTML = '';
  seen.forEach((r) => {
    const d = document.createElement('div');
    d.className = 'sug-item';
    const typeLabels = {
      sero: 'Serology',
      haemo: 'Haemogram',
      bs: 'Blood Sugar',
      bill: 'Bill',
      crpra: 'CRP/RA',
      biochem: 'Bio-Chemistry',
    };
    const typeLbl = typeLabels[r.type] || 'Report';
    d.innerHTML = `<span>${r.name}</span><span class="sug-meta">${typeLbl} · ${fmtDate(new Date(r.savedAt))}</span>`;
    d.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (type === 'sero') loadSeroRec(r);
      else if (type === 'haemo') loadHaemoRec(r);
      else if (type === 'bs') loadBSRec(r);
      else if (type === 'bill') loadBillRec(r);
      else if (type === 'crpra') loadCRPRARec(r);
      else loadBiochemRec(r);
      box.classList.remove('open');
    });
    box.appendChild(d);
  });

  // Position fixed dropdown below the input
  const input = document.getElementById(inputId);
  const rect = input.getBoundingClientRect();
  box.style.top = rect.bottom + 2 + 'px';
  box.style.left = rect.left + 'px';
  box.style.width = rect.width + 'px';
  box.classList.add('open');
}
function hideSug(id) {
  setTimeout(() => document.getElementById(id).classList.remove('open'), 300);
}

/* ══ BT/CT dropdown → text builder ══ */
function buildTime(field) {
  const minEl = document.getElementById(`hf-${field}-min`);
  const secEl = document.getElementById(`hf-${field}-sec`);
  const textEl = document.getElementById(`hf-${field}`);
  const minV = minEl.value,
    secV = secEl.value;
  if (minV === 'manual' || secV === 'manual') {
    textEl.focus();
    textEl.placeholder = 'Type manually e.g. 2 min 45 sec';
    // reset the manual option back so dropdown looks clean
    if (minV === 'manual') minEl.value = '';
    if (secV === 'manual') secEl.value = '';
    return;
  }
  if (!minV && !secV) {
    textEl.value = '';
    return;
  }
  const parts = [];
  if (minV) parts.push(minV + ' min');
  if (secV && secV !== '00') parts.push(secV + ' sec');
  else if (secV === '00' && minV) parts.push('00 sec');
  textEl.value = parts.join(' ');
}

/* ══ SEROLOGY ══ */
const DEFAULT_TPL = {
  hbsag_neg_method: '[ Immunochromatography Method ]',
  hbsag_neg_note:
    'NOTE  : A Negative result at any time does not preclude the possibility of Hepatitis B infection. All positive results must be confirmed by other methods like Neutralization test or ELISA. Or Hepatitis B envelope antigen ( HBeAg ).',
  hbsag_pos_method: '[ Immunochromatography Method ]',
  hbsag_pos_note:
    'NOTE  : POSITIVE result indicates presence of Hepatitis B Surface Antigen. Please confirm with additional tests like ELISA or Neutralization test. Consult a physician immediately.',
  hiv_nrx_method: '[ HIV I & II Tri-Dot Method ]',
  hiv_nrx_note:
    'NOTE :Repeat this test after 3 months to rule out the possibility of false negative test (i.e.Window period). This test detects only antibody to HIV I & II and may become positive after risk behaviour. (exposure to antigen).The test may be false negative during incubation period. This test is known to give occassional false positive results.Hence all positive results should be confirmed by Western Blot.',
  hiv_rx_method: '[ HIV I & II Tri-Dot Method ]',
  hiv_rx_note:
    '1.Please repeat the test by some other screening method to rule out rare chance of false POSITIVE. If the repeat test is also REACTIVE then please confirm by WESTERN BLOT.\n2.AIDS & AIDS-RELATED SYNDROMES are clinical conditions & their diagnosis can only be established clinically. This screening test cannot be used as sole criteria for the diagnosis.\n3.Please DO NOT LABEL the patient as HIV-REACTIVE unless & until confirmed by the WESTERN BLOT.',
};
let tpl = { ...DEFAULT_TPL };

function loadTemplates() {
  const s = localStorage.getItem('pitrubhakta_templates');
  if (s) {
    try {
      tpl = { ...DEFAULT_TPL, ...JSON.parse(s) };
    } catch (e) {}
  }
  document.getElementById('tpl-hbsag-neg-method').value = tpl.hbsag_neg_method;
  document.getElementById('tpl-hbsag-neg-note').value = tpl.hbsag_neg_note;
  document.getElementById('tpl-hbsag-pos-method').value = tpl.hbsag_pos_method;
  document.getElementById('tpl-hbsag-pos-note').value = tpl.hbsag_pos_note;
  document.getElementById('tpl-hiv-nrx-method').value = tpl.hiv_nrx_method;
  document.getElementById('tpl-hiv-nrx-note').value = tpl.hiv_nrx_note;
  document.getElementById('tpl-hiv-rx-method').value = tpl.hiv_rx_method;
  document.getElementById('tpl-hiv-rx-note').value = tpl.hiv_rx_note;
}
function saveTemplates() {
  tpl.hbsag_neg_method = document.getElementById('tpl-hbsag-neg-method').value.trim();
  tpl.hbsag_neg_note = document.getElementById('tpl-hbsag-neg-note').value.trim();
  tpl.hbsag_pos_method = document.getElementById('tpl-hbsag-pos-method').value.trim();
  tpl.hbsag_pos_note = document.getElementById('tpl-hbsag-pos-note').value.trim();
  tpl.hiv_nrx_method = document.getElementById('tpl-hiv-nrx-method').value.trim();
  tpl.hiv_nrx_note = document.getElementById('tpl-hiv-nrx-note').value.trim();
  tpl.hiv_rx_method = document.getElementById('tpl-hiv-rx-method').value.trim();
  tpl.hiv_rx_note = document.getElementById('tpl-hiv-rx-note').value.trim();
  localStorage.setItem('pitrubhakta_templates', JSON.stringify(tpl));
  seroSync();
  const m = document.getElementById('tpl-saved-msg');
  m.style.display = 'block';
  setTimeout(() => (m.style.display = 'none'), 3000);
}

function seroSync() {
  document.getElementById('sr-name').textContent =
    toTitleCase(document.getElementById('sf-name').value.trim()) || '—';
  autoShrinkName('sr-name');
  document.getElementById('sr-ref').textContent =
    document.getElementById('sf-ref').value.trim() || '—';
  document.getElementById('sr-date').textContent = document.getElementById('sf-date').value;
  const hbsag = document.getElementById('sf-hbsag').value;
  const hbsagEl = document.getElementById('sr-hbsag');
  hbsagEl.textContent = hbsag === 'NOT_TESTED' ? 'Not Tested' : hbsag;
  hbsagEl.classList.toggle('result-positive', hbsag === 'POSITIVE');
  // Hide entire entry if Not Tested
  const hbsagEntry = document.querySelector('[id="sr-hbsag"]')?.closest('.test-entry');
  if (hbsagEntry) hbsagEntry.style.display = hbsag === 'NOT_TESTED' ? 'none' : '';
  document.getElementById('sr-hbsag-method').textContent =
    hbsag === 'POSITIVE' ? tpl.hbsag_pos_method : tpl.hbsag_neg_method;
  document.getElementById('sr-hbsag-note').textContent =
    hbsag === 'POSITIVE' ? tpl.hbsag_pos_note : tpl.hbsag_neg_note;
  const hiv = document.getElementById('sf-hiv').value;
  const hivEntry = document.querySelector('[id="sr-hiv"]')?.closest('.test-entry');
  if (hivEntry) hivEntry.style.display = hiv === 'NOT_TESTED' ? 'none' : '';
  const hivEl = document.getElementById('sr-hiv');
  hivEl.innerHTML = hiv;
  hivEl.classList.toggle('result-positive', hiv.startsWith('REACTIVE'));
  document.getElementById('sr-hiv-method').textContent = hiv.startsWith('REACTIVE')
    ? tpl.hiv_rx_method
    : tpl.hiv_nrx_method;
  // For REACTIVE note — render numbered points with line breaks
  const hivNote = hiv.startsWith('REACTIVE') ? tpl.hiv_rx_note : tpl.hiv_nrx_note;
  const hivNoteEl = document.getElementById('sr-hiv-note');
  if (hiv.startsWith('REACTIVE') && hivNote.includes('\n')) {
    hivNoteEl.innerHTML = hivNote
      .split('\n')
      .map((line) => `<div style="margin-bottom:4px">${line}</div>`)
      .join('');
  } else {
    hivNoteEl.textContent = hivNote;
  }
  const hcv = document.getElementById('sf-hcv').value;
  const hcvEl = document.getElementById('sr-hcv');
  hcvEl.textContent = hcv === 'NOT_TESTED' ? 'Not Tested' : hcv;
  hcvEl.classList.toggle('result-positive', hcv === 'POSITIVE');
  const hcvEntry = document.getElementById('sr-hcv-entry');
  if (hcvEntry) hcvEntry.style.display = hcv === 'NOT_TESTED' ? 'none' : '';
}

function buildSeroRec() {
  return {
    type: 'sero',
    name: document.getElementById('sf-name').value.trim() || 'Unknown',
    date: document.getElementById('sf-date').value,
    ref: document.getElementById('sf-ref').value.trim(),
    hbsag: document.getElementById('sf-hbsag').value,
    hiv: document.getElementById('sf-hiv').value,
    hcv: document.getElementById('sf-hcv').value,
    savedAt: new Date().toISOString(),
  };
}
function loadSeroRec(r) {
  document.getElementById('sf-name').value = r.name;
  document.getElementById('sf-date').value = r.date || today;
  document.getElementById('sf-ref').value = r.ref;
  document.getElementById('sf-hbsag').value = r.hbsag;
  document.getElementById('sf-hiv').value = r.hiv;
  if (r.hcv) document.getElementById('sf-hcv').value = r.hcv;
  seroSync();
}

/* ══ Smart print — only prints the specific report ══ */
/* ══ Per-tab print margin settings ══ */
const DEFAULT_MARGINS = { top: 15, bottom: 15, left: 15, right: 15 };
const TAB_DEFAULT_MARGINS = {
  sero: { top: 48, bottom: 0, left: 8, right: 8 },
  haemo: { top: 48, bottom: 0, left: 7, right: 7 },
  bs: { top: 48, bottom: 15, left: 11, right: 5 },
  biochem: { top: 48, bottom: 15, left: 23, right: 23 },
  crpra: { top: 47, bottom: 15, left: 23, right: 23 },
  bill: { top: 48, bottom: 15, left: 20, right: 19 },
};

// Apply defaults only if no saved value exists yet — never overwrite user-saved margins
(function applyDefaultMargins() {
  Object.entries(TAB_DEFAULT_MARGINS).forEach(([key, val]) => {
    const lsKey = '_pcl_margin_' + key;
    if (!localStorage.getItem(lsKey)) {
      localStorage.setItem(lsKey, JSON.stringify(val));
    }
  });
})();
const TAB_KEYS = {
  'sero-report': 'sero',
  'haemo-report': 'haemo',
  'bs-report': 'bs',
  'biochem-report': 'biochem',
  'crpra-report': 'crpra',
  'bill-report': 'bill',
};

function getMargins(reportId) {
  const key = '_pcl_margin_' + (TAB_KEYS[reportId] || 'default');
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch (e) {}
  const tabKey = TAB_KEYS[reportId] || 'default';
  return TAB_DEFAULT_MARGINS[tabKey] ? { ...TAB_DEFAULT_MARGINS[tabKey] } : { ...DEFAULT_MARGINS };
}
function saveMargins(tabKey, margins) {
  localStorage.setItem('_pcl_margin_' + tabKey, JSON.stringify(margins));
}

const printPageStyle = document.createElement('style');
document.head.appendChild(printPageStyle);

async function printReportDocument(reportId, pageSize) {
  const config = LIVE_PRINT_PREVIEW_TABS.find((tab) => tab.report === reportId);
  const report = document.getElementById(reportId);
  if (!config || !report) return;
  const sheet = report.parentElement;
  if (!sheet?.classList.contains('print-preview-sheet')) return;
  const paper = getPaperDimensions(pageSize);
  const mainPage = report.closest('.main-tab-page');
  const subPage = report.closest('.sub-tab-page');
  const mainWasActive = mainPage?.classList.contains('active') || false;
  const subWasActive = subPage?.classList.contains('active') || false;
  if (mainPage) mainPage.classList.add('active');
  if (subPage) subPage.classList.add('active');

  document.body.classList.add('report-printing');
  sheet.classList.add('print-active');
  applyPrintPreviewLayout(sheet, config, pageSize, 1, (paper.width * 96) / 25.4);
  printPageStyle.textContent = `@media print{@page{size:${pageSize} portrait;margin:0}}`;

  try {
    window.print();
  } catch (error) {
    showToast(`Print failed: ${error.message}`, '#dc2626');
  } finally {
    sheet.classList.remove('print-active');
    document.body.classList.remove('report-printing');
    printPageStyle.textContent = '';
    if (mainPage && !mainWasActive) mainPage.classList.remove('active');
    if (subPage && !subWasActive) subPage.classList.remove('active');
    refreshLivePrintPreview(sheet);
  }
}

function printOnly(reportId, pageSize = 'A4') {
  return printReportDocument(reportId, pageSize);
}

async function seroPrint() {
  if (!requireName('sf-name')) return;
  try {
    await saveReportForPrint('sero', buildSeroRec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  printOnly('sero-report', getTabPageSize('sero', 'A4'));
}

/* ══ HAEMOGRAM SYNC ══ */
function hv(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  return el.value.trim();
}

function haemoSync() {
  document.getElementById('hr-name').textContent = hv('hf-name') || '—';
  autoShrinkName('hr-name');
  document.getElementById('hr-ref').textContent = hv('hf-ref') || '—';
  document.getElementById('hr-date').textContent =
    document.getElementById('hf-date')?.value || today;

  let html = '';

  // Helper — one full line with 3 zones using padding, no fixed columns
  const line = (label, result, range, opts = {}) => {
    const lbl = opts.underline
      ? `<b><u>${label}</u></b>`
      : opts.bold !== false
        ? `<b>${label}</b>`
        : label;
    const col = opts.colon ? ' :' : '';
    return `<div style="display:flex;font-size:11pt;padding:${opts.tight ? '1px' : '3px'} 0;line-height:1.5;font-family:inherit">
      <span style="flex:0 0 38%;font-size:11pt">${lbl}${col}</span>
      <span style="flex:0 0 22%;font-size:11pt">${result || ''}</span>
      <span style="flex:1;font-size:11pt;color:#333">${range || ''}</span>
    </div>`;
  };

  const gap = () => `<div style="height:10px"></div>`;

  // Haemoglobin
  if (hv('hf-hb')) {
    const hbVal = parseFloat(hv('hf-hb'));
    const hbDisplay = isNaN(hbVal) ? hv('hf-hb') : hbVal.toFixed(1);
    html += line('Haemoglobin', hbDisplay + ' g/dl', 'Male : 13.5 to 18.0 g/dl');
    html += line('', '', 'Female : 12.0 to 16.0 g/dl', { bold: false });
    html += gap();
  }

  // WBC
  if (hv('hf-wbc')) {
    html += line('W.B.C. Total', hv('hf-wbc') + ' /Cu. mm.', '4000-11000 /Cu. mm.');
    html += gap();
  }

  // Differential
  const hasDiff = hv('hf-neut') || hv('hf-lymp') || hv('hf-eosi') || hv('hf-mono') || hv('hf-baso');
  if (hasDiff) {
    html += `<div style="margin:10px 0">`;
    html += `<div style="font-size:11pt;font-weight:700;padding:3px 0"><b>Differential :</b></div>`;
    const diffRow = (label, val, range) =>
      `<div style="display:flex;font-size:11pt;padding:1px 0;line-height:1.5;font-family:inherit"><span style="flex:0 0 38%;padding-left:18px">${label}</span><span style="flex:0 0 10%;text-align:right;padding-right:8px">${val}</span><span style="flex:0 0 12%">%</span><span style="flex:1">${range}</span></div>`;
    if (hv('hf-neut')) html += diffRow('Neutrophils', hv('hf-neut'), '50 - 70%');
    if (hv('hf-lymp')) html += diffRow('Lymphocytes', hv('hf-lymp'), '20 - 40%');
    if (hv('hf-eosi')) html += diffRow('Eosinophils', hv('hf-eosi'), '1 - 6%');
    if (hv('hf-mono')) html += diffRow('Monocytes', hv('hf-mono'), '2 - 10%');
    if (hv('hf-baso')) html += diffRow('Basophils', hv('hf-baso'), '0 - 1%');
    html += `</div>`;
  }

  // Platelets
  if (hv('hf-plat')) {
    const platUnit = document.getElementById('hf-plat-unit')?.value || 'lakhs';
    html += line('Platelets', hv('hf-plat') + ' ' + platUnit, '1.5 - 4.5 Lakhs/cmm');
  }

  // ESR
  if (hv('hf-esr')) {
    html += gap();
    html += `<div style="display:flex;font-size:11pt;padding:3px 0;line-height:1.5;font-family:inherit">
      <span style="flex:0 0 38%"><b>ESR</b></span>
      <span style="flex:0 0 22%">${hv('hf-esr')} mm.</span>
      <span style="flex:1;white-space:nowrap">Male 0 - 8 mm. at the end of first Hr.</span>
    </div>`;
    html += `<div style="display:flex;font-size:11pt;padding:1px 0;line-height:1.5;font-family:inherit">
      <span style="flex:0 0 38%">(Westergreen's method)</span>
      <span style="flex:0 0 22%"></span>
      <span style="flex:1;white-space:nowrap">Female 0 - 20 mm. at the end of first Hr.</span>
    </div>`;
    html += gap();
  }

  // Blood Sugar
  if (hv('hf-sugar')) {
    const sugarRaw = parseFloat(hv('hf-sugar'));
    const sugarVal = isNaN(sugarRaw) ? hv('hf-sugar') : sugarRaw.toFixed(1);
    html += `<div style="margin:10px 0">`;
    html += line('Blood Sugar (Random)', sugarVal + ' mg/dl', '70-140 mg/dl', { underline: true });
    html += `</div>`;
  }

  // Urine Exam
  const alb = hv('hf-alb'),
    usg = hv('hf-usg'),
    mic = hv('hf-mic');
  if (alb || usg || mic) {
    html += `<div style="margin:10px 0">`;
    html += `<div style="display:flex;font-size:11pt;padding:3px 0;line-height:1.5;font-family:inherit">
      <span style="flex:0 0 38%"><b>Urine Exam</b></span>
      <span style="flex:1;padding-left:16px">
        ${alb ? `<div style="display:flex"><span style="width:90px">Albumin</span><span style="width:14px">:</span><span>${alb}</span></div>` : ''}
        ${usg ? `<div style="display:flex"><span style="width:90px">Sugar</span><span style="width:14px">:</span><span>${usg}</span></div>` : ''}
        ${
          mic
            ? `<div style="display:flex;font-size:11pt;padding:1px 0;line-height:1.5">
          <span style="width:90px;flex-shrink:0">Microscopy</span>
          <span style="width:14px;flex-shrink:0">:</span>
          <span style="white-space:pre-line;flex:1">${mic}</span>
        </div>`
            : ''
        }
      </span>
    </div>`;
    html += `</div>`;
  }

  // BT / CT
  if (hv('hf-bt'))
    html += line('Bleeding Time (B.T.)', hv('hf-bt'), '1-4 Min');
  if (hv('hf-ct')) html += line('Clotting Time (CT)', hv('hf-ct'), '4-10 Min');

  // HCV
  if (hv('hf-hcv')) {
    html += `<div style="height:6px"></div>`;
    html += `<div style="display:flex;font-size:11pt;padding:3px 0;line-height:1.5;font-family:inherit">
    <span style="flex:0 0 38%"><b><u>HCV Test</u></b></span>
    <span style="flex:0 0 22%">${hv('hf-hcv')}</span>
    <span style="flex:1;white-space:nowrap;font-size:9pt;line-height:1.6;color:#333">[ Immunochromatography Method ]</span>
  </div>`;
  }

  // Australia Antigen
  if (hv('hf-aat')) {
    html += `<div style="display:flex;font-size:11pt;padding:3px 0;margin:10px 0;line-height:1.5;font-family:inherit"><span style="flex:0 0 38%"><b><u>Australia Antigen Test</u></b></span><span style="flex:0 0 22%">${hv('hf-aat')}</span><span style="flex:1;white-space:nowrap;font-size:9pt;line-height:1.6;color:#333">[ Immunochromatography Method ]</span></div>`;
  }

  // HIV
  if (hv('hf-hiv')) {
    html += `<div style="display:flex;font-size:11pt;padding:3px 0;margin:10px 0;line-height:1.5;font-family:inherit"><span style="flex:0 0 38%;font-size:11pt"><b><u>H.I.V Antibody ( HIV-I & II )</u></b></span><span style="flex:0 0 22%;font-size:11pt;white-space:nowrap">${hv('hf-hiv')}</span><span style="flex:1;font-size:9pt;line-height:1.6;color:#333">(This is a rapid diagnostic Test.<br>Done by Device mtd.)</span></div>`;
  }

  html += `<div class="report-closing"><span>Thanks !</span><span class="report-closing-signature">SIGNATURE</span></div>`;
  document.getElementById('haemo-table-body').innerHTML = html;
}

function buildHaemoRec() {
  return {
    type: 'haemo',
    name: hv('hf-name') || 'Unknown',
    date: hv('hf-date'),
    ref: hv('hf-ref'),
    hb: hv('hf-hb'),
    wbc: hv('hf-wbc'),
    esr: hv('hf-esr'),
    neut: hv('hf-neut'),
    lymp: hv('hf-lymp'),
    eosi: hv('hf-eosi'),
    mono: hv('hf-mono'),
    baso: hv('hf-baso'),
    plat: hv('hf-plat'),
    platUnit: document.getElementById('hf-plat-unit')?.value || 'lakhs',
    sugar: hv('hf-sugar'),
    alb: hv('hf-alb'),
    usg: hv('hf-usg'),
    mic: hv('hf-mic'),
    bt: hv('hf-bt'),
    ct: hv('hf-ct'),
    hcv: hv('hf-hcv'),
    aat: hv('hf-aat'),
    hiv: hv('hf-hiv'),
    savedAt: new Date().toISOString(),
  };
}
function loadHaemoRec(r) {
  const f = (id, v) => {
    if (v !== undefined && document.getElementById(id)) document.getElementById(id).value = v;
  };
  f('hf-name', r.name);
  f('hf-date', r.date || today);
  f('hf-ref', r.ref);
  f('hf-hb', r.hb);
  f('hf-wbc', r.wbc);
  f('hf-esr', r.esr);
  f('hf-neut', r.neut);
  f('hf-lymp', r.lymp);
  f('hf-eosi', r.eosi);
  f('hf-mono', r.mono);
  f('hf-baso', r.baso);
  f('hf-plat', r.plat);
  if (r.platUnit && document.getElementById('hf-plat-unit'))
    document.getElementById('hf-plat-unit').value = r.platUnit;
  f('hf-sugar', r.sugar);
  f('hf-alb', r.alb);
  f('hf-usg', r.usg);
  f('hf-mic', r.mic);
  f('hf-bt', r.bt);
  f('hf-ct', r.ct);
  f('hf-hcv', r.hcv);
  f('hf-aat', r.aat);
  f('hf-hiv', r.hiv);
  // Try to restore dropdown selectors from stored text value
  restoreTimeDropdown('bt', r.bt || '');
  restoreTimeDropdown('ct', r.ct || '');
  haemoSync();
  checkDiff();
}

function restoreTimeDropdown(field, val) {
  // Parse "X min YY sec" back into dropdowns
  const minMatch = val.match(/(\d+)\s*min/);
  const secMatch = val.match(/(\d+)\s*sec/);
  const minEl = document.getElementById(`hf-${field}-min`);
  const secEl = document.getElementById(`hf-${field}-sec`);
  if (minEl && minMatch) {
    const opt = [...minEl.options].find((o) => o.value === minMatch[1]);
    minEl.value = opt ? minMatch[1] : '';
  }
  if (secEl && secMatch) {
    const sv = secMatch[1].padStart(2, '0');
    const opt = [...secEl.options].find((o) => o.value === sv);
    secEl.value = opt ? sv : '';
  }
}

/* ══ WBC Differential Validation ══ */
function checkDiff() {
  const ids = ['hf-neut', 'hf-lymp', 'hf-eosi', 'hf-mono', 'hf-baso'];
  const vals = ids.map((id) => parseFloat(document.getElementById(id).value) || 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const hasAny = ids.some((id) => document.getElementById(id).value.trim() !== '');
  const ctr = document.getElementById('diff-counter');
  ids.forEach((id) => document.getElementById(id).classList.remove('diff-input-error'));
  if (!hasAny) {
    ctr.style.display = 'none';
    return;
  }
  ctr.style.display = 'block';
  if (total === 100) {
    ctr.className = 'diff-counter ok';
    ctr.textContent = 'Total: 100% — Perfect!';
  } else if (total < 100) {
    ctr.className = 'diff-counter warn';
    ctr.textContent = `Total: ${total}% — Need ${100 - total}% more`;
  } else {
    ctr.className = 'diff-counter over';
    ctr.textContent = `Total: ${total}% — Exceeds 100% by ${total - 100}%`;
    ids.forEach((id) => {
      if (document.getElementById(id).value.trim())
        document.getElementById(id).classList.add('diff-input-error');
    });
  }
}
function diffIsValid() {
  const ids = ['hf-neut', 'hf-lymp', 'hf-eosi', 'hf-mono', 'hf-baso'];
  const hasAny = ids.some((id) => document.getElementById(id).value.trim() !== '');
  if (!hasAny) return true;
  const total = ids.reduce(
    (sum, id) => sum + (parseFloat(document.getElementById(id).value) || 0),
    0,
  );
  return total === 100;
}

async function haemoPrint() {
  if (!requireName('hf-name')) return;
  if (!requireHaemoSugar()) return;
  if (!diffIsValid()) {
    alert(
      'W.B.C. Differential total must equal exactly 100%.\n\nCurrent total: ' +
        ['hf-neut', 'hf-lymp', 'hf-eosi', 'hf-mono', 'hf-baso'].reduce(
          (s, id) => s + (parseFloat(document.getElementById(id).value) || 0),
          0,
        ) +
        '%\n\nPlease correct before printing.',
    );
    return;
  }
  try {
    await saveReportForPrint('haemo', buildHaemoRec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  printOnly('haemo-report', getTabPageSize('haemo', 'A4'));
}

/* ══ Title Case for name inputs ══ */
function autoShrinkName(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.style.fontSize = '';
  const sizes = [11, 10, 9, 8.5, 8];
  for (const s of sizes) {
    el.style.fontSize = s + 'pt';
    if (el.scrollWidth <= el.offsetWidth + 2 || s === sizes[sizes.length - 1]) break;
  }
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
}
function applyTitleCase(el) {
  const pos = el.selectionStart;
  const val = toTitleCase(el.value);
  el.value = val;
  el.setSelectionRange(pos, pos);
}
function initTitleCase() {
  const nameIds = ['sf-name', 'hf-name', 'bsf-name', 'bcf-name', 'cf-name', 'bf-name'];
  const refIds = ['sf-ref', 'hf-ref', 'bsf-ref', 'bcf-ref', 'cf-ref', 'bf-ref'];
  [...nameIds, ...refIds].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => applyTitleCase(el));
  });
}
function requireName(inputId) {
  const el = document.getElementById(inputId);
  const val = el ? el.value.trim() : '';
  if (!val) {
    if (el) {
      el.style.borderColor = '#dc2626';
      el.style.background = '#fff5f5';
      el.focus();
      // Reset style after user starts typing
      el.addEventListener(
        'input',
        () => {
          el.style.borderColor = '';
          el.style.background = '';
        },
        { once: true },
      );
    }
    alert('Patient name is required before printing or sharing.');
    return false;
  }
  return true;
}
function requireHaemoSugar() {
  const el = document.getElementById('hf-sugar');
  if (el && el.value.trim()) return true;
  if (el) {
    el.style.borderColor = '#dc2626';
    el.style.background = '#fff5f5';
    el.focus();
    el.addEventListener(
      'input',
      () => {
        el.style.borderColor = '';
        el.style.background = '';
      },
      { once: true },
    );
  }
  alert('Blood Sugar Random is required before printing or sharing.');
  return false;
}

/* ══ html2canvas share ══ */
async function captureEl(el) {
  await document.fonts.ready;
  const prev = el.style.minWidth;
  el.style.minWidth = '740px';
  const c = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
  el.style.minWidth = prev;
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
async function doShare(blob, name) {
  const fn = buildFN(name);
  const file = new File([blob], `${fn}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ title: `Report – ${name}`, text: `Report for ${name}`, files: [file] });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fn}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
async function seroShare() {
  if (!requireName('sf-name')) return;
  const btn = document.getElementById('sero-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const blob = await captureEl(document.getElementById('sero-report'));
    await saveRec(buildSeroRec());
    await doShare(blob, hv('sf-name'));
  } catch (e) {
    if (e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}
async function haemoShare() {
  if (!requireName('hf-name')) return;
  if (!requireHaemoSugar()) return;
  if (!diffIsValid()) {
    alert('W.B.C. Differential total must equal exactly 100%.\n\nPlease correct before sharing.');
    return;
  }
  const btn = document.getElementById('haemo-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const blob = await captureEl(document.getElementById('haemo-report'));
    await saveRec(buildHaemoRec());
    await doShare(blob, hv('hf-name'));
  } catch (e) {
    if (e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

/* ══ HISTORY RENDER ══ */
const selectedHistoryRecords = new Map();
function getSelectedHistoryRecords(containerId) {
  if (!selectedHistoryRecords.has(containerId)) selectedHistoryRecords.set(containerId, new Set());
  return selectedHistoryRecords.get(containerId);
}

async function renderHistory(typeFilter, containerId) {
  const wrap = document.getElementById(containerId);
  const searchId = containerId + '-search';
  const filterId = containerId + '-filters';
  const selected = getSelectedHistoryRecords(containerId);

  // Build shell once
  if (!wrap.querySelector('.history-header')) {
    const title =
      typeFilter === 'all'
        ? 'All Reports'
        : typeFilter === 'sero'
          ? 'Serology History'
          : typeFilter === 'haemo'
            ? 'Haemogram History'
            : typeFilter === 'bs'
              ? 'Blood Sugar History'
              : typeFilter === 'bill'
                ? 'Bill History'
                : typeFilter === 'crpra'
                  ? 'CRP/RA History'
                  : 'Bio-Chemistry History';
    const backupBtns =
      typeFilter === 'all'
        ? `
      <div class="backup-btns" id="backup-btns-area" style="display:flex">
        <button class="btn-backup" onclick="exportBackup()">Export Backup</button>
        <button class="btn-restore" onclick="document.getElementById('restore-file-input').click()">Restore Backup</button>
        <input type="file" id="restore-file-input" accept=".json" style="display:none" onchange="importBackup(this)">
      </div>`
        : '';
    wrap.innerHTML = `
      <div class="history-header">
        <h2>${title}</h2>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <input type="text" class="history-search" id="${searchId}" placeholder="Search by name..." oninput="renderHistory('${typeFilter}','${containerId}')">
          <div class="history-selection-actions">
            <span id="${containerId}-selected-count">0 selected</span>
            <button class="btn-delete-selected" id="${containerId}-delete-selected" onclick="deleteSelectedHistory('${typeFilter}','${containerId}')" disabled>Delete selected</button>
          </div>
          ${backupBtns}
        </div>
      </div>
      <div class="filter-bar" id="${filterId}"></div>
      <div class="history-stats" id="${containerId}-stats"></div>
      <div class="history-table-wrap" id="${containerId}-table"></div>`;
  }

  // Get all records
  let all = await getAllRecs();
  all.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  if (typeFilter !== 'all') all = all.filter((r) => r.type === typeFilter);

  // Build filter bar (once, or re-use existing values)
  const fb = document.getElementById(filterId);
  if (!fb.querySelector('.filter-group')) {
    // Collect unique refs for dropdown
    const refs = [...new Set(all.map((r) => r.ref).filter(Boolean))].sort();
    fb.innerHTML = `
      <div class="filter-group">
        <label>Date From</label>
        <input type="date" class="filter-date" id="${filterId}-from" onchange="renderHistory('${typeFilter}','${containerId}')">
      </div>
      <div class="filter-group">
        <label>Date To</label>
        <input type="date" class="filter-date" id="${filterId}-to" onchange="renderHistory('${typeFilter}','${containerId}')">
      </div>
      <div class="filter-group">
        <label>Quick Date</label>
        <select class="filter-select" id="${filterId}-quick" onchange="applyQuickDate('${filterId}','${typeFilter}','${containerId}')">
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Ref. By</label>
        <select class="filter-select" id="${filterId}-ref" onchange="renderHistory('${typeFilter}','${containerId}')">
          <option value="">All</option>
          ${refs.map((r) => `<option value="${r}">${r}</option>`).join('')}
        </select>
      </div>
      ${
        typeFilter === 'all'
          ? `
      <div class="filter-group">
        <label>Type</label>
        <select class="filter-select" id="${filterId}-type" onchange="renderHistory('${typeFilter}','${containerId}')">
          <option value="">All</option>
          <option value="sero">Serology</option>
          <option value="haemo">Haemogram</option>
          <option value="bs">Blood Sugar</option>
          <option value="bill">Bill</option>
          <option value="crpra">CRP/RA</option>
          <option value="biochem">Bio-Chemistry</option>
        </select>
      </div>`
          : ''
      }
      ${
        typeFilter === 'sero' || typeFilter === 'all'
          ? `
      <div class="filter-group">
        <label>HBsAg</label>
        <select class="filter-select" id="${filterId}-hbsag" onchange="renderHistory('${typeFilter}','${containerId}')">
          <option value="">All</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
        </select>
      </div>
      <div class="filter-group">
        <label>HIV</label>
        <select class="filter-select" id="${filterId}-hiv" onchange="renderHistory('${typeFilter}','${containerId}')">
          <option value="">All</option>
          <option value="REACTIVE">Reactive</option>
          <option value="NON-REACTIVE">Non-Reactive</option>
        </select>
      </div>`
          : ''
      }
      <button class="btn-clear-filters" onclick="clearFilters('${filterId}','${typeFilter}','${containerId}')">✕ Clear Filters</button>
      <span class="filter-results-count" id="${filterId}-count"></span>
    `;
  }

  // Read filter values
  const query = (document.getElementById(searchId)?.value || '').trim().toLowerCase();
  const fFrom = document.getElementById(`${filterId}-from`)?.value || '';
  const fTo = document.getElementById(`${filterId}-to`)?.value || '';
  const fRef = document.getElementById(`${filterId}-ref`)?.value || '';
  const fType = document.getElementById(`${filterId}-type`)?.value || '';
  const fHbsag = document.getElementById(`${filterId}-hbsag`)?.value || '';
  const fHiv = document.getElementById(`${filterId}-hiv`)?.value || '';

  // Parse date from DD/MM/YYYY → Date object (returns null if invalid)
  const parseDMY = (s) => {
    if (!s) return null;
    // Try DD/MM/YYYY
    const parts = s.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      const dt = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      return isNaN(dt) ? null : dt;
    }
    // Try YYYY-MM-DD
    const dt = new Date(s);
    return isNaN(dt) ? null : dt;
  };

  // Normalise fFrom/fTo to midnight for fair comparison
  const fromDate = fFrom ? new Date(fFrom) : null;
  const toDate = fTo ? new Date(fTo + 'T23:59:59') : null;

  let filtered = [...all];
  if (query) filtered = filtered.filter((r) => r.name.toLowerCase().includes(query));
  if (fromDate)
    filtered = filtered.filter((r) => {
      const d = parseDMY(r.date);
      return d && d >= fromDate;
    });
  if (toDate)
    filtered = filtered.filter((r) => {
      const d = parseDMY(r.date);
      return d && d <= toDate;
    });
  if (fRef) filtered = filtered.filter((r) => r.ref === fRef);
  if (fType) filtered = filtered.filter((r) => r.type === fType);
  if (fHbsag) filtered = filtered.filter((r) => r.hbsag === fHbsag);
  if (fHiv)
    filtered = filtered.filter((r) => {
      if (fHiv === 'REACTIVE') return r.hiv && r.hiv.startsWith('REACTIVE');
      if (fHiv === 'NON-REACTIVE') return r.hiv && r.hiv.startsWith('NON-REACTIVE');
      return true;
    });

  // Active filter count indicator
  const activeCount = [query, fFrom, fTo, fRef, fType, fHbsag, fHiv].filter(Boolean).length;
  const countEl = document.getElementById(`${filterId}-count`);
  if (countEl)
    countEl.textContent =
      activeCount > 0 ? `${filtered.length} of ${all.length} records` : `${all.length} records`;

  // Stats — based on filtered set, with total context when filters active
  const isFiltered = activeCount > 0;
  const src = filtered; // always show filtered counts
  const countLabel = isFiltered
    ? `<div style="font-size:.72rem;color:#718096;text-align:center;margin-bottom:8px;font-style:italic">Showing ${filtered.length} of ${all.length} records</div>`
    : '';

  document.getElementById(containerId + '-stats').innerHTML = `
    ${countLabel}
    <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.length}</div><div class="stat-label">Total${isFiltered ? ' (filtered)' : ''}</div></div>
    <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${new Set(src.map((r) => r.name.toLowerCase())).size}</div><div class="stat-label">Patients${isFiltered ? ' (filtered)' : ''}</div></div>
    ${
      typeFilter === 'all'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'sero').length}</div><div class="stat-label">Serology</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'haemo').length}</div><div class="stat-label">Haemogram</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'bs').length}</div><div class="stat-label">Blood Sugar</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'bill').length}</div><div class="stat-label">Bills</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'crpra').length}</div><div class="stat-label">CRP/RA</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.type === 'biochem').length}</div><div class="stat-label">Bio-Chem</div></div>`
        : ''
    }
    ${
      typeFilter === 'biochem'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.urea).length}</div><div class="stat-label">Blood Urea</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.sgot || r.sgpt).length}</div><div class="stat-label">Liver Tests</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.chol).length}</div><div class="stat-label">Cholesterol</div></div>`
        : ''
    }
    ${
      typeFilter === 'crpra'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.crp).length}</div><div class="stat-label">CRP Tests</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.ra).length}</div><div class="stat-label">RA Tests</div></div>`
        : ''
    }
    ${
      typeFilter === 'sero'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.hbsag === 'POSITIVE').length}</div><div class="stat-label">HBsAg +ve</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.hiv && r.hiv.startsWith('REACTIVE')).length}</div><div class="stat-label">HIV Reactive</div></div>`
        : ''
    }
    ${
      typeFilter === 'bs'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.rVal).length}</div><div class="stat-label">Random</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.fVal).length}</div><div class="stat-label">Fasting</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">${src.filter((r) => r.pVal).length}</div><div class="stat-label">PP</div></div>`
        : ''
    }
    ${
      typeFilter === 'bill'
        ? `
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">₹${src.reduce((s, r) => s + (r.total || 0), 0).toFixed(0)}</div><div class="stat-label">Revenue${isFiltered ? ' (filtered)' : ''}</div></div>
      <div class="stat-card${isFiltered ? ' stat-card-filtered' : ''}"><div class="stat-num">₹${src.reduce((s, r) => s + (r.discount || 0), 0).toFixed(0)}</div><div class="stat-label">Discount${isFiltered ? ' (filtered)' : ''}</div></div>`
        : ''
    }
  `;

  const tbl = document.getElementById(containerId + '-table');
  if (filtered.length === 0) {
    tbl.innerHTML = `<div class="empty-history"><div>${activeCount > 0 ? 'No records match your filters.' : 'No records found.'}</div></div>`;
    updateHistorySelectionUI(containerId, []);
    return;
  }

  const badge = (v) =>
    v === 'POSITIVE'
      ? `<span class="badge badge-pos">POSITIVE</span>`
      : `<span class="badge badge-neg">NEGATIVE</span>`;
  const hivBadge = (v) =>
    v && v.startsWith('REACTIVE')
      ? `<span class="badge badge-rx">REACTIVE</span>`
      : `<span class="badge badge-nrx">NON-REACTIVE</span>`;
  const typeBadge = (t) =>
    t === 'sero'
      ? `<span class="badge badge-sero">Serology</span>`
      : t === 'haemo'
        ? `<span class="badge badge-haemo">Haemogram</span>`
        : t === 'bs'
          ? `<span class="badge" style="background:#d1fae5;color:#065f46">Blood Sugar</span>`
          : t === 'bill'
            ? `<span class="badge" style="background:#fef3c7;color:#92400e">Bill</span>`
            : t === 'crpra'
              ? `<span class="badge" style="background:#ede9fe;color:#5b21b6">CRP/RA</span>`
              : `<span class="badge" style="background:#e0f2fe;color:#0369a1">Bio-Chem</span>`;

  tbl.innerHTML = `<table class="history-table"><thead><tr>
    <th class="history-select-col"><input class="history-select-all" type="checkbox" aria-label="Select all visible records" onchange="toggleVisibleHistorySelection('${containerId}',this.checked)"></th>
    <th>#</th>${typeFilter === 'all' ? '<th>Type</th>' : ''}
    ${typeFilter === 'bill' ? '<th>Bill No.</th>' : ''}
    <th>Patient Name</th><th>Date</th>
    <th>Ref. By</th>
    ${typeFilter === 'sero' ? '<th>HBsAg</th><th>HIV</th>' : ''}
    ${typeFilter === 'haemo' ? '<th>HB</th><th>WBC</th><th>Platelets</th>' : ''}
    ${typeFilter === 'bs' ? '<th>Random</th><th>Fasting</th><th>Post-PP</th>' : ''}
    ${typeFilter === 'bill' ? '<th>Items</th><th>Subtotal</th><th>Discount</th><th>Total Amount</th>' : ''}
    ${typeFilter === 'crpra' ? '<th>CRP</th><th>RA</th>' : ''}
    ${typeFilter === 'biochem' ? '<th>Blood Urea</th><th>S.Creatinine</th><th>SGOT</th><th>SGPT</th>' : ''}
    ${typeFilter === 'all' ? '<th>Key Result</th>' : ''}
    <th>Saved At</th><th>Actions</th>
  </tr></thead><tbody>
  ${filtered
    .map(
      (r, i) => `<tr>
      <td class="history-select-col"><input class="history-row-select" type="checkbox" aria-label="Select record" data-record-id="${r.id}" ${selected.has(r.id) ? 'checked' : ''} onchange="toggleHistorySelection('${containerId}',${r.id},this.checked)"></td>
    <td>${filtered.length - i}</td>
    ${typeFilter === 'all' ? `<td>${typeBadge(r.type)}</td>` : ''}
    ${typeFilter === 'bill' ? `<td><strong>#${r.billNo || '—'}</strong></td>` : ''}
    <td><strong>${r.name}</strong></td><td>${r.date}</td>
    <td>${r.ref || '—'}</td>
    ${typeFilter === 'sero' ? `<td>${r.hbsag ? badge(r.hbsag) : '—'}</td><td>${r.hiv ? hivBadge(r.hiv) : '—'}</td>` : ''}
    ${typeFilter === 'haemo' ? `<td>${r.hb || '—'}</td><td>${r.wbc || '—'}</td><td>${r.plat || '—'}</td>` : ''}
    ${typeFilter === 'bs' ? `<td>${r.rVal ? r.rVal + ' mg/dl' : '—'}</td><td>${r.fVal ? r.fVal + ' mg/dl' : '—'}</td><td>${r.pVal ? r.pVal + ' mg/dl' : '—'}</td>` : ''}
    ${typeFilter === 'bill' ? `<td>${r.items ? r.items.length : 0} test(s)</td><td>₹${(r.subtotal || 0).toFixed(2)}</td><td>₹${(r.discount || 0).toFixed(2)}</td><td><strong>₹${(r.total || 0).toFixed(2)}</strong></td>` : ''}
    ${typeFilter === 'crpra' ? `<td>${r.crp ? r.crp + ' mg/L' : '—'}</td><td>${r.ra ? r.ra + ' IU/mL' : '—'}</td>` : ''}
    ${typeFilter === 'biochem' ? `<td>${r.urea ? r.urea + ' mg/dl' : '—'}</td><td>${r.creat ? r.creat + ' mg/dl' : '—'}</td><td>${r.sgot ? r.sgot + ' IU/L' : '—'}</td><td>${r.sgpt ? r.sgpt + ' IU/L' : '—'}</td>` : ''}
    ${
      typeFilter === 'all'
        ? `<td>${
            r.type === 'bill'
              ? `<strong>₹${(r.total || 0).toFixed(2)}</strong>`
              : r.type === 'crpra'
                ? `${r.crp ? 'CRP:' + r.crp + ' mg/L' : ''}${r.crp && r.ra ? ' / ' : ''}${r.ra ? 'RA:' + r.ra : ''}`
                : r.type === 'biochem'
                  ? `${r.urea ? 'Urea:' + r.urea : ''}${r.urea && r.creat ? ' · ' : ''}${r.creat ? 'Creat:' + r.creat : ''}`
                  : r.type === 'sero'
                    ? r.hbsag
                      ? badge(r.hbsag)
                      : '—'
                    : r.type === 'haemo'
                      ? r.hb
                        ? r.hb + ' g%'
                        : '—'
                      : r.rVal || r.fVal || r.pVal
                        ? [r.rVal, r.fVal, r.pVal].filter(Boolean).join(' / ') + ' mg/dl'
                        : '—'
          }</td>`
        : ''
    }
    <td>${fmtDT(r.savedAt)}</td>
    <td>
      <div class="history-actions">
        <button class="btn-load" onclick='loadAndSwitch(${JSON.stringify(r).replace(/'/g, '&#39;')})'>Load</button>
        <button class="btn-preview" onclick='previewSavedRecord(${JSON.stringify(r).replace(/'/g, '&#39;')})'>Preview</button>
      </div>
    </td>
  </tr>`,
    )
    .join('')}
  </tbody></table>`;
  updateHistorySelectionUI(
    containerId,
    filtered.map((r) => r.id),
  );
}

function updateHistorySelectionUI(containerId, visibleIds) {
  const selected = getSelectedHistoryRecords(containerId);
  const count = selected.size;
  const countEl = document.getElementById(`${containerId}-selected-count`);
  const deleteButton = document.getElementById(`${containerId}-delete-selected`);
  if (countEl) countEl.textContent = `${count} selected`;
  if (deleteButton) deleteButton.disabled = count === 0;

  const selectedVisible = visibleIds.filter((id) => selected.has(id)).length;
  const selectAll = document.querySelector(`#${containerId}-table .history-select-all`);
  if (selectAll) {
    selectAll.checked = visibleIds.length > 0 && selectedVisible === visibleIds.length;
    selectAll.indeterminate = selectedVisible > 0 && selectedVisible < visibleIds.length;
  }
}

function toggleHistorySelection(containerId, id, checked) {
  const selected = getSelectedHistoryRecords(containerId);
  if (checked) selected.add(id);
  else selected.delete(id);
  const visibleIds = [
    ...document.querySelectorAll(`#${containerId}-table .history-row-select`),
  ].map((el) => Number(el.dataset.recordId));
  updateHistorySelectionUI(containerId, visibleIds);
}

function toggleVisibleHistorySelection(containerId, checked) {
  const selected = getSelectedHistoryRecords(containerId);
  document.querySelectorAll(`#${containerId}-table .history-row-select`).forEach((el) => {
    const id = Number(el.dataset.recordId);
    el.checked = checked;
    if (checked) selected.add(id);
    else selected.delete(id);
  });
  const visibleIds = [
    ...document.querySelectorAll(`#${containerId}-table .history-row-select`),
  ].map((el) => Number(el.dataset.recordId));
  updateHistorySelectionUI(containerId, visibleIds);
}

async function deleteSelectedHistory(typeFilter, containerId) {
  const selected = getSelectedHistoryRecords(containerId);
  const ids = [...selected];
  if (!ids.length) return;
  if (
    !confirm(
      `Delete ${ids.length} selected record${ids.length === 1 ? '' : 's'}? This cannot be undone.`,
    )
  )
    return;

  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Bulk delete was interrupted.'));
    });
    selected.clear();
    await renderHistory(typeFilter, containerId);
    showToast(`${ids.length} record${ids.length === 1 ? '' : 's'} deleted`, '#dc2626');
  } catch (error) {
    alert('Could not delete selected records: ' + error.message);
  }
}

function applyQuickDate(filterId, typeFilter, containerId) {
  const quick = document.getElementById(`${filterId}-quick`).value;
  const now = new Date();
  const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromEl = document.getElementById(`${filterId}-from`);
  const toEl = document.getElementById(`${filterId}-to`);
  const todayStr = fmt(now);
  if (quick === 'today') {
    fromEl.value = todayStr;
    toEl.value = todayStr;
  } else if (quick === 'week') {
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    fromEl.value = fmt(mon);
    toEl.value = todayStr;
  } else if (quick === 'month') {
    fromEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    toEl.value = todayStr;
  } else {
    fromEl.value = '';
    toEl.value = '';
  }
  renderHistory(typeFilter, containerId);
}

function clearFilters(filterId, typeFilter, containerId) {
  ['from', 'to', 'ref', 'type', 'hbsag', 'hiv', 'quick'].forEach((k) => {
    const el = document.getElementById(`${filterId}-${k}`);
    if (el) el.value = '';
  });
  const searchEl = document.getElementById(containerId + '-search');
  if (searchEl) searchEl.value = '';
  renderHistory(typeFilter, containerId);
}

function loadAndSwitch(r) {
  loadedRecordId = r.id ?? null;
  loadedRecordType = r.type;
  loadedRecordEditSession = { copyId: null, queue: Promise.resolve() };
  document.querySelectorAll('.main-tab-page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.main-tab-btn').forEach((b) => b.classList.remove('active'));
  // Navbar order: 0=haemo,1=bs,2=sero,3=biochem,4=crpra,5=bill
  if (r.type === 'sero') {
    loadSeroRec(r);
    document.getElementById('main-serology').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[2].classList.add('active');
    document.getElementById('sero-form').classList.add('active');
    document.getElementById('sero-hist').classList.remove('active');
    document.querySelectorAll('#main-serology .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-serology .sub-tab-btn')[1].classList.remove('active');
  } else if (r.type === 'haemo') {
    loadHaemoRec(r);
    document.getElementById('main-haemogram').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[0].classList.add('active');
    document.getElementById('haemo-form').classList.add('active');
    document.getElementById('haemo-hist').classList.remove('active');
    document.querySelectorAll('#main-haemogram .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-haemogram .sub-tab-btn')[1].classList.remove('active');
  } else if (r.type === 'bs') {
    loadBSRec(r);
    document.getElementById('main-bloodsugar').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[1].classList.add('active');
    document.getElementById('bs-form').classList.add('active');
    document.getElementById('bs-hist').classList.remove('active');
    document.querySelectorAll('#main-bloodsugar .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-bloodsugar .sub-tab-btn')[1].classList.remove('active');
  } else if (r.type === 'biochem') {
    loadBiochemRec(r);
    document.getElementById('main-biochem').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[3].classList.add('active');
    document.getElementById('biochem-form').classList.add('active');
    document.getElementById('biochem-hist').classList.remove('active');
    document.querySelectorAll('#main-biochem .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-biochem .sub-tab-btn')[1].classList.remove('active');
  } else if (r.type === 'crpra') {
    loadCRPRARec(r);
    document.getElementById('main-crpra').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[4].classList.add('active');
    document.getElementById('crpra-form').classList.add('active');
    document.getElementById('crpra-hist').classList.remove('active');
    document.querySelectorAll('#main-crpra .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-crpra .sub-tab-btn')[1].classList.remove('active');
  } else if (r.type === 'bill') {
    loadBillRec(r);
    document.getElementById('main-bill').classList.add('active');
    document.querySelectorAll('.main-tab-btn')[5].classList.add('active');
    document.getElementById('bill-form').classList.add('active');
    document.getElementById('bill-hist').classList.remove('active');
    document.querySelectorAll('#main-bill .sub-tab-btn')[0].classList.add('active');
    document.querySelectorAll('#main-bill .sub-tab-btn')[1].classList.remove('active');
  }
}
function previewSavedRecord(r) {
  const previews = {
    sero: { report: 'sero-report', build: buildSeroRec, load: loadSeroRec, label: 'Serology' },
    haemo: { report: 'haemo-report', build: buildHaemoRec, load: loadHaemoRec, label: 'Haemogram' },
    bs: { report: 'bs-report', build: buildBSRec, load: loadBSRec, label: 'Blood Sugar' },
    biochem: {
      report: 'biochem-report',
      build: buildBiochemRec,
      load: loadBiochemRec,
      label: 'Bio-Chemistry',
    },
    crpra: { report: 'crpra-report', build: buildCRPRARec, load: loadCRPRARec, label: 'CRP/RA' },
    bill: { report: 'bill-report', build: buildBillRec, load: loadBillRec, label: 'Bill' },
  };
  const config = previews[r.type];
  if (!config) return;

  document.querySelector('.report-preview-close')?.click();
  const trigger = document.activeElement;
  const currentRecord = config.build();
  let reportCopy;
  try {
    config.load(r);
    reportCopy = document.getElementById(config.report).cloneNode(true);
  } finally {
    config.load(currentRecord);
  }
  reportCopy.removeAttribute('id');
  reportCopy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));

  const overlay = document.createElement('div');
  overlay.className = 'report-preview-overlay';
  overlay.setAttribute('role', 'presentation');
  overlay.innerHTML = `
    <section class="report-preview-dialog" role="dialog" aria-modal="true" aria-label="Report preview">
      <header class="report-preview-toolbar">
        <div><h2 class="report-preview-title"></h2><div class="report-preview-date"></div></div>
        <div class="report-preview-actions">
          <button class="btn-print report-preview-print" type="button" aria-label="Print report">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print
          </button>
          <button class="report-preview-close" type="button" aria-label="Close preview" title="Close preview">✕</button>
        </div>
      </header>
      <div class="report-preview-body"></div>
    </section>`;
  overlay.querySelector('.report-preview-title').textContent =
    `${config.label} · ${r.name || 'Patient'}`;
  overlay.querySelector('.report-preview-date').textContent = r.date || '';
  const previewSheet = createPrintPreviewSheet(reportCopy, r.type);
  overlay.querySelector('.report-preview-body').appendChild(previewSheet);

  const previousOverflow = document.body.style.overflow;
  const close = () => {
    document.removeEventListener('keydown', onKeydown);
    livePrintPreviewObserver.unobserve(previewSheet);
    document.body.style.overflow = previousOverflow;
    overlay.remove();
    if (trigger?.isConnected) trigger.focus();
  };
  const onKeydown = (event) => {
    if (event.key === 'Escape') close();
  };
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('.report-preview-close').addEventListener('click', close);
  overlay
    .querySelector('.report-preview-print')
    .addEventListener('click', () => printPreviewRecord(r, config));
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
  document.body.appendChild(overlay);
  refreshLivePrintPreview(previewSheet);
  overlay.querySelector('.report-preview-close').focus();
}
async function printPreviewRecord(r, config) {
  const currentRecord = config.build();
  const pageSize = getTabPageSize(r.type, r.type === 'bs' ? 'A5' : 'A4');
  try {
    config.load(r);
    await printOnly(config.report, pageSize);
  } finally {
    config.load(currentRecord);
  }
}
function printSavedRecord(r) {
  loadAndSwitch(r);
  if (r.type === 'sero') printOnly('sero-report', getTabPageSize('sero', 'A4'));
  else if (r.type === 'haemo') printOnly('haemo-report', getTabPageSize('haemo', 'A4'));
  else if (r.type === 'bs') printOnly('bs-report', getTabPageSize('bs', 'A5'));
  else if (r.type === 'biochem') printOnly('biochem-report', getTabPageSize('biochem', 'A4'));
  else if (r.type === 'crpra') printOnly('crpra-report', getTabPageSize('crpra', 'A4'));
  else if (r.type === 'bill') printOnly('bill-report', getTabPageSize('bill', 'A4'));
}
async function confirmDel(id, typeFilter, containerId) {
  if (confirm('Delete this record?')) {
    await delRec(id);
    getSelectedHistoryRecords(containerId).delete(id);
    renderHistory(typeFilter, containerId);
  }
}

/* ══ Populate BT/CT dropdowns ══ */
function buildTimeDropdowns() {
  const secOpts =
    '<option value="">Sec</option>' +
    [10, 20, 30, 40, 50, 60]
      .map(
        (s) =>
          `<option value="${String(s).padStart(2, '0')}">${String(s).padStart(2, '0')} sec</option>`,
      )
      .join('') +
    '<option value="manual">Manual...</option>';

  // BT: 1–4 min
  let btMins = '<option value="">Min</option>';
  for (let i = 1; i <= 4; i++) btMins += `<option value="${i}">${i} min</option>`;
  btMins += '<option value="manual">Manual...</option>';
  document.getElementById('hf-bt-min').innerHTML = btMins;
  document.getElementById('hf-bt-sec').innerHTML = secOpts;

  // CT: 4–10 min
  let ctMins = '<option value="">Min</option>';
  for (let i = 4; i <= 10; i++) ctMins += `<option value="${i}">${i} min</option>`;
  ctMins += '<option value="manual">Manual...</option>';
  document.getElementById('hf-ct-min').innerHTML = ctMins;
  document.getElementById('hf-ct-sec').innerHTML = secOpts;
}

/* ══ BACKUP & RESTORE ══ */
async function exportBackup() {
  try {
    const all = await getAllRecs();
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: '',
      totalRecords: all.length,
      records: all,
    };
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const fname = `pitrubhakta_backup_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.json`;
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Backup exported successfully!\n\nFile: ${fname}\nTotal records: ${all.length}`);
  } catch (e) {
    alert('Export failed: ' + e.message);
  }
}

async function importBackup(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = ''; // reset so same file can be re-selected

  const confirmed = confirm(
    'Restore Backup\n\n' +
      'This will ADD all records from the backup file to your existing database.\n' +
      'Existing records will NOT be deleted.\n\n' +
      'Do you want to continue?',
  );
  if (!confirmed) return;

  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    // Validate backup format
    if (!backup.records || !Array.isArray(backup.records)) {
      alert('Invalid backup file. Please select a valid Pitrubhakta backup JSON file.');
      return;
    }

    const records = backup.records;
    let imported = 0,
      skipped = 0;

    // Get existing savedAt values to avoid duplicates
    const existing = await getAllRecs();
    const existingKeys = new Set(
      existing.map((r) => r.savedAt + '_' + r.name + '_' + (r.type || '')),
    );

    for (const rec of records) {
      const key = rec.savedAt + '_' + rec.name + '_' + (rec.type || '');
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      // Remove old id so DB assigns a new one
      const { id, ...recWithoutId } = rec;
      await saveRec(recWithoutId);
      imported++;
    }

    alert(
      `Restore Complete!\n\n` +
        `Imported: ${imported} records\n` +
        `Skipped (duplicates): ${skipped} records\n` +
        `Backup date: ${backup.exportedAt ? new Date(backup.exportedAt).toLocaleString() : 'Unknown'}`,
    );

    // Refresh the history view
    document.getElementById('all-hist-content').innerHTML = '';
    renderHistory('all', 'all-hist-content');
  } catch (e) {
    alert('Restore failed: ' + e.message + '\n\nMake sure you selected a valid backup file.');
  }
}

function handleSaveError(e) {
  return false;
}

openDB().then(() => {
  buildTimeDropdowns();
  loadTemplates();
  seroSync();
  haemoSync();
  bsSync();
  initBill();
  crpraSync();
  biochemSync();
  initTitleCase();
});

/* ══ BILL STATE ══ */
let billRows = [];
let currentBillNo = 1;

/* ══ Get next bill number from DB ══ */
async function getNextBillNo() {
  const all = await getAllRecs();
  const bills = all.filter((r) => r.type === 'bill');
  if (bills.length === 0) return 1;
  const max = Math.max(...bills.map((r) => r.billNo || 0));
  return max + 1;
}

function todayDateInputValue() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function billDateForInput(value) {
  if (!value) return todayDateInputValue();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return todayDateInputValue();
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function billDateForDisplay(value) {
  const match = (value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value || today;
}

const billToWords = new ToWords();
function billAmountInWords(amount) {
  return billToWords.convert(amount, { currency: true });
}

/* ══ Init bill form ══ */
async function initBill() {
  currentBillNo = await getNextBillNo();
  document.getElementById('bf-billno').value = currentBillNo;
  document.getElementById('bf-date').value = todayDateInputValue();
  billRows = [{ test: '', price: '' }];
  renderBillRows();
  billSync();
}

/* ══ Render bill form rows ══ */
function renderBillRows() {
  const c = document.getElementById('bill-items-form');
  c.innerHTML = '';
  // Header labels
  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:grid;grid-template-columns:1fr 110px 28px;gap:6px;margin-bottom:4px';
  hdr.innerHTML =
    '<span style="font-size:.7rem;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:.05em">Test Name</span><span style="font-size:.7rem;font-weight:600;color:#718096;text-transform:uppercase;letter-spacing:.05em">Price (₹)</span><span></span>';
  c.appendChild(hdr);
  billRows.forEach((row, i) => {
    const div = document.createElement('div');
    div.className = 'bill-item-row';
    div.innerHTML = `
      <input type="text" placeholder="Test name" value="${row.test}"
             oninput="billRows[${i}].test=this.value;billSync()">
      <input type="number" placeholder="0.00" value="${row.price}" min="0" step="0.01"
             oninput="billRows[${i}].price=this.value;billSync()">
      <button class="btn-del-row" onclick="removeBillRow(${i})">✕</button>
    `;
    c.appendChild(div);
  });
}

function addBillRow() {
  billRows.push({ test: '', price: '' });
  renderBillRows();
  // focus last test name input
  const inputs = document.getElementById('bill-items-form').querySelectorAll('input[type=text]');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function removeBillRow(i) {
  if (billRows.length === 1) {
    billRows[0] = { test: '', price: '' };
    renderBillRows();
    billSync();
    return;
  }
  billRows.splice(i, 1);
  renderBillRows();
  billSync();
}

/* ══ Bill sync ══ */
function billSync() {
  // patient info
  document.getElementById('br-name').textContent =
    toTitleCase(document.getElementById('bf-name').value.trim()) || '—';
  autoShrinkName('br-name');
  const ref = document.getElementById('bf-ref').value.trim();
  document.getElementById('br-ref').textContent = ref || '—';
  const age = document.getElementById('bf-age').value.trim();
  document.getElementById('br-age').textContent = age || '—';
  document.getElementById('br-age-field').style.display = age ? 'flex' : 'none';
  const gender = document.getElementById('bf-gender').value;
  document.getElementById('br-gender').textContent = gender;
  document.getElementById('br-gender-field').style.display = gender ? 'flex' : 'none';
  document.getElementById('br-ref-field').style.display = ref ? 'flex' : 'none';
  document.getElementById('br-contact').textContent =
    document.getElementById('bf-contact').value.trim() || '';
  document.getElementById('br-contact-field').style.display =
    document.getElementById('bf-contact').value.trim() ? 'flex' : 'none';
  const loc = document.getElementById('bf-location').value.trim();
  document.getElementById('br-location').textContent = loc;
  document.getElementById('br-location-field').style.display = loc ? 'flex' : 'none';
  // Keep date in sync.
  const curDate = document.getElementById('bf-date')?.value || today;
  document.getElementById('br-date').textContent = billDateForDisplay(curDate);
  // items table
  const tbody = document.getElementById('br-items');
  const filled = billRows.filter((r) => r.test.trim() || r.price);
  tbody.innerHTML = filled.length
    ? filled
        .map((r) => {
          const testName = r.test.trim().replace(/^./, (letter) => letter.toUpperCase());
          const amount = r.price
            ? `₹ ${parseFloat(r.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '';
          return `<tr><td>${testName || '—'}</td><td>${amount}</td></tr>`;
        })
        .join('')
    : '<tr><td colspan="2" style="text-align:center;color:#aaa;padding:14px;font-size:9.5pt">No items added yet</td></tr>';

  // totals
  const subtotal = billRows.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
  const discount = parseFloat(document.getElementById('bf-discount').value) || 0;
  const total = Math.max(0, subtotal - discount);

  document.querySelector('.bill-discount-row').style.display = discount > 0 ? 'flex' : 'none';
  document.getElementById('br-discount').textContent =
    '₹ ' + discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('br-amount-due').textContent =
    '₹ ' + total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('br-amount-words').textContent = `Amount in words: ${billAmountInWords(total)}`;

  // form summary
  document.getElementById('bf-subtotal-display').textContent = '₹ ' + subtotal.toFixed(2);
  document.getElementById('bf-discount-display').textContent = '₹ ' + discount.toFixed(2);
  document.getElementById('bf-total-display').textContent = '₹ ' + total.toFixed(2);
}

/* ══ Build bill record ══ */
function buildBillRec() {
  const subtotal = billRows.reduce((s, r) => s + (parseFloat(r.price) || 0), 0);
  const discount = parseFloat(document.getElementById('bf-discount').value) || 0;
  return {
    type: 'bill',
    billNo: currentBillNo,
    name: document.getElementById('bf-name').value.trim() || 'Unknown',
    date: billDateForDisplay(document.getElementById('bf-date').value),
    ref: document.getElementById('bf-ref').value.trim(),
    age: document.getElementById('bf-age').value.trim(),
    gender: document.getElementById('bf-gender').value,
    contact: document.getElementById('bf-contact').value.trim(),
    location: document.getElementById('bf-location').value.trim(),
    items: [...billRows.filter((r) => r.test.trim() || r.price)],
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    savedAt: new Date().toISOString(),
  };
}

function loadBillRec(r) {
  currentBillNo = r.billNo || currentBillNo;
  document.getElementById('bf-billno').value = currentBillNo;
  document.getElementById('bf-date').value = billDateForInput(r.date);
  document.getElementById('bf-gender').value = r.gender || '';
  if (r.items !== undefined) {
    document.getElementById('bf-name').value = r.name || '';
    document.getElementById('bf-ref').value = r.ref || '';
    document.getElementById('bf-age').value = r.age || '';
    document.getElementById('bf-contact').value = r.contact || '';
    document.getElementById('bf-location').value = r.location || '';
    document.getElementById('bf-discount').value = r.discount || 0;
    billRows =
      r.items && r.items.length
        ? r.items.map((i) => ({ test: i.test, price: i.price }))
        : [{ test: '', price: '' }];
    renderBillRows();
  } else {
    document.getElementById('bf-name').value = r.name || '';
    document.getElementById('bf-ref').value = r.ref || '';
    document.getElementById('bf-age').value = r.age || '';
    document.getElementById('bf-contact').value = r.contact || '';
    document.getElementById('bf-location').value = r.location || '';
  }
  billSync();
}

/* ══ Reset for new bill ══ */
async function resetBill() {
  document.getElementById('bf-name').value = '';
  document.getElementById('bf-ref').value = '';
  document.getElementById('bf-discount').value = '';
  document.getElementById('bf-gender').value = '';
  document.getElementById('bf-date').value = todayDateInputValue();
  billRows = [{ test: '', price: '' }];
  currentBillNo = await getNextBillNo();
  document.getElementById('bf-billno').value = currentBillNo;
  renderBillRows();
  billSync();
}

/* ══ Bill Print ══ */
async function billPrint() {
  if (!requireName('bf-name')) return;
  try {
    await saveReportForPrint('bill', buildBillRec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  currentBillNo = await getNextBillNo();
  document.getElementById('bf-billno').value = currentBillNo;
  printOnly('bill-report', getTabPageSize('bill', 'A4'));
}

/* ══ Bill Share ══ */
async function billShare() {
  if (!requireName('bf-name')) return;
  const btn = document.getElementById('bill-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const billRpt = document.getElementById('bill-report');
    const blob = await captureEl(billRpt);
    await saveRec(buildBillRec());
    currentBillNo = await getNextBillNo();
    document.getElementById('bf-billno').value = currentBillNo;
    await doShare(blob, document.getElementById('bf-name').value.trim() || 'Patient');
  } catch (e) {
    if (!handleSaveError(e) && e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

/* ══ CRP/RA SYNC ══ */
function cfv(id) {
  return document.getElementById(id).value.trim();
}

function crpraSync() {
  // patient info
  document.getElementById('cr-name').textContent = cfv('cf-name') || '—';
  autoShrinkName('cr-name');
  document.getElementById('cr-ref').textContent = cfv('cf-ref') || '—';
  document.getElementById('cr-date').textContent =
    document.getElementById('cf-date')?.value || today;

  const crp = cfv('cf-crp');
  const ra = cfv('cf-ra');

  // Dynamic title
  let title = '';
  if (crp && ra) title = 'RA AND CRP TEST ( TURBIDOMETRY )';
  else if (crp) title = 'CRP TEST ( TURBIDOMETRY )';
  else if (ra) title = 'RA TEST ( TURBIDOMETRY )';
  else title = 'CRP TEST ( TURBIDOMETRY )';
  document.getElementById('cr-title').textContent = title;

  // Build rows — only show filled tests
  const rows = [];
  if (crp)
    rows.push({
      name: 'C R P  Test',
      result: parseFloat(crp).toFixed(1) + '  mg/L',
      range: '0 - 6 mg/L',
    });
  if (ra)
    rows.push({
      name: 'R. A.  Test',
      result: parseFloat(ra).toFixed(1) + '  IU/mL',
      range: 'Less than 20 IU/mL',
    });

  document.getElementById('cr-rows').innerHTML = rows
    .map(
      (r) => `
    <div class="crpra-row">
      <span class="crpra-test-name">${r.name}</span>
      <span class="crpra-result">${r.result}</span>
      <span class="crpra-range">${r.range}</span>
    </div>
  `,
    )
    .join('');
}

function buildCRPRARec() {
  return {
    type: 'crpra',
    name: cfv('cf-name') || 'Unknown',
    date: cfv('cf-date'),
    ref: cfv('cf-ref'),
    crp: cfv('cf-crp'),
    ra: cfv('cf-ra'),
    savedAt: new Date().toISOString(),
  };
}

function loadCRPRARec(r) {
  const f = (id, v) => {
    if (v !== undefined && document.getElementById(id)) document.getElementById(id).value = v || '';
  };
  f('cf-name', r.name);
  f('cf-date', r.date || today);
  f('cf-ref', r.ref);
  f('cf-crp', r.crp);
  f('cf-ra', r.ra);
  crpraSync();
}

async function crpraPrint() {
  if (!requireName('cf-name')) return;
  try {
    await saveReportForPrint('crpra', buildCRPRARec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  printOnly('crpra-report', getTabPageSize('crpra', 'A4'));
}

async function crpraShare() {
  if (!requireName('cf-name')) return;
  const btn = document.getElementById('crpra-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const blob = await captureEl(document.getElementById('crpra-report'));
    await saveRec(buildCRPRARec());
    await doShare(blob, cfv('cf-name'));
  } catch (e) {
    if (!handleSaveError(e) && e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

/* ══ BIO-CHEMISTRY SYNC ══ */
function bcfv(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function bcfmt(v) {
  if (!v) return '';
  const n = parseFloat(v);
  return isNaN(n) ? v : n.toFixed(1);
}

/* Test definitions — label, fieldId, unit appended to result, normal range */
const BC_TESTS = [
  { id: 'urea', label: 'Blood Urea', unit: 'mg/dl', range: '10 - 50 mg/dl', field: 'bcf-urea' },
  {
    id: 'creat',
    label: 'S.Creatinine',
    unit: 'mg/dl',
    range: '0.8 - 1.4 mg/dl',
    field: 'bcf-creat',
  },
  { id: 'uric', label: 'S.Uric Acid', unit: 'mg/dl', range: '2.4 - 5.7 mg/dl', field: 'bcf-uric' },
  { id: 'bilirubin', label: 'S.Bilirubin', unit: '', range: '', field: null, isParent: true },
  {
    id: 'bil-total',
    label: 'Total',
    unit: 'mg/dl',
    range: '0 - 1.0 mg/dl',
    field: 'bcf-bil-total',
    isChild: true,
  },
  {
    id: 'bil-direct',
    label: 'Direct',
    unit: 'mg/dl',
    range: '0 - 0.30 mg/dl',
    field: 'bcf-bil-direct',
    isChild: true,
  },
  {
    id: 'bil-indirect',
    label: 'Indirect',
    unit: 'mg/dl',
    range: '0.3 - 0.7 mg/dl',
    field: 'bcf-bil-indirect',
    isChild: true,
  },
  { id: 'sgot', label: 'S.G.O.T.', unit: 'IU/L', range: 'UPTO - 40 IU/L', field: 'bcf-sgot' },
  { id: 'sgpt', label: 'S.G.P.T.', unit: 'IU/L', range: 'UPTO - 40 IU/L', field: 'bcf-sgpt' },
  {
    id: 'chol',
    label: 'Serum Total Cholesterol',
    unit: 'mg/dl',
    range: '140 - 250 mg/dl',
    field: 'bcf-chol',
  },
  {
    id: 'trig',
    label: 'Serum Triglycerides',
    unit: 'mg/dl',
    range: '60 - 165 mg/dl',
    field: 'bcf-trig',
  },
  { id: 'hdl', label: 'HDL-Cholesterol', unit: 'mg/dl', range: '30 - 70 mg/dl', field: 'bcf-hdl' },
  { id: 'ldl', label: 'LDL-Cholesterol', unit: 'mg/dl', range: '65 - 160 mg/dl', field: 'bcf-ldl' },
];

function biochemSync() {
  document.getElementById('bcr-name').textContent = bcfv('bcf-name') || '—';
  autoShrinkName('bcr-name');
  document.getElementById('bcr-ref').textContent = bcfv('bcf-ref') || '—';
  document.getElementById('bcr-date').textContent =
    document.getElementById('bcf-date')?.value || today;

  // Build rows — skip empty fields, skip parent if no children filled
  const rows = [];
  let i = 0;
  while (i < BC_TESTS.length) {
    const t = BC_TESTS[i];
    if (t.isParent) {
      // Collect children
      const children = [];
      let j = i + 1;
      while (j < BC_TESTS.length && BC_TESTS[j].isChild) {
        const cv = bcfv(BC_TESTS[j].field);
        if (cv) children.push({ ...BC_TESTS[j], val: cv });
        j++;
      }
      if (children.length > 0) {
        // Show parent label row
        rows.push(
          `<div class="bc-row bc-parent"><span class="bc-name">${t.label}</span><span></span><span></span></div>`,
        );
        // Show each filled child
        children.forEach((c) => {
          rows.push(`<div class="bc-row bc-child">
            <span class="bc-name">${c.label}</span>
            <span class="bc-result">${bcfmt(c.val)} ${c.unit}</span>
            <span class="bc-range">${c.range}</span>
          </div>`);
        });
      }
      i = j;
    } else {
      const v = bcfv(t.field);
      if (v) {
        rows.push(`<div class="bc-row">
          <span class="bc-name">${t.label}</span>
          <span class="bc-result">${bcfmt(v)} ${t.unit}</span>
          <span class="bc-range">${t.range}</span>
        </div>`);
      }
      i++;
    }
  }

  document.getElementById('bcr-rows').innerHTML = rows.length
    ? rows.join('')
    : '<div style="color:#aaa;font-size:10pt;padding:12px 0">No values entered yet</div>';
}

function buildBiochemRec() {
  return {
    type: 'biochem',
    name: bcfv('bcf-name') || 'Unknown',
    date: bcfv('bcf-date'),
    ref: bcfv('bcf-ref'),
    urea: bcfv('bcf-urea'),
    creat: bcfv('bcf-creat'),
    uric: bcfv('bcf-uric'),
    bilTotal: bcfv('bcf-bil-total'),
    bilDirect: bcfv('bcf-bil-direct'),
    bilIndirect: bcfv('bcf-bil-indirect'),
    sgot: bcfv('bcf-sgot'),
    sgpt: bcfv('bcf-sgpt'),
    chol: bcfv('bcf-chol'),
    trig: bcfv('bcf-trig'),
    hdl: bcfv('bcf-hdl'),
    ldl: bcfv('bcf-ldl'),
    savedAt: new Date().toISOString(),
  };
}

function loadBiochemRec(r) {
  const f = (id, v) => {
    const el = document.getElementById(id);
    if (el && v !== undefined) el.value = v || '';
  };
  f('bcf-name', r.name);
  f('bcf-date', r.date || today);
  f('bcf-ref', r.ref);
  f('bcf-urea', r.urea);
  f('bcf-creat', r.creat);
  f('bcf-uric', r.uric);
  f('bcf-bil-total', r.bilTotal);
  f('bcf-bil-direct', r.bilDirect);
  f('bcf-bil-indirect', r.bilIndirect);
  f('bcf-sgot', r.sgot);
  f('bcf-sgpt', r.sgpt);
  f('bcf-chol', r.chol);
  f('bcf-trig', r.trig);
  f('bcf-hdl', r.hdl);
  f('bcf-ldl', r.ldl);
  biochemSync();
}

async function biochemPrint() {
  if (!requireName('bcf-name')) return;
  try {
    await saveReportForPrint('biochem', buildBiochemRec());
  } catch (e) {
    if (handleSaveError(e)) return;
  }
  printOnly('biochem-report', getTabPageSize('biochem', 'A4'));
}

async function biochemShare() {
  if (!requireName('bcf-name')) return;
  const btn = document.getElementById('biochem-share-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Preparing…';
  btn.disabled = true;
  try {
    const blob = await captureEl(document.getElementById('biochem-report'));
    await saveRec(buildBiochemRec());
    await doShare(blob, bcfv('bcf-name'));
  } catch (e) {
    if (!handleSaveError(e) && e.name !== 'AbortError') alert('Could not share: ' + e.message);
  }
  btn.innerHTML = orig;
  btn.disabled = false;
}

/* ══ SETTINGS — Margin Sliders ══ */
const MARGIN_TABS = [
  { key: 'sero', label: 'Serology', pageSize: 'A4' },
  { key: 'haemo', label: 'Haemogram', pageSize: 'A4' },
  { key: 'bs', label: 'Blood Sugar', pageSize: 'A5' },
  { key: 'biochem', label: 'Bio-Chemistry', pageSize: 'A4' },
  { key: 'crpra', label: 'CRP / RA', pageSize: 'A4' },
  { key: 'bill', label: 'Bill', pageSize: 'A4' },
];

function buildSettingsCards() {
  const grid = document.getElementById('settings-grid');
  if (!grid || grid.children.length > 0) return;

  MARGIN_TABS.forEach((tab) => {
    const m = getMargins(tab.key + '-report');
    const savedSize = getTabPageSize(tab.key, tab.pageSize);
    const card = document.createElement('div');
    card.className = 'settings-card';
    card.id = 'settings-card-' + tab.key;
    card.innerHTML = `
      <div class="settings-card-title">${tab.label}</div>
      <div class="margin-slider-row" style="margin-bottom:8px">
        <label>Paper Size</label>
        <select id="ms-${tab.key}-pagesize" style="margin-left:8px;padding:2px 6px;border-radius:4px;border:1px solid #cbd5e0"
          onchange="saveTabPageSize('${tab.key}',this.value)">
          <option value="A4" ${savedSize === 'A4' ? 'selected' : ''}>A4</option>
          <option value="A5" ${savedSize === 'A5' ? 'selected' : ''}>A5</option>
        </select>
      </div>
      ${['top', 'bottom', 'left', 'right']
        .map(
          (side) => `
        <div class="margin-slider-row">
          <label>${side}</label>
          <input type="range" min="0" max="80" value="${side === 'top' ? m.top : side === 'bottom' ? m.bottom : side === 'left' ? m.left : m.right}"
                 id="ms-${tab.key}-${side}" step="1"
                 oninput="document.getElementById('msv-${tab.key}-${side}').textContent=this.value+'mm'">
          <span class="margin-slider-val" id="msv-${tab.key}-${side}">${side === 'top' ? m.top : side === 'bottom' ? m.bottom : side === 'left' ? m.left : m.right}mm</span>
        </div>
      `,
        )
        .join('')}
      <button class="btn-save-margins" onclick="saveTabMargins('${tab.key}')">Save Settings</button>
      <button class="btn-reset-margins" onclick="resetTabMargins('${tab.key}')">↺ Reset Settings</button>
      <div class="settings-saved" id="settings-saved-${tab.key}"></div>
    `;
    grid.appendChild(card);
  });
}

function saveTabPageSize(key, size) {
  localStorage.setItem('_pcl_pagesize_' + key, size);
  syncLivePrintPreview(key);
}
function getTabPageSize(key, defaultSize) {
  return localStorage.getItem('_pcl_pagesize_' + key) || defaultSize;
}
function getPaperDimensions(pageSize) {
  return pageSize === 'A5' ? { width: 148, height: 210 } : { width: 210, height: 297 };
}

function saveTabMargins(key) {
  const pageSize = document.getElementById(`ms-${key}-pagesize`)?.value;
  if (pageSize) saveTabPageSize(key, pageSize);
  const margins = {
    top: parseInt(document.getElementById(`ms-${key}-top`).value),
    bottom: parseInt(document.getElementById(`ms-${key}-bottom`).value),
    left: parseInt(document.getElementById(`ms-${key}-left`).value),
    right: parseInt(document.getElementById(`ms-${key}-right`).value),
  };
  saveMargins(key, margins);
  syncLivePrintPreview(key);
  const msg = document.getElementById('settings-saved-' + key);
  msg.textContent = 'Saved!';
  setTimeout(() => (msg.textContent = ''), 2000);
}

function resetTabMargins(key) {
  const def = TAB_DEFAULT_MARGINS[key] || DEFAULT_MARGINS;
  const defaultPageSize = MARGIN_TABS.find((tab) => tab.key === key)?.pageSize || 'A4';
  saveTabPageSize(key, defaultPageSize);
  const pageSizeSelect = document.getElementById(`ms-${key}-pagesize`);
  if (pageSizeSelect) pageSizeSelect.value = defaultPageSize;
  saveMargins(key, { ...def });
  ['top', 'bottom', 'left', 'right'].forEach((side) => {
    const slider = document.getElementById(`ms-${key}-${side}`);
    const val = document.getElementById(`msv-${key}-${side}`);
    const def2 = TAB_DEFAULT_MARGINS[key] || DEFAULT_MARGINS;
    if (slider) {
      slider.value = def2[side];
      val.textContent = def2[side] + 'mm';
    }
  });
  syncLivePrintPreview(key);
  const msg = document.getElementById('settings-saved-' + key);
  msg.textContent = `Settings reset: ${defaultPageSize} paper, default margins`;
  setTimeout(() => (msg.textContent = ''), 2000);
}

const LIVE_PRINT_PREVIEW_TABS = [
  { key: 'sero', report: 'sero-report', pageSize: 'A4' },
  { key: 'haemo', report: 'haemo-report', pageSize: 'A4' },
  { key: 'bs', report: 'bs-report', pageSize: 'A5' },
  { key: 'biochem', report: 'biochem-report', pageSize: 'A4' },
  { key: 'crpra', report: 'crpra-report', pageSize: 'A4' },
  { key: 'bill', report: 'bill-report', pageSize: 'A4' },
];

function refreshLivePrintPreview(scaler) {
  const config = LIVE_PRINT_PREVIEW_TABS.find((tab) => tab.key === scaler.dataset.previewType);
  if (!config || !scaler.clientWidth) return;
  const pageSize = getTabPageSize(config.key, config.pageSize);
  const pageWidth = getPaperDimensions(pageSize).width;
  const pageWidthPx = (pageWidth * 96) / 25.4;
  const scale = Math.min(1, scaler.clientWidth / pageWidthPx);
  applyPrintPreviewLayout(scaler, config, pageSize, scale, scaler.clientWidth);
}

function applyPrintPreviewLayout(scaler, config, pageSize, scale, availableWidth) {
  const { width: pageWidth, height: pageHeight } = getPaperDimensions(pageSize);
  const margins = getMargins(config.report);
  const pageWidthPx = (pageWidth * 96) / 25.4;
  scaler.style.setProperty('--preview-width', `${pageWidth}mm`);
  scaler.style.setProperty('--preview-page-height', `${pageHeight}mm`);
  scaler.style.setProperty('--preview-height', `${((pageHeight * 96) / 25.4) * scale}px`);
  scaler.style.setProperty('--preview-left', `${(availableWidth - pageWidthPx * scale) / 2}px`);
  scaler.style.setProperty('--preview-scale', scale);
  scaler.style.setProperty(
    '--preview-padding',
    `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
  );
  scaler.style.setProperty(
    '--preview-font-size',
    pageSize === 'A5' && config.key !== 'bill' ? '10pt' : '11.5pt',
  );
}

function syncLivePrintPreview(key) {
  document.querySelectorAll('.report-scaler.print-preview-sheet').forEach((scaler) => {
    if (scaler.dataset.previewType === key) refreshLivePrintPreview(scaler);
  });
}

function createPrintPreviewSheet(report, key) {
  const scaler = document.createElement('div');
  scaler.className = 'report-scaler print-preview-sheet';
  scaler.dataset.previewType = key;
  scaler.appendChild(report);
  livePrintPreviewObserver.observe(scaler);
  return scaler;
}

const livePrintPreviewObserver = new ResizeObserver((entries) => {
  entries.forEach(({ target }) => refreshLivePrintPreview(target));
});
LIVE_PRINT_PREVIEW_TABS.forEach((config) => {
  const scaler = document.getElementById(config.report)?.parentElement;
  if (!scaler?.classList.contains('report-scaler')) return;
  scaler.classList.add('print-preview-sheet');
  scaler.dataset.previewType = config.key;
  livePrintPreviewObserver.observe(scaler);
  refreshLivePrintPreview(scaler);
});
