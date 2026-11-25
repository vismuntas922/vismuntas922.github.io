document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('cv-form');
  if (!form) return;

  const submitBtn = document.getElementById('submit-btn');
  const clearBtn = document.getElementById('clear-btn');
  const resultBox = document.getElementById('form-result');
  const resultData = document.getElementById('result-data');
  const resultAverage = document.getElementById('result-average');

  const fields = {
    vardas: document.getElementById('vardas'),
    pavarde: document.getElementById('pavarde'),
    email: document.getElementById('email'),
    telefonas: document.getElementById('telefonas'),
    adresas: document.getElementById('adresas'),
    q1: document.getElementById('q1'),
    q2: document.getElementById('q2'),
    q3: document.getElementById('q3')
  };

  const labels = {
    vardas: 'Vardas',
    pavarde: 'Pavardė',
    email: 'El. paštas',
    telefonas: 'Tel. numeris',
    adresas: 'Adresas',
    q1: 'Svetainės dizainas',
    q2: 'Informacijos aiškumas',
    q3: 'Rekomendacija'
  };

  const touched = new Set();

  const nameRegex = /^\p{L}+(?:[ -]\p{L}+)*$/u;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^\+370 6\d{2} \d{5}$/;

  function validateField(key) {
    const value = fields[key].value.trim();

    if (value === '') {
      return 'Šis laukas yra privalomas.';
    }

    switch (key) {
      case 'vardas':
      case 'pavarde':
        if (!nameRegex.test(value)) {
          return 'Galima naudoti tik raides.';
        }
        break;
      case 'email':
        if (!emailRegex.test(value)) {
          return 'Neteisingas el. pašto formatas (pvz., vardenis@pastas.lt).';
        }
        break;
      case 'telefonas':
        if (!phoneRegex.test(value)) {
          return 'Numeris turi būti formatu +370 6xx xxxxx.';
        }
        break;
      case 'adresas':
        if (value.length < 5) {
          return 'Adresas per trumpas.';
        }
        break;
      case 'q1':
      case 'q2':
      case 'q3': {
        const num = Number(value);
        if (!Number.isInteger(num) || num < 1 || num > 10) {
          return 'Įvertinimas turi būti sveikasis skaičius nuo 1 iki 10.';
        }
        break;
      }
    }

    return '';
  }

  function showError(key, message) {
    const input = fields[key];
    const errorBox = document.getElementById(key + '-error');

    if (message) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      errorBox.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      errorBox.textContent = '';
    }
  }

  function updateSubmitButton() {
    const allValid = Object.keys(fields).every(function (key) {
      return validateField(key) === '';
    });
    submitBtn.disabled = !allValid;
  }

  function formatPhone(rawValue) {
    let digits = rawValue.startsWith('+370')
      ? rawValue.slice(4).replace(/\D/g, '')
      : rawValue.replace(/\D/g, '');

    if (!rawValue.startsWith('+370') && digits.startsWith('370')) {
      digits = digits.slice(3);
    }
    if (digits.startsWith('8')) {
      digits = digits.slice(1);
    }

    digits = digits.slice(0, 8);

    if (digits.length === 0) return '';
    if (digits.length <= 3) return '+370 ' + digits;
    return '+370 ' + digits.slice(0, 3) + ' ' + digits.slice(3);
  }

  fields.telefonas.addEventListener('beforeinput', function (event) {
    if (event.inputType === 'insertText' && event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  });

  fields.telefonas.addEventListener('input', function () {
    fields.telefonas.value = formatPhone(fields.telefonas.value);
  });

  Object.keys(fields).forEach(function (key) {
    const input = fields[key];

    input.addEventListener('input', function () {
      touched.add(key);
      showError(key, validateField(key));
      updateSubmitButton();
    });

    input.addEventListener('blur', function () {
      touched.add(key);
      showError(key, validateField(key));
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      email: fields.email.value.trim(),
      telefonas: fields.telefonas.value.trim(),
      adresas: fields.adresas.value.trim(),
      q1: Number(fields.q1.value),
      q2: Number(fields.q2.value),
      q3: Number(fields.q3.value)
    };

    console.log(formData);

    resultData.innerHTML = '';
    Object.keys(formData).forEach(function (key) {
      const line = document.createElement('p');
      const label = document.createElement('strong');
      label.textContent = labels[key] + ': ';
      line.appendChild(label);
      line.appendChild(document.createTextNode(formData[key]));
      resultData.appendChild(line);
    });

    const average = (formData.q1 + formData.q2 + formData.q3) / 3;
    resultAverage.textContent =
      formData.vardas + ' ' + formData.pavarde + ': ' + average.toFixed(1);

    resultBox.hidden = false;
  });

  clearBtn.addEventListener('click', function () {
    form.reset();
    touched.clear();

    Object.keys(fields).forEach(function (key) {
      fields[key].classList.remove('is-invalid', 'is-valid');
      document.getElementById(key + '-error').textContent = '';
    });

    resultData.innerHTML = '';
    resultAverage.textContent = '';
    resultBox.hidden = true;
    submitBtn.disabled = true;
  });

  updateSubmitButton();
});

