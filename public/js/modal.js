const modal = document.getElementById("modal"); // Modal container
const modalContent = document.getElementById("modal-content");  // Contains statistics data
const userStatsButton = document.getElementById("userstats-button");
const siteStatsButton = document.getElementById("sitestats-button");
const modalCloseButton = document.getElementById("modal-close-button");

let chartArray = [];  // Stores ApexCharts in current use

// Hide modal on click outside
window.addEventListener('click', event => {
  if (event.target == modal) {
    hideModal();
  }
});

// Setup buttons to show/hide modal
modalCloseButton.addEventListener('click', event => {
  hideModal();
});

siteStatsButton.addEventListener('click', async event => {
  showModal();
  drawSiteStatistics();
});

userStatsButton.addEventListener('click', async event => {
  showModal();
  drawUserStatistics();
});


function showModal() {
  modal.style.display = "block";
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  modal.style.display = "none";
  document.body.style.overflow = 'visible';

  // Clear charts & elements
  chartArray.forEach(element => {
    element.destroy();
  });
  chartArray = [];
  modalContent.innerHTML = '';
}

async function drawUserStatistics() {
  // Get data from Heroku
  const data = await getNotesSummaryFromDb();
  if (data._error) {
    modalContent.innerHTML = '<h2>Connection Error</h2><p>Failed to get statistics from server</p>';
    return;
  }

  // Print statistics
  modalContent.innerHTML = `<h2>User Satistics for ${data.first_name} ${data.last_name}</h2>
    <p>Account created ${data.days_since_creation} days ago (${data.account_created})</p><br>
    <table>
      <tr>
        <td>Notes created - total</td>
        <td>${data.notes_total}</td>
      </tr>
      <tr>
        <td>Notes created - past week</td>
        <td>${data.notes_past_week}</td>
      </tr>
      <tr>
        <td>Notes created - past month</td>
        <td>${data.notes_past_month}</td>
      </tr>
      <tr>
        <td>Notes/day - total</td>
        <td>${data.notes_per_day_since_creation}</td>
      </tr>
      <tr>
        <td>Notes/day - past week</td>
        <td>${data.notes_per_day_past_week}</td>
      </tr>
      <tr>
        <td>Average note length</td>
        <td>${data.notes_avg_length}</td>
      </tr>
    </table><br>
  `;

  // Prepare data and Draw bar chart
  const series = [
    { name: 'Done', data: [data.notes_done] },
    { name: 'Not done', data: [data.notes_total - data.notes_done] }
  ];

  let notesBar = document.createElement('div');
  modalContent.appendChild(notesBar);
  // chartArray.push(await drawSingleBarChart(notesBar, null, null, 'Completed notes comparison'));
  chartArray.push(await drawSingleBarChart(notesBar, series, [data.notes_total + ' total notes'], 'Completed notes comparison', ' note', ' notes'));
}

// Fill modal with Website Statistics
async function drawSiteStatistics() {
  // Get data from google (through Heroku backend)
  const data = await getWebsiteStatistics();
  if (data._error) {
    modalContent.innerHTML = '<h2>Connection Error</h2><p>Failed to get statistics from server</p>';
    return;
  }

  // Create Header and Nodes
  modalContent.innerHTML = `
    <h2>Website Satistics - 30 days</h2><br>
  `;
  let browserPie = document.createElement('div');
  let osPie = document.createElement('div');
  modalContent.appendChild(browserPie);
  modalContent.appendChild(osPie);

  // Organize data for charts
  let browserData = {};
  let osData = {};
  data.forEach(element => {
    if (!browserData[element[2]]) {
      browserData[element[2]] = parseInt(0);
    }
    if (!osData[element[1]]) {
      osData[element[1]] = parseInt(0);
    }
    osData[element[1]] += parseInt(element[6]);
    browserData[element[2]] += parseInt(element[6]);
  });

  // Draw charts
  chartArray.push(await drawPieChart(browserPie, Object.values(browserData), Object.keys(browserData), 'Site Browser Statistics'));
  chartArray.push(await drawPieChart(osPie, Object.values(osData), Object.keys(osData), 'Site OS Statistics'));
}

// Draws Apex Chart in included div
function drawPieChart(div, series, labels, title) {
  const options = {
    series: series,
    labels: labels,
    chart: {
      type: 'donut'
    },
    title: {
      text: title
    }
  }
  const chart = new ApexCharts(div, options);
  chart.render();
  return chart;
}

// Draws Bar Chart with a single bar in included div 
function drawSingleBarChart(div, series, xaxisText, title, toolTipSingle = '', toolTipMulti = '') {
  const options = {
    series: series,
    chart: {
      type: 'bar',
      height: 200,
      stacked: true,
      stackType: '100%'
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    title: {
      text: title
    },
    xaxis: {
      categories: xaxisText,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          let str = toolTipMulti;
          if (val === 1) { str = toolTipSingle; }
          return val + str;
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    }
  };

  const chart = new ApexCharts(div, options);
  chart.render();
  return chart;
}

