# 项目Vue文件功能说明文档

本文档旨在说明项目中各个 `.vue` 文件的主要功能、职责、以及它们之间可能存在的依赖关系，方便日后维护和迭代。

## 总体项目结构 (src/)

- **`assets/`**: 存放全局静态资源，如图片、全局CSS变量 (`main.css`, `auth-forms.css` 等)。
- **`components/`**: 存放可重用的子组件，按功能模块分子目录 (例如 `account`, `common`, `interview`, `report`, `setup`, `learn`, `career`, `discussion`, `practice`)。
- **`layouts/`**: 存放布局组件，如 `DefaultLayout.vue`, `AuthLayout.vue`。
- **`router/`**: Vue Router 的配置 (`index.ts`)。
- **`stores/`**: Pinia状态管理模块 (例如 `authStore.ts`, `interviewSetupStore.ts` 等)。
- **`types/`**: TypeScript类型定义文件 (例如 `reportTypes.ts`, `commonTypes.ts` 等)。
- **`views/`**: 存放页面级视图组件，按功能模块分子目录。
- **`main.ts`**: Vue应用的入口文件，初始化Vue实例、路由、Pinia、全局指令、图标库等。
- **`App.vue`**: 根组件，通常包含 `<router-view />` 和动态布局选择。

---

## 布局组件 (Layouts - `src/layouts/`)

### 1. `DefaultLayout.vue`
* **文件名**: `DefaultLayout.vue`
* **目的**: 应用主界面的默认布局，适用于用户登录后的大部分页面。包含一个通用的顶部导航栏（Logo、主导航链接、通知、用户头像下拉菜单、主题切换器）和内容区域插槽。
* **关键特性**:
    * 顶部导航栏，链接到应用的主要功能模块。
    * 用户头像下拉菜单，提供“账户资料”、“应用设置”、“退出登录”等操作。
    * `<slot />` 用于承载各个视图组件的内容。
    * 使用 `themeStore` 和 `authStore`。

### 2. `AuthLayout.vue`
* **文件名**: `AuthLayout.vue`
* **目的**: 用于认证相关页面（如登录、注册、忘记密码）的布局。通常包含一个简化的头部（Logo）和一个居中显示表单的内容区域。
* **关键特性**:
    * 简洁的头部。
    * `<slot />` 用于承载认证表单。
    * 确保认证页面有统一的、专注的视觉风格。

### 3. `BaseModal.vue` (位于 `src/components/common/`)
* **文件名**: `BaseModal.vue`
* **目的**: 一个可重用的基础模态框组件，提供模态框的通用结构、样式和行为（如打开/关闭、点击遮罩关闭、ESC键关闭）。
* **关键Props**:
    * `isOpen: boolean` (或 `v-model:isOpen`): 控制模态框的显示与隐藏。
    * `title?: string`: 模态框的标题 (中文)。
* **关键Events**:
    * `@update:isOpen (value: boolean)`: 当模态框状态改变时触发。
    * `@close`: 当模态框关闭时触发。
* **关键Slots**:
    * `default`: 用于模态框的主体内容。
    * `header`: 自定义模态框头部内容。
    * `footer`: 自定义模态框脚部内容（通常放操作按钮）。
* **注意**: 通过 `<Teleport to="body">` 渲染到 body 下，避免 CSS 层叠问题。

---

## 页面视图组件 (Views - `src/views/`)

### 账户与设置 (Account & Settings)

#### 1. `account/AccountSettingsView.vue`
* **文件名**: `AccountSettingsView.vue`
* **目的**: “账户设置”页面，允许用户查看和编辑个人信息、管理简历、修改密码以及执行账户删除等操作。
* **关键特性**:
    * 使用 `UserProfileInfoForm.vue`, `UserResumeManager.vue`, `PasswordChangeForm.vue` 子组件。
    * 管理“删除账户”的确认模态框 (`BaseModal.vue`)。
    * 与 `authStore` 交互，获取和更新用户信息。
    * 所有文本内容已中文化。
* **依赖Stores**: `authStore`。

