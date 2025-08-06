@echo off
echo ========================================
echo    ManohPressing - Serveur de Developpement
echo ========================================
echo.
echo Demarrage du serveur PHP...
echo.
echo URLs principales:
echo - Dashboard: http://localhost:8000/dashboard.html
echo - Design System: http://localhost:8000/design-system.html
echo - Commandes: http://localhost:8000/orders.html
echo - Clients: http://localhost:8000/customers.html
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo ========================================
echo.

php -S localhost:8000 -t public

pause 