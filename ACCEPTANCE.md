# 验收报告：dsh-intelligent-ui 0.1.0

**结论：`WEB_PASS_DESKTOP_BLOCKED`**

- Web 与打包门禁均已通过，没有任何必需门禁失败。
- **Desktop 未验证**：本环境是无 Desktop 的 Linux 容器，因此不能声明“支持 Desktop 已验证”。
- **真实模型未验证**：本环境没有模型密钥，Web 验证改用本地 mock 模型，详见“环境与产物”中的“模型路由”一行。

## 环境与产物

| 项 | 值 |
| --- | --- |
| DSH | `@deepseek-ai/dsh` 0.2.0-rc.2（npm），对应 tag `dsh-v0.2.0-rc.2` / `639ed015397290b3745d163aafe02ffee4aa3f84` |
| 插件源码 commit | `b70ece8cfd36e786467d0706fd46189430f1b1ec`（tgz 由此构建；其后的提交只增加测试与文档，不改变包内容） |
| 包 | `release/dsh-intelligent-ui-0.1.0.tgz` |
| 包 SHA-256 | `3e62e17d1878237ceec6a7075fa373b4d36ef242476062d4ed8d7effc84eaee2`（从干净 clone 执行 `pnpm install --frozen-lockfile && pnpm run pack`，得到逐字节相同的包） |
| OS/arch | Linux x86_64；Node 22.22.0；Chromium 141（Playwright 驱动） |
| 模型路由 | provider `deepseek`，model `deepseek-flash`（profile 默认值）。`DEEPSEEK_BASE_URL` 指向**本地 mock**（`validation/mock-messages-server.mjs`，按关键词返回固定内容，不是真实模型）。辅助调用与主回答走同一路由 |
| 测试 profile | 隔离的 `DSH_HOME`；`--from-default-profile web` 生成 profile `iui` 后，用 `dsh plugin --profile iui add <tgz>` 安装 |

## 验证内容

1. **单元/集成测试（vitest，共 40 项）**：
   - `core.spec.ts`：数值保真；程序校验，含 15 类拒绝用例；Smart Auto 预筛的正例与反例。
   - `service.spec.ts`：用真实 cordis + storage + storage-json + storage-domain 搭建，只替换 llm。覆盖调用次数、触发条件、幂等、身份绑定、失败与重试、SKIP、重启、坏缓存、运行中卸载。
2. **Web E2E**（`validation/web-e2e.mjs`）：真实 DSH Web 服务，插件从 tgz 安装，模型为 mock。结果：
   - `main` 25/25；
   - `reload` 4/4；
   - `absent`（`mode: off`）4/4；
   - `absent`（`disabled: true`）4/4；
   - `absent`（卸载后）4/4。
3. **加载检查**：禁用或卸载后，页面对本插件资源的请求数为 0、注入的样式标签数为 0。正向对照：插件启用时两项各为 1。

## G01–G16

