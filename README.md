# 自动登录 GDUF 校园网

模拟登录操作自动登录校园网，很快！

## 扩展功能

- 可在后台检测登陆状态并自动登录

- 收集校园网公告并在扩展内展示

## 系统要求

扩展在 Microsoft Edge、Google Chrome 和 Mozilla Firefox 中测试通过。

其他基于 Chromium 的浏览器应该也能够使用此扩展。

## 获取扩展

- Microsoft Edge

  - [自动登陆GDUF校园网 - Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/keaemmllkpjogndglcndjdihlbeaeede)

- Google Chrome

  - 上架商店需要一定的费用，如果你希望扩展上架，请在这个 [Issue](https://github.com/tomtiao/GDUF-Auto-Login/issues/1) 下回复。

- Mozilla Firefox 及其他基于 Chromium 的浏览器

  - [Releases · tomtiao/GDUF-Auto-Login](https://github.com/tomtiao/GDUF-Auto-Login/releases)

## 使用说明

1. 安装扩展

2. 打开扩展的设置界面

    - 可通过点击扩展图标弹出的菜单，或在浏览器扩展页面点击“扩展选项”，进入扩展设置

3. 设置校园网的账号和密码，并保存

4. 选择是否启用“后台检测并自动登录”

    - 若启用，下次打开浏览器后，会后台检测网络环境并自动登录

    - 若禁用，下次打开校园网登录页面时，仍会自动登录并关闭页面

5. （可选）打开浏览器的“继续运行后台扩展和应用”，扩展也能在关闭浏览器窗口后继续运行

    - Microsoft Edge
    
      - 在设置-系统和性能-在 Microsoft Edge 关闭后继续运行后台扩展和应用

## 报告问题

使用 [Issues](https://github.com/tomtiao/GDUF-Auto-Login/issues) 功能提交使用扩展时遇到的问题。

## 隐私声明

### 收集、存储的个人信息及原因

扩展会收集用户在设置界面提供校园网账号和密码，并将信息存储在浏览器本地空间和浏览器厂商提供的同步服务中，以便扩展使用这些信息向校园网登陆服务器发送请求。

扩展为了检测网络环境，实现后台自动登录，会向以下服务器发送请求，请求中可能会包含用户信息，如用户的 IP 地址、浏览器信息等：

- http://developers.google.cn/generate_204

- http://g.cn/generate_204

- http://edge.microsoft.com/captiveportal/generate_204

如果不想向以上服务器发送请求，可以在扩展的设置页面中禁用“后台检测并自动登录”。
