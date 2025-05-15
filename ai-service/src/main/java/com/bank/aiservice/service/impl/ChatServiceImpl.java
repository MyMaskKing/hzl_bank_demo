package com.bank.aiservice.service.impl;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import com.bank.aiservice.service.ChatService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import com.bank.aiservice.knowledge.KnowledgeService;

@Service
public class ChatServiceImpl implements ChatService {

    private final KnowledgeService knowledgeService;
    private final ChatClient chatClient;

    public ChatServiceImpl(ChatClient.Builder chatClientBuilder, KnowledgeService knowledgeService) {
        this.chatClient = chatClientBuilder.build();
        this.knowledgeService = knowledgeService;
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        String userInput = request.getMessage();
        var knowledgeList = knowledgeService.searchRelevantKnowledge(userInput, 3); // 取top3
        StringBuilder sb = new StringBuilder();
        if (!knowledgeList.isEmpty()) {
            sb.append("【知识库相关内容】\n");
            for (String k : knowledgeList) {
                sb.append(k).append("\n");
            }
        }
        sb.append("【用户提问】\n").append(userInput);
        String enhancedPrompt = sb.toString();
        String aiContent = chatClient.prompt().user(enhancedPrompt).call().content();
        return new ChatResponse(aiContent);
    }

    @Override
    public Flux<ChatResponse> streamChat(ChatRequest request) {
        String userInput = request.getMessage();
        var knowledgeList = knowledgeService.searchRelevantKnowledge(userInput, 3); // 取top3
        StringBuilder sb = new StringBuilder();
        if (!knowledgeList.isEmpty()) {
            sb.append("【知识库相关内容】\n");
            for (String k : knowledgeList) {
                sb.append(k).append("\n");
            }
        }
        sb.append("【用户提问】\n").append(userInput);
        String enhancedPrompt = sb.toString();
        return chatClient.prompt()
                .user(enhancedPrompt)
                .stream()
                .content()
                .map(ChatResponse::new);
    }
} 