| 门禁 | 结果 | 证据 |
| --- | --- | --- |
| G01 固定版本安装 | PASS（Web） | DSH peers 精确为 `0.2.0-rc.2`。干净 profile 安装 tgz 后，已安装的 `lib/client.js` 与构建产物哈希一致。Client 只 `require` 宿主共享的 `react`、`react/jsx-runtime`、`dsh-client-ui-primitives`，不打包 React |
| G02 Final 识别 | PASS | 单元：工具调用之后的文本、被中断的回合、子代理都是 0 调用；completed 的最终回答调用 1 次。Web A2 |
| G03 无 UI 漏检 | PASS（单元） | Host 只监听 `session/event`，与 UI 无关：service.spec 全程没有 Client 参与。`pending` 在事件监听器返回之前同步登记，所以首次 read 不会误报 absent。Web 中“切换会话 / 隐藏窗口”未单独实测 |
| G04 幂等 | PASS | 单元：重放同一批事件不会再次调用。Web R1–R3：刷新页面和第二个窗口都读到同一视图，新增调用 0。迟到结果只能写回自己的 key（`settle` 会校验 controller） |
| G05 Smart Auto | PASS（mock） | 问候：Web C1/C2 为 0 调用、无视图；解释/代码反例见单元测试。Card（B1/B2）、Table+Chart（A）、line（L1）正例均出现。SKIP 见单元测试。**真实模型下的选择质量 NOT_RUN** |
| G06 一次调用 | PASS | 单元与 Web A2：每个回答 1 次、`tools=0`、`maxTokens=2048`。mock 日志：24 次辅助调用均 `tools=0`。只有用户点击“重试”时才会额外调用（D3） |
| G07 原文 | PASS | Web A3/D1：原 Markdown 表格逐字渲染；视图只通过 `turnTail` 追加。原文的显示不等待增强（`pending` 只是追加一行提示）。复制/导出走宿主自身路径，插件不改动，未单独实测 |
| G08 四组件 | PASS（mock） | Markdown（A 中的 `markdown` 项）、Card（B）、Table（A4–A7）、bar（A8–A13）、line（L1，缺失值处断线）。截图：`validation/screenshots/` |
| G09 数据保真 | PASS | 单元覆盖负数、小数、百分比、单位、缺失、高精度、转义 `\|`。Web：缺失值排序始终在最后（A4/A5）；tooltip 显示精确值（A8）；缺失显示为“缺失”而非 0（A9）；负值柱在 0 线以下（A11） |
| G10 不可信输出 | PASS | 单元 15 类拒绝：未知字段或组件、HTML/表达式、错误 id、重复 id、尾随内容、重复键、超限等。Web D1/D2：原文中的注入文本不会渲染为视图 |
| G11 回退 | PASS（部分子项仅代码审阅） | 单元：模型报错、截断、非法输出都回退为 `failed` 并保留原文；坏缓存只丢失对应视图。Web D1/D3：失败提示与重试。**超时**（20 s 计时器）、**渲染异常**（ErrorBoundary 渲染 `null`）、**存储写入失败**只做了代码审阅。Client 是单文件 bundle，没有可失败的按需 chunk |
| G12 Remote 隔离 | PASS | 单元：session、hash 任一不匹配即返回 `absent`；`read` 只查表，不生成也不加载会话 |
| G13 生命周期 | PASS | 单元：pending 期间卸载插件，会中止该调用（signal aborted），之后的新回合 0 调用。Web：`off`、禁用、卸载三种情况都是 0 调用、无视图，新回答正常显示，页面无错误 |
| G14 Desktop | **BLOCKED / NOT_RUN** | 本容器没有 Desktop 安装包和图形环境 |
| G15 重启 | PASS | 单元：重启后 `ready` 可读，且 0 次调用；坏记录被跳过，新回合照常生成。Web：服务重启后刷新页面，持久化的视图可读（在本版本之前的构建上手工观察，存储代码未变） |
| G16 定向性能 | 部分 NOT_RUN | 设计层面：Host 按回合增量跟踪，不扫描历史；Client 只在 `pending` 时轮询（800 ms，最多 30 s），进入其他状态即停止；视图在挂载时才渲染。**未做约 100 回合的实测** |

## 阻塞项

1. **Desktop（G14）**：需要一台装有 rc.2 Desktop 的 Windows 或 macOS 机器。
2. **真实模型路径**：需要一个有效的 DeepSeek（或其他已配置 provider）密钥。目前 Card/Table/Chart 只经过 mock 验证。

### Desktop 复现步骤

1. 启动一次 Desktop 完成初始化，然后完全退出。
2. 使用 Desktop 菜单安装的 `dsh` 执行：

   ```sh
   dsh --version          # 应为 0.2.0-rc.2，且来自 Desktop 运行时
   dsh plugin --profile desktop add <路径>/dsh-intelligent-ui-0.1.0.tgz
   ```

3. 重新打开 Desktop，在 `dsh-app://app` 中按计划第 8.2 节逐项验证。
4. 卸载：

   ```sh
   dsh plugin --profile desktop remove dsh-intelligent-ui
   ```

### 真实模型 Web 复现步骤

```sh
export DSH_HOME=<隔离目录>
dsh iui --from-default-profile web   # 首次运行创建 profile，随后 Ctrl-C
dsh plugin --profile iui add release/dsh-intelligent-ui-0.1.0.tgz
DEEPSEEK_API_KEY=<真实密钥> dsh --profile iui
```

然后依次提问：“比较三种存储方案的优缺点”“给出 2025 年各季度营收和利润表格”“近六个月活跃用户趋势表”，以及一句问候。

## 本地 mock E2E 复现步骤

```sh
pnpm install && pnpm run pack
node validation/mock-messages-server.mjs 18765 /tmp/mock.jsonl &
DSH_HOME=<隔离目录> DEEPSEEK_BASE_URL=http://127.0.0.1:18765/anthropic DEEPSEEK_API_KEY=mock-local-key \
  dsh --profile iui --no-open --port 18888 --host 127.0.0.1
# 另一终端；需要 playwright-core 与 Chromium
node validation/web-e2e.mjs '<带 token 的 URL>' <输出目录> /tmp/mock.jsonl main     # 也可用 reload 或 absent
```

