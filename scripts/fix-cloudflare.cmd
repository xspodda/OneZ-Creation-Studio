@echo off
setlocal
cd /d "%~dp0.."

echo [0/6] Removing stray zero-byte placeholder files (they shadow the real npm/npx)...
for %%F in (cd node npm npm.cmd npx vite start update onez-creation-studio@0.1.0) do (
  if exist "%%F" (
    for %%A in ("%%F") do if %%~zA EQU 0 del /f /q "%%F"
  )
)
if exist cloudflare-install.log del /f /q cloudflare-install.log

echo [1/6] Stopping local Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/6] Removing incomplete dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json

echo [3/6] Locating npm...
set "NPM="
>nul 2>&1 where npm
if not errorlevel 1 set "NPM=npm"
if not defined NPM (
  if exist "C:\Program Files\nodejs\npm.cmd" set "NPM=C:\Program Files\nodejs\npm.cmd"
)
if not defined NPM (
  echo npm was not found in PATH or at C:\Program Files\nodejs\npm.cmd
  echo Install Node.js first, then run this script again.
  goto failed
)

echo [4/6] Installing dependencies (this can take a few minutes)...
call "%NPM%" install --include=optional --foreground-scripts > cloudflare-install.log 2>&1
set "CI_EXIT=%ERRORLEVEL%"
if not "%CI_EXIT%"=="0" goto failed

echo [5/6] Checking Wrangler...
set "NPX="
>nul 2>&1 where npx
if not errorlevel 1 set "NPX=npx"
if not defined NPX (
  if exist "C:\Program Files\nodejs\npx.cmd" set "NPX=C:\Program Files\nodejs\npx.cmd"
)
if defined NPX (
  call "%NPX%" wrangler --version
  if errorlevel 1 goto failed
) else (
  echo npx was not found in PATH or at C:\Program Files\nodejs\npx.cmd
  goto failed
)

echo.
echo Wrangler is ready. Next run:
echo   npm run deploy:pages
goto done

:failed
echo.
echo Repair failed with exit code %CI_EXIT% (or Wrangler check failed).
echo The install log was saved to:
echo   %CD%\cloudflare-install.log
echo.
echo Last install output:
type cloudflare-install.log
exit /b 1

:done
pause
