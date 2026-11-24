# 上线前检查 · 2026-11-24

验收对象：justvolleyball.app 当前本地代码及用户运行的 localhost:3000。未部署、未推送远程仓库、未启动生产服务。本报告不代表生产服务器验收通过。

## 结论

内容页面的构建、静态资源、SEO 配置和抽查交互通过本地检查。Locker 本地原生渲染通过。网站上线仍需在目标服务器验证域名、HTTPS 和原生渲染环境；不能直接以静态托管替代现有 Locker 服务。

## 已完成的检查

- ESLint、TypeScript、23 项单元测试（含断网构建回归测试）。
- Next.js 生产构建；103 个预渲染 HTML、75 组静态元信息、3,426 处本地链接、712 处图片引用、211 个 JSON-LD 块、78 个 Sitemap URL。构建检查验证链接目标和图片文件，不等于所有外链均可用或结构化数据必定获得富结果。
- 23 个独立页面的 Canonical、社交图片和 Legal 联系邮箱；搜索页实际呈现 noindex, follow 和规范 URL。
- Sitemap 连续执行两次，未变动内容的记录保持一致。
- 桌面 1440，以及 1024、768、390 宽度下抽查首页、Skins、皮肤详情、Characters/Shop、Guides、Tools/Locker、Updates、Legal。抽查未见横向溢出、损坏图片或重复 H1。未逐个手动检查所有详情页的视觉布局。
- 手机汉堡菜单、皮肤搜索、复制代码、详情页跳转及人物图片有效尺寸。
- Locker 六次原生渲染：默认、自定义、代码回读、便服、背面、训练服/头像；PNG 内嵌代码、无效输入拦截和 100 个缩略图哈希。
- 渲染接口跨域请求返回 403；输入大小、资源 ID、模式和代码校验有现有测试覆盖。
- npm audit --omit=dev：检查时生产依赖已知漏洞为 0。此结论不覆盖原生引擎或未来新增漏洞。
- Steam 官方 appdetails API 核对：temkosoft、2026-11-16、Windows、美区标准价 $7.99 / 检查时促销价 $4.95。价格会变化，站内保留查询日期和缓存标识。

## 本次修复

1. Sitemap 日期此前只追踪路由文件和部分数据，会漏掉共享组件、原生人物图片和默认旋转图的变化。新增按页面族追踪的组件与图片指纹，并保留重复执行稳定性。
2. 旧工具页、旧介绍页及 Updates 详情页原先依赖页面流式重定向。将这些已知旧地址放入 Next 配置的永久 HTTP 重定向，避免先返回页面再跳转。新页面仍保留原有布局。

3. Steam 新闻接口曾导致 Updates 预渲染超时。生产构建改用带时间标记的本地快照，运行时缓存仍会按规则更新官方数据；修复后最终构建约 7 秒完成，新增断网预渲染测试通过。

## 生产上线前仍需完成

1. **Locker 环境**：目标 Node 服务器必须具备可执行的原生引擎、准备好的资源包和兼容图形环境。相关文件和本地配置在 .gitignore 中，上传代码不会自动带上它们。参见 artifacts/locker-engine/README.md。部署后须在真实域名完成一次自定义、旋转、导出、导入回读。
2. **生产域名**：核对 justvolleyball.app 的 DNS、HTTPS、www/非 www 规范跳转以及公开 robots.txt/sitemap.xml。此次未操作域名或部署平台，也未启动生产服务，因此未验证这些项目。
3. **并发与容量**：当前原生工作队列串行、最多 3 个排队任务，并有缓存。未完成多用户压力测试；大量同时换装会等待或返回 429。公开放量前需结合目标机器容量配置入口限流及监控。
4. **未知 URL**：Cache Components 流式响应下，部分动态未知路径返回 HTTP 200，同时显示未找到页面并注入 noindex。已核对 noindex；尚未实现所有未知动态 URL 都返回传输层 404，不能将它们描述为严格 404 验收通过。
5. **第三方与真实游戏**：Steam API 本次可达，但不保证所有地区可访问所有外链。原生代码回读不等于已经在运行的 Steam 游戏中逐个导入验证全部社区代码。

## 可重复执行

```text
npm run lint
npm run typecheck
npm test
npm run seo:check
npm run build
npm run verify:build
node scripts/verify-page-metadata.mjs --live
node scripts/verify-locker.mjs
```

最后两个命令使用用户已经运行的本地网站；不会启动服务。构建和开发服务器同时写入 .next 时，增量类型缓存可能短暂引用被重建的生成文件；应在构建完成后运行 typecheck，避免将这个并发状态误判为源码类型错误。

官方信息核对端点：https://store.steampowered.com/api/appdetails?appids=5037200&cc=us&l=english
