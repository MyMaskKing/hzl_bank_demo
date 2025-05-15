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
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class KnowledgeService {
    private static final Logger logger = LoggerFactory.getLogger(KnowledgeService.class);
    private static final int BATCH_SIZE = 1000;
    
    @Resource
    private VectorStore vectorStore;

    @PostConstruct
    public void init() {
        loadKnowledgeBase();
    }

    // 启动时加载知识库文件到向量库
    public void loadKnowledgeBase() {
        try {
            // 先清理旧数据
            logger.info("开始清理知识库旧数据...");
            
            // 分批处理所有文档
            List<String> allDocIds = new ArrayList<>();
            int offset = 0;
            while (true) {
                List<Document> batch = vectorStore.similaritySearch(
                    SearchRequest.builder()
                        .query("")
                        .topK(BATCH_SIZE)
                        .build()
                );
                
                if (batch.isEmpty()) {
                    break;
                }
                
                List<String> batchIds = batch.stream()
                    .map(Document::getId)
                    .collect(Collectors.toList());
                allDocIds.addAll(batchIds);
                
                if (batch.size() < BATCH_SIZE) {
                    break;
                }
                
                offset += BATCH_SIZE;
            }
            
            if (!allDocIds.isEmpty()) {
                logger.info("找到{}条需要清理的知识库数据", allDocIds.size());
                // 分批删除
                for (int i = 0; i < allDocIds.size(); i += BATCH_SIZE) {
                    int end = Math.min(i + BATCH_SIZE, allDocIds.size());
                    List<String> batchIds = allDocIds.subList(i, end);
                    vectorStore.delete(batchIds);
                    logger.info("已删除第{}到{}条数据", i + 1, end);
                }
                logger.info("知识库旧数据清理完成");
            } else {
                logger.info("没有找到需要清理的知识库数据");
            }
            
            // 加载新数据
            logger.info("开始加载知识库新数据...");
            Path knowledgeDir = Paths.get("src/main/resources/knowledge");
            if (!Files.exists(knowledgeDir)) {
                logger.warn("知识库目录不存在: {}", knowledgeDir);
                return;
            }
            
            DirectoryStream<Path> stream = Files.newDirectoryStream(knowledgeDir);
            for (Path file : stream) {
                String content = Files.readString(file);
                Document doc = new Document(
                    content, 
                    Map.of("filename", file.getFileName().toString())
                );
                vectorStore.add(List.of(doc));
                logger.info("已加载知识库文件: {}", file.getFileName());
            }
            logger.info("知识库数据加载完成");
            
        } catch (Exception e) {
            logger.error("加载知识库数据时发生错误", e);
        }
    }

    // 检索相关知识内容
    public List<String> searchRelevantKnowledge(String query, int topK) {
        SearchRequest request = SearchRequest.builder().query(query).topK(topK).build();
        List<Document> results = vectorStore.similaritySearch(request);
        return results.stream().map(Document::getText).collect(Collectors.toList());
    }
} 