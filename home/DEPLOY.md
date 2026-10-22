# 个人主页部署

这是`suispasdavinci.com`根站的纯静态游戏化个人主页。

## 本地预览

可以直接双击`index.html`。CSS、JS和favicon都使用相对路径。

更接近线上环境的方式：

```bash
python -m http.server 8080
```

随后打开`http://localhost:8080`。

## Vercel

1. 新建Project并选择当前仓库。
2. Root Directory设为`home`。
3. Framework Preset选`Other`。
4. Build Command留空，Output Directory留空。
5. 先绑定临时预览域名，确认后再切`suispasdavinci.com`。

原Hexo站在确认跳转方案前不要改动。未来可绑定`articles.suispasdavinci.com`。
