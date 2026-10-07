@echo off
setlocal
rem Packs everything the web server needs into dist\woerterwiese.zip.
rem Unpack the zip contents directly into the web root (or a sub folder).
rem Usage: double-click, or "build-zip.bat /nopause" from a terminal.
rem Keep lines short: cmd reads batch files in 512-byte blocks and can
rem mistake text in a very long line for a label.
cd /d "%~dp0"

set "NOPAUSE=%~1"
set "FILES=index.html styles.css garden.css core.js garden.js"
set "FILES=%FILES% math.js deutsch.js report.js app.js"
set "STAGE=dist\woerterwiese"
set "ZIP=dist\woerterwiese.zip"

for %%F in (%FILES%) do (
  if not exist "%%F" (
    echo Fehlt: %%F
    goto :fail
  )
)
if not exist "audio\laute\*.wav" (
  echo Fehlt: audio\laute\*.wav
  echo Erst tools\generate-laute.ps1 ausfuehren.
  goto :fail
)

if exist dist rmdir /s /q dist
mkdir "%STAGE%\audio\laute" || goto :fail
for %%F in (%FILES%) do (
  copy /y "%%F" "%STAGE%\" >nul || goto :fail
)
copy /y "audio\laute\*.wav" "%STAGE%\audio\laute\" >nul || goto :fail
rem The sounds are GPL: their source and license must ship with them.
for %%F in (QUELLE.md GPL-2.0-or-later.txt) do (
  copy /y "audio\laute\%%F" "%STAGE%\audio\laute\" >nul || goto :fail
)

powershell -NoProfile -ExecutionPolicy Bypass ^
  -File "tools\make-zip.ps1" -Source "%STAGE%" -Destination "%ZIP%" ^
  || goto :fail
rmdir /s /q "%STAGE%"

echo.
echo Fertig: %CD%\%ZIP%
echo Inhalt direkt in den Web-Ordner entpacken,
echo sodass index.html dort liegt.
call :done
exit /b 0

:fail
echo.
echo Das ZIP konnte nicht erstellt werden.
if exist dist rmdir /s /q dist
call :done
exit /b 1

:done
rem Keep the window open when started by double-click.
if /i not "%NOPAUSE%"=="/nopause" pause
exit /b 0
