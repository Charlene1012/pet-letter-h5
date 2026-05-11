# 520 宠物来信 H5

一个**动态内容叠加**的 H5 海报模板。视觉底图是已经设计好的拍立得海报切图，只把：

- 宠物照片（polygon 裁切进拍立得窗口）
- 宠物昵称
- 关键词标签
- 信的正文
- 二维码

…做成可动态替换的叠加层。第一眼必须和设计稿高度一致。

## 🗂 目录结构

```
pet-letter-h5/
├── index.html           # 页面骨架：海报舞台 + 编辑面板 + 保存按钮
├── style.css            # 1080 画布坐标系 + polygon 裁切 + 文字层样式
├── app.js               # 缩放适配 + 输入绑定 + html2canvas 导出
├── poster_config.json   # 画布尺寸 + 动态区域坐标 + 默认文案
├── assets/              # 切图资产（见 assets/README.md）
│   ├── 02_template_blank_all_text.png   ← 必需：干净底图
│   ├── sample_pet.jpg                   ← 可选：示例宠物照
│   └── sample_qr.png                    ← 可选：示例二维码
└── README.md
```

## 🚀 本地运行

```bash
# 任意一个静态服务器都行，随便选
npx serve .
# 或
python3 -m http.server 8889
```

然后手机或浏览器访问 `http://localhost:8889`。

> ⚠️ 必须用 HTTP 服务，不要直接双击 `index.html` 打开 —— `fetch('poster_config.json')` 在 `file://` 协议下会被浏览器拦截。

## 🧩 图层顺序（从下到上）

```
第1层  干净背景模板（02_template_blank_all_text.png）
第2层  宠物照片（clip-path polygon 裁切到拍立得窗口）
第3层  宠物昵称（拍立得左上角的小徽标）
第4层  关键词标签（# 今天也想和你贴贴 #）
第5层  信的正文（多行文字，polygon 倾斜 -4°）
第6层  CHUNKE 品牌弱露出
第7层  二维码
```

## 📐 坐标系统

- 海报 `.poster` 是一个原生的 **1080×1920** 容器。所有子元素都用 `px` 坐标定位在这个坐标系里。
- 页面加载时，JS 给 `.poster` 加 `transform: scale(屏幕宽 / 1080)`，整体缩放到手机屏幕宽度。
- 导出 PNG 时，临时把 `scale` 还原为 1，用 html2canvas 按 **1080×1920 原生尺寸**截图。

## ✅ 核心原则

1. **用干净模板作底图，不要用带旧文字的参考图。**
2. **所有定位基于 1080×1920 固定画布坐标，通过 `scale` 适配屏幕。**
3. **宠物照片用 `clip-path: polygon(...)` 裁切到拍立得窗口内。**
4. **保存按钮在 `.poster` 外部，不会被导出到图片里。**
