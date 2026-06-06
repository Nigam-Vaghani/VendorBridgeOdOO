<div align="center">
  <h1>VendorBridge ERP</h1>
  <p>An open-source, full-lifecycle B2B procurement and vendor management system.</p>

  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

<br/>

VendorBridge ERP is designed to modernize and automate enterprise procurement. It provides a unified platform where Procurement Teams, Managers, and Vendors can securely interact, negotiate, and finalize purchase cycles through structured workflows.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage & Evaluation](#usage--evaluation)
- [Contributing](#contributing)
- [Team & Acknowledgments](#team--acknowledgments)

## Features

- **Role-Based Access Control (RBAC):** Strict separation of concerns across Admin, Manager, Procurement Officer, and Vendor roles.
- **Full Procurement Lifecycle:** Track items from Vendor Onboarding and RFQ (Request for Quotation) broadcasting, to Quote comparison, Approval workflows, PO generation, and Invoicing.
- **Advanced Quote Algorithms:** Automated side-by-side ingestion and comparison of vendor bids to highlight optimal pricing.
- **Dynamic Analytics:** Real-time data visualization of spending trends, vendor performance metrics, and category distributions using Recharts.
- **Native PDF Exporting:** Custom print stylesheets allow direct browser-to-PDF conversion for clean, professional invoice generation.

## Architecture

VendorBridge utilizes a modern, decoupled architecture:
- **Frontend:** Built with React 18 and Vite. Styled using Tailwind CSS and structured with customized, minimalist components for a highly responsive user experience.
- **Backend:** Powered by FastAPI for high-performance asynchronous API endpoints.
- **Database:** Uses SQLAlchemy ORM. Configured with SQLite by default for rapid development and testing, with seamless drop-in support for PostgreSQL in production.
- **Authentication:** Secure stateless sessions using PyJWT and bcrypt password hashing.

## Installation

Ensure you have Node.js (v18+) and Python (v3.10+) installed.

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/Nigam-Vaghani/VendorBridgeOdOO.git
cd VendorBridgeOdOO

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed historical data
python backend/seed_historical.py

# Start the server
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Usage & Evaluation

For hackathon evaluators and community testers:
1. **Data Seeding:** We strongly recommend running `python backend/seed_historical.py` before testing. This seeds 6 months of historical relationships (Vendors, RFQs, POs) so that the Analytics engine is fully populated.
2. **PDF Exports:** Navigate to the Invoices tab and utilize the "Export as PDF" functionality to test the print-media styles.
3. **Role Testing:** The UI dynamically adapts based on the authenticated user. Try logging in as a Vendor to submit a bid, and subsequently as a Manager to approve it.

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## Team & Acknowledgments

**Contributors:**
- Nigam Vaghani
- Dhanesh Vagahsiya
- Rohit Sharma

**Evaluator:**
Special thanks to our evaluator for reviewing this submission:
- **Bhavya Mehta (mebh)** | [mebh@odoo.com](mailto:mebh@odoo.com) | GitHub: [@mebh-odoo](https://github.com/mebh-odoo)

## License
This project is licensed under the MIT License - see the LICENSE file for details.
