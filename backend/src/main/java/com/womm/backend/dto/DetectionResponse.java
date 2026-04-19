package com.womm.backend.dto;

public class DetectionResponse {
    private Double ai_probability;
    private Double ai_percentage;
    private String label;
    private String confidence;

    // ----- Getters/Setters -----
    public Double getAi_probability() { return ai_probability; }
    public void setAi_probability(Double ai_probability) { this.ai_probability = ai_probability; }

    public Double getAi_percentage() { return ai_percentage; }
    public void setAi_percentage(Double ai_percentage) { this.ai_percentage = ai_percentage; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }
}