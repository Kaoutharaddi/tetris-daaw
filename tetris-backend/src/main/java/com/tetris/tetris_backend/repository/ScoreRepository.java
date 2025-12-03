package com.tetris.tetris_backend.repository;
import com.tetris.tetris_backend.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Capa de acceso a datos.
 * No escribimos SQL, Spring Data genera las consultas.
 */
public interface ScoreRepository extends JpaRepository<Score, Long> {

    // Devuelve las 10 mejores puntuaciones ordenadas por número de líneas (descendente)
    List<Score> findTop10ByOrderByLineasDesc();
}
