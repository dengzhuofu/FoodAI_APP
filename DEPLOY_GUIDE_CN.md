# 腾讯云服务器部署保姆级教程 (Ubuntu 22.04 版本)

本教程将手把手教你将 `Food Illustration App` 的后端部署到腾讯云服务器。

## 📋 第一阶段：服务器准备

### 1. 重装系统
*   登录腾讯云控制台。
*   找到你的云服务器实例。
*   选择 **“重装系统”** -> 选择 **Ubuntu Server 22.04 LTS 64位** (推荐)。
*   设置一个你记得住的 **ubuntu 用户密码**（或者 root 密码，通常它们是一样的，或者你可以在控制台重置）。

### 2. 开放防火墙端口
*   在腾讯云控制台 -> **安全组** -> **修改规则**。
*   确保 **入站规则** 中开放了以下端口：
    *   `22` (SSH 远程连接)
    *   `80` (HTTP 网站访问)
    *   `443` (HTTPS 安全访问)
    *   `3306` (MySQL 数据库，可选)

---

## 💻 第二阶段：连接服务器

**推荐使用 Xshell** (如果你已经安装了的话)

1.  打开 Xshell，点击左上角 **“新建”**。
2.  **名称**：随便填，比如 `FoodAI`。
3.  **主机**：填入你的腾讯云服务器公网 IP。
4.  点击左侧 **“用户身份验证”**：
    *   **用户名**：`ubuntu` (⚠️注意：Ubuntu 系统默认登录用户通常是 `ubuntu`，不是 `root`)
    *   **密码**：填入你设置的密码。
5.  点击 **“连接”**，如果弹出 SSH 安全警告，选择 **“接受并保存”**。

如果你没有 Xshell，也可以直接在电脑终端（PowerShell）输入命令连接：
*(将 `159.75.135.120` 替换为你的服务器公网 IP)*

```powershell
ssh ubuntu@159.75.135.120
```
*输入命令后回车，输入 yes 确认指纹，然后输入刚才设置的密码（输入时不会显示字符），回车进入。*

---

## 🛠️ 第三阶段：安装基础软件

连接成功后，在服务器终端依次执行以下命令（复制一行，右键粘贴，回车）：
*(因为是 ubuntu 用户，所以大部分命令前面要加 `sudo`)*

### 1. 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装 Python、MySQL 和 Nginx
```bash
# Ubuntu 22.04 默认的 python3 就是 3.10，非常适合本项目
sudo apt install python3-pip python3-venv mysql-server nginx git -y
```

### 3. 配置 MySQL 数据库
进入 MySQL 命令行 (需要 sudo)：
```bash
sudo mysql
```
*(root 用户直接回车即可进入，不需要密码)*

在 `mysql>` 提示符下，一行行执行下面的 SQL 语句：

```sql
-- 1. 创建数据库
CREATE DATABASE food_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2. 创建用户并授权
-- 注意：'Tofu@256' 是强密码示例，你可以改成自己的，但必须够复杂(含大小写字母+数字+符号)
CREATE USER 'tofu'@'localhost' IDENTIFIED BY 'Tofu@256';
GRANT ALL PRIVILEGES ON food_ai.* TO 'tofu'@'localhost';
FLUSH PRIVILEGES;

-- 3. 退出
EXIT;
```

---

## 📂 第四阶段：上传代码

### ⚠️ 预先准备：创建目录并授权 (重要！)
因为我们是用 `ubuntu` 用户登录的，默认没有权限往 `/var/www/` 里写东西。
所以必须先在**服务器**上执行下面这两行命令，创建目录并把权限给 `ubuntu` 用户：

```bash
# 1. 创建目录
sudo mkdir -p /var/www/foodai

# 2. 将目录所有权改为 ubuntu 用户
sudo chown -R ubuntu:ubuntu /var/www/foodai
```

### 方法一：使用 Xftp (推荐，如果你用 Xshell)
1.  在 Xshell 窗口上方工具栏，点击绿色的 **Xftp 图标**（或者按 `Ctrl+Alt+F`），会自动打开文件传输窗口。
2.  **左边窗口**是你自己的电脑：
    *   在上方地址栏输入：`C:\Users\Administrator\Desktop\project\Food Illustration App (3)` 并回车。
    *   你应该能看到 `backend` 这个文件夹。
3.  **右边窗口**是服务器：
    *   双击地址栏，输入 `/var/www/foodai` 并回车。
4.  将左边的 `backend` 文件夹里的**所有内容**（全选），直接**拖拽**到右边窗口中。
    *   注意：是把 `backend` 里面的 `app`, `main.py`, `requirements.txt` 等文件拖进去。
    *   最终确保服务器路径 `/var/www/foodai` 下直接能看到 `main.py`。

### 方法二：使用命令上传 (推荐，无需安装额外软件)