#### 2. `settings/SettingsView.vue`
* **文件名**: `SettingsView.vue`
* **目的**: “应用设置”页面，允许用户配置应用级别的偏好，如主题选择、通知偏好、数据隐私选项。
* **关键特性**:
    * 提供主题切换选项（亮色、暗色、跟随系统）。
    * 提供各类通知的开关。
    * 提供数据隐私相关的设置（如允许匿名数据用于AI模型改进）。
    * 包含“删除账户”功能（也在此处提供了入口，最终调用 `authStore` 的逻辑）。
    * 所有文本内容已中文化。
* **依赖Stores**: `userPreferencesStore`, `themeStore`, `authStore`。

### 认证 (Auth - `src/views/auth/`)

#### 1. `LoginView.vue`
* **文件名**: `LoginView.vue`
* **目的**: 用户登录页面。
* **关键特性**: 提供用户名/邮箱/学号和密码输入框，登录按钮，以及指向注册和忘记密码页面的链接。处理登录逻辑。所有文本内容已中文化。
* **依赖Stores**: `authStore`。

#### 2. `RegisterView.vue`
* **文件名**: `RegisterView.vue`
* **目的**: 用户注册页面。
* **关键特性**: 提供学号/邮箱、姓名、专业、密码和确认密码输入框，注册按钮，以及指向登录页面的链接。处理注册逻辑。所有文本内容已中文化。
* **依赖Stores**: `authStore`。

#### 3. `ForgotPasswordView.vue`
* **文件名**: `ForgotPasswordView.vue`
* **目的**: 忘记密码页面，允许用户输入邮箱以发送密码重置链接。
* **关键特性**: 邮箱输入框，“发送重置链接”按钮。所有文本内容已中文化。
* **依赖Stores**: `authStore`。

#### 4. `ResetPasswordView.vue`
* **文件名**: `ResetPasswordView.vue`
* **目的**: 密码重置页面，用户通过邮件中的链接访问，输入新密码进行重置。
* **关键特性**: 新密码和确认新密码输入框，“重置密码”按钮。处理URL中的重置令牌。所有文本内容已中文化。
* **依赖Stores**: `authStore`。

### 面试流程 (Interview - `src/views/interview/`)

#### 1. `InterviewSetupView.vue`
* **文件名**: `InterviewSetupView.vue`
* **目的**: 用户配置模拟面试的参数，包括选择职位领域、经验水平、可选简历、以及选择面试包含的阶段。
* **关键特性**:
    * 使用 `SetupSectionCard.vue`, `TagSelector.vue`, `ResumeSelectorUpload.vue`, `PhaseSelector.vue`, `InterviewReview.vue` 子组件。
    * 与 `interviewSetupStore` 交互，存储和读取配置。
    * 引导用户进入设备检查页面。
    * 所有文本内容已中文化。
* **依赖Stores**: `interviewSetupStore`。

#### 2. `DeviceCheckView.vue`
* **文件名**: `DeviceCheckView.vue`
* **目的**: 进行设备（摄像头、麦克风）检查和调试，确保用户设备工作正常。
* **关键特性**:
    * 使用 `UserCameraFeed.vue` 和 `DeviceSelector.vue` 子组件。
    * 摄像头预览、麦克风音量检测、设备选择下拉框、状态检查清单。
    * 引导用户进入面试房间。
    * 所有文本内容已中文化。
* **依赖Stores**: `interviewSetupStore`。

#### 3. `InterviewRoomView.vue`
* **文件名**: `InterviewRoomView.vue`
* **目的**: 核心的实时面试界面，用户在此进行模拟面试。
* **关键特性**:
    * 使用 `InterviewHeaderInfo.vue`, `InterviewPhaseProgress.vue`, `UserCameraFeed.vue` (小窗), `QuestionDisplay.vue`, `CodeInputArea.vue` (OJ风格), `InterviewControls.vue` (含计时器) 子组件。
    * 新的两栏布局：左侧为题目/代码区，右侧为小窗视频和控制区。
    * 显示当前面试阶段、问题/题目描述、用户摄像头画面、代码输入区（编程阶段）、计时器。
    * 提供“下一题”、“提交代码”、“下一阶段”、“完成面试并生成报告”、“提前结束面试”等控制。
    * 处理WebRTC媒体流和`MediaRecorder`录制逻辑。
    * 编程题阶段有倒计时和自动提交逻辑。
    * 所有文本内容已中文化。
