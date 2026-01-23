@echo off
echo =======================================================
echo      FoodAI Backend Deploy Script (Windows -> Linux)
echo =======================================================

:: 配置部分 (请修改这里)
set SERVER_IP=159.75.135.120
set USER=ubuntu
set TARGET_DIR=/var/www/foodai
set PROJECT_DIR=%CD%

echo [1/3] Uploading backend code...
echo Source: %PROJECT_DIR%\backend
echo Target: %USER%@%SERVER_IP%:%TARGET_DIR%

:: 使用 scp 上传 (排除 venv, __pycache__, .git 等无关文件)
:: 注意：这里简单全量覆盖，如果文件很多建议用 rsync (需要安装)
scp -r backend/* %USER%@%SERVER_IP%:%TARGET_DIR%

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Upload failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Restarting service on server...
:: 远程执行重启命令
ssh %USER%@%SERVER_IP% "sudo systemctl restart foodai"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Restart failed!
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Checking service status...
ssh %USER%@%SERVER_IP% "sudo systemctl status foodai | grep Active"

echo.
echo =======================================================
echo      Deployment Success!
echo =======================================================
pause