**⚠️ 关键点：这一步要在你自己的电脑上操作！不要在服务器窗口里敲！**

1.  **打开一个新的 PowerShell 窗口**：
    *   在 Windows 电脑上，按 `Win + R`，输入 `powershell`，回车。
    
2.  **执行命令**：
    ```powershell
    # 1. 先进入项目目录
    cd "C:\Users\Administrator\Desktop\project\Food Illustration App (3)"
    
    # 2. 将代码传上去 (将 159.75.135.120 换成服务器IP)
    # 这里的 /var/www/foodai 是目标路径
    # 注意：这里用的是 ubuntu@...
    scp -r backend/* ubuntu@159.75.135.120:/var/www/foodai
    ```
    *输入服务器密码，等待传输完成。*

    > **⚠️ 常见报错：WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!**
    > 解决方法：在 PowerShell 里执行 `ssh-keygen -R 159.75.135.120`

---

## ⚙️ 第五阶段：配置后端环境

回到**服务器的终端窗口**，继续操作：

### 1. 进入项目目录
```bash
cd /var/www/foodai
```

### 2. 创建 Python 虚拟环境
```bash
# Ubuntu 22.04 自带 Python 3.10，直接创建即可
python3 -m venv venv
```

### 3. 安装依赖包
```bash
# 1. 先升级 pip (重要！否则可能会报错)
./venv/bin/pip install --upgrade pip setuptools wheel

# 2. 安装项目依赖
./venv/bin/pip install -r requirements.txt

# 3. 安装服务器运行工具
./venv/bin/pip install "uvicorn[standard]" gunicorn
```

### 4. 创建配置文件 (.env)
```bash
nano .env
```
此时会进入编辑界面，复制以下内容并修改（**右键粘贴**）：

```ini
# 将 'Tofu@256' 换成第三阶段设置的数据库密码
DATABASE_URL=mysql://tofu:Tofu@256@localhost:3306/food_ai

# 下面的内容从你本地的 .env 文件中复制过来
SECRET_KEY=请复制你本地的SECRET_KEY
SILICONFLOW_API_KEY=请复制你本地的key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn
```
*按 `Ctrl + O` 保存，按 `Enter` 确认，按 `Ctrl + X` 退出。*

### 5. 初始化数据库
```bash
# 1. 初始化 Aerich 配置 (如果提示已有则跳过)
./venv/bin/aerich init -t app.core.config.settings.TORTOISE_ORM

# 2. 初始化数据库结构
./venv/bin/aerich init-db

# 3. 升级数据库 (如果是更新代码)
# ./venv/bin/aerich upgrade
```

---

## 🚀 第六阶段：设置后台运行 (Systemd)

我们要让程序在后台一直运行，即使关掉窗口也不断。

### 1. 创建服务文件
```bash
sudo nano /etc/systemd/system/foodai.service
```

### 2. 粘贴以下内容
```ini
[Unit]
Description=FoodAI API Server
After=network.target

[Service]
# 注意这里改成了 ubuntu 用户
User=ubuntu
WorkingDirectory=/var/www/foodai
Environment="PATH=/var/www/foodai/venv/bin"
# 启动命令
ExecStart=/var/www/foodai/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4

[Install]
WantedBy=multi-user.target
```
*按 `Ctrl + O` 保存，按 `Enter` 确认，按 `Ctrl + X` 退出。*

### 3. 启动服务
```bash
sudo systemctl daemon-reload
sudo systemctl start foodai
sudo systemctl enable foodai
```
检查是否运行成功：
```bash
sudo systemctl status foodai
```
*如果看到绿色的 `active (running)` 就成功了！按 `q` 退出查看。*

---

## 🌐 第七阶段：配置外网访问 (Nginx)

### 1. 创建网站配置
```bash
sudo nano /etc/nginx/sites-available/foodai
```

### 2. 粘贴以下内容
*(将 `你的服务器公网IP` 替换成真实的 IP)*
```nginx
server {
    listen 80;
    server_name 159.75.135.120;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态文件（图片等）
    location /static {
        alias /var/www/foodai/static;
    }
}
```
*保存退出 (Ctrl+O, Enter, Ctrl+X)*

### 3. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/foodai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 删除默认配置
sudo nginx -t  # 测试配置是否正确
sudo systemctl restart nginx  # 重启 Nginx
```

---

## 🎉 恭喜！部署完成

现在，打开浏览器访问：
`http://你的服务器IP/docs`

如果你能看到 API 文档页面，说明部署大功告成！

### ⚠️ 最后一步：修改 App 端 API 地址
别忘了回到你的 React Native 项目，修改 `src/api/client.ts`：

```typescript
export const DEV_API_URL = Platform.select({
  // ... 其他不变
  android: 'http://你的服务器IP/api/v1', 
  default: 'http://你的服务器IP/api/v1',
});
```
