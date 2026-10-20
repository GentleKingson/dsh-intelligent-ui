# 第三方依赖与许可证

本插件自身以 MIT 许可证发布。

## 运行时依赖（`dependencies`，由 `dsh plugin add` 经 pnpm 安装）

| 包 | 锁定版本 | 许可证 | 用途 |
| --- | --- | --- | --- |
| zod | 4.4.3 | MIT | 配置、模型输出与存储记录的严格校验；生成的 Typert 编解码 |
| mdast-util-from-markdown | 2.1.0 | MIT | 解析原回答 Markdown，建立可引用块索引 |
| mdast-util-gfm | 3.1.0 | MIT | GFM 表格/列表支持 |
| micromark-extension-gfm | 3.0.0 | MIT | GFM 语法扩展 |
| mdast-util-to-string | 4.0.0 | MIT | 提取标题与单元格纯文本 |

上述包的传递依赖（micromark-*、mdast-util-*、unist-util-*、debug、ms 等，共 60 个包）经
`pnpm licenses list --prod` 核对，全部为 MIT。

## 浏览器 bundle（`lib/client.js`）内联内容

- 本插件自身源码，以及 `@deepseek-ai/dsh-typert-protocol` 的 `remote-info` 小段（MIT，由生成的 `typert.remote-client.js` 引入）。

React、zod、`@deepseek-ai/dsh-client-ui-primitives` 等平台模块不打包，运行时由 DSH 外壳的模块表提供。

## 对等依赖（`peerDependencies`，由 DSH 安装提供）

`@deepseek-ai/cordis`、`@deepseek-ai/dsh-llm`、`@deepseek-ai/dsh-session`、
`@deepseek-ai/dsh-storage-domain`、`@deepseek-ai/dsh-typert-protocol`：DeepSeek Harness，MIT。

## 仅构建/测试使用（不随包分发）

typescript 6.0.3（Apache-2.0）、tsdown 0.22.14（MIT）、vitest 4.1.12（MIT）、react 18.3.1（MIT，仅类型检查）、
`@deepseek-ai/dsh-typert-generator` 等 DSH 开发包（MIT）。

## 未采用

OpenUI（`@openuidev/*` 1.0.0）经评估后未采用，未引入任何代码，理由见 README。