* **依赖Stores**: `interviewSessionStore`, `interviewSetupStore`, `themeStore`。

### 报告 (Report - `src/views/report/`)

#### 1. `GeneratingReportView.vue`
* **文件名**: `GeneratingReportView.vue`
* **目的**: 面试结束后，显示一个加载/处理中的过渡页面，模拟报告生成过程。
* **关键特性**: 显示加载动画和中文的进度提示信息。完成后自动导航到报告详情页。
* **依赖Stores**: 无直接数据依赖，但通常由 `InterviewRoomView` 导航至此。

#### 2. `ReportView.vue`
* **文件名**: `ReportView.vue`
* **目的**: 展示详细的面试评估报告。
* **关键特性**:
    * 使用 `ReportHeader.vue`, `ReportOverallSummary.vue`, `CoreAbilitiesRadarChart.vue`, `ReportTabs.vue`, 以及各标签页内容组件 (`ReportPhaseBreakdownContent.vue`, `ReportKeyMomentsContent.vue`, `ReportCoreAbilitiesDetailContent.vue`), `VideoPlaybackSection.vue`, `RecommendedResourcesSection.vue`, `ReportActionsSection.vue`。
    * 显示总体摘要、核心能力雷达图、按阶段表现细分、关键时刻与建议、视频回放（占位）、推荐学习资源、下载报告等。
    * 综合得分、阶段得分等使用红黄绿颜色区分。
    * 所有文本内容已中文化。
* **依赖Stores**: `interviewSetupStore` (获取面试配置用于报告上下文), (未来可能有一个 `reportStore` 来获取已生成的报告数据)。

### 其他主要视图

#### 1. `HomeView.vue` (位于 `src/views/`)
* **文件名**: `HomeView.vue`
* **目的**: 用户登录后的仪表盘/主页。
* **关键特性**:
    * 包含一个该页面特有的左侧导航栏。
    * 显示欢迎信息、开始新面试和查看历史的快捷操作按钮。
    * 展示“近期表现概览”卡片（平均分、完成次数、待改进项）。
    * 展示“个性化提升建议”列表。
    * 所有文本内容已中文化。
* **依赖Stores**: `authStore`。

#### 2. `history/InterviewHistoryView.vue`
* **文件名**: `InterviewHistoryView.vue`
* **目的**: 展示用户的历史面试记录列表。
* **关键特性**:
    * 以表格形式显示每次面试的日期、岗位、状态/得分，并提供查看报告的链接。
    * 包含简单的客户端分页。
    * 所有文本内容和日期格式已中文化。
* **依赖Stores**: `interviewSetupStore` (用于获取岗位标签), (未来应有 `historyStore`)。

#### 3. `learn/LearningResourcesView.vue`
* **文件名**: `LearningResourcesView.vue`
* **目的**: 展示学习资源，提供搜索和分类筛选功能。
* **关键特性**:
    * 使用 `ResourceHeader.vue`, `ResourceFilterBar.vue`, `ResourceCard.vue` 子组件。
    * 资源以卡片形式网格布局，可按分类或平铺列表显示。
    * 所有文本内容已中文化。
* **依赖Stores**: `resourceStore`。

#### 4. `career/CareerInsightsView.vue`
* **文件名**: `CareerInsightsView.vue` (原“Jobs”页面)
* **目的**: 展示不同职位角色的技能需求、行业前景等信息，帮助用户规划学习。
* **关键特性**:
    * 使用 `CareerInsightsHeader.vue`, `CareerFilters.vue` 子组件 (后续会拆分 `JobRoleCard.vue`)。
    * 提供职位领域、经验级别筛选和关键词搜索。
    * 以卡片形式展示职位概要，点击可展开查看详情（职责、技能要求、学习建议等）。
    * 所有文本内容已中文化。
