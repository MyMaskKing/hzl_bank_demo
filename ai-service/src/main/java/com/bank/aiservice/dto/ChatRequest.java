package com.bank.aiservice.dto;

import lombok.Data;

@Data
public class ChatRequest {
    /**
     * 聊天消息内容
     */
    private String message;
} 