//package com.dutch_vocab.dutch_vocab_app;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//import org.springframework.core.env.Environment;
//import org.springframework.beans.factory.annotation.Autowired;
//import java.util.Arrays;
//
//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//
//    @Autowired
//    private Environment env;
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        // 检查当前环境
//        boolean isProd = Arrays.asList(env.getActiveProfiles()).contains("prod");
//
//        if (isProd) {
//            // 生产环境 - 允许来自所有域名的请求，或者可以指定特定的域名
//            registry.addMapping("/**")
//                    .allowedOrigins("*")  // 或者指定特定的域名，如 ".onrender.com"
//                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                    .allowedHeaders("*")
//                    .maxAge(3600);
//        } else {
//            // 开发环境 - 允许来自本地开发服务器的请求
//            registry.addMapping("/**")
//                    .allowedOrigins("https://localhost:63342", "http://localhost:63342", "http://localhost:3000")
//                    .allowCredentials(true)
//                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                    .allowedHeaders("*")
//                    .maxAge(3600);
//        }
//    }
//}