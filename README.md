<div align="center">
  <br />
  <h1>VendorBridge ERP</h1>
  <p><strong>A streamlined, role-based B2B Procurement and Vendor Management system.</strong></p>
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

VendorBridge is a lightweight ERP solution designed to handle the core workflows of enterprise procurement. It provides dedicated portals for Vendors, Procurement Officers, and Managers to collaborate on RFQs, Quotations, Purchase Orders, and Invoicing.

## Features

- **Role-Based Access Control (RBAC)**: Securely isolated views and actions for `Admin`, `Manager`, `Procurement Officer`, and `Vendor` roles.
- **Procurement Workflow**: 
  - Manage Vendors and broadcast RFQs (Request for Quotations).
  - Vendors can submit bids/quotations directly through their portal.
  - Side-by-side bid comparison and automated PO (Purchase Order) generation.
- **Approval System**: Multi-stage approval processes for managers to review high-value quotes.
- **Analytics Dashboard**: Interactive charts tracking monthly spend and vendor performance, built with Recharts.
- **Native PDF Export**: Print-optimized CSS rules (`@media print`) allow direct exporting of Invoices and Analytics to professional PDFs.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn-style components, React Router.
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (structured to seamlessly migrate to PostgreSQL).
- **Security**: JWT-based authentication, bcrypt password hashing.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Seed the database with sample historical data for testing
python backend/seed_historical.py

# Run the API server
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Evaluation & Testing Guide

For hackathon judges and evaluators, here are the recommended ways to explore the platform:

1. **Test Data**: Make sure to run the `backend/seed_historical.py` script. This populates the SQLite database with 6 months of historical procurement data so the Analytics charts and Activity Logs are fully populated and interactive.
2. **Role Restrictions**: The API and UI both enforce strict role isolation. Test this by attempting to create an RFQ as a `Vendor` (you will be blocked), and then logging in as a `Manager` to approve a Purchase Order.
3. **PDF Generation**: Go to the **Invoices** page and click "Export as PDF" to see the custom print stylesheets in action.

## Team

- **Nigam Vaghani**
- **Dhanesh Vagahsiya**
- **Rohit Rathod**

**Evaluator / Reviewer:**
- **Bhavya Mehta (mebh)** | 📧 mebh@odoo.com | 🐙 [@mebh-odoo](https://github.com/mebh-odoo)

## License

Distributed under the MIT License.
