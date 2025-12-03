package com.tetris.tetris_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Representa una puntuación de una partida de Tetris.
 * Se guarda como una fila en la tabla SCORE de la BD H2.
 */
@Entity
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private int nivel;
    private int lineas;

    public Score() {
        // Constructor vacío requerido por JPA
    }

    public Score(String nombre, int nivel, int lineas) {
        this.nombre = nombre;
        this.nivel = nivel;
        this.lineas = lineas;
    }

    // Getters y setters

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getNivel() {
        return nivel;
    }

    public void setNivel(int nivel) {
        this.nivel = nivel;
    }

    public int getLineas() {
        return lineas;
    }

    public void setLineas(int lineas) {
        this.lineas = lineas;
    }
}
