# assets 目录说明

本项目依赖以下切图 / 资产文件。请把本地 `/Users/chenghan/Downloads/pet_letter_h5_cut_assets/` 里的文件**原封不动**复制到这个目录下：

| 必需 | 文件名 | 用途 |
|------|--------|------|
| ✅ | `02_template_blank_all_text.png` | **第1层背景 —— 干净模板（无旧文字）** |
| 可选 | `00_reference_full_1080x1920.png` | 原始参考图（视觉对齐用，不参与渲染） |
| 可选 | `01_template_keep_header_blank_dynamic.png` | 保留标题、只清空动态区 |
| 可选 | `03_polaroid_card_blank_crop.png` | 单独的空拍立得卡 |
| 可选 | `04_photo_window_mask_fullsize.png` | 照片窗口蒙版 |
| 可选 | `05_dev_regions_annotated.png` | 开发期对齐用的标注图 |

运行期**只有 `02_template_blank_all_text.png` 是必需的**；它由 `poster_config.json` 的 `baseTemplate` 字段指定，作为海报底图。

## 可选：放一张示例宠物照和示例二维码

如果你希望打开页面时就能直接看到一张预览图（不需要用户先上传），可以放：

- `sample_pet.jpg` —— 任意比例的宠物照（会被 `object-fit: cover` 填满窗口）
- `sample_qr.png` —— 任意二维码图（会被缩放到 239×239）

这两个文件名在 `poster_config.json` 的 `defaults.petPhoto` / `defaults.qrCode` 中引用；
如果不放也没关系——页面会正常渲染其他层，只是照片和二维码位置为空，等用户上传即可。

## 关键原则（务必遵守）

1. **底图必须用 `02_template_blank_all_text.png`**（无旧文字），绝对不要用带旧文字的参考图。
2. **所有定位基于 1080×1920 固定画布**，坐标写在 `poster_config.json` 里，不要硬编码手机屏幕尺寸。
3. **宠物照片通过 `clip-path: polygon(...)` 裁切到拍立得窗口内**，不允许超出窗口边界。
4. **保存按钮在 `.poster` 画布外部**，导出图片时不会被包含。
