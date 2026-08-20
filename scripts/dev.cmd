@echo off
rem Dev server launcher: portable Node 22 first on PATH (machine Node 26 breaks
rem Payload's config loader), then Next dev on port 3001.
set "PATH=C:\CC\verboten\vendor\node;%PATH%"
cd /d C:\CC\verboten
call npm run dev
