@echo off
REM Script para rodar o projeto em ambiente com proxy/firewall
REM Desabilita verificação SSL (apenas para desenvolvimento)

echo.
echo ========================================
echo   Study Manager - Iniciando Servidor
echo ========================================
echo.
echo Desabilitando verificacao SSL...
echo.

REM Desabilitar verificação SSL do Node.js (firewall/proxy)
set NODE_TLS_REJECT_UNAUTHORIZED=0

REM Desabilitar strict-ssl do npm
call npm config set strict-ssl false

REM Executar servidor Next.js
call npm run dev

pause
