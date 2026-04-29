@echo off
echo ==========================================
echo  SAPD Procesado - Instalacion y Compilacion
echo ==========================================
echo.

echo [1/3] Instalando dependencias...
pip install customtkinter pyinstaller --quiet
if errorlevel 1 (
    echo ERROR: No se pudo instalar dependencias. Asegurate de tener Python instalado.
    pause
    exit /b 1
)

echo [2/3] Compilando a .exe...
pyinstaller --onefile --windowed --name "SAPD_Procesado" --add-data "charges_db.json;." sapd_procesado.py
if errorlevel 1 (
    echo ERROR: Fallo la compilacion.
    pause
    exit /b 1
)

echo [3/3] Listo!
echo.
echo El ejecutable esta en: dist\SAPD_Procesado.exe
echo.
pause
