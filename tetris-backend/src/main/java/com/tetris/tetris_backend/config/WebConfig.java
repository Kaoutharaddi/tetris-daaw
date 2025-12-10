package com.tetris.tetris_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración Global de CORS.
 * Permite que el Frontend (React) se comunique con este Backend desde distintos orígenes
 * (localhost, red local, despliegue en nube).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todos los endpoints de la API
                .allowedOriginPatterns("*") // Permite cualquier origen (flexible para la práctica)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Verbos permitidos
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}