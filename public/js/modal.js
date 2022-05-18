const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
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

// Fill modal wiyh Website Statistics
async function drawSiteStatistics() {
  // Create Nodes
  const browserTitle = document.createElement('h2');
  browserTitle.appendChild(document.createTextNode('Site Browser Statistics'));
  let browserPie = document.createElement('div');

  const osTitle = document.createElement('h2');
  osTitle.appendChild(document.createTextNode('Site OS Statistics'));
  let osPie = document.createElement('div');

  modalContent.appendChild(browserTitle);
  modalContent.appendChild(browserPie);
  modalContent.appendChild(osTitle);
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
  chartArray.push(await drawPieChart(browserPie, Object.values(browserData), Object.keys(browserData)));
  chartArray.push(await drawPieChart(osPie, Object.values(osData), Object.keys(osData)));
}

// Draws Apex Chart in included div
function drawPieChart(div, series, labels) {
  const options = {
    series: series,
    labels: labels,
    chart: {
      type: 'donut'
    }
  }
  const chart = new ApexCharts(div, options);
  chart.render();
  return chart;
}

