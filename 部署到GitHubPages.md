# Hexo 项目迁移至 GitHub Pages 自动化部署指南

## 项目概述
本指南旨在将您原有的、基于自建服务器（Nginx）的 Hexo 静态博客/知识库项目，完整迁移至 **GitHub Pages** 服务。迁移后将实现：**提交 Markdown 源码即自动构建并发布网站**，无需管理服务器，并继续通过 `https://<用户名>.github.io` 免费访问。

## 迁移优势
- **零成本托管**：利用 GitHub Pages 的免费静态网站托管服务。
- **自动化流水线**：通过 GitHub Actions，实现推送代码 -> 自动构建 -> 自动部署的全流程。
- **无需服务器运维**：告别服务器续费、安全维护等工作。
- **保留原有工作流**：写作方式不变，仅将部署环节从手动执行脚本改为 `git push`。

## 详细迁移步骤

### 第一阶段：仓库准备
1.  **创建 Pages 仓库 (存放生成的网站)**
    *   访问 https://github.com/new，新建一个仓库。
    *   **仓库名必须严格遵守格式**：`<你的 GitHub 用户名>.github.io` (例如用户 `zhangsan` 的仓库名为 `zhangsan.github.io`)。
    *   描述可留空。
    *   选择 **Public** (公开)。
    *   **不勾选** “Initialize this repository with a README”。
    *   点击 “Create repository”。

2.  **创建源码仓库 (存放 Hexo 项目源代码)**
    *   再次访问 https://github.com/new，新建另一个仓库。
    *   仓库名称可自定义，例如 `my-hexo-blog-source`。
    *   描述可按需填写。
    *   根据需求选择 Public (公开) 或 Private (私有)。
    *   **不勾选** “Initialize this repository with a README”。
    *   点击 “Create repository”。

### 第二阶段：本地项目配置与推送
1.  **清理与检查本地项目**
    *   进入您的 Hexo 项目目录 (例如 `my-static-site`)。
    *   确保 `.gitignore` 文件已包含 `public/` 和 `node_modules/`，以防止将生成的文件和依赖包上传。
    *   (可选) 运行 `hexo clean` 清理本地历史生成文件。

2.  **初始化 Git 并关联远程仓库**
    *   如果该项目目录尚未初始化为 Git 仓库，请执行：
        ```bash
        git init
        git add .
        git commit -m "初次提交：完整的 Hexo 项目源码"
        ```
    *   将本地仓库关联到刚创建的**源码仓库**：
        ```bash
        git remote add origin https://github.com/<你的GitHub用户名>/my-hexo-blog-source.git
        ```

3.  **推送源码**
    ```bash
    git branch -M main
    git push -u origin main
    ```

### 第三阶段：配置 GitHub Actions 自动化工作流
1.  **创建工作流文件**
    *   在您的**本地 Hexo 项目根目录**下，创建文件夹和文件：`.github/workflows/deploy.yml`。
    *   将以下 YAML 配置完整地复制到 `deploy.yml` 文件中。

2.  **配置工作流内容 (`deploy.yml`)**
    ```yaml
    name: Deploy Hexo to GitHub Pages

    on:
      push:
        branches: [ main ]
      workflow_dispatch:

    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest
        permissions:
          contents: write

        steps:
          - name: Checkout Source Code
            uses: actions/checkout@v4
            with:
              submodules: recursive

          - name: Setup Node.js
            uses: actions/setup-node@v4
            with:
              node-version: '20'

          - name: Install Dependencies
            run: npm ci

          - name: Generate Static Files
            run: |
              npm run build
              # 或 hexo generate
              # 请确保 package.json 的 scripts 中存在 "build": "hexo generate"

          - name: Deploy to GitHub Pages
            uses: peaceiris/actions-gh-pages@v4
            with:
              deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
              external_repository: <你的GitHub用户名>/<你的GitHub用户名>.github.io
              publish_branch: main
              publish_dir: ./public
    ```
    **重要**：请将上述配置中**两处** `<你的GitHub用户名>` 替换为您自己的 GitHub 用户名。

