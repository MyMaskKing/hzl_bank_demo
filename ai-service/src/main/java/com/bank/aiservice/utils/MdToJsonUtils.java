package com.bank.aiservice.utils;

import java.util.*;
import java.util.regex.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.databind.ObjectMapper;

public class MdToJsonUtils {

    /**
     * 将标准事件库.md内容转换为List<Map<String, String>>，可直接序列化为JSON
     * @param mdContent md文件内容
     * @return List<Map<String, String>>
     */
    public static List<Map<String, String>> mdToJsonList(String mdContent) {
        List<Map<String, String>> result = new ArrayList<>();
        // 匹配表头和数据行
        String[] lines = mdContent.split("\\r?\\n");
        int startIdx = -1;
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith("|") && lines[i].contains("id") && lines[i].contains("name")) {
                startIdx = i;
                break;
            }
        }
        if (startIdx == -1 || startIdx + 2 >= lines.length) return result;

        // 解析表头（允许空格和不可见字符）
        String[] headers = Arrays.stream(lines[startIdx].trim().split("\\|", -1))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        // 解析数据行
        for (int i = startIdx + 1; i < lines.length; i++) { // 修正为+1，兼容无分隔线的md
            String line = lines[i].trim();
            if (!line.startsWith("|")) break;
            // 打印调试信息
            // System.out.println("line: [" + line + "]");
            String[] values = Arrays.stream(line.split("\\|", -1))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toArray(String[]::new);
            if (values.length != headers.length) {
                // System.out.println("skip line: " + line);
                continue;
            }
            Map<String, String> item = new LinkedHashMap<>();
            for (int j = 0; j < headers.length; j++) {
                item.put(headers[j], values[j]);
            }
            result.add(item);
        }
        return result;
    }

    /**
     * 直接返回标准JSON字符串
     * @param mdContent md文件内容
     * @return JSON字符串
     */
    public static String mdToJsonString(String mdContent) {
        List<Map<String, String>> list = mdToJsonList(mdContent);
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(list);
        } catch (Exception e) {
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    /**
     * 读取md文件并直接转换为JSON字符串
     * @param filePath md文件路径
     * @return JSON字符串
     */
    public static String mdFileToJsonString(String filePath) {
        try {
            String mdContent = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);
            return mdToJsonString(mdContent);
        } catch (Exception e) {
            throw new RuntimeException("读取或转换md文件失败: " + filePath, e);
        }
    }

    public static void main(String[] args) {
        String filePath = "src/main/resources/标准事件库.md";
        String json = MdToJsonUtils.mdFileToJsonString(filePath);
        System.out.println(json);
    }
}
