#!/bin/bash
echo "=================================================="
echo " Starting FLS School (Docker Containers)"
echo "=================================================="
echo ""
echo "Building and starting MongoDB, NestJS Backend & Vite/Nginx Frontend..."
docker compose up --build -d

echo ""
echo "✔ Application successfully started!"
echo ""
echo "🌐 Web App (Landing & Admin):  http://localhost:5173"
echo "🌐 Parent Space:              http://localhost:5173/parent"
echo "🌐 API & Swagger Docs:         http://localhost:3000/api/docs"
echo ""
echo "Admin Credentials:"
echo "  Email:    admin@fls.school"
echo "  Password: ChangeMe123!"
echo ""
