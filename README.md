# BryxoPay

## Overview
BryxoPay is a **SaaS billing platform** designed for managing payments, subscriptions, invoicing (via SmartBooks), dunning, metered billing, and tax compliance. It serves BryxoOne and external tenants, offering a **Stripe or Chargebee-like solution** for businesses needing robust billing automation.

## Features
### Core Functionalities
- **Multi-Tenancy**: Supports multiple businesses using a single platform.
- **Subscription Management**: Plan creation, upgrades, downgrades, and cancellations.
- **Payment Processing**: Integration with Adfin API for seamless transactions.
- **SmartBooks Integration**: Automatic invoice generation and reconciliation.
- **Dunning & Recovery**: Automated retry for failed payments with notifications.
- **Metered Billing**: Per-seat, per-transaction, or usage-based billing support.
- **Tax Compliance**: VAT & sales tax automation with multi-currency support.
- **Analytics & Reporting**: Subscription insights, churn rate, and revenue tracking.

## Tech Stack
### Backend
- **Node.js & Express.js** for API and business logic
- **PostgreSQL** for structured billing data
- **MongoDB** for event logs & usage records
- **Redis** for caching & rate limiting
- **RabbitMQ/Kafka** for event-driven workflows
- **MinIO** for invoice storage
- **BryxoIdentity** for authentication & user management
- **Jenkins** for CI/CD automation
- **NGINX** for load balancing

### Frontend
- **Next.js** for the UI dashboard
- **TailwindCSS** for styling
- **React Query** for API calls
- **Storybook** for component management

## Folder Structure
```
📦 bryxopay-backend
 ┣ 📂 src
 ┃ ┣ 📂 api
 ┃ ┃ ┣ 📂 controllers
 ┃ ┃ ┃ ┣ 📜 tenantController.js
 ┃ ┃ ┃ ┣ 📜 subscriptionController.js
 ┃ ┃ ┃ ┣ 📜 paymentController.js
 ┃ ┃ ┃ ┣ 📜 invoiceController.js
 ┃ ┃ ┃ ┣ 📜 dunningController.js
 ┃ ┃ ┃ ┗ 📜 analyticsController.js
 ┃ ┃ ┣ 📂 services
 ┃ ┃ ┣ 📂 models
 ┃ ┃ ┣ 📂 middleware
 ┃ ┃ ┣ 📂 config
 ┃ ┣ 📂 routes
 ┃ ┣ 📂 events
 ┃ ┣ 📂 utils
 ┃ ┣ 📂 tests
 ┣ 📜 package.json
 ┣ 📜 .env
 ┣ 📜 .gitignore
 ┣ 📜 server.js
 ┗ 📜 README.md
```

## Setup & Installation
### Prerequisites
- **Node.js** (latest LTS version recommended)
- **Docker** (for containerized deployment)
- **PostgreSQL & MongoDB** (database instances)
- **Redis** (for caching & session storage)

### Installation Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/bryxo/bryxopay.git
   cd bryxopay-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   ```sh
   cp .env.example .env
   ```
   - Update database credentials, API keys, and configurations.
4. Run the database migrations:
   ```sh
   npm run migrate
   ```
5. Start the development server:
   ```sh
   npm run dev
   ```
6. Access the API at `http://localhost:5000` (configurable in `.env`).

## API Documentation
API endpoints are available in the **Postman collection**.
Alternatively, if running locally, access Swagger docs at:
```
http://localhost:5000/api-docs
```

## Deployment
### Using Docker
```sh
docker-compose up -d
```
This will start PostgreSQL, MongoDB, Redis, and the application in separate containers.

### Using Jenkins CI/CD
1. Set up a **Jenkins pipeline** with the following:
   - Build the Docker image
   - Push the image to the registry
   - Deploy to Kubernetes or VM

## Security Measures
- **JWT Authentication** for API security
- **RBAC (Role-Based Access Control)** for user permissions
- **Rate Limiting** to prevent abuse
- **PCI-DSS Compliance** for payment security

## Roadmap
### Phase 1 (MVP)
✅ Multi-Tenancy Support
✅ Subscription & Plan Management
✅ Basic Payment Processing (Adfin API)
✅ SmartBooks Invoice Integration
✅ Authentication via BryxoIdentity

### Phase 2 (Upcoming)
- Dunning & Payment Recovery
- Metered Billing Implementation
- Tax Compliance Features
- Advanced Analytics & Reporting

## Contributors
- **Project Lead:** [Your Name]
- **Backend Development:** [Team Member Names]
- **Frontend Development:** [Team Member Names]
- **QA & Testing:** [Team Member Names]

## License
This project is licensed under the **MIT License**. See `LICENSE` for details.

---
For questions or contributions, reach out at **help@bryxo.com** 🚀

"# email-marketing-be" 
