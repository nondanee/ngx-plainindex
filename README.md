# Nginx Plain Index (not module)

Vanilla JS + plain CSS + Node.js (0 Dependences)

不想自编译，又想定制目录页，应该怎么办呢 😶

## 预览
![view](https://user-images.githubusercontent.com/26399680/47614562-c35b4900-dadc-11e8-938d-b04092e9f495.png)

## 特性

- 目录页美化
- 拖拽上传
- 自实现 multipart/form-data 处理

## 原理

- 使用 nginx 自带 `auth_basic` 认证身份（base64太危险了，建议上 https）
- 借助 `autoindex_format json` 实现，SPA 前端交互，hash router 保留状态
- 上传文件由反代后端处理，查 authorization header 确定身份

## 相关

- UI偷师自 [barrowclift/directory-theme](https://github.com/barrowclift/directory-theme)
- 自己的毕设 [nondanee/dropbox](https://github.com/nondanee/dropbox)

## 许可

The MIT License