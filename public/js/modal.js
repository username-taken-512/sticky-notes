const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const userStatsButton = document.getElementById("userstats-button");
const siteStatsButton = document.getElementById("sitestats-button");
const modalCloseButton = document.getElementById("modal-close-button");

let chartArray = [];

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

/*
account_created: "2022-04-15 21:18"
days_since_creation: 35
first_name: "jiiiii"
last_name: "kkkkk"
notes_avg_length: "9"
notes_done: "0"
notes_past_month: "6"
notes_past_week: "0"
notes_per_day_past_week: "0.00"
notes_per_day_since_creation: "0.17"
notes_total: "6"
user_id: 4
username: "jon"
*/

async function drawUserStatistics() {
  // Get data from Heroku
  const data = await getNotesSummaryFromDb();

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
    </table>
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
  // Create Header and Nodes
  modalContent.innerHTML = `
    <h2>Website Satistics - 30 days</h2><br>
  `;
  let browserPie = document.createElement('div');
  let osPie = document.createElement('div');
  modalContent.appendChild(browserPie);
  modalContent.appendChild(osPie);

  // Get data from google
  const data = await getWebsiteStatistics();

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

// drawSingleBarChart(div, series, [data.notes_total], 'Completed notes comparison', ' note', ' notes')
// Draws Bar Chart in included div 
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

