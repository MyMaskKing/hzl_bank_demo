package com.bank.aiservice.service;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import reactor.core.publisher.Flux;

public interface ChatService {
    /**
     * 同步聊天接口
     * @param request 聊天请求
     * @return 聊天响应
     */
    ChatResponse chat(ChatRequest request);

    /**
     * 流式聊天接口
     * @param request 聊天请求
     * @return 聊天响应流
     */
    Flux<ChatResponse> streamChat(ChatRequest request);
} 