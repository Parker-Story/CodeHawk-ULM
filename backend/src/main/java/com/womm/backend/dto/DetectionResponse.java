package com.womm.backend.dto;

public class DetectionResponse {
    private Double ai_probability;
    private Double ai_percentage;
    private String label;
    private String confidence;

    // ----- Getters/Setters -----
    public Double getAiProbability() { return ai_probability; }
    public void setAiProbability(Double ai_probability) { this.ai_probability = ai_probability; }

    public Double getAiPercentage() { return ai_percentage; }
    public void setAiPercentage(Double ai_percentage) { this.ai_percentage = ai_percentage; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }
}