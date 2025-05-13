package com.bank.aiservice.dto;

import lombok.Data;
import org.springframework.ai.chat.prompt.ChatOptions;

@Data
public class ChatRequest {
    /**
     * 聊天消息内容
     */
    private String message;
    
    /**
     * 聊天选项，可选
     */
    private ChatOptions options;
} 