`absent` 场景需要先在 profile 的 `cordis.patch.yml` 中设置 `mode: "off"` 或 `disabled: true`，或者先卸载插件，然后重启服务再运行。

---

# 追加记录：阶段 1～3（2026-10-21）

本节为追加内容；上文 0.1.0 的验收结论（`WEB_PASS_DESKTOP_BLOCKED`）保持原样。插件版本仍为 0.1.0，未发布；DSH 固定 `0.2.0-rc.2`。

| 阶段 | 内容 | 合并提交 | 结论 |
| --- | --- | --- | --- |
| 1 | MVP 真实运行验收 | —（即上文基线 `26984ee`） | **用户报告通过；原始证据（系统、日志、截图）尚未入库** |
| 2 | 折线有序横轴、折线/柱状纵轴、同表去重、触屏 tooltip（[#1](https://github.com/GentleKingson/dsh-intelligent-ui/pull/1)） | `8b1ef72` | **Web mock PASS**；Desktop NOT_RUN |
| 3 | Smart Auto 本地预筛与提示词（[#2](https://github.com/GentleKingson/dsh-intelligent-ui/pull/2)） | `f4e9eb1` | **本地预筛 PASS**；真实模型 NOT_RUN；Desktop NOT_RUN |

## 证据

所有结果均为本地运行（Linux x86_64，Node 22.22.0，Chromium 141）。仓库没有配置 GitHub CI，上述 PR 没有任何 GitHub 检查记录，**这些结果不等同于 GitHub CI PASS**。Web E2E 使用真实 DSH `0.2.0-rc.2` Web 服务，插件从 tgz 安装，模型为本地 mock（`validation/mock-messages-server.mjs`，不是真实模型）。

| 检查 | 对应提交 | 结果 |
| --- | --- | --- |
| `typecheck` / `test` / `pack` | `f4e9eb1` | PASS / 85 项全部通过 / PASS |
| Web E2E `main` | `9484531`（#1 head）、`d029fbf`（#2 重建后 head，源码与 `f4e9eb1` 相同，仅 README 不同） | 27/27、27/27 |
| Web E2E `touch`（375px、触屏点按） | `9484531` | 6/6（同一脚本在基线 0.1.0 包上为 3/6） |
| Web E2E `reload` | `9484531` | 4/4 |
| Web E2E `absent`（卸载后） | `9484531` | 4/4 |
| Web E2E `absent`（`mode: "off"`） | `8315390`（#2 首个提交；之后只改了本地预筛，未重跑） | 4/4 |
| Smart Auto 样本门禁（`tests/fixtures/smart-auto-samples.ts`，35 条） | `f4e9eb1` | 明确负例误触发 4 → 0，明确正例漏检 0 → 0，本地触发 20/35 → 16/35 |

`f4e9eb1` 在本环境打出的 `dsh-intelligent-ui-0.1.0.tgz` 的 SHA-256 为 `e5a800f18d853bd9f88dc77cd5ca37997d8aab7b688e40b42ff9fde3f3c59096`，仅用于核对。它与 `release/` 中的旧 0.1.0 包同名但内容不同。

## 未完成项（正式发布验收前需补齐）

1. **B4 真实模型对比**：用同样的 35 条样本，在同一 provider/model、原有 DSH 路由下，对比 `8b1ef72`（PR-A）与 `f4e9eb1`（PR-B）的包。需要记录：
   - 每条样本是本地未触发，还是模型返回 `SKIP`，二者分开统计；
   - `ready`、`invalid-output` 的数量；
   - 视图 `usage` 中的真实输入/输出 tokens（提示词字符数不是 token 数）；
   - 每次调用的耗时。
2. **Desktop**：用最终合并提交重新执行 `pnpm run pack`，安装前记录该 tgz 的 SHA-256，再按上文“Desktop 复现步骤”验证。不能复用 `release/` 中的旧同名包。

---

# 追加记录：安装包 0.1.2（2026-10-21）

本节为追加内容，上文各节保持原样。0.1.2 是 `claude/dsh-0.2.0-rc.2` 分支（DSH 固定 `0.2.0-rc.2`）在阶段 1～3 合并后的安装包。它跳过 0.1.1，因为该版本号已被 `claude/dsh-0.2.1-rc.2` 分支的包（对应 DSH 0.2.1-rc.2）占用。**两条分支的版本号大小不代表 DSH 新旧**，安装前请核对包的 `peerDependencies` 中的 DSH 版本。

| 项 | 值 |
| --- | --- |
| 包 | `release/dsh-intelligent-ui-0.1.2.tgz`（`release/dsh-intelligent-ui-0.1.0.tgz` 保留，为历史包） |
| 构建提交 | `5896e79`（在 `f45dffb` 上只把版本号改为 0.1.2，源码与 `f4e9eb1` 相同） |
| SHA-256 | `69afe8b47b33a680a9d8bfb1061dd99a8a2301c27db27a97302167be651fc180` |
| 可复现性 | 从干净 clone 执行 `pnpm install --frozen-lockfile && pnpm run pack`，得到逐字节相同的包 |

## 本包验证（本地运行，非 GitHub CI）

| 检查 | 结果 |
| --- | --- |
| `typecheck` / `test` / `pack` | PASS / 85 项全部通过 / PASS |
| 安装到干净的 DSH 0.2.0-rc.2 profile | 安装后的插件版本为 0.1.2 |
| Web E2E `main` / `touch` / `reload` | 27/27 / 6/6 / 4/4 |
| Web E2E `absent`（卸载后） | 4/4 |

Web E2E 使用的模型仍为本地 mock。B4 真实模型对比与 Desktop 验收仍为 **NOT_RUN**；补测时请直接使用本包，并先核对上面的 SHA-256。

---

# 追加记录：流式工具 UI 第一阶段（`inline-stream`，0.1.3，2026-10-21）

本节为追加内容，上文各节保持原样。新增可选模式 `mode: inline-stream`，默认仍为 `smart-auto`。DSH 固定 `0.2.0-rc.2`（`639ed01`）；复核时上游最新 HEAD 为 `687f282`（2026-10-17），本阶段不跟进。

## 本地门禁（非 GitHub CI）

| 检查 | 结果 |
| --- | --- |
| `typecheck` | PASS |
| `test` | 110 项全部通过（原 85 项，新增 25 项：流式解析、校验与拒绝、注册范围、`concludeTurn`、插件卸载清理，以及 inline 模式不发起辅助调用） |
| `pack` | PASS。Client 包从 230.57 kB 增至 258.55 kB（gzip 从 51.17 kB 增至 58.77 kB），没有新增运行时依赖 |

## Web E2E

环境：真实 DSH 0.2.0-rc.2 Web 服务，插件从 0.1.3 tgz 安装，模型为本地 mock（`validation/mock-messages-server.mjs`，不是真实模型）。`render_ui` 的参数按每块 24 字符、每块间隔 80 ms 分块流式输出。

| 场景 | 模式 | 结果 |
| --- | --- | --- |
| `inline`：流式显示、完成后显示、交互、回退、中断、普通回答 | `inline-stream` | 15/15 |
| `inline-reload`：刷新和第二个窗口 | `inline-stream` | 4/4 |
| `absent`，并设置 `INLINE_HISTORY=1` 查看 inline 历史 | `disabled: true` | 5/5 |
| `main` / `touch` / `reload` | `smart-auto`（默认） | 27/27 / 6/6 / 4/4 |
| `absent` | `mode: "off"` | 4/4 |

**流式时序**：时间由页面内每 20 ms 采样一次得到，单位为页面时钟 ms。

| 时刻 | 事件 |
| --- | --- |
| 9900 | `render_ui` 工具行进入参数生成阶段（preparing） |
| 10128 | 首个组件可见 |
| 10764 | 第 2 个组件可见 |
| 11337 | 第 3 个组件可见 |
| 11926 | 调用完成，本轮结束，视图移到回合尾部 |

首个组件比调用完成早约 1.8 s。最后一个组件与参数结尾在同一个数据块里到达，所以它与调用完成同时显示。截图：

- `validation/screenshots/inline-N-first-component.png`：截图时已显示 2 个组件，调用仍在生成中；
- `inline-N-settled.png`：调用完成后的视图；
- `inline-NR-second-window.png`：第二个窗口恢复的视图。

**回退**：

| 情况 | 行为 | 截图 |
| --- | --- | --- |
| 恶意 HTML/脚本、行列不一致、超限（9 个组件） | 工具返回错误，视图不显示，模型第二次请求以 Markdown 作答，没有任何注入标记进入 DOM | — |
| 非法 JSON | DSH provider 判为 `MALFORMED_RESPONSE`，本轮显示 DSH 自带的失败提示，同一次响应里的前导文字一并丢弃（DSH 行为，插件无法干预） | `inline-F-invalid-json.png` |
| 中断 | 保留前导文字，不保留视图 | `inline-I-interrupted.png` |
| 插件禁用 | 历史回合显示前导文字和通用工具卡片 | `inline-X-inline-history.png` |

## 调用次数与开销

以下数据来自 mock 日志。字节数是 HTTP 请求体大小；mock 返回的 token 数是固定值，不能当作真实计量。

| 场景 | smart-auto | inline-stream |
| --- | --- | --- |
| 数据型回答 | 2 次请求：主 Agent 70,148 B，加辅助调用 13,894 B（输出上限 2048 tokens） | 1 次请求：主 Agent 73,909 B，视图数据作为工具参数在同一次输出中生成（本例 589 字符） |
| 普通回答（"你好"） | 1 次，69,993 B | 1 次，73,739 B |
| 参数被拒绝 | — | 2 次请求（第二次以 Markdown 作答） |
| 主 Agent 请求的固定开销 | — | 每次 +3,746 B：多 1 个工具 schema，系统提示多 935 字符。按英文约 4 字节/token 估算，约 0.9–1k 输入 tokens，**未经真实分词器验证** |

## 未完成项

- **真实模型流式**：本环境没有可用的真实模型，NOT_RUN。
- **Desktop**：NOT_RUN。
- **PTC**：只有单元测试（PTC 和子代理不注册工具、子调度被拒绝），没有 E2E。

## 追加：审查意见处理（2026-10-21）

本小节为追加内容，上文流式阶段的记录保持原样。以下结果均为本地运行，非 GitHub CI。

| 审查项 | 处理 | 验证 |
| --- | --- | --- |
| P1：历史参数先解析 JSON、后检查大小 | `readInlineArgs()` 先检查 UTF-8 字节数，超过 64 KiB 直接拒绝，不调用 `JSON.parse` | 在原有限额测试中增加断言：超限时 `JSON.parse` 没有被调用 |
| P2：流式预览与最终结果不一致 | 文档写明：预览过的组件如果整次调用最终被拒绝，就不保留（README 规则 3 与“已知限制”）。不改变实现 | — |
| P2：结论被折叠 | 提示词与参数说明要求 `items` 的第一项是一句 Markdown 结论 | E2E 新增 N3b：不展开回合也能读到结论（mock 遵守提示词；真实模型是否遵守尚未验证） |
| 已知限制：非法 JSON 导致 `MALFORMED_RESPONSE` | 保持原样，不修改 Agent Loop | — |

**PTC**：以 `DSH_TOOLS_MODE=ptc` 启动同一 Web 服务，新增 E2E 场景 `inline-ptc`，结果 3/3：

- Agent 请求只带 `run_code` 一个工具；
- 请求体的任何位置都不包含 `render_ui`，原生工具、PTC SDK 和提示词中都没有；
- 回答以 Markdown 显示，不出现视图，也不发起辅助调用。

作为对照，原生模式下请求体包含 `render_ui`。

**本轮门禁**：

| 检查 | 结果 |
| --- | --- |
| `typecheck` | PASS |
| `test` | 110/110 |
| `pack` | PASS，0.1.3 tgz 的 SHA-256 为 `97d086c481b84dae7e6df8f3a0abe34865383fbf7a8ef8823be39ca30cfd87cc` |
| Web E2E | `inline` 16/16，`inline-reload` 4/4，`inline-ptc` 3/3 |

本轮只改了 `inline.ts` 和 inline 提示词，smart-auto 代码路径没有改动，所以没有重跑 smart-auto 的 E2E。

**开销更新**：提示词变长后，主 Agent 每次请求比 smart-auto 多 4,148 B（原为 3,746 B），系统提示多 1,102 字符。

**仍未完成**：

- 真实模型流式（阶段 B）：NOT_RUN，本环境没有真实模型；
- Desktop：NOT_RUN。

---

# 追加记录：阶段 B 真实模型验收（2026-10-21）

本节为追加内容，上文各节保持原样。

## 环境

| 项 | 值 |
| --- | --- |
| DSH | `0.2.0-rc.2` Web，插件 0.1.3（SHA-256 `97d086c4…`） |
| 模型 | OpenCode Go 上的 `deepseek-v4.1-flash`，经 DSH 内置的 `dsh-llm-pi-ai` 路由 |
| 协议 | `api: openai-responses`，`baseURL: https://opencode.ai/inference/go/openai/v1` |
| 请求头 | OpenCode Go 要求 `x-opencode-session`，其文档注明 DSH 的会话支持不完整。本次在路由的 `headers` 中给整次测试设置了一个固定的会话 ID 和描述性 `user-agent` |

## 方法

- 新增 E2E 场景 `real`，每个提示词开一个新会话。页面内每 20 ms 采样一次，记录 preparing 阶段、首个组件、完成后视图的时间。
- 请求次数和真实 tokens 取自 DSH 会话日志 `assistant/message.usage`，输入 = `inputTokens + cacheReadTokens`；smart-auto 辅助调用的用量取自插件自己的存储。
- 提示词：3 条普通问答，加 4 类数据型问题（季度经营表、月活趋势、三种存储方案对比、HTTP 状态码列表），每类 3 次。两种模式各跑这 15 条，共 30 次。

## inline-stream 结果

| 类别 | 显示视图 | 说明 |
| --- | --- | --- |
| 普通问答 | 0/3 | 均为纯 Markdown，符合预期 |
| 季度经营（数值表） | 3/3 | 表格 + 图表 |
| 月活趋势（数值序列） | 3/3 | 折线图 + 表格 |
| 存储方案对比（选项） | 0/3 | 模型没有调用 `render_ui`，直接用 Markdown 作答 |
| HTTP 状态码（记录表） | 0/3 | 同上 |

- `render_ui` 共调用 6 次，6 次都通过校验，没有被拒绝的参数，也没有出现 `MALFORMED_RESPONSE`。
- **流式**：6/6 都在调用完成前显示了首个组件。首个组件比调用完成早 155 ms 到 6,118 ms（中位数约 2.8 s）。组件逐个出现，例如 `[1,2,3,4,5]`。
- **结论可见**：6/6 的首项都是 Markdown 结论，不展开回合即可阅读。
- **请求次数**：每个视图都在同一次请求中生成，没有辅助调用。有 3 次运行中，模型在调用 `render_ui` 之前先用了一次 `bash` 计算数据，所以那 3 次是 2 次请求。这是模型自己的工具选择，不是插件追加的请求。
- 30 次运行没有页面错误，所有回合都正常完成。

## 与 smart-auto 的对比（同一路由、同一组提示词）

| 指标 | inline-stream | smart-auto |
| --- | --- | --- |
| 显示视图的回答 | 6/15（仅数值类） | 13/15（12 条数据型全部显示，另有 1 条普通问答也被增强） |
| 辅助调用 | 0 | 13 次，全部成功；输入 31,717 / 输出 9,193 tokens；在回答完成后再用 3.3–9.1 s |
| 主 Agent 首次请求的输入 tokens（15 次平均） | 7,162 | 6,638 |
| 单次请求的固定开销 | 每次请求多 489–541 tokens（真实分词器计数；工具 schema 加提示词） | — |
| 总请求数 / 输入 / 输出（15 次） | 19 / 144,254 / 29,842 | 40 / 446,670 / 51,953，另加辅助调用 13 次 |

smart-auto 的总量偏高，主要来自 2 次运行：模型自行调用 `bash`、`write`、`read_image`，用 matplotlib 绘图，分别用了 14 次和 9 次请求。样本量小，不能据此得出 inline-stream 一般更省的结论。可以确定的只有两点：inline-stream 每次请求固定多约 0.5k 输入 tokens，并且省去辅助调用。

## 结论

- **阶段 B（真实模型，Web）**：流式显示、校验、结论可见、单次请求都已在真实模型上验证通过。
- **新发现的限制**：对“选项比较”和“记录列表”类问题，模型 0/6 选择调用 `render_ui`，而 smart-auto 能为它们生成视图。也就是说，当前提示词下 inline-stream 的覆盖面明显小于 smart-auto。是否调整提示词，需要另行决定。
- Desktop 仍为 NOT_RUN。
- 截图：`validation/screenshots/inline-real-trend.png`、`inline-real-quarterly.png`。

## 复现

在 profile 的 `cordis.patch.yml` 中加入以下配置，启动 `dsh` 前在环境中设置 `OPENCODE_API_KEY`；密钥不要写进配置文件。

```yaml
- id: llm-pi-ai
  config:
    providers:
      opencode-go:
        apiKeyEnv: OPENCODE_API_KEY
        api: openai-responses
        baseURL: https://opencode.ai/inference/go/openai/v1
        headers: { x-opencode-session: <每次测试一个固定 ID> }
        models: [{ id: deepseek-v4.1-flash }]
- id: agent-default-model
  config: { provider: opencode-go, model: deepseek-v4.1-flash }
```

运行：`PROMPTS=<提示词 JSON> node validation/web-e2e.mjs '<URL>' <输出目录> /dev/null real`

## 追加：放宽提示词后重跑阶段 B（2026-10-21）

**改动**：

- **提示词**：选项比较（2 个以上方案在相同维度上对比）、字段相同的列表（4 项以上）、数值数据，都明确要求调用 `render_ui`；解释、步骤、代码、简短回答仍用 Markdown。
- **校验**：新增一条规则——只有 Markdown 组件的调用视为无效。

新增这条校验的原因：放宽提示词后的第一轮重跑中，第 10 次运行（HTTP 状态码）的 `render_ui` 只带了一句 Markdown 结论、没有表格。调用成功并结束了本轮，用户没有看到列表。新规则会把这种调用拒绝，模型收到错误后改为重新调用或用 Markdown 作答。

**结果**：同一路由（OpenCode Go 的 `deepseek-v4.1-flash`，`openai-responses`）、同 15 条提示词，在包含上述修复的包上运行。

| 类别 | 放宽前 | 放宽后 |
| --- | --- | --- |
| 普通问答（纯 Markdown） | 0/3 显示视图 | 0/3 显示视图 |
| 季度经营 | 3/3 | 3/3 |
| 月活趋势 | 3/3 | 3/3 |
| 存储方案对比 | 0/3 | 3/3 |
| HTTP 状态码列表 | 0/3 | 3/3 |

- **流式**：12/12 都在调用完成前显示了首个组件，比调用完成早 993 ms 到 13.7 s（中位数约 3.8 s）。
- **结论可见**：12/12 的首项都是 Markdown 结论。
- **一次拒绝后重试**：第 9 次运行（方案对比）的首次调用中，图表组件缺少 `x` 和 `series`，被校验拒绝。模型收到错误后重新提交了合法参数，本轮共 2 次请求。预览过的组件在拒绝后消失，最终视图正常显示。
- **请求与 tokens**：15 次运行共 17 次请求，输入 126,687、输出 29,301 tokens，没有辅助调用。
- **固定开销**：每次请求比 smart-auto 多 561–665 个输入 tokens，平均约 600；放宽前约为 524。
- **mock 回归**：`inline` 16/16、`inline-reload` 4/4、`inline-ptc` 3/3；`typecheck` 通过，测试 110/110。

截图：`validation/screenshots/inline-real-options.png`。

**结论**：放宽后，inline-stream 在这组提示词上的覆盖面与 smart-auto 相当，而且不需要辅助调用。Desktop 仍为 NOT_RUN。

## inline-stream 展示优化（PR-A：只改样式，不动协议）

**改动**：只调整前端展示，不改 schema、提示词或 Host。除下面标注的两项外，其余样式只对 inline-stream 视图生效（`.diu-inline`），smart-auto 不变。

- **去掉工具面板感**：视图不再有外边框和内边距；“交互视图”折叠条降为 12px 次要文字。折叠和关闭功能保留。
- **正文可读性**：视图正文 14px；Markdown 项不再用 compact 变体的 13px 灰字，改为继承主文字颜色；首项结论 15px。
- **小表格**：6 行及以下的表格隐藏筛选行，表头仍可排序。
- **卡片网格**（两种模式都生效）：改为 `auto-fit` 加 `minmax(min(100%,180px),1fr)`。3 张卡片在 680px 宽度下并排；窄屏单列，不溢出。
- **图表**（两种模式都生效）：按容器的实际宽度绘制，不再固定 640 宽后整体缩放，所以窄屏下坐标轴文字保持 11px。横轴标签数量随宽度减少，每个标签至少 40px。

**验证**（mock、Web、Chromium）：
- inline-stream：`inline` 16/16、`inline-reload` 4/4、`inline-ptc` 3/3。
- smart-auto（共用 `View.tsx`）：`main` 27/27、`touch` 6/6、`reload` 4/4。
- `typecheck` 通过，测试 110/110。

截图分 1280 浅色、390 手机、1280 深色三种，均无横向溢出：
- `validation/screenshots/inline-polish-desktop.png`
- `validation/screenshots/inline-polish-phone.png`
- `validation/screenshots/inline-polish-dark.png`

对比基线是 `inline-N-settled.png`。

**未做**：
- 没有用真实模型重跑，因为提示词和 schema 都没变。
- Desktop 仍为 NOT_RUN。
- 手机上，3 列表格在表格内部横向滚动，这是原有行为。

## inline-stream 布局与内容组织（PR-B）

**改动**：没有扩展 schema，也没有新增组件。

- **提示词**：按回答类型约定布局。
  - 方案比较：每个方案一张卡片，首行是该方案的结论，后面 2～4 个要点；维度在 3 个以上且都很短时，改用“方案 × 维度”表格。
  - 趋势或数值比较：一个图表。图表数据点一下就能看到，所以只有图表里没有的列才另加表格。
  - 列表：一张紧凑表格。
  - 只有第二个组件能补充第一个组件没有的信息时才添加。
  - 提示词增加 449 个字符，估计每次请求多约 100 个输入 tokens。
- **去重**（在 `validateInlineArgs` 里做，Host 和 Client 共用）：与 smart-auto 的规则一致——表头和行与某个图表数据完全相同的表格不单独显示，可以通过该图表的“查看数据”打开。多出列的表格照常保留。
- **4 张卡片**：680px 宽度下改为 2×2，原来是 3+1；1100px 时 4 张一行，窄屏单列。2、3、5 张卡片的排版不变。

**验证**（mock、Web、Chromium）：
- 新增 1 条单测，覆盖“重复的表格去掉、多出列的表格保留”，测试 111/111；`typecheck` 通过。
- inline-stream：`inline` 17/17，新增 N3c：表格不与图表数据重复显示；N5 改为通过“查看数据”验证排序。`inline-reload` 4/4，`inline-ptc` 3/3。
- smart-auto：`main` 27/27、`touch` 6/6、`reload` 4/4。
- 卡片排版：用 Chromium 在 263、390、680、1100px 下实测每行卡片数。

截图：`validation/screenshots/inline-layout-desktop.png`，对比 `inline-polish-desktop.png`，重复的表格已不再显示。

**未做**：
- 提示词改了，但没有用真实模型重跑 15 条场景：本会话没有可用的 OpenCode key，所以 NOT_RUN。
- 流式预览阶段，重复的表格仍会先显示，到调用结束才去掉。
- Desktop 仍为 NOT_RUN。

## 追加：PR-B 后真实模型复测（2026-10-21）

**环境**：同一路由（OpenCode Go 的 `deepseek-v4.1-flash`，`openai-responses`），同样的 15 条提示词，安装包为 `90693ea`（包含 PR-A 和 PR-B）。基线是 `e0e9141` 的那一轮。

| 指标 | 基线 `e0e9141` | 本轮 `90693ea` |
| --- | --- | --- |
| 数据型问题显示视图 | 12/12 | 12/12 |
| 普通问答保持 Markdown | 3/3 | 3/3 |
| 首项为 Markdown 结论 | 12/12 | 12/12 |
| 被拒绝后重试成功 | 1 次（图表缺少字段） | 1 次（`chart` 字段给成了对象） |
| 请求数 | 17 | 17 |
| 输入 / 输出 tokens | 126,687 / 29,301 | 127,903 / 22,436 |
| 每次请求的固定输入开销 | — | 比基线多 99 tokens（15 条首个请求都是 +99，实测） |
| 与图表完全重复的表格 | 0 | 0 |
| 每个视图的非 Markdown 组件数（平均） | 2.25 | 2.17 |
| 末尾多余的 Markdown 组件 | 8/12 | 4/12 |

**布局约定的遵守情况**：
- 趋势类问题 3/3 都把图表放在第一位，表格只多出图表里没有的列，符合约定。
- 方案比较 3/3 仍然同时给了“维度表格”和“每个方案一张卡片”。两者内容不重复（表格对比各维度，卡片写适用场景和慎用场景），但提示词要求的是二选一，没有被遵守。
- 列表 2/3 给了两张表。
- 季度经营 1/3 把图表放在第一位。

总体看，模型每个视图用几个组件基本没变。PR-B 的提示词效果有限：多余的末尾 Markdown 减少了一半，输出 tokens 少了 23%（这一项可能有随机波动）。

**流式**：12 次中只有 8 次在调用完成前显示了首个组件，提前量只有 0.1～0.8 s；基线是 12/12，中位数约 3.8 s。

原因已确认不在插件。DSH 会话日志记录的是服务端收到流的时间：这一轮工具参数从开始到结束只用了 150～350 ms，基线是 4～9 s，两轮参数长度相近（约 0.75～2.4k 字符）。也就是说这一轮参数几乎是一次性到达的，没有内容可以流式显示。mock 测试（参数按定时分块下发）中，流式显示仍然正常（`inline` 17/17）。

截图：`validation/screenshots/inline-real-layout-options.png`。

**结论**：
- 覆盖率、结论首项、校验与重试均无回退。
- PR-B 布局提示词的效果有限，代价是每次请求多 99 个输入 tokens（普通问答也要承担）。
- 去重规则在真实模型的数据里没有触发过，目前只在 mock 中验证过。
- 流式提前量的下降来自供应商下发参数的速度，与插件无关。
- Desktop 仍为 NOT_RUN。
