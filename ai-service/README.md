# AI聊天服务

这是一个基于Spring Boot和Spring AI的简单聊天服务，用于与AI进行对话交互。

## 技术栈

- Spring Boot 3.1.5
- Spring AI 0.7.0
- Ollama (使用deepseek-r1:1.5b模型)
- JDK 17

## 功能特性

- 提供REST API接口，支持用户与AI进行对话
- 支持跨域请求，可从任何前端应用调用
- 返回JSON格式的响应数据

## 快速开始

### 前提条件

- 安装JDK 17或更高版本
- 安装Ollama，并下载deepseek-r1:1.5b模型

### 启动Ollama服务

```bash
# 启动Ollama服务
ollama serve

# 在另一个终端中，加载模型
ollama pull deepseek-r1:1.5b
```

### 运行应用

```bash
# 使用Maven启动应用
./mvnw spring-boot:run
```

或者使用IDE直接运行`AiServiceApplication`类。

## API接口说明

### 发送聊天消息

```
POST /api/chat/send
```

请求体示例：

```json
{
  "content": "你好，我是谁？"
}
```

响应示例：

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "ASSISTANT",
    "content": "您好！我是一个AI助手，可以回答您的问题或提供帮助。您是用户，正在与我进行对话。我能为您做些什么呢？",
    "timestamp": "2023-04-28T10:15:30",
    "eventSuggestion": null
  }
}
```

## 配置说明

在`application.yml`文件中可以配置以下参数：

```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        model: deepseek-r1:1.5b

server:
  port: 8080
```

主要配置参数说明：
- `server.port`: 服务器端口，默认8080
- `spring.ai.ollama.base-url`: Ollama服务地址
- `spring.ai.ollama.chat.model`: 使用的AI模型名称 