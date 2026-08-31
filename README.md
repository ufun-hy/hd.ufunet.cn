# hd.ufunet.cn

基于 Webman 的活动与评分系统。

## 环境要求

- PHP 7.2 或更高版本
- Composer
- MySQL
- Redis

## 本地部署

1. 安装 PHP 依赖：

   ```bash
   composer install
   ```

2. 创建本地环境配置：

   ```bash
   cp .env.example .env
   cp config/aeskey.example.php config/aeskey.php
   cp config/authkey.example.php config/authkey.php
   cp config/redis.example.php config/redis.php
   cp config/thinkorm.example.php config/thinkorm.php
   ```

3. 在 `.env` 中填写数据库、Redis、鉴权和 AES 配置。

4. 按 Webman 的方式启动项目：

   ```bash
   php start.php start
   ```

## 生产部署保护脚本

`scripts/deploy-production.sh` 只允许在 `main` 分支、tracked working tree clean 时，从 `main` 历史中的完整 40 位 commit SHA 部署。文件必须逐个通过 `--file` 指定，不会同步整个项目；覆盖前会备份到生产根目录的 `runtime/deploy-backups/`，部署后逐文件比较 Git source 与生产文件的 SHA256。

默认是 dry-run，不会复制文件或创建备份；它会检查目标目录中当前文件是否已与指定 commit 一致。实际复制必须显式使用 `--apply`：

```bash
scripts/deploy-production.sh \
  --commit "$(git rev-parse HEAD)" \
  --target-dir /path/to/production \
  --file app/example.php \
  --file public/example.html \
  --dry-run
```

确认 dry-run 后，将最后一个参数改为 `--apply`。目标目录必须能在当前主机直接访问，并且已有 `runtime/deploy-backups/`；本版本不包含 SSH、CI/CD、自动回滚或历史备份清理。

## 不进入版本库的内容

以下内容包含本地配置、运行数据或客户数据，部署时需单独备份和迁移：

- `.env`
- `config/aeskey.php`
- `config/authkey.php`
- `config/redis.php`
- `config/thinkorm.php`
- `runtime/`
- `public/attachment/`
- `public/signsoft/`
- `public/static/images/screen/` 下的图片、音频和视频资源
- `vendor/`
