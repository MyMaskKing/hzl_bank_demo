package com.bank.aiservice.controller;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import com.bank.aiservice.service.ChatService;
import com.bank.aiservice.knowledge.KnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final KnowledgeService knowledgeService;

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

    /**
     * 知识库查询接口
     */
    @PostMapping("/knowledge")
    public List<String> searchKnowledge(@RequestBody ChatRequest request) {
        return knowledgeService.searchRelevantKnowledge(request.getMessage(), 3);
    }
} 