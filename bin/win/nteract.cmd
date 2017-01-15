@echo off
setlocal

SET EXPECT_OUTPUT=

FOR %%a IN (%*) DO (
  IF /I "%%a"=="-h"         SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="--help"     SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="-v"         SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="--version"  SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="--verbose"  SET EXPECT_OUTPUT=YES
)

IF "%EXPECT_OUTPUT%"=="YES" (
  %NTERACT_EXE% %NTERACT_DIR% %*
) ELSE (
  set ELECTRON_RUN_AS_NODE=1
  call %NTERACT_EXE% "%~dp0\..\nteract.js" %*
)
endlocal
