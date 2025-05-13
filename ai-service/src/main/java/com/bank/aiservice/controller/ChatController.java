package com.bank.aiservice.controller;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import com.bank.aiservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * 同步聊天接口
     */
    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.chat(request);
    }

    /**
     * 流式聊天接口
     */
    @PostMapping(value = "/stream", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<ChatResponse> streamChat(@RequestBody ChatRequest request) {
        return chatService.streamChat(request);
    }
} 