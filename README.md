
# Client Feedback

This is a dynamic web dashboard that visualizes client feedback data with filtering, reporting, and interactive charts.

## Features

- Two separate views: **Dashboard** and **Reporting**
- Client filtering with persistence via `sessionStorage`
- Dynamic charts using **Highcharts**
- Toggleable **dark/light theme**
- Responsive layout and mobile-friendly
- Expandable reporting rows with detailed answer breakdown

## Technologies Used

- HTML5, CSS3, JavaScript (Vanilla)
- [Highcharts](https://www.highcharts.com/) for chart rendering
- Node.js & Express.js for API and static file serving
- JSON file as data source (`/server/data.json`)

## Project Structure

<pre> public/ ├── css/ → Stylesheets │ ├── style.css → Shared global styles │ ├── dashboard.css → Dashboard-specific styles │ ├── reporting.css → Reporting-specific styles │ └── darkmode.css → Dark mode styles │ ├── js/ → JavaScript modules │ ├── main.js → Main app logic and navigation │ ├── dashboard.js → Dashboard logic and rendering │ └── reporting.js → Reporting logic and interactivity │ ├── index.html → App entry point ├── dashboard.html → Dashboard tab structure ├── reporting.html → Reporting tab structure └── footer.html → Shared footer content </pre>

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

The app will run on: [http://localhost:3000](http://localhost:3000)

##  API Endpoint

| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| GET    | `/api/data`  | Returns the feedback data in JSON format |

## Notes

- Data is served via an Express backend (`data.json` file)
- You can expand this project to include POST/PUT/DELETE routes for admin features
- This is a clean structure ready to be deployed or adapted for larger apps

## Author

_Kalina Yordanova_ – built as part of internship and personal portfolio.
