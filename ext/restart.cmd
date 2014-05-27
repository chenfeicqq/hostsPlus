@echo off
call :loop

rem 每隔一秒判断进程是否存在，不存在，重新启动并结束脚本
:loop
tasklist | find /i "hostsPlus.exe" || start hostsPlus.exe && exit
ping 127.0.0.1 -n 1
goto :loop