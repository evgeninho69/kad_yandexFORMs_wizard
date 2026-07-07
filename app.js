// Wizard form for 2KAD. Posts to kad_yandexFORMs_leads/webhook/yandex.
// Pure ES2018, no build step. Designed for static hosting.

(function () {
  'use strict';

  // ---- Endpoint -----------------------------------------------------------
  // New: deployed in the same Dokploy project (kad_yandexFORMs_leads) as
  // the wizard. The legacy endpoint (kad-yandexFORMs-leads.dev.ii4ki.ru
  // in cuzr_official project) is kept for backwards compat until sunset.
  var ENDPOINT = 'https://kad-yandexFORMs-leads.dev.ii4ki.ru/webhook/yandex';

  // ---- Object types → available work codes (mirrors backend parser) ----
  // Each item: [code, label, hint]
  // Code prefix maps to deal title prefix and parser branch:
  //   A = Межевые планы, B = Технические планы, C = ККР/ЗКИ, D = Смежные услуги.
  var OBJECT_TYPES = {
    'Земельный участок': {
      icon: '🌿',
      categories: [
        { id: 'A', title: 'A. Межевые планы', works: [
          ['1', 'Уточнение границ (межевание)'],
          ['2', 'Раздел ЗУ'],
          ['3', 'Объединение ЗУ'],
          ['4', 'Перераспределение ЗУ'],
          ['5', 'Образование ЗУ из гос/муниципальной собственности'],
          ['6', 'Вынос границ в натуру'],
          ['7', 'Образование части ЗУ'],
          ['8', 'Исправление реестровой ошибки'],
          ['11', 'Установление сервитута'],
          ['13', 'Схема расположения ЗУ на КПТ']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['1', 'Выписка из ЕГРН'],
          ['11', 'Регистрация в Росреестре'],
          ['15', 'Подготовка схемы границ'],
          ['20', 'Изменение ВРИ'],
          ['21', 'ГПЗУ / разрешение на строительство'],
          ['24', 'Согласование границ с муниципалитетом'],
          ['30', 'Подготовка XML для ЕГРН'],
          ['31', 'Подача в Росреестр без доверенности (218-ФЗ)']
        ]}
      ]
    },
    'Жилой дом / садовый дом': {
      icon: '🏠',
      categories: [
        { id: 'B', title: 'B. Технические планы', works: [
          ['1', 'ТП здания (жилой/садовый дом)'],
          ['3', 'ТП ОНС'],
          ['8', 'Акт обследования (снос)'],
          ['9', 'ТП для ввода в эксплуатацию'],
          ['10', 'Внесение изменений в ЕГРН (реконструкция)']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['4', 'Уведомление о начале строительства'],
          ['5', 'Уведомление об окончании строительства'],
          ['6', 'Разрешение на ввод в эксплуатацию'],
          ['11', 'Регистрация в Росреестре'],
          ['19', 'Согласование перепланировки']
        ]}
      ]
    },
    'Квартира / помещение': {
      icon: '🚪',
      categories: [
        { id: 'B', title: 'B. Технические планы', works: [
          ['6', 'ТП помещения (квартира)'],
          ['10', 'Внесение изменений в ЕГРН (перепланировка)'],
          ['12', 'Технический паспорт']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['11', 'Регистрация в Росреестре'],
          ['17', 'Договор купли-продажи / дарения'],
          ['18', 'Регистрация перехода права'],
          ['19', 'Согласование перепланировки']
        ]}
      ]
    },
    'Здание / сооружение': {
      icon: '🏢',
      categories: [
        { id: 'B', title: 'B. Технические планы', works: [
          ['1', 'ТП здания'],
          ['2', 'ТП сооружения'],
          ['5', 'ТП единого недвижимого комплекса'],
          ['7', 'ТП МКД'],
          ['8', 'Акт обследования (снос)'],
          ['9', 'ТП для ввода в эксплуатацию'],
          ['10', 'Внесение изменений в ЕГРН (реконструкция)'],
          ['12', 'Технический паспорт']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['6', 'Разрешение на ввод в эксплуатацию'],
          ['11', 'Регистрация в Росреестре'],
          ['13', 'Снятие с кадастрового учёта']
        ]}
      ]
    },
    'Объект незавершённого строительства': {
      icon: '🏗',
      categories: [
        { id: 'B', title: 'B. Технические планы', works: [
          ['3', 'ТП ОНС'],
          ['8', 'Акт обследования (если консервация)'],
          ['9', 'ТП для ввода в эксплуатацию']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['4', 'Уведомление о начале строительства'],
          ['5', 'Уведомление об окончании строительства'],
          ['6', 'Разрешение на ввод в эксплуатацию'],
          ['11', 'Регистрация в Росреестре']
        ]}
      ]
    },
    'Машино-место': {
      icon: '🚗',
      categories: [
        { id: 'B', title: 'B. Технические планы', works: [
          ['4', 'ТП машино-места'],
          ['10', 'Внесение изменений в ЕГРН']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['11', 'Регистрация в Росреестре'],
          ['18', 'Регистрация перехода права']
        ]}
      ]
    },
    'Линейный объект': {
      icon: '〰',
      categories: [
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['27', 'Постановка на кадастровый учёт линейного объекта'],
          ['25', 'Получение ТУ (электро-, газо-, водо-)'],
          ['26', 'Подключение к сетям'],
          ['11', 'Регистрация в Росреестре']
        ]}
      ]
    },
    'Другое': {
      icon: '📄',
      categories: [
        { id: 'C', title: 'C. ККР и заключения КИ', works: [
          ['1', 'Комплексные кадастровые работы (ККР)'],
          ['2', 'Заключение кадастрового инженера (ЗКИ)'],
          ['3', 'Судебная землеустроительная экспертиза']
        ]},
        { id: 'D', title: 'D. Смежные услуги', works: [
          ['16', 'Оценка рыночной стоимости'],
          ['14', 'Восстановление правоустанавливающих документов'],
          ['28', 'Оформление сервитута'],
          ['29', 'Согласование с Росреестром исправления ошибок']
        ]}
      ]
    }
  };

  // ---- Form state --------------------------------------------------------
  var TOTAL_STEPS = 5;
  var current = 1;
  var form = document.getElementById('wizard');
  var navEl = document.getElementById('nav');
  var stepsEl = document.getElementById('steps');
  var objectsList = document.getElementById('objects');
  var objectSeq = 0;

  function $(name) { return form.elements[name]; }
  function val(name) { var el = $(name); return el && 'value' in el ? (el.value || '').trim() : ''; }

  // ---- Object cards (step 4) -------------------------------------------
  function makeId() { return 'obj_' + (++objectSeq); }

  function addObject() {
    var id = makeId();
    var div = document.createElement('div');
    div.className = 'object';
    div.dataset.objectId = id;
    div.innerHTML = renderObjectForm(id);
    objectsList.appendChild(div);
    div.querySelector('select[name="object_type"]').addEventListener('change', function () {
      refreshObjectWorks(div);
      updateObjectSummary(div);
    });
    div.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () { updateObjectSummary(div); });
      el.addEventListener('change', function () { updateObjectSummary(div); });
    });
    div.querySelector('.object__collapse').addEventListener('click', function () { collapseObject(div); });
    div.querySelector('.object__remove').addEventListener('click', function () { removeObject(div); });
    return div;
  }

  function renderObjectForm(id) {
    var types = Object.keys(OBJECT_TYPES);
    var opts = ['<option value="">— выберите тип объекта —</option>']
      .concat(types.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }))
      .join('');
    return [
      '<div class="object__header">',
      '  <div class="object__icon" data-icon>?</div>',
      '  <div class="object__summary">',
      '    <b>Новый объект</b>',
      '    <span class="muted" data-subtitle>Выберите тип и отметьте работы</span>',
      '  </div>',
      '  <div class="object__actions">',
      '    <button type="button" class="iconbtn object__collapse" title="Свернуть">▾</button>',
      '    <button type="button" class="iconbtn iconbtn--danger object__remove" title="Удалить">×</button>',
      '  </div>',
      '</div>',
      '<div class="object__body">',
      '  <div class="grid">',
      '    <label class="field"><span class="field__label">Тип объекта <em>*</em></span>',
      '      <select name="object_type" data-id="' + id + '" required>' + opts + '</select></label>',
      '    <label class="field"><span class="field__label">Кадастровый номер <em>(если есть)</em>',
      '      <input type="text" name="object_cadnum" placeholder="69:10:0000023:456" /></label>',
      '    <label class="field field--full"><span class="field__label">Адрес или ориентир <em>*</em>',
      '      <input type="text" name="object_address" required placeholder="г. Тверь, ул. Лесная, 12" /></label>',
      '    <label class="field"><span class="field__label">Площадь, м²',
      '      <input type="text" name="object_area" inputmode="decimal" placeholder="например, 1500" /></label>',
      '    <label class="field"><span class="field__label">Присвоен ли официальный адрес?',
      '      <select name="object_address_official"><option value="">— не знаю —</option><option>Да</option><option>Нет</option></select></label>',
      '  </div>',
      '  <div class="object__works"></div>',
      '</div>'
    ].join('');
  }

  function refreshObjectWorks(card) {
    var t = (card.querySelector('select[name="object_type"]') || {}).value;
    var worksBox = card.querySelector('.object__works');
    if (!t || !OBJECT_TYPES[t]) {
      worksBox.innerHTML = '';
      return;
    }
    var parts = ['<div class="object__section"><p class="object__section-title">Выберите нужные работы</p>'];
    OBJECT_TYPES[t].categories.forEach(function (cat) {
      parts.push('<div class="object__section">');
      parts.push('<p class="object__section-title">' + cat.title + '</p>');
      parts.push('<div class="checks">');
      cat.works.forEach(function (w) {
        var name = 'work_' + cat.id + '_' + w[0];
        parts.push('<label><input type="checkbox" name="' + name + '" value="' + cat.id + w[0] + '" />'
          + '<span>' + w[0] + '. ' + w[1] + '</span></label>');
      });
      parts.push('</div></div>');
    });
    parts.push('</div>');
    worksBox.innerHTML = parts.join('');
    worksBox.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () { updateObjectSummary(card); });
    });
  }

  function updateObjectSummary(card) {
    var t = (card.querySelector('select[name="object_type"]') || {}).value || 'Новый объект';
    var addr = (card.querySelector('input[name="object_address"]') || {}).value || '';
    var cad = (card.querySelector('input[name="object_cadnum"]') || {}).value || '';
    var works = [];
    card.querySelectorAll('input[type=checkbox]:checked').forEach(function (cb) {
      var lbl = cb.parentElement.querySelector('span');
      if (lbl) works.push(lbl.textContent.replace(/^\d+\.\s*/, ''));
    });
    var titleBit = t;
    if (addr) titleBit += ' · ' + (addr.length > 50 ? addr.slice(0, 50) + '…' : addr);
    card.querySelector('[data-icon]').textContent = (OBJECT_TYPES[t] || {}).icon || '📄';
    var sum = card.querySelector('.object__summary b');
    var sub = card.querySelector('[data-subtitle]');
    if (sum) sum.textContent = titleBit;
    if (sub) {
      var pieces = [];
      if (cad) pieces.push('КН ' + cad);
      pieces.push(works.length ? 'Работ: ' + works.length + ' (' + works.slice(0, 2).join(', ') + (works.length > 2 ? '…' : '') + ')'
                              : 'Работы не выбраны');
      sub.textContent = pieces.join(' · ');
    }
  }

  function collapseObject(card) {
    card.classList.toggle('is-collapsed');
    var btn = card.querySelector('.object__collapse');
    btn.textContent = card.classList.contains('is-collapsed') ? '▸' : '▾';
  }

  function removeObject(card) {
    if (!confirm('Удалить объект?')) return;
    card.parentNode.removeChild(card);
  }

  document.getElementById('addObject').addEventListener('click', function () {
    var card = addObject();
    card.classList.add('is-focused');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

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
    // For step 4, also require at least one object with at least one work
    if (n === 4) {
      if (!objectsList.children.length) {
        alert('Добавьте хотя бы один объект.');
        return false;
      }
      var anyWork = false;
      objectsList.querySelectorAll('input[type=checkbox]:checked').forEach(function () { anyWork = true; });
      if (!anyWork) {
        alert('Отметьте хотя бы одну работу.');
        return false;
      }
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

  // ---- Cadastral number mask (all object cards + step 3 legacy) ----------
  function attachCadnumMask(el) {
    if (!el || el.dataset.cadMask) return;
    el.dataset.cadMask = '1';
    el.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '').slice(0, 19);
      var parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 7), d.slice(7)];
      e.target.value = parts.filter(Boolean).join(':');
    });
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.name === 'object_cadnum') attachCadnumMask(e.target);
  });
  attachCadnumMask($('object_cadnum'));

  // ---- Build answers array in Yandex Forms shape ------------------------
  function buildAnswers() {
    var ct = (form.querySelector('input[name="customer_type"]:checked') || {}).value || '';
    var objects = [];
    objectsList.querySelectorAll('.object').forEach(function (card) {
      var o = {
        object_type: (card.querySelector('select[name="object_type"]') || {}).value || '',
        object_cadnum: (card.querySelector('input[name="object_cadnum"]') || {}).value || '',
        object_address: (card.querySelector('input[name="object_address"]') || {}).value || '',
        object_area: (card.querySelector('input[name="object_area"]') || {}).value || '',
        object_address_official: (card.querySelector('select[name="object_address_official"]') || {}).value || '',
        work_a: [], work_b: [], work_c: [], work_d: []
      };
      card.querySelectorAll('input[type=checkbox]:checked').forEach(function (cb) {
        var v = cb.value || '';  // e.g. "A1", "B6", "D11"
        var prefix = v.charAt(0);
        var num = v.slice(1);
        if (o['work_' + prefix.toLowerCase()]) o['work_' + prefix.toLowerCase()].push(num);
      });
      objects.push(o);
    });

    // Map: first object's first work → "work_main" for TITLE.
    // We also keep raw answers per object so backend can use them later.
    var primary = objects[0] || {};
    var workMain = '';
    var firstWorkArr = primary.work_a && primary.work_a.length ? primary.work_a
      : primary.work_b && primary.work_b.length ? primary.work_b
      : primary.work_c && primary.work_c.length ? primary.work_c
      : primary.work_d && primary.work_d.length ? primary.work_d : [];
    if (firstWorkArr.length) {
      // Will be expanded by the backend parser via WORK_CATALOG.
      workMain = 'A' + firstWorkArr[0];
    }

    var map = {
      customer_type: ct,
      org_name: val('org_name'),
      inn: val('inn'),
      fio: val('fio'),
      phone: val('phone'),
      email: val('email'),
      snils: val('snils'),
      // Legacy single-object fields (first object, for parser compat):
      object_kind: primary.object_type || '',
      object_cadnum: primary.object_cadnum || '',
      object_address: primary.object_address || '',
      object_area: primary.object_area || '',
      object_address_official: primary.object_address_official || '',
      work_main: workMain,
      work_a: (primary.work_a || []).join(', '),
      work_b: (primary.work_b || []).join(', '),
      work_c: (primary.work_c || []).join(', '),
      work_d: (primary.work_d || []).join(', '),
      // New multi-object field (sent as JSON-encoded string for transport).
      objects: JSON.stringify(objects),
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

  // ---- Init: open with one empty object ---------------------------------
  showStep(1);
  addObject();
})();
