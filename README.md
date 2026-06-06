<div align="center">
  <br />
  <h1>🌉 VendorBridge ERP</h1>
  <p><strong>A streamlined, role-based B2B Procurement and Vendor Management system.</strong></p>
  
  [![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
  <br />
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
</div>

<br />

## 📖 About The Project

VendorBridge is a lightweight ERP solution designed to handle the core workflows of enterprise procurement. It replaces scattered emails, PDFs, and spreadsheets with a centralized dashboard. It provides dedicated portals for Vendors, Procurement Officers, and Managers to securely collaborate on RFQs, Quotations, Purchase Orders, and Invoicing.

## ✨ Key Features

- **🛡️ Role-Based Access Control (RBAC)**: Securely isolated views and actions for `Admin`, `Manager`, `Procurement Officer`, and `Vendor` roles.
- **🔄 Complete Procurement Workflow**: 
  - Manage Vendors and broadcast RFQs (Request for Quotations).
  - Vendors can submit bids/quotations directly through their own portal.
  - Side-by-side bid comparison to easily identify the best value.
  - Automated Purchase Order (PO) and Invoice generation.
- **✅ Approval System**: Multi-stage approval processes for managers to review and approve high-value quotes.
- **📊 Dynamic Analytics Dashboard**: Interactive charts tracking monthly spend and vendor performance, built using live database queries and Recharts.
- **🖨️ Native PDF Export**: Print-optimized CSS rules (`@media print`) allow direct exporting of Invoices and Analytics to professional, highlightable PDFs without third-party plugins.

## 🛠️ Built With

### Frontend
- **[React 18](https://react.dev/)**: Core UI library.
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling framework.
- **[Recharts](https://recharts.org/)**: Composable charting library built on React components.
- **[Lucide React](https://lucide.dev/)**: Beautiful and consistent iconography.
- **[React Router DOM](https://reactrouter.com/)**: Declarative routing.

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)**: Modern, fast web framework for building APIs with Python.
- **[SQLAlchemy](https://www.sqlalchemy.org/)**: Python SQL toolkit and Object Relational Mapper.
- **[SQLite](https://sqlite.org/)**: Lightweight, file-based database (structured for seamless PostgreSQL migration).
- **[PyJWT](https://pyjwt.readthedocs.io/)** & **[Passlib](https://passlib.readthedocs.io/)**: Secure JSON Web Token authentication and bcrypt password hashing.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- Python (3.10+ recommended)

### 1. Backend Setup

Open a terminal and navigate to the project root:

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
The backend API will now be running at `http://localhost:8000`.

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will now be accessible at `http://localhost:5173`.

---

## 🧪 Hackathon Evaluation Guide

For hackathon judges and evaluators, here are the recommended ways to explore the platform:

1. **Test Data**: Make sure to run the `backend/seed_historical.py` script. This populates the SQLite database with 6 months of historical procurement data so the **Analytics charts** and **Activity Logs** are fully populated and interactive.
2. **Role Restrictions**: The API and UI both enforce strict role isolation. Test this by attempting to create an RFQ as a `Vendor` (you will be blocked), and then logging in as a `Manager` to approve a Purchase Order.
3. **PDF Generation**: Go to the **Invoices** page and click "Export as PDF" to see the custom print stylesheets in action.

---

## 👥 Team

- **Nigam Vaghani**
- **Dhanesh Vagahsiya**
- **Rohit Sharma**

**Evaluator / Reviewer:**
- **Bhavya Mehta (mebh)** | 📧 mebh@odoo.com | 🐙 [@mebh-odoo](https://github.com/mebh-odoo)

---

## 📄 License

Distributed under the MIT License.
