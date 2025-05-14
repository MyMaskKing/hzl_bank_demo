
## 项目名：ai-service

## 技术
- Spring Boot: 3.2.3
- Spring AI: 1.0.0-SNAPSHOT
- JDK: 17
- Ollama: 确保与Spring AI兼容的版本
- WebClient: 使用Spring Boot WebFlux
- Jackson JSON: 最新稳定版本
- Lombok: 最新稳定版本

# 技术参考网站
- springAI：https://www.spring-doc.cn/spring-ai/1.0.0-SNAPSHOT/reference.html

## api-service的使用
- 通过外部chat画面连接ai-service的API服务
## AI生成内容
- 可以通过chat画面进行AI对话
- 理解用户的意图，并且在知识库中找到对应的事件，步骤如下。
  1. 理解用户意图，从知识库中找到对应的事件
  2. 事件参数处理：如果需要参数，则向用户询问
  3. 把事件信息和参数整理成markdown展示给用户，让用户确认事件和参数的正确性
  4. 确认完成后把事件信息和参数作为参数传递json，下面的API还没有实现
     - https://bank_server/p_seiki

## 知识库
- 每次项目启动的时候，要加载下面的文件到知识库，我会把文件放进去的，你要创建一个文件夹，然后读取里面所有的文件，下面是文件的内容格式展示的示例，文件内容仅供参考。
  - 标准事件库.md
    ```
    # otp_upd
    - 名称：OTP更新
    - 说明：可以进行OTP（一次性密码）的开启或关闭
    - 参数：userid，otp_flg
    - 返回值：result
    # otp_sel
    - 名称：OTP查询
    - 说明：可以进行OTP（一次性密码）状态的查询
    - 参数：userid
    - 返回值：otp_flg
    # mail_send
    - 名称：邮件发送服务
    - 说明：发送邮件
    - 参数：userid，email
    - 返回值：result
    ```
  - 银行事件库.md
      ```
      # bank_otp_upd
      - 名称：OTP更新
      - 说明：可以进行OTP（一次性密码）的开启或关闭
      - 关联标准库：otp_sel，otp_upd
      # bank_mail_send
      - 名称：邮件发送服务
      - 说明：发送邮件
      - 关联标准库：mail_send
      ```
  - 个人事件库.md
      ```
      # person_otp_upd
      - 名称：OTP更新快速启用
      - 说明：可以进行OTP（一次性密码）的开启或关闭
      - 关联银行库：bank_otp_upd，bank_mail_send
      ```
- 事件库关系
  - 银行事件是由1个或者多个标准事件组成
  - 个人事件是由1个或者多个银行事件组成

## AI执行流程
- A[服务启动] 
- B[加载知识库]
  - 目录:ai-service/src/main/resources/knowledge/，放置知识库文件（如faq.md、events.json等）。
- C[向量数据转换]
  - 使用ollama的nomic-embed-text
- D[向量数据库存储]
  - 使用Redis，连接地址：192.168.4.14:6379，密码是cyj123456
- E[用户输入]
- F[DeepSeek大模型解析意图]
  - F1[量数据库语义检索]
  - F2[相关知识内容]
- G[知识内容+用户意图]
- H[DeepSeek大模型生成增强回复]
- J[前端chat画面展示]
方案一：本地文件知识库（适合初期/小型项目）
1）知识库文件存放
在ai-service/src/main/resources/knowledge/目录下，放置知识库文件（如faq.md、events.json等）。
2）知识库加载
启动时自动扫描该目录，加载所有知识库文件到内存（可用Spring的@PostConstruct或InitializingBean实现）。
支持多种格式（Markdown、JSON、YAML），可用Jackson、SnakeYAML等解析。
3）知识库服务
新建KnowledgeService，负责加载、检索和提供知识内容。
支持关键词检索、全文检索、模糊匹配等。
4）AI集成
在ChatServiceImpl中，用户提问时先用KnowledgeService检索知识库，若命中则优先返回知识内容，或将知识内容作为AI提示（prompt的一部分）增强AI回答。
5）接口扩展
可提供REST接口，支持知识库内容的查询、管理和热加载。

A[服务启动] --> B[KnowledgeLoader 加载 knowledge 目录下所有事件库文件]
    B --> C[KnowledgeBase 内存管理所有事件]
    C --> D[KnowledgeService 提供检索/汇总等服务]
    D --> E[ChatServiceImpl 注入 KnowledgeService]
    E --> F[ChatController 暴露 /api/chat 接口]
    F --> G[前端Chat画面通过API发送用户输入]
    G --> H[ChatServiceImpl 处理用户输入]
    H --> I{是否为泛化汇总类问题?}
    I -- 是 --> J[KnowledgeService.getAllEventsSummary 返回所有事件库汇总]
    I -- 否 --> K{是否命中具体事件?}
    K -- 是 --> L[KnowledgeService.searchEvents 返回事件详情]
    K -- 否 --> M[调用AI大模型生成回复]
    J & L & M --> N[ChatController 返回响应]
    N --> O[前端Chat画面展示AI/知识库回复]