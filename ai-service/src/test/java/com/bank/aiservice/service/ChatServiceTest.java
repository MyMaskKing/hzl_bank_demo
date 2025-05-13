package com.bank.aiservice.service;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ChatServiceTest {

    @Autowired
    private ChatService chatService;

    @Test
    void testSyncChat() {
        // 准备测试数据
        ChatRequest request = new ChatRequest();
        request.setMessage("你好，请做个自我介绍");

        // 执行测试
        ChatResponse response = chatService.chat(request);

        // 验证结果
        assertThat(response).isNotNull();
        assertThat(response.getContent()).isNotEmpty();
    }

    @Test
    void testStreamChat() {
        // 准备测试数据
        ChatRequest request = new ChatRequest();
        request.setMessage("你好，请做个自我介绍");

        // 执行测试
        Flux<ChatResponse> responseFlux = chatService.streamChat(request);

        // 验证结果
        StepVerifier.create(responseFlux)
                .assertNext(response -> {
                    assertThat(response).isNotNull();
                    assertThat(response.getContent()).isNotEmpty();
                })
                .thenCancel()
                .verify();
    }
} 