### 第四阶段：配置仓库部署密钥 (关键安全步骤)
此步骤旨在授权“源码仓库”中的 Actions 有权限写入“Pages 仓库”。

1.  **生成 SSH 密钥对**
    在本地电脑的终端中执行以下命令 (任何目录均可)：
    ```bash
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/github-actions-deploy
    ```
    此命令会在 `~/.ssh/` 目录下生成两个文件：
    *   `github-actions-deploy` (私钥，需保密)
    *   `github-actions-deploy.pub` (公钥)

2.  **在 Pages 仓库中添加公钥 (Deploy Key)**
    *   访问您的 **`<用户名>.github.io`** 仓库。
    *   进入 **Settings** -> **Deploy keys** -> **Add deploy key**。
    *   **Title** 填写: `HEXO_DEPLOY_KEY`。
    *   **Key** 粘贴 `github-actions-deploy.pub` 文件中的全部内容。
    *   **务必勾选** `Allow write access`。
    *   点击 **Add key**。

3.  **在源码仓库中添加私钥 (Secret)**
    *   访问您的 **`my-hexo-blog-source`** 仓库。
    *   进入 **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**。
    *   **Name** 填写: `ACTIONS_DEPLOY_KEY`。
    *   **Value** 粘贴 `github-actions-deploy` 文件中的**全部内容** (包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`)。
    *   点击 **Add secret**。

### 第五阶段：更新配置，完成迁移
1.  **修改 Hexo 站点 URL**
    *   打开您本地 Hexo 项目根目录的 `_config.yml` 文件。
    *   找到 `url` 配置项，将其修改为您的 GitHub Pages 地址：
        ```yaml
        url: https://<你的GitHub用户名>.github.io
        # 如果后续绑定自定义域名，此处可改为您的域名
        ```
2.  **提交更改并触发首次自动化部署**
    ```bash
    # 在您的本地 Hexo 项目目录下执行
    git add .github/workflows/deploy.yml _config.yml
    git commit -m “配置 GitHub Actions 工作流并更新站点 URL”
    git push origin main
    ```

### 第六阶段：验证与访问
1.  **查看部署状态**
    *   推送代码后，进入您的**源码仓库** (`my-hexo-blog-source`) 的 **Actions** 选项卡。
    *   您将看到一个名为 “Deploy Hexo to GitHub Pages” 的工作流正在运行。
    *   等待约 1-2 分钟，所有步骤显示绿色对勾即表示部署成功。

2.  **访问您的网站**
    *   在浏览器中访问：`https://<你的GitHub用户名>.github.io`
    *   您的 Hexo 站点应已正常显示。

## 后续工作流程 (迁移完成后)
未来，您发布新文章的流程简化为以下三步：
1.  **写作**：在本地 `source/_posts` 目录下创建或放置新的 Markdown 文件。
2.  **提交**：
    ```bash
    git add .
    git commit -m “发布新文章：《文章标题》”
    git push origin main
    ```
3.  **等待**：推送后，GitHub Actions 会自动开始构建和部署。约 1-2 分钟后，刷新您的网站即可看到新内容。

## 重要提示
*   **公开性**：`<用户名>.github.io` 仓库必须设置为 **Public**，否则网站无法被公开访问 (GitHub Free 计划限制)。
*   **自定义域名**：如果您希望使用自己的域名，需在 Pages 仓库的 **Settings -> Pages** 中配置 **Custom domain**，并在域名服务商处添加对应的 CNAME 或 A 记录。同时，在项目 `source` 目录下创建名为 `CNAME` 的文件 (无后缀)，内容为您绑定的域名。
*   **工作流文件**：请确保 `.github/workflows/deploy.yml` 文件中的缩进格式正确 (使用两个空格)，否则会导致 Actions 运行失败。

通过以上步骤，您已成功将项目从自建服务器迁移至 GitHub Pages，并建立了一套更优雅、自动化的持续部署流水线。