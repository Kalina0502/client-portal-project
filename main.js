
let selectedClient = null;
let currentTab = 'dashboard';


function loadTab(filename) {
  fetch(filename)
    .then(res => res.text())
    .then(html => {
      document.getElementById('content-area').innerHTML = html;

      currentTab = filename.includes('reporting') ? 'reporting' : 'dashboard';

      // Активен бутон
      const buttons = document.querySelectorAll('.sidebar button');
      buttons.forEach(btn => btn.classList.remove('active'));
      if (filename === 'dashboard.html') buttons[0].classList.add('active');
      if (filename === 'reporting.html') buttons[1].classList.add('active');

      setTimeout(() => {
        fetch('data.json')
          .then(res => res.json())
          .then(data => {
            jsonData = data.data[0];
            populateClientFilter(jsonData);

            // Dashboard таб
            if (filename === 'dashboard.html') {
              const contentBox = document.getElementById('dashboard-content');
              const warning = document.getElementById('select-warning');

              if (selectedClient) {
                const filtered = jsonData.filter(d => d.Col006 === selectedClient);
                if (contentBox) contentBox.style.display = 'block';
                if (warning) warning.style.display = 'none';

                renderDashboardTable(filtered);
                renderAllQuestionsChart(filtered);
                renderTop3Chart(filtered);
                renderBottom3Chart(filtered);
              } else {
                if (contentBox) contentBox.style.display = 'none';
                if (warning) warning.style.display = 'block';
              }
            }

            // Reporting таб
            if (filename === 'reporting.html') {
              const table = document.getElementById('reporting-table');
              const warning = document.getElementById('select-warning-reporting');

              if (selectedClient) {
                const filtered = jsonData.filter(d => d.Col006 === selectedClient);
                if (table) table.style.display = 'block';
                if (warning) warning.style.display = 'none';

                renderReportingTable(filtered);
              } else {
                if (table) table.style.display = 'none';
                if (warning) warning.style.display = 'block';
              }
            }
          });
      }, 100);
    });
}

// Dashboard таб по подразбиране при стартиране
window.addEventListener('DOMContentLoaded', () => {
  loadTab('dashboard.html');

  setTimeout(() => {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        jsonData = data.data[0];
        populateClientFilter(jsonData);
      });
  }, 300);
});

//DASHBOARD
let jsonData = []; // ще държи всички данни
let currentClientData = []; // филтрирани данни според избрания клиент

function populateClientFilter(data) {
  const select = document.getElementById('clientFilter');

  if (select.dataset.loaded === "true") return;

  const clients = [...new Set(data.map(d => d.Col006))];

  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client;
    option.textContent = client;
    select.appendChild(option);
  });

  select.dataset.loaded = "true";

  select.addEventListener('change', () => {
    const client = select.value;
    selectedClient = client;
    const filtered = data.filter(d => d.Col006 === client);

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

  });
}


function renderDashboardTable(data) {
  const tableBody = document.getElementById('dashboard-table-body');
  tableBody.innerHTML = ''; // чистене преди попълване

  // групиране по въпрос
  const grouped = {};

  data.forEach(row => {
    const id = row.Col001;
    const question = row.Col005;
    const answer = row.Col002;
    const responses = parseInt(row.Col003);

    if (!grouped[id]) {
      grouped[id] = {
        questionText: question,
        answers: {},
        total: 0
      };
    }

    if (!grouped[id].answers[answer]) {
      grouped[id].answers[answer] = 0;
    }

    grouped[id].answers[answer] += responses;
    grouped[id].total += responses;
  });

  // изграждане на редовете
  Object.entries(grouped).forEach(([id, info]) => {
    const row = document.createElement('tr');

    const answersCSV = Object.entries(info.answers)
      .map(([ans, count]) => `${ans} (${count})`).join(', ');

    row.innerHTML = `
      <td>${id}</td>
      <td class="question-text">${info.questionText}</td>
      <td class="answer-text">${answersCSV}</td>
      <td>${info.total}</td>
    `;

    tableBody.appendChild(row);
  });
}


