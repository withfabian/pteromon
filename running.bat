@echo off
:start
echo Menjalankan Aplikasi
echo Pastikan Anda Telah Mengisi Config File API KEY
node server.js

if %errorlevel% neq 0 (
    echo Menjalankan Bot Kembali
    timeout /t 5 /nobreak >nul
    goto start
)

echo Aplikasi selesai dijalankan.
pause

