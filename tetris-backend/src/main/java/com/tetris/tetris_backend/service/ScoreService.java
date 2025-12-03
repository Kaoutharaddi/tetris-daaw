package com.tetris.tetris_backend.service;

import com.tetris.tetris_backend.model.Score;
import com.tetris.tetris_backend.repository.ScoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Contiene la lógica de negocio relacionada con el ranking.
 */
@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;

    public ScoreService(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    /**
     * Guarda una nueva puntuación.
     */
    public Score saveScore(Score score) {
        return scoreRepository.save(score);
    }

    /**
     * Devuelve el top 10 ordenado por líneas.
     */
    public List<Score> getTopRanking() {
        return scoreRepository.findTop10ByOrderByLineasDesc();
    }
}