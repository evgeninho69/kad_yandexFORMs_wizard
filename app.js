// Wizard form for 2KAD. Posts to kad_yandexFORMs_leads/webhook/yandex.
// Pure ES2018, no build step. Designed for static hosting.

(function () {
  'use strict';

  // ---- Endpoint -----------------------------------------------------------
  // FastAPI service (kad_yandexFORMs_leads) deployed in Dokploy.
  // Same project as the wizard (kad_yandexFORMs_leads / production).
  var ENDPOINT = 'https://kad-yandexforms-leads.dev.ii4ki.ru/webhook/yandex';

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
  var worksNav = document.getElementById('worksNav');
  var worksMain = document.getElementById('worksMain');
  var objectSeq = 0;
  var activeWorkObjId = null;

  function $(name) { return form.elements[name]; }
  function val(name) { var el = $(name); return el && 'value' in el ? (el.value || '').trim() : ''; }

  // ---- Object cards (шаг 3: только данные; работы — в шаге 4) ---------
  function makeId() { return 'obj_' + (++objectSeq); }

  function addObject() {
    var id = makeId();
    var div = document.createElement('div');
    div.className = 'object';
    div.dataset.objectId = id;
    // Хранилище выбора работ — { "B1": true, "D11": false, ... }
    // Не зависит от рендера чекбоксов в шаге 4, переживает переключение объектов.
    div.selectedWorks = {};
    div.innerHTML = renderObjectForm(id);
    objectsList.appendChild(div);

    // Чекбокс «адрес как у первого объекта» — только для НЕ-первого
    var copyFirst = div.querySelector('.object__copyfirst');
    if (copyFirst) {
      var cb = copyFirst.querySelector('input[type=checkbox]');
      if (objectsList.children.length <= 1) {
        copyFirst.hidden = true;
      } else {
        cb.addEventListener('change', function () {
          if (cb.checked) copyFromFirst(div);
        });
      }
    }

    // Слушатели на поля
    div.querySelector('select[name="object_type"]').addEventListener('change', function () {
      updateObjectIcon(div);
      rebuildWorksFor(div);
    });
    div.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('input', function () { updateObjectIcon(div); });
      el.addEventListener('change', function () { updateObjectIcon(div); });
    });
    div.querySelector('.object__remove').addEventListener('click', function () { removeObject(div); });
    return div;
  }

  function copyFromFirst(card) {
    var first = objectsList.querySelector('.object');
    if (!first || first === card) return;
    var src = {
      object_address: (first.querySelector('input[name="object_address"]') || {}).value || '',
      object_address_official: (first.querySelector('select[name="object_address_official"]') || {}).value || ''
    };
    var dstAddr = card.querySelector('input[name="object_address"]');
    var dstOff = card.querySelector('select[name="object_address_official"]');
    if (dstAddr) dstAddr.value = src.object_address;
    if (dstOff) dstOff.value = src.object_address_official;
  }

  function renderObjectForm(id) {
    var types = Object.keys(OBJECT_TYPES);
    var opts = ['<option value="">— выберите тип объекта —</option>']
      .concat(types.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }))
      .join('');
    return [
      '<div class="object__header">',
      '  <div class="object__icon" data-icon>📄</div>',
      '  <div class="object__summary">',
      '    <b>Новый объект</b>',
      '    <span class="muted" data-subtitle>Выберите тип и заполните данные</span>',
      '  </div>',
      '  <div class="object__actions">',
      '    <button type="button" class="iconbtn iconbtn--danger object__remove" title="Удалить">×</button>',
      '  </div>',
      '</div>',
      '<div class="object__body">',
      // Чекбокс «адрес как у первого» — показываем через CSS/JS (для не-первого)
      '  <label class="object__copyfirst" hidden>',
      '    <input type="checkbox" />',
      '    <span>Адрес как у первого объекта</span>',
      '  </label>',
      '  <div class="grid">',
      '    <label class="field field--full"><span class="field__label">Тип объекта <em>*</em></span>',
      '      <select name="object_type" required>' + opts + '</select></label>',
      '    <label class="field"><span class="field__label">Кадастровый номер <em>(если есть)</em>',
      '      <input type="text" name="object_cadnum" placeholder="69:10:0000023:456" /></label>',
      '    <label class="field"><span class="field__label">Площадь, м²',
      '      <input type="text" name="object_area" inputmode="decimal" placeholder="например, 1500" /></label>',
      '    <label class="field field--full"><span class="field__label">Адрес или ориентир <em>*</em></span>',
      '      <input type="text" name="object_address" required placeholder="г. Тверь, ул. Лесная, 12" /></label>',
      '    <label class="field"><span class="field__label">Присвоен ли официальный адрес?',
      '      <select name="object_address_official"><option value="">— не знаю —</option><option>Да</option><option>Нет</option></select></label>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function updateObjectIcon(card) {
    var t = (card.querySelector('select[name="object_type"]') || {}).value || '';
    var addr = (card.querySelector('input[name="object_address"]') || {}).value || '';
    var cad = (card.querySelector('input[name="object_cadnum"]') || {}).value || '';
    var icon = (OBJECT_TYPES[t] || {}).icon || '📄';
    var iconEl = card.querySelector('[data-icon]');
    if (iconEl) iconEl.textContent = icon;
    var sum = card.querySelector('.object__summary b');
    var sub = card.querySelector('[data-subtitle]');
    var title = t || 'Новый объект';
    if (addr) {
      var short = addr.length > 50 ? addr.slice(0, 50) + '…' : addr;
      title += ' · ' + short;
    }
    if (sum) sum.textContent = title;
    if (sub) {
      var pieces = [];
      if (cad) pieces.push('КН ' + cad);
      pieces.push('Работ: ' + countWorks(card));
      sub.textContent = pieces.join(' · ');
    }
  }

  function countWorks(card) {
    if (!card || !card.selectedWorks) return 0;
    var n = 0;
    Object.keys(card.selectedWorks).forEach(function (k) { if (card.selectedWorks[k]) n++; });
    return n;
  }

  function removeObject(card) {
    if (!confirm('Удалить объект?')) return;
    var wasActive = card.dataset.objectId === activeWorkObjId;
    card.parentNode.removeChild(card);
    if (wasActive) activeWorkObjId = null;
    refreshCopyFirst();
    rebuildWorksNav();
    if (activeWorkObjId) rebuildWorksFor(activeWorkObjId);
    else clearWorksMain();
  }

  function refreshCopyFirst() {
    var all = objectsList.querySelectorAll('.object');
    all.forEach(function (card, idx) {
      var copyFirst = card.querySelector('.object__copyfirst');
      if (!copyFirst) return;
      if (idx === 0) {
        copyFirst.hidden = true;
        var cb = copyFirst.querySelector('input[type=checkbox]');
        if (cb) cb.checked = false;
      } else {
        copyFirst.hidden = false;
      }
    });
  }

  // ---- Step 4: nav + works for selected object -------------------------
  function rebuildWorksNav() {
    if (!worksNav) return;
    worksNav.innerHTML = '';
    var cards = objectsList.querySelectorAll('.object');
    if (!cards.length) {
      worksNav.innerHTML = '<p class="muted">Нет объектов. Вернитесь на&nbsp;шаг 3.</p>';
      return;
    }
    cards.forEach(function (card) {
      var id = card.dataset.objectId;
      var t = (card.querySelector('select[name="object_type"]') || {}).value || 'Объект';
      var addr = (card.querySelector('input[name="object_address"]') || {}).value || '';
      var icon = (OBJECT_TYPES[t] || {}).icon || '📄';
      var title = addr ? addr : t;
      var shortTitle = title.length > 30 ? title.slice(0, 30) + '…' : title;
      var cnt = countWorks(card);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'objnav' + (id === activeWorkObjId ? ' is-active' : '');
      btn.dataset.objId = id;
      btn.innerHTML = [
        '<span class="objnav__icon">' + icon + '</span>',
        '<span class="objnav__body">',
        '  <span class="objnav__title">' + escapeHtml(shortTitle) + '</span>',
        '  <span class="objnav__sub">' + escapeHtml(t) + '</span>',
        '</span>',
        '<span class="objnav__count">' + (cnt ? cnt : '') + '</span>'
      ].join('');
      btn.addEventListener('click', function () { selectWorkObj(id); });
      worksNav.appendChild(btn);
    });
  }

  function selectWorkObj(id) {
    activeWorkObjId = id;
    rebuildWorksNav();
    rebuildWorksFor(id);
  }

  function rebuildWorksFor(idOrCard) {
    var card = typeof idOrCard === 'string'
      ? objectsList.querySelector('.object[data-object-id="' + idOrCard + '"]')
      : idOrCard;
    if (!card) { clearWorksMain(); return; }
    var t = (card.querySelector('select[name="object_type"]') || {}).value;
    var cnt = countWorks(card);
    var name = (OBJECT_TYPES[t] || {}).icon || '📄';
    var tname = t || 'Объект';

    if (!t) {
      worksMain.innerHTML = [
        '<div class="works-for">',
        '  <span class="works-for__icon">📄</span>',
        '  <span class="works-for__name">Выберите тип объекта на&nbsp;шаге&nbsp;3</span>',
        '</div>',
        '<p class="works-for__empty">Вернитесь на&nbsp;шаг 3 и&nbsp;укажите тип объекта — тогда мы покажем доступные работы.</p>'
      ].join('');
      return;
    }

    var parts = [
      '<div class="works-for">',
      '  <span class="works-for__icon">' + name + '</span>',
      '  <span class="works-for__name">' + escapeHtml(tname) + '</span>',
      '  <span class="works-for__count">Выбрано: <b>' + cnt + '</b></span>',
      '</div>'
    ];

    OBJECT_TYPES[t].categories.forEach(function (cat) {
      parts.push('<div class="object__section">');
      parts.push('<p class="object__section-title">' + cat.title + '</p>');
      parts.push('<div class="checks">');
      cat.works.forEach(function (w) {
        var code = cat.id + w[0];  // "B1", "D11", ...
        var name2 = 'work_' + code;
        // Состояние берём из card.selectedWorks — переживает переключение объектов.
        var isOn = !!card.selectedWorks[code];
        parts.push('<label><input type="checkbox" name="' + name2 + '" value="' + code + '" data-card="' + card.dataset.objectId + '"' + (isOn ? ' checked' : '') + ' />'
          + '<span>' + w[0] + '. ' + w[1] + '</span></label>');
      });
      parts.push('</div></div>');
    });
    worksMain.innerHTML = parts.join('');

    worksMain.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var code = cb.value;
        card.selectedWorks[code] = cb.checked;
        updateObjectIcon(card);
        // update nav count
        var navBtn = worksNav.querySelector('.objnav[data-obj-id="' + card.dataset.objectId + '"] .objnav__count');
        if (navBtn) navBtn.textContent = countWorks(card) || '';
        // update header count
        var cntEl = worksMain.querySelector('.works-for__count b');
        if (cntEl) cntEl.textContent = countWorks(card);
      });
    });
  }

  function clearWorksMain() {
    if (!worksMain) return;
    worksMain.innerHTML = '<p class="works-for__empty">Нет объектов. Вернитесь на&nbsp;шаг 3 и&nbsp;добавьте хотя бы один.</p>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---- Init add-object button -------------------------------------------
  document.getElementById('addObject').addEventListener('click', function () {
    var card = addObject();
    refreshCopyFirst();
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

    // При входе в шаг 4 — построить nav + выбрать первый объект
    if (n === 4) {
      var first = objectsList.querySelector('.object');
      if (first) {
        activeWorkObjId = first.dataset.objectId;
      } else {
        activeWorkObjId = null;
      }
      rebuildWorksNav();
      if (activeWorkObjId) rebuildWorksFor(activeWorkObjId);
      else clearWorksMain();
    }

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

    // Снимаем прошлую ошибку согласия
    var consent = $('consent_pdn');
    var consentBlock = consent ? consent.closest('.check') : null;
    if (consentBlock) consentBlock.classList.remove('is-error');

    var required = panel.querySelectorAll('[required]');
    var ok = true;
    required.forEach(function (el) {
      var bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
      if (bad) {
        if (el.type !== 'checkbox') el.style.borderColor = 'var(--danger)';
        ok = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (!ok) {
      var firstField = panel.querySelector('.field');
      if (firstField) firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Шаг 3: должен быть хотя бы один объект, и у каждого — тип + адрес
    if (n === 3) {
      var cards = objectsList.querySelectorAll('.object');
      if (!cards.length) {
        alert('Добавьте хотя бы один объект.');
        return false;
      }
      var okStep3 = true;
      cards.forEach(function (card) {
        var t = (card.querySelector('select[name="object_type"]') || {}).value;
        var a = (card.querySelector('input[name="object_address"]') || {}).value.trim();
        if (!t) {
          (card.querySelector('select[name="object_type"]') || {}).style && ((card.querySelector('select[name="object_type"]')).style.borderColor = 'var(--danger)');
          okStep3 = false;
        }
        if (!a) {
          (card.querySelector('input[name="object_address"]') || {}).style && ((card.querySelector('input[name="object_address"]')).style.borderColor = 'var(--danger)');
          okStep3 = false;
        }
      });
      if (!okStep3) return false;
    }

    // Шаг 4: для каждого объекта должна быть выбрана хотя бы одна работа
    if (n === 4) {
      var cards4 = objectsList.querySelectorAll('.object');
      if (!cards4.length) {
        alert('Добавьте хотя бы один объект на шаге 3.');
        return false;
      }
      var anyWork = false;
      var emptyObjects = [];
      cards4.forEach(function (card) {
        if (countWorks(card) > 0) {
          anyWork = true;
        } else {
          var t = (card.querySelector('select[name="object_type"]') || {}).value || 'объект';
          emptyObjects.push(t);
        }
      });
      if (!anyWork) {
        alert('Отметьте хотя бы одну работу для объекта: ' + emptyObjects.join(', '));
        return false;
      }
    }

    // Шаг 5: согласие ПДн — отдельный красивый shake
    if (n === 5) {
      if (consent && !consent.checked) {
        if (consentBlock) {
          consentBlock.classList.remove('is-error');
          // reflow → перезапуск анимации
          void consentBlock.offsetWidth;
          consentBlock.classList.add('is-error');
          consentBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Дополнительно: подсветим всю панель шага 5
          if (panel) {
            panel.classList.remove('is-error');
            void panel.offsetWidth;
            panel.classList.add('is-error');
          }
        } else {
          // consentBlock == null — что-то не так с разметкой
          if (window.console && console.warn) {
            console.warn('consent_pdn: ближайший .check не найден');
          }
        }
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

  // ---- Снимаем shake при ручном отмечании чекбокса --------------------
  var consentEl = $('consent_pdn');
  if (consentEl) {
    consentEl.addEventListener('change', function () {
      var block = consentEl.closest('.check');
      if (block) block.classList.remove('is-error');
    });
  }

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

  // ---- Cadastral number mask (РФ: XX:XX:XXXXXXX:XXXXX..., ≥13 цифр) ---
  // Формат по приказу Росреестра П/0592:
  //   ЗУ:        AA:BB:CCCCCCC:DD            (2+2+7+2   = 13)
  //   ОКС:       AA:BB:CCCCCCC:DDDD         (2+2+7+4   = 15)
  //   Сооружения:AA:BB:CCCCCCC:DDDDDDD...   (2+2+7+∞   = 13+  — последняя часть НЕ ограничена)
  //   Помещение: AA:BB:CCCCCC:DD            (2+2+6+2   = 12, старый формат)
  // Маска: пользователь вводит ТОЛЬКО цифры; двоеточия подставляются по позициям
  // 2, 4 и 11. После 11-й цифры — всё остальное идёт в последнюю группу без ограничения.
  function attachCadnumMask(el) {
    if (!el || el.dataset.cadMask) return;
    el.dataset.cadMask = '1';
    el.addEventListener('input', function (e) {
      var d = e.target.value.replace(/\D/g, '');
      // Без жёсткого потолка — последняя часть может быть сколь угодно длинной.
      // Но чтобы UI оставался читабельным, ограничим общую длину до 30 цифр.
      d = d.slice(0, 30);
      var out = '';
      if (d.length > 0) out = d.slice(0, 2);
      if (d.length > 2) out += ':' + d.slice(2, 4);
      if (d.length > 4) out += ':' + d.slice(4, 11);
      if (d.length > 11) out += ':' + d.slice(11);
      e.target.value = out;
    });
    el.setAttribute('inputmode', 'numeric');
    el.setAttribute('autocomplete', 'off');
    el.removeAttribute('maxlength');  // maxlength теперь зависит от длины ввода
  }
  document.addEventListener('input', function (e) {
    if (e.target && e.target.name === 'object_cadnum') attachCadnumMask(e.target);
    if (e.target && e.target.name === 'agreed_price') attachPriceMask(e.target);
  });

  // ---- Price mask (разделитель тысяч пробелами) -------------------------
  function attachPriceMask(el) {
    if (!el || el.dataset.priceMask) return;
    el.dataset.priceMask = '1';
    el.addEventListener('input', function (e) {
      // Берём только цифры, делим на группы по 3 с конца
      var d = e.target.value.replace(/\D/g, '').slice(0, 12);
      var out = '';
      while (d.length > 3) {
        out = ' ' + d.slice(-3) + out;
        d = d.slice(0, -3);
      }
      out = d + out;
      e.target.value = out;
    });
  }

  // ---- Build answers array in Yandex Forms shape ------------------------
  function buildAnswers() {
    var ct = (form.querySelector('input[name="customer_type"]:checked') || {}).value || '';
    var objects = [];
    objectsList.querySelectorAll('.object').forEach(function (card) {
      var o = {
        object_id: card.dataset.objectId,
        object_type: (card.querySelector('select[name="object_type"]') || {}).value || '',
        object_cadnum: (card.querySelector('input[name="object_cadnum"]') || {}).value || '',
        object_address: (card.querySelector('input[name="object_address"]') || {}).value || '',
        object_area: (card.querySelector('input[name="object_area"]') || {}).value || '',
        object_address_official: (card.querySelector('select[name="object_address_official"]') || {}).value || '',
        work_a: [], work_b: [], work_c: [], work_d: []
      };
      // Собираем работы из card.selectedWorks (а не из DOM, потому что в шаге 4
      // чекбоксы рендерятся динамически и могут не существовать в момент submit).
      var sel = card.selectedWorks || {};
      Object.keys(sel).forEach(function (code) {
        if (!sel[code]) return;
        var prefix = code.charAt(0);
        var num = code.slice(1);
        if (o['work_' + prefix.toLowerCase()]) o['work_' + prefix.toLowerCase()].push(num);
      });
      objects.push(o);
    });

    var primary = objects[0] || {};
    var workMain = '';
    var firstWorkArr = primary.work_a && primary.work_a.length ? primary.work_a
      : primary.work_b && primary.work_b.length ? primary.work_b
      : primary.work_c && primary.work_c.length ? primary.work_c
      : primary.work_d && primary.work_d.length ? primary.work_d : [];
    if (firstWorkArr.length) workMain = 'A' + firstWorkArr[0];

    var map = {
      customer_type: ct,
      org_name: val('org_name'),
      inn: val('inn'),
      fio: val('fio'),
      phone: val('phone'),
      email: val('email'),
      snils: val('snils'),
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
      objects: JSON.stringify(objects),
      notes: val('notes'),
      deadline: val('deadline'),
      urgency: val('urgency'),
      source: val('source'),
      agreed_price: val('agreed_price'),
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

    // multipart/form-data — чтобы прикрепить файлы.
    // Backend (FastAPI) парсит это через python-multipart + UploadFile.
    var fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    var filesInput = form.querySelector('input[name="files"]');
    if (filesInput && filesInput.files) {
      Array.prototype.forEach.call(filesInput.files, function (f) {
        fd.append('files', f, f.name);
      });
    }

    fetch(ENDPOINT, {
      method: 'POST',
      // НЕ указываем Content-Type — браузер сам выставит boundary
      body: fd
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
        // Кнопка «На главную» вместо «Отправить заявку» / «Далее»
        submit.hidden = true;
        var nextBtn = document.getElementById('next');
        if (nextBtn) nextBtn.hidden = true;
        var homeBtn = document.getElementById('home');
        if (homeBtn) homeBtn.hidden = false;
      })
      .catch(function (err) {
        alert('Не удалось отправить заявку. Попробуйте ещё раз или позвоните +7 (4822) 41-57-68.\n\nТехническая ошибка: ' + err.message);
        submit.disabled = false;
        submit.textContent = 'Отправить заявку';
      });
  });

  // ---- "На главную" — сбросить форму и вернуться на шаг 1 ----------------
  var homeBtn = document.getElementById('home');
  if (homeBtn) {
    homeBtn.addEventListener('click', function () {
      // Сбросить все поля
      form.reset();
      // Очистить все карточки объектов и добавить одну пустую
      while (objectsList.firstChild) objectsList.removeChild(objectsList.firstChild);
      objectSeq = 0;
      addObject();
      refreshCopyFirst();
      // Сбросить активный объект для шага 4
      activeWorkObjId = null;
      // Спрятать кнопку «На главную», вернуть «Далее» / «Отправить»
      homeBtn.hidden = true;
      current = 1;
      showStep(1);
    });
  }

  // ---- Init: open with one empty object ---------------------------------
  showStep(1);
  addObject();
  refreshCopyFirst();
})();
