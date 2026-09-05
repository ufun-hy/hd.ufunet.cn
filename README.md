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

## 生产发布与数据库迁移

`database/migrations/` 中的迁移文件必须随 `main` 一起发布。发布前先只读确认迁移未执行，再按文件日期顺序执行并记录结果；数据库迁移成功后再部署代码并 Reload Webman。若代码依赖新字段，未完成对应迁移时不得单独发布代码。

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