* **依赖Stores**: `careerInsightsStore`, `interviewSetupStore` (用于筛选选项)。

#### 5. `discussion/DiscussionHomeView.vue`
* **文件名**: `DiscussionHomeView.vue` (原“Network”页面)
* **目的**: 讨论区主页，展示论坛分类列表。
* **关键特性**:
    * 使用 `ForumCategoryListItem.vue` 子组件。
    * 列表头部包含“分类名称”、“主题/帖子”、“最新动态”等列标题。
    * 所有文本内容已中文化。
* **依赖Stores**: `forumStore`。

#### 6. `discussion/ThreadListView.vue`
* **文件名**: `ThreadListView.vue`
* **目的**: 显示特定分类下的主题（帖子）列表。
* **关键特性**:
    * 使用 `ThreadListItem.vue` 子组件。
    * 包含面包屑导航、分类标题、“发布新主题”按钮（触发 `CreateThreadModal.vue`）。
    * 列表头部包含“主题/作者”、“回复/查看”、“最后回复”等列标题。
    * 所有文本内容已中文化。
* **依赖Stores**: `forumStore`。

#### 7. `discussion/ThreadView.vue`
* **文件名**: `ThreadView.vue`
* **目的**: 显示单个主题的详细内容，包括原始帖子和所有回复，并提供回复功能。
* **关键特性**:
    * 使用 `PostItem.vue` 和 `ReplyForm.vue` 子组件。
    * 包含面包屑导航、主题标题。
    * 按顺序展示帖子。
    * 所有文本内容已中文化。
* **依赖Stores**: `forumStore`, `authStore`。

#### 8. `practice/PracticeView.vue`
* **文件名**: `PracticeView.vue`
* **目的**: 技术和算法题刷题板块主页面。
* **关键特性**:
    * 使用 `ProblemListTable.vue` 和 `ProblemFilters.vue` 子组件。
    * 左右两栏布局：左侧为题目列表，右侧为筛选器。
    * 所有文本内容已中文化。
* **依赖Stores**: `practiceStore`。

#### 9. `practice/ProblemSolveView.vue`
* **文件名**: `ProblemSolveView.vue`
* **目的**: 单个编程/算法题的作答页面。
* **关键特性**:
    * 左侧显示题目描述（标题、难度、标签、详细内容）。
    * 右侧为代码编辑区（使用 `CodeInputArea.vue`）、语言选择、运行/提交按钮、模拟结果显示区。
    * 所有文本内容已中文化。
* **依赖Stores**: `practiceStore`。

#### 10. `NotFoundView.vue`
* **文件名**: `NotFoundView.vue`
* **目的**: 404错误页面。
* **关键特性**: 显示“页面未找到”等提示信息 (应中文化)。

---

## 可重用子组件 (Components - `src/components/`)

(这里列出已明确拆分或讨论过的，部分在上面视图的“关键特性”中已提及)

### `common/`
* **`ThemeToggle.vue`**: 主题切换按钮 (亮色/暗色)。
* **`BaseModal.vue`**: 通用模态框基础组件。

### `account/`
* **`UserProfileInfoForm.vue`**: 账户设置中的个人信息编辑表单。
* **`UserResumeManager.vue`**: 账户设置中的简历管理组件。
* **`PasswordChangeForm.vue`**: 账户设置中的密码修改表单。

### `setup/` (面试设置相关)
* **`SetupSectionCard.vue`**: 包裹每个设置步骤的卡片容器。
* **`TagSelector.vue`**: 标签式单项选择器 (用于职位领域、经验级别)。
* **`ResumeSelectorUpload.vue`**: 简历选择及上传组件。
* **`PhaseSelector.vue`**: 面试阶段多项选择组件。
* **`InterviewReview.vue`**: 面试配置回顾摘要组件。

