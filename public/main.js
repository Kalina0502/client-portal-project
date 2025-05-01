let selectedClient = null;
let currentTab = null;
let jsonData = [];

function loadTab(filename) {
  const targetTab = filename.includes('reporting') ? 'reporting' : 'dashboard';
  const contentArea = document.getElementById('content-area');

  if (currentTab === targetTab && contentArea && contentArea.innerHTML.trim() !== '') {
    return;
  }
  fetch(filename)
    .then(res => res.text())
    .then(html => {
      document.getElementById('content-area').innerHTML = html;

      currentTab = targetTab;

      // Активира бутоните
      const buttons = document.querySelectorAll('.sidebar button');
      buttons.forEach(btn => btn.classList.remove('active'));
      if (filename === 'dashboard.html') buttons[0].classList.add('active');
      if (filename === 'reporting.html') buttons[1].classList.add('active');

      fetch('/api/data')
        .then(res => res.json())
        .then(data => {
          jsonData = data.data[0];
          populateClientFilter(jsonData);

          if (currentTab === 'dashboard') {
            sessionStorage.setItem('currentTab', currentTab);
            const contentBox = document.getElementById('dashboard-content');
            const warning = document.getElementById('select-warning');

            if (selectedClient && selectedClient !== 'Client Filter') {
              const filtered = selectedClient === 'all' ? jsonData : jsonData.filter(d => d.Col006 === selectedClient);
              if (contentBox) contentBox.style.display = 'block';
              if (warning) warning.style.display = 'none';

              renderDashboardTable(filtered);
              renderAllQuestionsChart(filtered);
              renderTop3Chart(filtered);
              renderBottom3Chart(filtered);
              renderDashboardSummary(filtered);
            } else {
              if (contentBox) contentBox.style.display = 'none';
              if (warning) warning.style.display = 'block';
            }
          }

          if (currentTab === 'reporting') {
            sessionStorage.setItem('currentTab', currentTab);
            const table = document.getElementById('reporting-table');
            const warning = document.getElementById('select-warning-reporting');

            if (selectedClient && selectedClient !== 'Client Filter') {
              const filtered = selectedClient === 'all' ? jsonData : jsonData.filter(d => d.Col006 === selectedClient);
              if (table) table.style.display = 'block';
              if (warning) warning.style.display = 'none';

              renderReportingTable(filtered);

              document.getElementById('sort-top-answer')?.addEventListener('click', () => sortReporting('top'));
              document.getElementById('sort-responses')?.addEventListener('click', () => sortReporting('responses'));

            } else {
              if (table) table.style.display = 'none';
              if (warning) warning.style.display = 'block';
            }
          }
        })
        .catch(err => console.error('Грешка при взимане на данните:', err));
    });
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTab = sessionStorage.getItem('currentTab') || 'dashboard';
  loadTab(`${savedTab}.html`);

  const intro = document.getElementById('intro');
  const introShown = sessionStorage.getItem('introShown');

  const blocker = document.getElementById('page-blocker');

  if (!introShown && intro) {
    setTimeout(() => {
      intro.classList.add('animate__fadeOut');

      intro.addEventListener('animationend', () => {
        intro.remove();
        blocker.style.opacity = 0;

        setTimeout(() => {
          blocker.remove();
        }, 500);
      });

      sessionStorage.setItem('introShown', 'true');
    }, 2500);
  } else {
    intro?.remove();
    blocker.remove();
  }

});

