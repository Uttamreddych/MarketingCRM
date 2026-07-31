# FlowCRM AI - Spring Boot Backend (PostgreSQL Edition)

This is the backend for the FlowCRM AI platform, built with Java, Spring Boot, and PostgreSQL.

## 🚀 Technologies
- **Java 17**
- **Spring Boot 3.2.5**
- **Spring Data JPA (Hibernate)**
- **PostgreSQL**
- **Spring Security**
- **Lombok**

## 🛠️ Setup Instructions

### 1. PostgreSQL
Ensure you have PostgreSQL running.
- **Port**: 5432
- **Username**: root
- **Password**: Pandupandu@12
- **Database**: Create a database named `flowcrm`.

### 2. Build the Project
Run the following command in the `backend` directory:
```bash
mvn clean install
```

### 3. Run the Application
```bash
mvn spring-boot:run
```
The server will start at `http://localhost:8080`.

## 📡 API Endpoints
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create a new lead
- `GET /api/leads/{id}` - Get lead by ID
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead

## 🔒 Security
Currently, CORS is configured to allow all origins for development purposes. CSRF is disabled to facilitate frontend testing.