### `interview/` (面试房间相关)
* **`InterviewHeaderInfo.vue`**: 面试房间顶部信息栏。
* **`InterviewPhaseProgress.vue`**: 面试阶段进度条及信息。
* **`InterviewTimerDisplay.vue`**: HH:MM:SS 计时器显示。
* **`UserCameraFeed.vue`**: 用户摄像头画面显示。
* **`QuestionDisplay.vue`**: 问题/题目描述显示区。
* **`CodeInputArea.vue`**: 代码输入编辑器 (已集成 `vue-codemirror` 占位)。
* **`InterviewControls.vue`**: 面试控制按钮集合。

### `report/` (面试报告相关)
* **`ReportHeader.vue`**: 报告页头部。
* **`ReportOverallSummary.vue`**: 报告页总体摘要和得分。
* **`CoreAbilitiesRadarChart.vue`**: 核心能力雷达图。
* **`ReportTabs.vue`**: 报告详情的标签页导航。
* **`ReportPhaseBreakdownContent.vue`**: “按阶段表现”标签页内容。
* **`ReportKeyMomentsContent.vue`**: “关键时刻与建议”标签页内容。
* **`ReportCoreAbilitiesDetailContent.vue`**: “核心能力详情”标签页内容。
* **`VideoPlaybackSection.vue`**: 视频回放区域 (目前为占位符)。
* **`RecommendedResourcesSection.vue`**: 个性化学习资源推荐列表。
* **`ReportActionsSection.vue`**: 报告页底部操作按钮。

### `device/` (设备检查相关)
* **`DeviceSelector.vue`**: 通用设备（摄像头/麦克风）选择下拉框。

### `career/` (职业洞察相关)
* **`CareerInsightsHeader.vue`**: 职业洞察页头部。
* **`CareerFilters.vue`**: 职业洞察页筛选和搜索栏。
* **`JobRoleCard.vue`** (计划中): 单个职位概要卡片。
* **`JobRoleDetailDisplay.vue`** (计划中): 职位详情展示。

### `learn/` (学习资源相关)
* **`ResourceHeader.vue`**: 学习资源页头部。
* **`ResourceFilterBar.vue`**: 学习资源页筛选和搜索栏。
* **`ResourceCard.vue`**: 单个学习资源卡片。

### `discussion/` (讨论区相关)
* **`ForumCategoryListItem.vue`**: 论坛分类列表项。
* **`ThreadListItem.vue`**: 主题列表项。
* **`CreateThreadModal.vue`**: 创建新主题的模态框。
* **`PostItem.vue`**: 单个帖子（主题帖或回复）显示。
* **`ReplyForm.vue`**: 回复表单。

### `practice/` (刷题板块相关)
* **`ProblemFilters.vue`**: 刷题页右侧筛选栏。
* **`ProblemListTable.vue`**: 刷题页左侧题目列表（表格）。

---

## Pinia Stores (`src/stores/`)

* **`authStore.ts`**: 用户认证、当前用户信息（包括简历列表）、相关操作（登录、注册、更新profile、上传/删除简历、修改密码、登出）。
* **`themeStore.ts`**: 管理当前应用主题 (亮色/暗色)。
* **`userPreferencesStore.ts`**: 管理用户应用级偏好设置（主题选择、通知开关、数据隐私）。
* **`interviewSetupStore.ts`**: 管理用户在“设置新面试”页面所做的选择（职位领域、经验水平、选择的面试阶段、选择的简历）。
* **`interviewSessionStore.ts`**: 管理当前正在进行的面试会话的状态（当前阶段、当前问题、计时器信息、编程题代码等）。
* **`resourceStore.ts`**: 管理“学习资源”页面的数据（资源列表、分类）和筛选状态。
* **`careerInsightsStore.ts`**: 管理“职业洞察”页面的数据（职位画像列表）和筛选状态。
* **`forumStore.ts`**: 管理“讨论区”的数据（分类、主题、帖子）和相关操作（获取、创建）。
* **`practiceStore.ts`**: 管理“刷题板块”的数据（题目列表、用户题目状态）和筛选/排序状态。

---

这份文档应该能为您后续的项目维护和迭代提供一个清晰的概览。随着项目的进展，您可以持续更新此文档。