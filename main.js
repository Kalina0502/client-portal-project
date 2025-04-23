function loadTab(filename) {
  fetch(filename)
    .then(res => res.text())
    .then(html => {
      document.getElementById('content-area').innerHTML = html;
    });
}

// Зареждаме Dashboard таб по подразбиране при стартиране
window.addEventListener('DOMContentLoaded', () => {
  loadTab('dashboard.html');

  // изчакваме малко, за да е зареден tab-a
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
  const clients = [...new Set(data.map(d => d.Col006))];
  const select = document.getElementById('clientFilter');

  clients.forEach(client => {
    const option = document.createElement('option');
    option.value = client;
    option.textContent = client;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    const client = select.value;
    const filtered = data.filter(d => d.Col006 === client);
    renderDashboardTable(filtered);

    renderDashboardTable(filtered);
    renderAllQuestionsChart(filtered);
    renderTop3Chart(filtered);
    renderBottom3Chart(filtered);
  });
}


function renderDashboardTable(data) {
  const tableBody = document.getElementById('dashboard-table-body');
  tableBody.innerHTML = ''; // чистим преди попълване

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






















// Зарежда footer-a автоматично
fetch('footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-area').innerHTML = html;
  });
