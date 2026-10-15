package com.devmeetscribe.backend.llm;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Thin wrapper over the whisper.cpp server (whisper-server.exe), default http://localhost:8081.
 * Settings are optional: whisper.base-url, whisper.timeout-seconds, whisper.language.
 */
@Component
public class WhisperClient {

    private final RestClient inferenceClient;
    private final RestClient healthClient;
    private final String baseUrl;
    private final String language;

    public WhisperClient(@Value("${whisper.base-url:http://localhost:8081}") String baseUrl,
                         @Value("${whisper.timeout-seconds:1800}") long timeoutSeconds,
                         @Value("${whisper.language:auto}") String language) {
        this.baseUrl = baseUrl;
        this.language = language;
        this.inferenceClient = build(baseUrl, Duration.ofSeconds(5), Duration.ofSeconds(timeoutSeconds));
        this.healthClient = build(baseUrl, Duration.ofSeconds(2), Duration.ofSeconds(2));
    }

    private static RestClient build(String baseUrl, Duration connectTimeout, Duration readTimeout) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    /** Sends a 16 kHz WAV and returns the raw transcript text. */
    public String transcribe(byte[] wav) {
        MultipartBodyBuilder parts = new MultipartBodyBuilder();
        parts.part("file", new ByteArrayResource(wav) {
            @Override
            public String getFilename() {
                return "audio.wav";
            }
        }).contentType(MediaType.parseMediaType("audio/wav"));
        parts.part("response_format", "json");
        parts.part("temperature", "0.0");
        parts.part("language", language);

        try {
            JsonNode response = inferenceClient.post()
                    .uri("/inference")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(parts.build())
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new LlmException("Empty response from the Whisper server");
            }
            if (response.hasNonNull("error")) {
                throw new LlmException("Whisper could not process the audio: " + response.get("error").asText());
            }
            return response.path("text").asText("");
        } catch (RestClientResponseException ex) {
            throw new LlmException("Whisper could not process the audio (HTTP " + ex.getStatusCode().value()
                    + "). Try a shorter or clearer recording.", ex);
        } catch (RestClientException ex) {
            throw new LlmException("Cannot reach the Whisper server at " + baseUrl
                    + ". Start whisper-server first (see docs/audio-setup.md).", ex);
        }
    }

    /** UP, LOADING (model still loading) or DOWN. Uses short timeouts so health checks never hang. */
    public String status() {
        try {
            healthClient.get().uri("/health").retrieve().toBodilessEntity();
            return "UP";
        } catch (RestClientResponseException ex) {
            return "LOADING";
        } catch (RestClientException ex) {
            return "DOWN";
        }
    }
}
