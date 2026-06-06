<div align="center">
  <br />
  <h1>🌉 VendorBridge ERP</h1>
  <p><strong>Next-Generation Procurement & Vendor Management System</strong></p>
  <p>A comprehensive, role-based platform designed to automate and streamline the entire B2B procurement lifecycle—from Vendor onboarding and RFQs to Invoicing and Analytics.</p>
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
</div>

<br />

## 📖 Overview

**VendorBridge ERP** was built to solve the disjointed and manual processes plaguing modern enterprise procurement. By providing a unified, secure, and intuitive dashboard, VendorBridge brings Vendors, Procurement Officers, and Managers together in a single synchronized environment. 

Whether you are evaluating complex RFQs, managing multi-tier approval workflows, or generating professional financial PDFs, VendorBridge ensures complete auditability and efficiency.

---

## ✨ Key Features

- 🔐 **Role-Based Access Control (RBAC)**: Distinct, securely scoped portals for `Admins`, `Managers`, `Procurement Officers`, and `Vendors`.
- 📦 **End-to-End Procurement Lifecycle**:
  - **Vendor Management**: Onboard, evaluate, and track vendor performance.
  - **RFQ Generation**: Draft, broadcast, and manage Request for Quotations.
  - **Quotation Comparison**: Automatically ingest and compare vendor quotes side-by-side to identify the best value.
  - **Approval Workflows**: Multi-stage approval processes preventing unauthorized spending.
  - **Purchase Orders & Invoicing**: Automated PO generation and one-click professional PDF invoice exporting.
- 📊 **Dynamic Analytics Engine**: Real-time KPI aggregation, spend distribution tracking, and vendor performance history (powered by Recharts).
- 🎨 **Minimalist Premium UI**: A highly responsive, glass-morphic two-color theme built on React and Tailwind CSS, prioritizing UX and accessibility.
- 🖨️ **Native PDF Generation**: Meticulously crafted CSS `@media print` rules allowing direct, high-fidelity native browser PDF exporting.

---

## 💻 Tech Stack

### Frontend
* **Core:** React 18, Vite
* **Styling:** Tailwind CSS, Custom UI components inspired by Shadcn UI
* **Routing:** React Router DOM
* **Visuals:** Lucide-React (Icons), Recharts (Data Visualization)
* **State Management:** React Hooks (`useAuth`, Context API)

### Backend
* **Framework:** FastAPI (Python)
* **Database:** SQLite (Default, configured for immediate drop-in replacement with PostgreSQL)
* **ORM:** SQLAlchemy
* **Authentication:** PyJWT, Passlib (Bcrypt hashing)
* **Security:** FastAPI CORS middleware, secure HTTP-only configurations.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.10+ recommended)

### 1. Backend Setup
Navigate to the root directory of the project:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the historical data seeder to populate the dashboard!
python backend/seed_historical.py

# Start the FastAPI Server
uvicorn backend.main:app --reload
```
*The backend will now be running at `http://localhost:8000`*

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will now be accessible at `http://localhost:5173`*

---

## 🧪 Hackathon Evaluation Notes

If you are a judge or organizer evaluating this platform, please note the following highlights:
1. **Dynamic Data Engine**: Run `python backend/seed_historical.py` prior to testing. This generates 6 months of interconnected, randomized historical procurement data (Vendors -> RFQs -> Quotes -> POs -> Invoices) so that the Analytics and Activity Log features demonstrate immediate real-world value.
2. **Professional Exporting**: Navigate to the Analytics or Invoices pages and click "Export as PDF". The platform utilizes advanced Print CSS rules to format data into professional, highlightable documents dynamically.
3. **Role Testing**: The system enforces strict API-level and UI-level isolation based on the user's role. Try creating a quote as a Vendor, and approving it as a Manager.

---

## 👥 Team & Contributors

This project was built collaboratively by:
- **Nigam Vaghani**
- **Dhanesh Vagahsiya**
- **Rohit Sharma**

---
<!-- ok -->
## 👨‍🏫 Evaluator

Special thanks to our evaluator for reviewing this hackathon submission:
- **Bhavya Mehta (mebh)**
  - 📧 Email: mebh@odoo.com
  - 🐙 GitHub: [@mebh-odoo](https://github.com/mebh-odoo)

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
