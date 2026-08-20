@echo off
setlocal
cd /d "%~dp0.."

echo [1/4] Stopping local Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Removing incomplete dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json

echo [3/4] Installing dependencies with optional Windows packages...
if exist cloudflare-install.log del /f /q cloudflare-install.log
call npm.cmd install --include=optional --foreground-scripts > cloudflare-install.log 2>&1
set "NPM_EXIT=%ERRORLEVEL%"
if not "%NPM_EXIT%"=="0" goto failed

echo [4/4] Checking Wrangler...
call npx.cmd wrangler --version
if errorlevel 1 goto failed

echo.
echo Wrangler is ready. Next run:
echo   npx wrangler login
echo   npm.cmd run deploy:pages
goto done

:failed
echo.
echo Repair failed with exit code %NPM_EXIT%.
echo The install log was saved to:
echo   %CD%\cloudflare-install.log
echo.
echo Last install output:
type cloudflare-install.log
exit /b 1

:done
pause
