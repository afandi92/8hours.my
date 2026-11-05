@echo off
setlocal
cd /d "%~dp0"
title Attendance V3 Premium V5 - Local Test
echo.
echo  ATTENDANCE WEB V3 PREMIUM V5
 echo  -------------------------
echo  The portal opens automatically in your browser.
echo  Close this window to stop the local server.
echo.
where py >nul 2>&1
if %errorlevel%==0 (
  py -3 LOCAL_SERVER.py
  goto :end
)
where python >nul 2>&1
if %errorlevel%==0 (
  python LOCAL_SERVER.py
  goto :end
)
echo [ERROR] Python not found. Install Python and enable Add to PATH.
pause
:end
endlocal
