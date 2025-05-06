// Renders the reporting table with questions, top answers, and expandable details
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

    // Find top answer and its percentage
    const [topAnswerText, topAnswerCount] = Object.entries(info.answers)
      .sort((a, b) => b[1] - a[1])[0];

      let rawTopPercentage;
      if (info.total === 0) {
        rawTopPercentage = 0;
      } else {
        rawTopPercentage = (topAnswerCount / info.total) * 100;
      }
      
      let topAnswerPercentage;
      if (Number.isInteger(rawTopPercentage)) {
        topAnswerPercentage = rawTopPercentage;
      } else {
        topAnswerPercentage = rawTopPercentage.toFixed(2);
      }

    // Determine color class based on percentage
    let colorClass = '';
    if (topAnswerPercentage > 90) {
      colorClass = 'top-answer-green';
    } else if (topAnswerPercentage >= 50 && topAnswerPercentage <= 90) {
      colorClass = 'top-answer-orange';
    } else {
      colorClass = 'top-answer-red';
    }

    const topAnswerHtml = `
    <div class="top-answer-cell ${colorClass}">
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

    // Expandable sub-row with breakdown of answers
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
    ${Object.entries(info.answers)
        .sort((a, b) => b[1] - a[1])
        .map(([answer, count], idx) => {
          const rawPercent = info.total === 0 ? 0 : (count / info.total) * 100;
          const percent = Number.isInteger(rawPercent) ? rawPercent : rawPercent.toFixed(2);

          const isTop = idx === 0 && count > 0;

          return `
            <tr>
              <td class="left-align">
                ${answer}
                ${isTop ? `
                  <span class="top-icon-wrapper" style="margin-left:6px; vertical-align:middle; cursor:pointer;">
                    <svg height="46px" width="28px">
                      <polygon style="fill: #50555B" fill-opacity="1" points="0,0 0,46 8,37 16,46 16,0"></polygon>
                      <polygon style="fill: #3c4044" fill-opacity="1" points="16,0 16,6 20,6"></polygon>
                      <text fill="white" y="12" x="5.5" style="font-family: Arial; font-weight: bold; font-size: 9px;">T</text>
                      <text fill="white" y="22" x="4.5" style="font-family: Arial; font-weight: bold; font-size: 9px;">O</text>
                      <text fill="white" y="32" x="5" style="font-family: Arial; font-weight: bold; font-size: 9px;">P</text>
                    </svg>
                  </span>
                ` : ''}
              </td>
              <td class="right-align">${percent}%</td>
              <td class="right-align">${count}</td>
            </tr>
          `;
        }).join('')
      }
  </tbody>
      `;

    const subContentWrapper = document.createElement('div');
    subContentWrapper.classList.add('sub-content-wrapper');
    subContentWrapper.appendChild(subTable);
    subCell.appendChild(subContentWrapper);
    subRow.appendChild(subCell);

    const innerIcon = subCell.querySelector('.top-icon-wrapper');
    if (innerIcon) {
      attachPopperJS(innerIcon, "Top Answer - a measure that identifies the value that appears most frequently in a set of data.");
    }

    // Toggle sub-row on click
    tr.addEventListener('click', () => {
      const contentWrapper = subCell.querySelector('.sub-content-wrapper');

      if (subCell.style.display === 'none' || subCell.style.display === '') {
        subCell.style.display = 'table-cell';
        const fullHeight = contentWrapper.scrollHeight;
        contentWrapper.style.height = fullHeight + 'px';
        arrowIcon.textContent = '▲';
        tr.classList.add('active-row');
      }
      else {
        contentWrapper.style.height = '0px';
        arrowIcon.textContent = '▼';
        tr.classList.remove('active-row');

        contentWrapper.addEventListener('transitionend', function hideSubCell() {
          subCell.style.display = 'none';
          contentWrapper.removeEventListener('transitionend', hideSubCell);
        });
      }
    });

    tableBody.appendChild(tr);
    tableBody.appendChild(subRow);
  });
}

// Sorts reporting table by top answer % or total responses
let currentSort = { column: null, direction: 'desc' };

function sortReporting(by) {
  const data = getFilteredData();
  const sorted = [...data];

  // Определяме посоката
  if (currentSort.column === by) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = by;
    currentSort.direction = 'desc';
  }

  const multiplier = currentSort.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    const aTop = getTopAnswer(a);
    const bTop = getTopAnswer(b);

    if (by === 'top') {
      return (aTop.percent - bTop.percent) * multiplier;
    } else if (by === 'responses') {
      return (aTop.count - bTop.count) * multiplier;
    }

    return 0;
  });

  renderReportingTable(sorted);

  const arrowTop = document.getElementById('arrow-top');
  const arrowResponses = document.getElementById('arrow-responses');

  arrowTop.textContent = '▲';
  arrowResponses.textContent = '▲';
  arrowTop.classList.remove('active');
  arrowResponses.classList.remove('active');

  const directionArrow = currentSort.direction === 'asc' ? '▲' : '▼';

  if (by === 'top') {
    arrowTop.textContent = directionArrow;
    arrowTop.classList.add('active');
  } else if (by === 'responses') {
    arrowResponses.textContent = directionArrow;
    arrowResponses.classList.add('active');
  }
}


// Helper: returns top answer info (text, count, percent) for a question
function getTopAnswer(entry) {
  const question = entry.Col005;
  const filtered = jsonData.filter(d => d.Col005 === question && (!selectedClient || selectedClient === 'all' || d.Col006 === selectedClient));

  const grouped = {};
  let total = 0;

  filtered.forEach(row => {
    const answer = row.Col002;
    const count = parseInt(row.Col003);

    if (!grouped[answer]) grouped[answer] = 0;
    grouped[answer] += count;
    total += count;
  });

  const [topAnswerText, topAnswerCount] = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  const percent = total > 0 ? ((topAnswerCount / total) * 100).toFixed(2) : 0;

  return {
    text: topAnswerText,
    count: topAnswerCount,
    percent: parseFloat(percent)
  };
}
