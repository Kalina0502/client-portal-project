// Renders the dashboard summary table with questions, answers, and response totals
function renderDashboardTable(data) {
    const tableBody = document.getElementById('dashboard-table-body');
    tableBody.innerHTML = '';

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

// CHART 1: Bar chart showing distribution of all question answers
function renderAllQuestionsChart(data) {
    const { backgroundColor, textColor } = getChartColors();
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
            type: 'bar',
            backgroundColor: backgroundColor
        },
        title: {
            text: 'All Questions – Answer Distribution',
            style: { color: textColor }
        },
        xAxis: {
            categories: questionTexts,
            title: { text: 'Questions', style: { color: textColor } },
            labels: { style: { color: textColor } }
        },
        yAxis: {
            min: 0,
            title: { text: 'Responses', style: { color: textColor } },
            stackLabels: {
                enabled: true,
                style: { color: textColor }
            },
            labels: { style: { color: textColor } }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    },
                    xAxis: {
                        labels: {
                            style: {
                                fontSize: '10px'
                            }
                        }
                    }
                }
            }]
        },
        legend: {
            reversed: true,
            itemStyle: { color: textColor }
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: series
    });
}

// CHART 2: Bar chart for Top 3 Most Chosen Answers
function renderTop3Chart(data) {
    const { backgroundColor, textColor } = getChartColors();
    const grouped = {};

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
            type: 'bar',
            backgroundColor: backgroundColor
        },
        title: {
            text: 'Top 3 Questions – Answer Distribution',
            style: { color: textColor }
        },
        xAxis: {
            categories: questionTexts,
            title: { text: 'Questions', style: { color: textColor } },
            labels: { style: { color: textColor } }
        },
        yAxis: {
            min: 0,
            title: { text: 'Responses', style: { color: textColor } },
            stackLabels: {
                enabled: true,
                style: { color: textColor }
            },
            labels: { style: { color: textColor } }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    },
                    xAxis: {
                        labels: {
                            style: {
                                fontSize: '10px'
                            }
                        }
                    }
                }
            }]
        },
        legend: {
            reversed: true,
            itemStyle: { color: textColor }
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: series
    });
}

// CHART 3: Bar chart for Bottom 3 Least Chosen Answers
function renderBottom3Chart(data) {
    const grouped = {};

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

    const { backgroundColor, textColor } = getChartColors();
    Highcharts.chart('bottom-questions-chart', {
        chart: {
            type: 'bar',
            backgroundColor: backgroundColor
        },
        title: {
            text: 'Bottom 3 Questions – Answer Distribution',
            style: {
                color: textColor,
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: questionTexts,
            title: { text: 'Questions', style: { color: textColor } },
            labels: { style: { color: textColor } }
        },
        yAxis: {
            min: 0,
            title: { text: 'Responses', style: { color: textColor } },
            stackLabels: {
                enabled: true,
                style: { color: textColor }
            },
            labels: { style: { color: textColor } }
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 600
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    },
                    xAxis: {
                        labels: {
                            style: {
                                fontSize: '10px'
                            }
                        }
                    }
                }
            }]
        },
        legend: {
            reversed: true,
            itemStyle: { color: textColor }
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: series
    });
}

// Summary stats: total responses and average per client
function renderDashboardSummary(data) {
    const summaryBox = document.getElementById('dashboard-summary');
    if (!summaryBox) return;

    const questions = [...new Set(data.map(d => d.Col005))];

    let totalResponses = 0;
    let totalTopPercents = 0;

    questions.forEach(q => {
        const questionData = data.filter(d => d.Col005 === q);
        const grouped = {};

        questionData.forEach(row => {
            const answer = row.Col002;
            const count = parseInt(row.Col003);
            if (!grouped[answer]) grouped[answer] = 0;
            grouped[answer] += count;
        });

        const total = Object.values(grouped).reduce((a, b) => a + b, 0);
        const top = Math.max(...Object.values(grouped));
        const percent = total > 0 ? (top / total) * 100 : 0;

        totalResponses += total;
        totalTopPercents += percent;
    });

    const avgTop = questions.length > 0 ? (totalTopPercents / questions.length).toFixed(1) : 0;

    summaryBox.innerHTML = `
      <div><strong>📊 Total Questions:</strong> ${questions.length}</div>
      <div><strong>✅ Avg. Top Answer:</strong> ${avgTop}%</div>
      <div><strong>👥 Total Responses:</strong> ${totalResponses}</div>
    `;
}

// Update charts on theme switch
function updateChartsTheme() {
    if (currentTab === 'dashboard' && selectedClient && selectedClient !== 'Client Filter') {
        const filtered = selectedClient === 'all' ? jsonData : jsonData.filter(d => d.Col006 === selectedClient);
        renderAllQuestionsChart(filtered);
        renderTop3Chart(filtered);
        renderBottom3Chart(filtered);
    }
}
