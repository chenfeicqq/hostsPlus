@echo off
call :loop

rem ÿ��һ���жϽ����Ƿ���ڣ������ڣ����������������ű�
:loop
tasklist | find /i "hostsPlus.exe" || start hostsPlus.exe && exit
ping 127.0.0.1 -n 1
goto :loop