function populateClientFilter(data) {
  const select = document.getElementById('clientFilter');

  if (select.dataset.loaded === "true") return;

  const clients = [...new Set(data.map(d => d.Col006))];

  //All Clients
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Clients';
  select.appendChild(allOption);

  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client;
    option.textContent = client;
    select.appendChild(option);
  });

  const savedClient = sessionStorage.getItem('selectedClient');
  if (savedClient) {
    select.value = savedClient;
    selectedClient = savedClient;

    const filtered = savedClient === 'all' ? data : data.filter(d => d.Col006 === savedClient);

    if (currentTab === 'dashboard') {
      const contentBox = document.getElementById('dashboard-content');
      const warning = document.getElementById('select-warning');
      if (contentBox) contentBox.style.display = 'block';
      if (warning) warning.style.display = 'none';

      renderDashboardTable(filtered);
      renderAllQuestionsChart(filtered);
      renderTop3Chart(filtered);
      renderBottom3Chart(filtered);
    }

    if (currentTab === 'reporting') {
      const table = document.getElementById('reporting-table');
      const warning = document.getElementById('select-warning-reporting');

      if (table) table.style.display = 'block';
      if (warning) warning.style.display = 'none';

      renderReportingTable(filtered);
    }
  }

  select.dataset.loaded = "true";

  select.addEventListener('change', () => {
    const client = select.value;
    selectedClient = client;
    sessionStorage.setItem('selectedClient', client);
    const filtered = client === 'all' ? data : data.filter(d => d.Col006 === client);


    if (currentTab === 'dashboard') {
      const contentBox = document.getElementById('dashboard-content');
      const warning = document.getElementById('select-warning');
      if (contentBox) contentBox.style.display = 'block';
      if (warning) warning.style.display = 'none';

      renderDashboardTable(filtered);
      renderAllQuestionsChart(filtered);
      renderTop3Chart(filtered);
      renderBottom3Chart(filtered);
      renderDashboardSummary(filtered);
    }

    if (currentTab === 'reporting') {
      const table = document.getElementById('reporting-table');
      const warning = document.getElementById('select-warning-reporting');

      if (table) table.style.display = 'block';
      if (warning) warning.style.display = 'none';

      renderReportingTable(filtered);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function getChartColors() {
  const isDark = document.body.classList.contains('dark-mode');
  return {
    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    textColor: isDark ? '#ffffff' : '#000000'
  };
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function attachPopperJS(targetElement, contentText) {
  const tooltip = document.createElement('div');
  tooltip.className = 'popper-tooltip';
  tooltip.textContent = contentText;

  Object.assign(tooltip.style, {
    backgroundColor: '#333',
    color: '#fff',
    padding: '5px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: 1000,
    display: 'none',
    position: 'absolute'
  });

  document.body.appendChild(tooltip);

  let popperInstance = null;

  function show() {
    tooltip.style.display = 'block';
    popperInstance = Popper.createPopper(targetElement, tooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: { offset: [0, 8] }
        }
      ]
    });
  }

  function hide() {
    tooltip.style.display = 'none';
    if (popperInstance) {
      popperInstance.destroy();
      popperInstance = null;
    }
  }

  targetElement.addEventListener('mouseenter', show);
  targetElement.addEventListener('mouseleave', hide);
}

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      updateChartsTheme();
    });

    document.getElementById('sort-top-answer')?.addEventListener('click', () => sortReporting('top'));
    document.getElementById('sort-responses')?.addEventListener('click', () => sortReporting('responses'));
  }
});

(function () {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if (backTop) {
    var dataElement = backTop.getAttribute('data-element');
    var scrollElement = dataElement ? document.querySelector(dataElement) : window;
    var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
      scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0,
      scrollOffset = 0,
      scrollOffsetOut = 0,
      scrolling = false;

    var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
      targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

    updateOffsets();

    backTop.addEventListener('click', function (event) {
      event.preventDefault();
      if (!window.requestAnimationFrame) {
        scrollElement.scrollTo(0, 0);
      } else {
        dataElement ? scrollElement.scrollTo({ top: 0, behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
    });

    checkBackToTop();
    if (scrollOffset > 0 || scrollOffsetOut > 0) {
      scrollElement.addEventListener("scroll", function (event) {
        if (!scrolling) {
          scrolling = true;
          (!window.requestAnimationFrame) ? setTimeout(function () { checkBackToTop(); }, 250) : window.requestAnimationFrame(checkBackToTop);
        }
      });
    }

    function checkBackToTop() {
      updateOffsets();
      var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
      if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
      var condition = windowTop >= scrollOffset;
      if (scrollOffsetOut > 0) {
        condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
      }
      backTop.classList.toggle('back-to-top--is-visible', condition);
      scrolling = false;
    }

    function updateOffsets() {
      scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
      scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
    }

    function getOffset(target, startOffset, bool) {
      var offset = 0;
      if (target) {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if (!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var boundingClientRect = target.getBoundingClientRect();
        offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
        offset = offset + windowTop;
      }
      if (startOffset) { offset += parseInt(startOffset); }
      return offset;
    }

    function moveFocus(element) {
      if (!element) element = document.getElementsByTagName("body")[0];
      element.focus();
      if (document.activeElement !== element) {
        element.setAttribute('tabindex', '-1');
        element.focus();
      }
    };
  }
}());

fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-area').innerHTML = html;
  });

function getFilteredData() {
  if (!selectedClient || selectedClient === 'Client Filter') return [];
  return selectedClient === 'all'
    ? jsonData
    : jsonData.filter(d => d.Col006 === selectedClient);
}
