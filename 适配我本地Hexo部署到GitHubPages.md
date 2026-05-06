# 适配我本地 Hexo 部署到 GitHub Pages 迁移计划

---

## 第一部分：项目现状分析报告

### 1.1 项目基本信息

| 项目属性 | 当前状态 |
|---------|---------|
| Hexo 版本 | 8.1.1 |
| 主题 | hexo-theme-fluid (v1.9.9) |
| 当前部署方式 | 自定义 SSH 脚本 (deploy.js) |
| 目标部署方式 | GitHub Pages + GitHub Actions |

### 1.2 当前部署机制分析

**现有部署流程**：
1. 执行 `hexo clean && hexo g` 生成静态文件
2. 通过 `node-ssh` 连接远程服务器 (81.71.163.202)
3. 清空远程目录 `/usr/local/nginx/html/*`
4. 上传 `./public` 目录内容到服务器

**关键问题识别**：
- ✅ **高风险**：`deploy.js` 中硬编码了服务器密码，存在安全隐患
- ✅ **需要移除**：项目依赖中的 `node-ssh`、`scp2`、`ssh2` 在迁移后不再需要
- ✅ **需要添加**：需要安装 `hexo-deployer-git` 用于 GitHub Pages 部署

### 1.3 兼容性评估

| 组件 | GitHub Pages 兼容性 | 说明 |
|-----|-------------------|-----|
| Hexo 8.1.1 | ✅ 完全兼容 | GitHub Actions 支持最新版本 |
| hexo-theme-fluid | ✅ 完全兼容 | 主流主题，支持静态部署 |
| 自定义脚本 | ❌ 需要调整 | `deploy.js` 将被 GitHub Actions 替代 |
| Markdown 文章 | ✅ 完全兼容 | 无需修改 |

---

## 第二部分：分阶段迁移计划

### 阶段一：准备工作

#### 1.1 备份文件清单

**务必备份以下文件**：
- `_config.yml` - 站点配置
- `_config.fluid.yml` - 主题配置（如果存在）
- `deploy.js` - 当前部署脚本（作为历史参考）
- `source/_posts/` - 所有文章（虽然使用Git，但建议额外备份）

#### 1.2 GitHub 仓库创建

**需要创建两个仓库**：

| 仓库类型 | 仓库名称 | 可见性 | 用途 |
|---------|---------|-------|-----|
| Pages 仓库 | `<你的GitHub用户名>.github.io` | **必须 Public** | 存放生成的静态网站 |
| 源码仓库 | `my-hexo-blog-source` | 建议 Private | 存放 Hexo 源码和文章 |

**创建步骤**：
1. 访问 https://github.com/new
2. 创建 Pages 仓库：`<你的GitHub用户名>.github.io`，**不勾选** README
3. 创建源码仓库：`my-hexo-blog-source`，**不勾选** README

#### 1.3 安装必要依赖

**需要安装的新依赖**：
```bash
npm install hexo-deployer-git --save
```

**可考虑移除的旧依赖**（迁移成功后）：
```bash
npm uninstall node-ssh scp2 ssh2 --save
```

---

### 阶段二：配置调整

#### 2.1 修改 `_config.yml`

**需要修改的配置项**：

| 配置项 | 当前值 | 修改后值 | 说明 |
|-------|-------|---------|-----|
| `url` | `http://example.com` | `https://<你的GitHub用户名>.github.io` | GitHub Pages 地址 |
| `deploy.type` | `''` | `git` | 使用 git 部署 |

**修改后的 deploy 配置块**：
```yaml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: git
  repo: https://github.com/<你的GitHub用户名>/<你的GitHub用户名>.github.io.git
  branch: main
```

#### 2.2 新增 GitHub Actions 工作流文件

创建 `.github/workflows/deploy.yml` 文件：

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
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Generate Static Files
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          external_repository: <你的GitHub用户名>/<你的GitHub用户名>.github.io
          publish_branch: main
          publish_dir: ./public
