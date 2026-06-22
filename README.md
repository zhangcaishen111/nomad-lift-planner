# Nomad Lift Planner

Nomad Lift Planner is a small offline web app that creates practical travel workout plans. It balances trip length, daily walking load, equipment access, and training goal so a traveler can keep strength work realistic while still enjoying the trip.

## Features

- Generates a day-by-day travel training plan.
- Adjusts training volume when walking load is high.
- Supports bodyweight, resistance bands, dumbbells, and hotel gym options.
- Saves the latest planner settings in the browser.
- Copies a clean plan summary for notes or chat.
- Runs as plain HTML, CSS, and JavaScript with no build step.

## Run locally

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Project structure

```text
.
├── index.html
├── styles.css
├── app.js
├── README.md
└── .gitignore
```

## Why this exists

Most travel workout plans are either too generic or too ambitious. This project keeps the plan small enough to complete after a long walking day, while still giving the user a clear training rhythm.
