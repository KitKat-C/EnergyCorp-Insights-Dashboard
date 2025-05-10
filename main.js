const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function updateSummaryCards() {
  loadCSV("data/energy_production.csv", data => {
    const total = data.reduce((sum, row) => sum + parseFloat(row.output_MWh || 0), 0);
    document.getElementById("totalEnergy").textContent = `${total.toLocaleString()} MWh`;
  });

  loadCSV("data/plant_efficiency.csv", data => {
    const totalEmissions = data.reduce((sum, row) => {
      const tons = parseFloat(row.emissions_tons);
      return sum + (isNaN(tons) ? 0 : tons);
    }, 0);
    document.getElementById("totalEmissions").textContent = `${totalEmissions.toLocaleString()} tons`;
  });

  loadCSV("data/household_usage.csv", data => {
    const usage = data.map(row => parseFloat(row.daily_avg_kWh)).filter(v => !isNaN(v));
    const avg = usage.reduce((sum, val) => sum + val, 0) / usage.length;
    document.getElementById("dailyAvg").textContent = `${avg.toFixed(2)} kWh`;
  });

  loadCSV("data/consumption_per_state.csv", data => {
    const stateTotals = {};
    data.forEach(row => {
      const state = row.state;
      const value = parseFloat(row.consumption_kWh);
      if (!isNaN(value)) stateTotals[state] = (stateTotals[state] || 0) + value;
    });
    const top = Object.entries(stateTotals).sort((a, b) => b[1] - a[1])[0];
    if (top) document.getElementById("topState").textContent = `${top[0]} (${top[1].toLocaleString()} kWh)`;
  });

  loadCSV("data/grid_usage.csv", data => {
    const sectorTotals = {};
    data.forEach(row => {
      const sector = row.sector?.trim();
      const usage = parseFloat(row.usage_percent);
      if (sector && !isNaN(usage)) sectorTotals[sector] = (sectorTotals[sector] || 0) + usage;
    });
    const topSector = Object.entries(sectorTotals).sort((a, b) => b[1] - a[1])[0];
    if (topSector) document.getElementById("topSector").textContent = `${topSector[0]} (${topSector[1].toFixed(1)}%)`;
  });

  loadCSV("data/plant_efficiency.csv", data => {
    const plantSet = new Set();
    data.forEach(row => {
      if (row.plant_name) plantSet.add(row.plant_name);
    });
    document.getElementById("plantCount").textContent = plantSet.size;
  });
}

function loadCSV(path, callback) {
  Papa.parse(path, {
    download: true,
    header: true,
    complete: function (results) {
      callback(results.data);
    }
  });
}

