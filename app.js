// Wizard form for 2KAD. Posts to kad_yandexFORMs_leads/webhook/yandex.
// Pure ES2018, no build step. Designed for static hosting.

(function () {
  'use strict';

  // ---- Endpoint -----------------------------------------------------------
  // Override at deploy-time by editing this constant. Production target
  // is the Dokploy-deployed FastAPI service.
  var ENDPOINT = 'https://kad-yandexFORMs-leads.dev.ii4ki.ru/webhook/yandex';

  // ---- Work catalog (mirrors the parser) --------------------------------
  var WORK_CATALOG = {
    A: [
      'Уточнение границ ЗУ (межевание)',
      'Раздел ЗУ',
      'Объединение ЗУ',
      'Перераспределение ЗУ',
      'Образование ЗУ из гос/муниципальной собственности',
      'Вынос границ в натуру',
      'Образование части ЗУ',
      'Исправление реестровой ошибки',
      'Объединение с сохранением исходных',
      'Раздел с сохранением исходного в изменённых границах',
      'Установление сервитута',
      'Межевание с уточнением площади',
      'Схема расположения ЗУ на КПТ'
    ],
    B: [
      'ТП здания', 'ТП сооружения', 'ТП ОНС', 'ТП машино-места',
      'ТП единого недвижимого комплекса', 'ТП помещения', 'ТП МКД',
      'Акт обследования (снос)', 'ТП для ввода в эксплуатацию',
      'Внесение изменений в ЕГРН', 'ТП для регистрации права', 'Техпаспорт'
    ],
    C: [
      'ККР', 'ЗКИ', 'Судебная землеустроительная экспертиза',
      'Межевой план для исправления реестровой ошибки'
    ]
  };

  function expandCodes(input, kind) {
    if (!input) return '';
    var items = WORK_CATALOG[kind];
    if (!items) return input;
    var out = [];
    input.split(',').forEach(function (tok) {
      var n = parseInt((tok.match(/\d+/) || [''])[0], 10);
      if (n >= 1 && n <= items.length) out.push(items[n - 1]);
    });
    return out.join('; ');
  }

  // ---- Form state --------------------------------------------------------
  var TOTAL_STEPS = 5;
  var current = 1;
  var form = document.getElementById('wizard');
  var navEl = document.getElementById('nav');
  var stepsEl = document.getElementById('steps');

  function $(name) { return form.elements[name]; }
  function val(name) { var el = $(name); return el && 'value' in el ? (el.value || '').trim() : ''; }

  // ---- Show/hide step ----------------------------------------------------
  function showStep(n) {
    document.querySelectorAll('.panel').forEach(function (p) {
      var want = String(n);
      var isSuccess = n === 'success';
      p.hidden = !(p.dataset.panel === want || (isSuccess && p.dataset.panel === 'success'));
      p.classList.toggle('is-active', p.dataset.panel === want || (isSuccess && p.dataset.panel === 'success'));
    });
    document.querySelectorAll('.steps__item').forEach(function (li) {
      var s = parseInt(li.dataset.step, 10);
      li.classList.toggle('is-active', s === n);
      li.classList.toggle('is-done', s < n);
    });
    navEl.hidden = (n === 'success');
    document.getElementById('prev').hidden = (n === 1);
    document.getElementById('next').hidden = (n >= TOTAL_STEPS);
    document.getElementById('submit').hidden = (n !== TOTAL_STEPS);
    if (n !== 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ---- Conditional fields (legal block, СНИЛС) --------------------------
  function refreshConditional() {
    var ct = (form.querySelector('input[name="customer_type"]:checked') || {}).value || '';
    var isLegal = /юр|ип|ооо|зао|оао|ао|предприним/i.test(ct);
    var isPhiz = /физ|фл/i.test(ct);
    document.getElementById('legal-block').hidden = !isLegal;
    var org = form.querySelector('input[name="org_name"]');
    var inn = form.querySelector('input[name="inn"]');
    if (org) org.required = isLegal;
    if (inn) inn.required = isLegal;
    document.getElementById('snils-field').hidden = !isPhiz;
  }

  // ---- Per-step validation ----------------------------------------------
  function validateStep(n) {
    var panel = document.querySelector('.panel[data-panel="' + n + '"]');
    if (!panel) return true;
    var required = panel.querySelectorAll('[required]');
    var ok = true;
    required.forEach(function (el) {
      var bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (bad) {
        el.style.borderColor = 'var(--danger)';
        ok = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (!ok) {
      panel.querySelector('.field') && panel.querySelector('.field').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  // ---- Files preview ----------------------------------------------------
  var filesInput = form.querySelector('input[name="files"]');
  var filesList = document.getElementById('filesList');
  if (filesInput && filesList) {
    filesInput.addEventListener('change', function () {
      filesList.innerHTML = '';
      var files = Array.from(filesInput.files || []);
      if (!files.length) { filesList.hidden = true; return; }
      filesList.hidden = false;
      files.forEach(function (f) {
        var li = document.createElement('li');
        li.textContent = f.name + ' (' + Math.round(f.size / 1024) + ' КБ)';
        filesList.appendChild(li);
      });
    });
  }

  // ---- Customer type radio → conditional refresh ------------------------
  form.querySelectorAll('input[name="customer_type"]').forEach(function (r) {
    r.addEventListener('change', refreshConditional);
  });
  refreshConditional();

  // ---- Navigation --------------------------------------------------------
  document.getElementById('prev').addEventListener('click', function () {
    if (current > 1) { current--; showStep(current); }
  });
  document.getElementById('next').addEventListener('click', function () {
    if (validateStep(current) && current < TOTAL_STEPS) {
      current++;
      showStep(current);
    }
  });

  // ---- Phone mask (RU) --------------------------------------------------
  var phoneEl = $('phone');
  if (phoneEl) {
    phoneEl.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7') && d.length) d = '7' + d;
      d = d.slice(0, 11);
      var out = '';
      if (d.length > 0) out = '+7';
      if (d.length > 1) out += ' ' + d.slice(1, 4);
      if (d.length > 4) out += ' ' + d.slice(4, 7);
      if (d.length > 7) out += '-' + d.slice(7, 9);
      if (d.length > 9) out += '-' + d.slice(9, 11);
      e.target.value = out;
    });
  }

  // ---- SNILS mask -------------------------------------------------------
  var snilsEl = $('snils');
  if (snilsEl) {
    snilsEl.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '').slice(0, 11);
      var out = '';
      if (d.length > 0) out = d.slice(0, 3);
      if (d.length > 3) out += '-' + d.slice(3, 6);
      if (d.length > 6) out += '-' + d.slice(6, 9);
      if (d.length > 9) out += ' ' + d.slice(9, 11);
      e.target.value = out;
    });
  }

  // ---- Cadastral number mask --------------------------------------------
  var cadEl = $('object_cadnum');
  if (cadEl) {
    cadEl.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '').slice(0, 19);
      var parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 7), d.slice(7)];
      e.target.value = parts.filter(Boolean).join(':');
    });
  }

  // ---- Build answers array in Yandex Forms shape ------------------------
  function buildAnswers() {
    var ct = (form.querySelector('input[name="customer_type"]:checked') || {}).value || '';
    var workA = expandCodes(val('work_a'), 'A');
    var workB = expandCodes(val('work_b'), 'B');
    var workC = expandCodes(val('work_c'), 'C');
    var workD = val('work_d');
    var workExtra = val('work_extra');

    var map = {
      customer_type: ct,
      org_name: val('org_name'),
      inn: val('inn'),
      fio: val('fio'),
      phone: val('phone'),
      email: val('email'),
      snils: val('snils'),
      object_kind: val('object_kind'),
      object_cadnum: val('object_cadnum'),
      object_address: val('object_address'),
      object_area: val('object_area'),
      object_address_official: val('object_address_official'),
      work_a: workA,
      work_b: workB,
      work_c: workC,
      work_d: workD,
      work_extra: workExtra,
      files_list: val('files_list'),
      notes: val('notes'),
      deadline: val('deadline'),
      urgency: val('urgency'),
      source: val('source'),
      consent_pdn: $('consent_pdn') && $('consent_pdn').checked
    };
    var answers = [];
    Object.keys(map).forEach(function (k) {
      var v = map[k];
      if (v === '' || v === null || v === undefined) return;
      answers.push({ question_id: k, value: v });
    });

    // Files — shape as Yandex Forms file answer (with name + size + a base64 dataURL).
    // Server-side, files are currently a TODO on the FastAPI side; we send metadata only.
    var files = Array.from((filesInput && filesInput.files) || []);
    if (files.length) {
      files.forEach(function (f) {
        answers.push({ question_id: 'files', value: { name: f.name, size: f.size, type: f.type } });
      });
    }
    return answers;
  }

  // ---- Submit ------------------------------------------------------------
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!validateStep(current)) return;
    var submit = document.getElementById('submit');
    submit.disabled = true;
    submit.textContent = 'Отправляем…';

    var payload = {
      event: 'answer.created',
      survey_id: 'kad_yandexFORMs_wizard',
      submitted_at: new Date().toISOString(),
      answers: buildAnswers()
    };

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, status: r.status, body: b }; });
      })
      .then(function (res) {
        if (res.ok && res.body && res.body.deal_id) {
          document.getElementById('dealId').textContent = '#' + res.body.deal_id;
        } else {
          document.getElementById('dealId').textContent = '(отправлено)';
        }
        showStep('success');
      })
      .catch(function (err) {
        alert('Не удалось отправить заявку. Попробуйте ещё раз или позвоните +7 (4822) 41-57-68.\n\nТехническая ошибка: ' + err.message);
        submit.disabled = false;
        submit.textContent = 'Отправить заявку';
      });
  });

  // ---- Init --------------------------------------------------------------
  showStep(1);
})();
