
## 项目名：ai-service

## 技术
- Spring Boot: 3.2.3
- Spring AI: 0.8.1-SNAPSHOT
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