```

**⚠️ 重要**：请将 `<你的GitHub用户名>` 替换为您实际的 GitHub 用户名（共两处）。

#### 2.3 主题配置调整

**Fluid 主题特殊注意事项**：
- 如果 `_config.fluid.yml` 中配置了绝对路径或自定义域名相关设置，需要同步更新
- 检查是否有 CDN 配置指向自建服务器，如果有需要移除或更新

---

### 阶段三：GitHub 配置

#### 3.1 生成 SSH 密钥对

在本地终端执行以下命令：

```bash
# 生成密钥对，按回车使用默认路径，不要设置密码
ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/github-actions-deploy
```

执行后会生成两个文件：
- `~/.ssh/github-actions-deploy` - 私钥（**保密！**）
- `~/.ssh/github-actions-deploy.pub` - 公钥

#### 3.2 在 Pages 仓库添加公钥 (Deploy Key)

**操作路径**：
1. 访问 `<你的GitHub用户名>.github.io` 仓库
2. 点击 **Settings** → **Deploy keys** → **Add deploy key**

| 字段 | 值 |
|-----|-----|
| Title | `HEXO_DEPLOY_KEY` |
| Key | 粘贴 `github-actions-deploy.pub` 的全部内容 |
| Allow write access | **务必勾选** |

点击 **Add key** 完成。

#### 3.3 在源码仓库添加私钥 (Secret)

**操作路径**：
1. 访问 `my-hexo-blog-source` 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| 字段 | 值 |
|-----|-----|
| Name | `ACTIONS_DEPLOY_KEY` |
| Value | 粘贴 `github-actions-deploy` 的全部内容（包括 `-----BEGIN RSA PRIVATE KEY-----` 和 `-----END RSA PRIVATE KEY-----`） |

点击 **Add secret** 完成。

---

### 阶段四：测试与验证

#### 4.1 本地测试步骤

**步骤 1：清理并构建**
```bash
hexo clean
hexo generate
```

**步骤 2：本地预览**
```bash
hexo server
```
访问 `http://localhost:4000` 确认网站正常显示。

**步骤 3：验证配置文件**
确保 `_config.yml` 中：
- `url` 已正确设置为 GitHub Pages 地址
- `deploy.type` 已设置为 `git`

#### 4.2 首次部署验证清单

| 验证项 | 验证方法 |
|-------|---------|
| Actions 工作流启动 | 进入源码仓库 → **Actions** 查看工作流是否运行 |
| 构建成功 | 工作流所有步骤显示绿色对勾 |
| 网站可访问 | 访问 `https://<你的GitHub用户名>.github.io` |
| 文章完整 | 检查所有文章是否正确显示 |
| 样式正常 | 确认主题样式、图片、链接正常 |

#### 4.3 回滚方案

**如果部署失败**：
1. 查看 Actions 日志，定位失败原因
2. 修复代码或配置
3. 重新提交：`git add . && git commit -m "fix: 修复部署问题" && git push`

**如果需要回滚到之前版本**：
```bash
# 查看提交历史
git log --oneline

# 回滚到指定版本
git revert <commit-hash>

# 推送回滚
git push origin main
```

---

## 第三部分：检查清单

### 迁移前检查项
- [ ] 已备份 `_config.yml` 和主题配置文件
- [ ] 已创建两个 GitHub 仓库
- [ ] 已安装 `hexo-deployer-git` 依赖
- [ ] 已生成 SSH 密钥对

### 迁移中检查项
- [ ] `_config.yml` 的 `url` 已更新
- [ ] `_config.yml` 的 `deploy.type` 已设置为 `git`
- [ ] 已创建 `.github/workflows/deploy.yml`
- [ ] 公钥已添加到 Pages 仓库的 Deploy keys
- [ ] 私钥已添加到源码仓库的 Secrets

### 迁移后验证项
- [ ] Actions 工作流执行成功
- [ ] 网站可正常访问
- [ ] 所有文章和页面正常显示
- [ ] 链接和图片加载正常

---

## 第四部分：常见问题预案

### Q1: Actions 工作流执行失败

**可能原因**：
- SSH 密钥配置错误
- 工作流文件 YAML 格式错误
- Node.js 版本不兼容

**解决方法**：
1. 查看 Actions 日志中的具体错误信息
2. 确认密钥配置正确（私钥完整复制，无多余空格）
3. 确认 YAML 文件缩进正确（使用 2 个空格）

### Q2: 网站样式丢失或显示异常

**可能原因**：
- `url` 配置不正确，导致资源路径错误
- 主题配置中存在硬编码路径

**解决方法**：
- 确保 `_config.yml` 中的 `url` 正确设置
- 检查主题配置文件，移除硬编码的绝对路径

### Q3: 自定义脚本如何迁移

**原 `deploy.js` 的处理**：
- 迁移完成后，`deploy.js` 不再需要
- 建议保留作为备份或删除
- 如果有自定义构建逻辑，需要迁移到 GitHub Actions 的工作流文件中

### Q4: 如何添加自定义域名

**配置步骤**：
1. 在域名服务商处添加 CNAME 记录指向 `<你的GitHub用户名>.github.io`
2. 在 GitHub Pages 仓库的 **Settings** → **Pages** 中配置 Custom domain
3. 在项目 `source` 目录下创建 `CNAME` 文件，内容为您的域名

---

## 附录：常用命令参考

| 命令 | 用途 |
|-----|-----|
| `hexo clean` | 清理生成的静态文件 |
| `hexo generate` | 生成静态文件 |
| `hexo server` | 启动本地预览服务器 |
| `hexo deploy` | 手动部署（调试用） |
| `npm run build` | 执行 package.json 中的 build 脚本 |

---

**文档版本**：v1.0  
**生成日期**：2026-05-06  
**适用项目**：`my-static-site` (Hexo 8.1.1 + Fluid 主题)