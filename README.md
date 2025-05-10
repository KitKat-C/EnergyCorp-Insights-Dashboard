# 🔍 Energy Insights Dashboard

Welcome to the **Energy Corp Insights Dashboard**, a simulated analytics platform designed to provide interactive, visual summaries of synthetic energy data. This project fulfills the requirements of **Assignment Two** for the Analytics and Interactive Websites course.

---

## 📊 Project Overview

This dashboard showcases **five distinct charts**, each representing a unique visualization strategy based on synthetic energy-related datasets. The layout was built using **Bootstrap** for responsive design, with varied chart sizes and arrangements per row.

Each chart gives meaningful insight into data patterns commonly found in the **energy sector**, including production trends, consumption, emissions, and household usage.

---

## 📁 Data Sources

All datasets used in this project were generated synthetically using **ChatGPT** exported in `.csv` format. Each dataset reflects a real-world industrial context, simulating:

1. **Energy Production by Source Type**
2. **State-Level Consumption Data**
3. **Grid Usage by Sector**
4. **Monthly Plant Emissions**
5. **Daily Household Energy Usage**

---

## 📈 Chart Types Used

| Chart Type   | Chart Name                                    | Purpose                                      |
|--------------|-----------------------------------------------|----------------------------------------------|
| Bar Chart    | Annual Energy Output by Source Type           | Compare energy production over time          |
| Pie Chart    | Grid Usage by Sector                          | Show sector-wise energy consumption shares   |
| Line Chart   | Monthly Emissions by Plant                    | Reveal emissions trends from multiple plants |
| Choropleth   | State Energy Consumption Map                  | Visualize regional usage across the U.S.     |
| Histogram    | Daily Household Energy Usage                  | Display usage distribution among households  |

---

## 🧠 Chart Strategy

Each chart was chosen to best reflect the underlying structure and trends in the dataset. We ensured **no chart type is reused**, providing diversity in insight and design. Data loading is modular and dynamic, using a **data getter approach** via `Papa.parse()` for efficient parsing and rendering.

---

## 🖥️ Technologies Used

- **Chart.js** & **Plotly.js** (for data visualization)
- **Bootstrap 5** (for responsive layout and column strategy)
- **JavaScript + CSV Parsing** with [PapaParse](https://www.papaparse.com/)
- **HTML5 / CSS3**

---

## 📹 Video Walkthrough

Watch the full walkthrough on YouTube, where I explain the dashboard layout, data sources, and chart design choices:

📺 [Click to Watch](/)

---

## 🚀 How to Run the Project

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/energy-dashboard.git
