package com.dutch_vocab.dutch_vocab_app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供健康检查端点，用于监控应用程序状态
 */
@RestController
public class HealthController {
    
    /**
     * 简单的健康检查端点
     * @return 包含状态信息的响应
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Dutch Vocabulary App");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 简单的根路径响应
     * @return 欢迎消息
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to Dutch Vocabulary API");
        response.put("version", "1.0");
        response.put("docs", "/swagger-ui.html");
        
        return ResponseEntity.ok(response);
    }
}