package com.tetris.tetris_backend.controller.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Manejador global de excepciones. 
 * Captura errores no controlados y devuelve una respuesta JSON limpia.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Captura cualquier excepción genérica (Exception.class) que no haya sido
     * capturada por métodos más específicos.
     * * @param ex La excepción capturada
     * @return Una respuesta con estado 500 (Internal Server Error) y el mensaje.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        // Aquí podrías añadir logs para ver el error en la consola del servidor
        ex.printStackTrace(); 
        
        // Devolvemos un error 500 con un mensaje entendible para el cliente
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error interno del servidor: " + ex.getMessage());
    }
}