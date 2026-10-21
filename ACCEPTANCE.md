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
