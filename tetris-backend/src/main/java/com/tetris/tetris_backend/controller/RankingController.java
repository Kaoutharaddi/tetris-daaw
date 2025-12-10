package com.tetris.tetris_backend.controller;

import com.tetris.tetris_backend.model.Score;
import com.tetris.tetris_backend.service.ScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Expone la API REST de ranking.
 * Rutas:
 *  - POST /ranking
 *  - GET  /ranking
 */
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
    public ResponseEntity<Score> addScore(@RequestBody Score score) {
        Score savedScore = scoreService.saveScore(score);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedScore);
    }

    /**
     * GET /ranking
     * Devuelve el top 10 de puntuaciones.
     */
    @GetMapping
    public ResponseEntity<List<Score>> getRanking() {
        List<Score> ranking = scoreService.getTopRanking();
        return ResponseEntity.ok(ranking);
    }
}