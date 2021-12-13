//setup
const datasetLabels = [];
const datasetData = [];
let configData = {};

//config
configData = {
  labels: datasetLabels,
  datasets: [
    {
      label: "Today's Energy Savings",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
      data: datasetData,
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    },
  ],
};

const config = {
  type: "line",
  data: configData,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Solar stat chart - Hira School",
      },
    },
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Value",
        },
        suggestedMin: -10,
        suggestedMax: 200,
      },
    },
  },
};

//chart
const myChart = new Chart(document.getElementById("myChart"), config);

function fetchAndUpdate() {
  axios
    .get(`/api`, { timeout: 30000 })
    .then((res) => {
      removeData(myChart);
      res.data.db.data.forEach((element) => {
        addData(myChart, String(element.dateTime), element.eTotal);
      });

      let lastStats = res.data.db.data[res.data.db.data.length - 1];
      document.querySelector("#last-updated").innerHTML = dataTimestamp;
      document.querySelector("#etoday").innerHTML =
        lastStats.eToday > 0 ? lastStats.eToday + " kWh" : "NA";
      document.querySelector("#mtoday").innerHTML =
        lastStats.mToday > 0 ? "MVR." + lastStats.mToday : "NA";
      document.querySelector("#etotal").innerHTML =
        lastStats.eTotal > 0 ? lastStats.eTotal + " kWh" : "NA";
      document.querySelector("#mtotal").innerHTML =
        lastStats.mTotal > 0 ? "MVR." + lastStats.mTotal : "NA";
      document.querySelector("#plant-name").innerHTML =
        res.data.db.plantInfo.plantName;
      document.querySelector("#plant-island").innerHTML =
        res.data.db.plantInfo.plantIsland;
      document.querySelector("#plant-country").innerHTML =
        res.data.db.plantInfo.plantCountry;
      document.querySelector("#created-date").innerHTML =
        res.data.db.plantInfo.createdDate;
    });
  setTimeout(fetchAndUpdate, UPDATE_INTERVAL);
}

$(document).ready(function () {
  fetchAndUpdate();
});

function addData(chart, label, data) {
  if (chart.data.labels.indexOf(label) == -1) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
    });
    if (chart.data.labels.length > 50) {
      chart.data.labels.shift();
    }
  }
  chart.update();
}

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.update();
}