document.addEventListener('DOMContentLoaded', function () {
  const board = document.getElementById('pazanga');
  if (!board) return;

  const STORAGE_KEY = 'cvSkillStatuses';

  const STATUSES = ['Planuojama', 'Mokomasi', 'Atlikta'];

  const STATUS_IDS = {
    'Planuojama': 'planuojama',
    'Mokomasi': 'mokomasi',
    'Atlikta': 'atlikta'
  };

  const LEVELS = [
    { level: 1, min: 0,   max: 50,       rank: 'Pradedantysis' },
    { level: 2, min: 50,  max: 150,      rank: 'Praktikantas' },
    { level: 3, min: 150, max: 300,      rank: 'Specialistas' },
    { level: 4, min: 300, max: Infinity, rank: 'Profesionalas' }
  ];

  const initialSkills = [
    { id: 1, name: 'DOM valdymas',              status: 'Planuojama', xp: 40, icon: 'bi-braces' },
    { id: 2, name: 'PLC programavimas',         status: 'Planuojama', xp: 60, icon: 'bi-cpu' },
    { id: 3, name: 'JavaScript pagrindai',      status: 'Mokomasi',   xp: 50, icon: 'bi-filetype-js' },
    { id: 4, name: 'Elektros pavarų valdymas',  status: 'Mokomasi',   xp: 40, icon: 'bi-gear-wide-connected' },
    { id: 5, name: 'HTML pagrindai',            status: 'Atlikta',    xp: 50, icon: 'bi-filetype-html' },
    { id: 6, name: 'CSS stilizavimas',          status: 'Atlikta',    xp: 60, icon: 'bi-filetype-css' },
    { id: 7, name: 'Elektros schemų braižymas', status: 'Atlikta',    xp: 70, icon: 'bi-lightning-charge' },
    { id: 8, name: 'GitHub Pages',              status: 'Atlikta',    xp: 30, icon: 'bi-github' }
  ];

  let skills = loadSkills();

  function loadSkills() {
    const copy = initialSkills.map(function (skill) {
      return Object.assign({}, skill);
    });

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        copy.forEach(function (skill) {
          if (STATUSES.includes(saved[skill.id])) {
            skill.status = saved[skill.id];
          }
        });
      }
    } catch (error) {
      console.warn('Nepavyko nuskaityti išsaugotų būsenų:', error);
    }

    return copy;
  }

  function saveSkills() {
    const statuses = {};
    skills.forEach(function (skill) {
      statuses[skill.id] = skill.status;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.warn('Nepavyko išsaugoti būsenų:', error);
    }
  }

  function createSkillCard(skill) {
    const card = document.createElement('article');
    card.className = 'skill-card';

    const iconBox = document.createElement('div');
    iconBox.className = 'skill-card-icon';
    const icon = document.createElement('i');
    icon.className = 'bi ' + skill.icon;
    iconBox.appendChild(icon);

    const body = document.createElement('div');
    body.className = 'skill-card-body';

    const title = document.createElement('h4');
    title.textContent = skill.name;

    const meta = document.createElement('div');
    meta.className = 'skill-card-meta';

    const select = document.createElement('select');
    select.className = 'skill-status-select';
    select.setAttribute('aria-label', 'Įgūdžio „' + skill.name + '“ būsena');
    STATUSES.forEach(function (status) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      option.selected = status === skill.status;
      select.appendChild(option);
    });
    select.addEventListener('change', function () {
      changeStatus(skill.id, select.value);
    });

    const xp = document.createElement('span');
    xp.className = 'skill-xp';
    xp.textContent = 'XP: ' + skill.xp;

    meta.appendChild(select);
    meta.appendChild(xp);
    body.appendChild(title);
    body.appendChild(meta);
    card.appendChild(iconBox);
    card.appendChild(body);

    return card;
  }

  function renderSkills() {
    STATUSES.forEach(function (status) {
      const id = STATUS_IDS[status];
      const column = document.getElementById('cards-' + id);
      const count = document.getElementById('count-' + id);
      const columnSkills = skills.filter(function (skill) {
        return skill.status === status;
      });

      column.innerHTML = '';
      columnSkills.forEach(function (skill) {
        column.appendChild(createSkillCard(skill));
      });

      if (columnSkills.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'kanban-empty';
        empty.textContent = 'Įgūdžių nėra';
        column.appendChild(empty);
      }

      count.textContent = columnSkills.length;
    });
  }

  function calculateTotalXP() {
    return skills
      .filter(function (skill) { return skill.status === 'Atlikta'; })
      .reduce(function (sum, skill) { return sum + skill.xp; }, 0);
  }

  function getLevelInfo(totalXP) {
    return LEVELS.find(function (item) {
      return totalXP >= item.min && totalXP < item.max;
    });
  }

  function updateProgress() {
    const totalXP = calculateTotalXP();
    const info = getLevelInfo(totalXP);

    document.getElementById('xp-total').textContent = totalXP + ' XP';
    document.getElementById('xp-level').textContent = info.level;
    document.getElementById('xp-rank').textContent = info.rank;

    let percent;
    if (info.max === Infinity) {
      percent = 100;
      document.getElementById('xp-progress-label').textContent = 'Pasiektas aukščiausias lygis';
      document.getElementById('xp-progress-range').textContent = totalXP + ' XP';
    } else {
      percent = Math.round(((totalXP - info.min) / (info.max - info.min)) * 100);
      document.getElementById('xp-progress-label').textContent = 'Progresas iki ' + (info.level + 1) + ' lygio';
      document.getElementById('xp-progress-range').textContent = totalXP + ' / ' + info.max + ' XP';
    }

    document.getElementById('xp-bar-fill').style.width = percent + '%';
    document.getElementById('xp-bar-text').textContent = percent + '%';
    document.getElementById('xp-bar').setAttribute('aria-valuenow', percent);
  }

  function updateStats() {
    const total = skills.length;
    const done = skills.filter(function (skill) {
      return skill.status === 'Atlikta';
    }).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-percent').textContent = percent + '%';
  }

  function updateAll() {
    renderSkills();
    updateProgress();
    updateStats();
  }

  function changeStatus(skillId, newStatus) {
    const skill = skills.find(function (item) { return item.id === skillId; });
    if (!skill || !STATUSES.includes(newStatus)) return;

    skill.status = newStatus;
    saveSkills();
    updateAll();
  }

  document.getElementById('reset-skills').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Nepavyko išvalyti saugyklos:', error);
    }
    skills = loadSkills();
    updateAll();
  });

  updateAll();
});