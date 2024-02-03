@echo off
setlocal enabledelayedexpansion

set "requiredVersion=v14.17.3"

where node > nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js not found, please install at : https://nodejs.org/en/download
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v 2^>^&1') do (
    set "currentVersion=%%a"
)

if !currentVersion! lss %requiredVersion% (
    echo Node.js not found, please install at : https://nodejs.org/en/download
    pause
    exit /b 1
)

npm install
pause
exit /b 0