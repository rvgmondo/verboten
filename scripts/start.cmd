@echo off
rem Production server launcher (next start) with portable Node 22 on PATH.
set "PATH=C:\CC\verboten\vendor\node;%PATH%"
cd /d C:\CC\verboten
call npm run start
