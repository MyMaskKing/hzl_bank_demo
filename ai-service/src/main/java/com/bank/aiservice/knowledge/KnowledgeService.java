package com.bank.aiservice.knowledge;

import jakarta.annotation.Resource;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.nio.file.*;
import java.util.stream.Collectors;

@Service
public class KnowledgeService {
    @Resource
    private VectorStore vectorStore;

    @PostConstruct
    public void init() {
        loadKnowledgeBase();
    }

    // 启动时加载知识库文件到向量库
    public void loadKnowledgeBase() {
        try {
            Path knowledgeDir = Paths.get("src/main/resources/knowledge");
            if (!Files.exists(knowledgeDir)) return;
            DirectoryStream<Path> stream = Files.newDirectoryStream(knowledgeDir);
            for (Path file : stream) {
                String content = Files.readString(file);
                Document doc = new Document(content, Map.of("filename", file.getFileName().toString()));
                vectorStore.add(List.of(doc));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 检索相关知识内容
    public List<String> searchRelevantKnowledge(String query, int topK) {
        SearchRequest request = SearchRequest.builder().query(query).topK(topK).build();
        List<Document> results = vectorStore.similaritySearch(request);
        // 只用getText()
        return results.stream().map(Document::getText).collect(Collectors.toList());
    }
} 