# Paytm SurePay

AI-powered wrong payment prevention system for a Paytm-integrated payment flow.

## Project Status

Step 1 is complete: project structure, frontend tooling, backend tooling, and base configuration are in place.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Python + FastAPI
- Data: mock transaction data for the first version
- Architecture: multi-agent safety analysis layer

## Folder Structure

```text
project/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend health check:

```text
GET http://127.0.0.1:8000/health
```

## Product Positioning

SurePay is an AI-assisted payment safety layer that helps users identify potentially unintended or unusual payments before completing a transaction.

The user always has the final choice: **Cancel** or **Proceed Anyway**.
