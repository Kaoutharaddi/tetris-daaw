package com.tetris.tetris_backend.controller;

import com.tetris.tetris_backend.model.Score;
import com.tetris.tetris_backend.service.ScoreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Expone la API REST de ranking.
 * Rutas:
 *  - POST /ranking
 *  - GET  /ranking
 */
@CrossOrigin(origins = "http://localhost:5173") // permite que el frontend de Vite llame a esta API
@RestController
@RequestMapping("/ranking")
public class RankingController {

    private final ScoreService scoreService;

    public RankingController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    /**
     * POST /ranking
     * Recibe JSON con nombre, nivel y líneas y lo guarda en BD.
     */
    @PostMapping
    public Score addScore(@RequestBody Score score) {
        return scoreService.saveScore(score);
    }

    /**
     * GET /ranking
     * Devuelve el top 10 de puntuaciones.
     */
    @GetMapping
    public List<Score> getRanking() {
        return scoreService.getTopRanking();
    }
}