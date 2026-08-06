# suispasdavinci.com新首页

这是独立的纯静态个人主页，不依赖Hexo，也不修改现有文章、工具和小游戏。

推荐部署结构：

- `suispasdavinci.com`：本目录`home/`
- `articles.suispasdavinci.com`：仓库根目录现有Hexo站
- 游戏暂时继续放在文章站的`/games/`，以后再拆`play.suispasdavinci.com`

## Vercel

从同一个GitHub仓库新建一个Vercel Project，Root Directory设为`home`，Framework Preset选`Other`，Build Command留空，Output Directory留空。

现有Hexo Project继续使用仓库根目录，域名改为`articles.suispasdavinci.com`。确认二级域名可访问后，再把根域名切到新Project。

## 本地预览

```bash
cd home
python -m http.server 8080
```

访问`http://localhost:8080`。

## 切换前检查

- 根站所有项目链接可打开
- `articles.suispasdavinci.com`已绑定并完成HTTPS
- 旧文章URL是否需要在根站做301，视搜索流量决定
- Open Graph图片可访问
- 手机宽度375px无横向滚动
