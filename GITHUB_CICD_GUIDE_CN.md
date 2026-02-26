# GitHub Actions 自动化部署教程 (CI/CD)

本教程将教你如何配置 GitHub Actions，实现**“只要把代码推送到 GitHub，服务器就自动更新并重启”**的效果。

## 📋 原理说明
我们在项目中添加了一个配置文件 `.github/workflows/deploy.yml`。
每当你向 `main` 分支推送代码，且修改了 `backend` 文件夹下的内容时，GitHub 的服务器就会自动执行以下操作：
1.  **下载**你的最新代码。
2.  通过 SSH **上传**代码到你的腾讯云服务器。
3.  远程**执行命令**（安装依赖、重启服务）。

---

## 🚀 第一步：准备 GitHub 仓库

如果你还没有把代码上传到 GitHub，请先创建仓库并上传：

1.  在 [GitHub](https://github.com) 上创建一个新仓库（例如 `food-illustration-app`）。
2.  在本地项目根目录打开终端，执行：
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/dengzhuofu/FoodAI_APP.git
    git push -u origin main
    ```

---

## 🔑 第二步：配置 GitHub Secrets

为了安全起见，我们不能把服务器 IP 和密码直接写在代码里。我们需要把它们存到 GitHub 的“保险箱”（Secrets）里。

1.  打开你的 GitHub 仓库页面。
2.  点击上方的 **Settings** (设置)。
3.  在左侧菜单栏找到 **Secrets and variables** -> 点击 **Actions**。
4.  点击绿色的 **New repository secret** 按钮，依次添加以下 3 个变量：

| Name (变量名) | Secret (值) | 说明 |
| :--- | :--- | :--- |
| `SERVER_IP` | `8.148.212.184` | 你的腾讯云服务器公网 IP |
| `SSH_USER` | `ubuntu` | 登录用户名 (Ubuntu系统默认是 ubuntu) |
| `SSH_PASSWORD` | `你的服务器密码` | 你设置的服务器登录密码 |

> **进阶提示**：如果你想用 SSH 密钥登录（更安全），可以添加 `SSH_PRIVATE_KEY`，并在 `deploy.yml` 中把 `password` 换成 `key`。

---

## 📄 第三步：检查工作流文件

我已经帮你创建好了配置文件：`.github/workflows/deploy.yml`。

你可以打开它看看，核心逻辑如下：
*   **触发条件**：`main` 分支有推送，且修改了 `backend/` 目录。
*   **动作 1 (SCP)**：把 `backend` 文件夹里的内容，复制到服务器的 `/var/www/foodai`。
*   **动作 2 (SSH)**：
    1.  进入目录。
    2.  安装 `requirements.txt` 里的新依赖。
    3.  执行 `sudo systemctl restart foodai` 重启服务。

---

## ✅ 第四步：测试自动部署

现在，让我们来测试一下！

1.  在本地修改一点后端代码（比如在 `main.py` 里加个注释，或者修改一下 `README.md`）。
2.  提交并推送代码：
    ```bash
    git add .
    git commit -m "Test CI/CD deployment"
    git push
    ```
3.  回到 GitHub 仓库页面，点击上方的 **Actions** 标签。
4.  你应该能看到一个黄色的圆圈在转（正在运行）。
5.  等它变成**绿色对勾** ✅，说明部署成功！
6.  这时候你的服务器上的代码就已经是最新的，并且服务已经重启了。

---

## ❓ 常见问题

**Q: 部署失败，提示 `Permission denied`？**
A: 请检查 `SSH_PASSWORD` 是否填写正确，或者服务器上的 `/var/www/foodai` 目录权限是否属于 `ubuntu` 用户（我们在之前的部署教程里做过 `chown` 操作）。

**Q: 部署成功了，但新功能没生效？**
A: 可能是服务没重启成功。可以登录服务器查看日志：`sudo journalctl -u foodai -f -n 50`。

**Q: 我不想每次修改文档都触发部署？**
A: `deploy.yml` 里配置了 `paths: - 'backend/**'`，所以只有修改 `backend` 文件夹下的文件才会触发部署。修改根目录的文档不会触发。