//CHART 1
function renderAllQuestionsChart(data) {
  const grouped = {};

  data.forEach(row => {
    const qText = row.Col005;
    const answer = row.Col002;
    const count = parseInt(row.Col003);

    if (!grouped[qText]) {
      grouped[qText] = {};
    }

    if (!grouped[qText][answer]) {
      grouped[qText][answer] = 0;
    }

    grouped[qText][answer] += count;
  });

  const questionTexts = Object.keys(grouped);
  const answerTypes = new Set();

  questionTexts.forEach(q => {
    Object.keys(grouped[q]).forEach(ans => answerTypes.add(ans));
  });

  const series = [...answerTypes].map(answer => ({
    name: answer,
    data: questionTexts.map(q => grouped[q][answer] || 0)
  }));

  Highcharts.chart('all-questions-chart', {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'All Questions – Answer Distribution'
    },
    xAxis: {
      categories: questionTexts,
      title: { text: 'Questions' }
    },
    yAxis: {
      min: 0,
      title: { text: 'Responses' },
      stackLabels: {
        enabled: true
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: series
  });
}

//CHART 2
function renderTop3Chart(data) {
  const grouped = {};

  // групиране и броене по въпрос и отговор
  data.forEach(row => {
    const qText = row.Col005;
    const answer = row.Col002;
    const count = parseInt(row.Col003);

    if (!grouped[qText]) {
      grouped[qText] = {
        answers: {},
        total: 0
      };
    }

    if (!grouped[qText].answers[answer]) {
      grouped[qText].answers[answer] = 0;
    }

    grouped[qText].answers[answer] += count;
    grouped[qText].total += count;
  });

  // сортиране по total и взимане на top 3
  const top3 = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  const questionTexts = top3.map(entry => entry[0]);
  const allAnswers = new Set();

  top3.forEach(entry => {
    Object.keys(entry[1].answers).forEach(a => allAnswers.add(a));
  });

  const series = [...allAnswers].map(answer => ({
    name: answer,
    data: top3.map(entry => entry[1].answers[answer] || 0)
  }));

  Highcharts.chart('top-questions-chart', {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Top 3 Questions – Answer Distribution'
    },
    xAxis: {
      categories: questionTexts,
      title: { text: 'Questions' }
    },
    yAxis: {
      min: 0,
      title: { text: 'Responses' },
      stackLabels: {
        enabled: true
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: series
  });
}


//CHART 3
function renderBottom3Chart(data) {
  const grouped = {};

  // групиране и броене по въпрос и отговор
  data.forEach(row => {
    const qText = row.Col005;
    const answer = row.Col002;
    const count = parseInt(row.Col003);

    if (!grouped[qText]) {
      grouped[qText] = {
        answers: {},
        total: 0
      };
    }

    if (!grouped[qText].answers[answer]) {
      grouped[qText].answers[answer] = 0;
    }

    grouped[qText].answers[answer] += count;
    grouped[qText].total += count;
  });

  // сортиране по total и взимане на bottom 3
  const bottom3 = Object.entries(grouped)
    .sort((a, b) => a[1].total - b[1].total)
    .slice(0, 3);

  const questionTexts = bottom3.map(entry => entry[0]);
  const allAnswers = new Set();

  bottom3.forEach(entry => {
    Object.keys(entry[1].answers).forEach(a => allAnswers.add(a));
  });

  const series = [...allAnswers].map(answer => ({
    name: answer,
    data: bottom3.map(entry => entry[1].answers[answer] || 0)
  }));

  Highcharts.chart('bottom-questions-chart', {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Bottom 3 Questions – Answer Distribution'
    },
    xAxis: {
      categories: questionTexts,
      title: { text: 'Questions' }
    },
    yAxis: {
      min: 0,
      title: { text: 'Responses' },
      stackLabels: {
        enabled: true
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: series
  });
}

//REPORTING
function renderReportingTable(data) {
  const tableBody = document.getElementById('reporting-table-body');
  tableBody.innerHTML = '';

  const grouped = {};

  data.forEach(row => {
    const question = row.Col005;
    const answer = row.Col002;
    const count = parseInt(row.Col003);

    if (!grouped[question]) {
      grouped[question] = {
        total: 0,
        answers: {}
      };
    }

    grouped[question].total += count;
    grouped[question].answers[answer] = (grouped[question].answers[answer] || 0) + count;
  });

  Object.entries(grouped).forEach(([question, info]) => {
    const tr = document.createElement('tr');
    tr.classList.add('reporting-row');

    // намиране на top answer и неговия процент
    const [topAnswerText, topAnswerCount] = Object.entries(info.answers)
      .sort((a, b) => b[1] - a[1])[0];

    const topAnswerPercentage = ((topAnswerCount / info.total) * 100).toFixed(2);

    // топ отговор с процент
    const topAnswerHtml = `
<div class="top-answer-cell">
  <div class="top-answer-text">${topAnswerText}</div>
  <div class="top-answer-percent">${topAnswerPercentage}%</div>
</div>
`;

    const questionTd = document.createElement('td');
    questionTd.innerText = question;

    const topAnswerTd = document.createElement('td');
    topAnswerTd.innerHTML = topAnswerHtml;

    const totalTd = document.createElement('td');
    totalTd.classList.add('responses-cell');
    totalTd.innerHTML = `
  <span class="response-count">${info.total}</span>
  <span class="arrow-icon">▼</span>
`;

    const arrowIcon = totalTd.querySelector('.arrow-icon');

    tr.appendChild(questionTd);
    tr.appendChild(topAnswerTd);
    tr.appendChild(totalTd);


    const subRow = document.createElement('tr');
    const subCell = document.createElement('td');
    subCell.colSpan = 4;
    subCell.style.padding = '0';
    subCell.style.backgroundColor = '#fafafa';
    subCell.style.display = 'none';

    const subTable = document.createElement('table');
    subTable.classList.add('sub-table');
    subTable.style.width = '100%';
    subTable.innerHTML = `
      <thead>
        <tr>
          <th class="left-align">Answer</th>
          <th class="right-align">Percentage</th>
          <th class="right-align">Count</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(info.answers).map(([answer, count]) => {
      const percent = ((count / info.total) * 100).toFixed(2);
      return `
            <tr>
              <td class="left-align">${answer}</td>
              <td class="right-align">${percent}%</td>
              <td class="right-align">${count}</td>
            </tr>
          `;
    }).join('')}
      </tbody>
    `;

    subCell.appendChild(subTable);
    subRow.appendChild(subCell);

    tr.addEventListener('click', () => {
      const isVisible = subCell.style.display === 'table-cell';
      subCell.style.display = isVisible ? 'none' : 'table-cell';
      arrowIcon.textContent = isVisible ? '▼' : '▲';
    });

    tableBody.appendChild(tr);
    tableBody.appendChild(subRow);
  });
}

// Зарежда footer-a автоматично
fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-area').innerHTML = html;
  });
