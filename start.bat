@echo off
title Uv Changer
color a
setlocal enabledelayedexpansion

set "requiredVersion=v14.17.3"

where node > nul 2>nul
if %errorlevel% neq 0 (
    color c
    echo Node.js not found, please install at : https://nodejs.org/en/download
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v 2^>^&1') do (
    set "currentVersion=%%a"
)

if !currentVersion! lss %requiredVersion% (
    color c
    echo Node.js not found, please install at : https://nodejs.org/en/download
    pause
    exit /b 1
)
    color a
node index.js
pause
exit