function renderStackedEnergyBarChart() {
  Papa.parse("data/energy_production.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;
      const grouped = {};

      data.forEach(row => {
        const year = row.year;
        const source = row.source_type;
        const output = parseFloat(row.output_MWh);

        if (!grouped[year]) grouped[year] = {};
        grouped[year][source] = (grouped[year][source] || 0) + output;
      });

      const allYears = Object.keys(grouped).map(Number).sort();
      const years = allYears.filter(y => y >= 2020).map(String);
      const sources = [...new Set(data.map(row => row.source_type))];

      const colorMap = {
        'Solar': '#AFFC41',
        'Wind': '#B2FF9E',
        'Gas': '#1DD3B0',
        'Hydro': '#086375',
        'Nuclear': '#3C1642'
      };

      const datasets = sources.map(source => ({
        label: source,
        data: years.map(year => grouped[year][source] || 0),
        backgroundColor: colorMap[source] || '#ccc'
      }));

      if (window.barChart instanceof Chart) window.barChart.destroy();
      window.barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
          labels: years,
          datasets: datasets
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Annual Energy Output by Source Type",
              font: { size: 18 }
            },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${parseInt(ctx.raw).toLocaleString()} MWh`
              }
            },
            legend: { position: 'top' }
          },
          scales: {
            x: {
              stacked: true,
              title: { display: true, text: "Energy Output (MWh)" }
            },
            y: {
              stacked: true,
              title: { display: true, text: "Year" }
            }
          }
        }
      });
    }
  });
}

function renderPieChart() {
  loadCSV("data/grid_usage.csv", data => {
    const grouped = {};
    data.forEach(d => {
      const sector = d.sector?.trim();
      const usage = parseFloat(d.usage_percent);
      if (sector && !isNaN(usage)) {
        grouped[sector] = (grouped[sector] || 0) + usage;
      }
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
    const total = values.reduce((sum, val) => sum + val, 0);

    if (window.pieChart instanceof Chart) window.pieChart.destroy();
    window.pieChart = new Chart(document.getElementById('pieChart'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#AFFC41', '#B2FF9E', '#1DD3B0', '#086375', '#3C1642']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Electricity Grid Usage by Sector",
            font: { size: 18 }
          },
          legend: {
            display: window.innerWidth > 600
          },
          datalabels: {
            color: '#000',
            font: { weight: 'bold' },
            formatter: (value) => {
              const percent = (value / total * 100).toFixed(1);
              return `${percent}%`;
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const percent = ((value / total) * 100).toFixed(1);
                return `${label}: ${percent}%`;
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  });
}

function renderHistogram() {
  loadCSV("data/household_usage.csv", data => {
    const usageBins = Array(10).fill(0);
    data.forEach(row => {
      const kWh = parseFloat(row.daily_avg_kWh);
      const index = Math.min(Math.floor(kWh / 5), 9);
      usageBins[index]++;
    });

    const labels = ["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "40-45", "45+"];

    if (window.histogramChart instanceof Chart) window.histogramChart.destroy();
    window.histogramChart = new Chart(document.getElementById('histogramChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Households',
          data: usageBins,
          backgroundColor: "#3C1642"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Distribution of Daily Household Energy Usage (kWh)",
            font: { size: 18 }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Daily Usage Range (kWh)' } },
          y: { title: { display: true, text: 'Household Count' } }
        }
      }
    });
  });
}


function renderMapChart() {
  loadCSV("data/consumption_per_state.csv", data => {
    const totals = {};
    data.forEach(row => {
      const state = row.state;
      const value = parseFloat(row.consumption_kWh);
      if (!isNaN(value)) {
        totals[state] = (totals[state] || 0) + value;
      }
    });

    const states = Object.keys(totals);
    const values = states.map(state => totals[state]);

    const mapData = [{
      type: "choropleth",
      locationmode: "USA-states",
      locations: states,
      z: values,
      colorscale: [
        [0.0, '#AFFC41'],
        [0.25, '#B2FF9E'],
        [0.5, '#1DD3B0'],
        [0.75, '#086375'],
        [1.0, '#3C1642']
      ],
      colorbar: { title: "Total Consumption (kWh)" }
    }];

    const layout = {
      title: "5-Year Electricity Consumption by State",
      width: 850,
      height: 600,
      geo: {
        scope: "usa",
        showlakes: true,
        lakecolor: "rgb(255,255,255)"
      },
      margin: { t: 30, l: 0, r: 0, b: 0 }
    };

    Plotly.newPlot("mapChart", mapData, layout);
  });
}

function renderStackedPlantMonthlyChart() {
  loadCSV("data/plant_efficiency.csv", data => {
    const grouped = {};
    data.forEach(row => {
      const name = row.plant_name;
      if (!["Plant A", "Plant B", "Plant C", "Plant D"].includes(name)) return;

      const year = row.year;
      const month = row.month;
      const key = `${year}-${month}`;
      const emissions = parseFloat(row.emissions_tons);
      if (isNaN(emissions)) return;

      if (!grouped[key]) grouped[key] = {};
      grouped[key][name] = (grouped[key][name] || 0) + emissions;
    });

    const labels = Object.keys(grouped).sort((a, b) => new Date(`${a}-01`) - new Date(`${b}-01`));
    const plants = ["Plant A", "Plant B", "Plant C", "Plant D"];
    const colorMap = {
      "Plant A": "#AFFC41",
      "Plant B": "#B2FF9E",
      "Plant C": "#1DD3B0",
      "Plant D": "#086375"
    };

    const datasets = plants.map(name => ({
      label: name,
      data: labels.map(key => grouped[key][name] || 0),
      fill: true,
      borderColor: colorMap[name],
      backgroundColor: colorMap[name]
    }));

    if (window.plantMonthChart instanceof Chart) window.plantMonthChart.destroy();
    window.plantMonthChart = new Chart(document.getElementById("stackedPlantOutputChart"), {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Monthly Emissions by Plant"
          },
          legend: { position: 'top' },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${parseFloat(ctx.raw).toLocaleString()} tons`
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: { stacked: true, title: { display: true, text: "Month/Year" } },
          y: { stacked: true, title: { display: true, text: "Emissions (tons)" } }
        }
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderStackedEnergyBarChart();
  renderPieChart();
  renderHistogram();
  renderMapChart();
  renderStackedPlantMonthlyChart();
  updateSummaryCards();
});
