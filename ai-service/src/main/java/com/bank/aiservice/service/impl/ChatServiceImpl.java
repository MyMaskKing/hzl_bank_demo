package com.bank.aiservice.service.impl;

import com.bank.aiservice.dto.ChatRequest;
import com.bank.aiservice.dto.ChatResponse;
import com.bank.aiservice.service.ChatService;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class ChatServiceImpl implements ChatService {

    private final OllamaChatModel chatModel;

    public ChatServiceImpl(OllamaChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        Prompt prompt = new Prompt(request.getMessage());
        var aiResponse = chatModel.call(prompt);
        return new ChatResponse(aiResponse.getResult().getOutput().getText());
    }

    @Override
    public Flux<ChatResponse> streamChat(ChatRequest request) {
        Prompt prompt = new Prompt(request.getMessage());
        return chatModel.stream(prompt)
                .map(response -> new ChatResponse(response.getResult().getOutput().getText()));
    }
} 