package com.codehawk.dto;

import java.time.Duration;

public class LatePenaltyRule {
    private Duration gracePeriod;
    private String penaltyType;  // PERCENT_PER_DAY or FIXED_PERCENT
    private double penaltyPercent;
    private double maxPenaltyPercent;

    public Duration getGracePeriod() {
        return gracePeriod;
    }

    public void setGracePeriod(Duration gracePeriod) {
        this.gracePeriod = gracePeriod;
    }

    public String getPenaltyType() {
        return penaltyType;
    }

    public void setPenaltyType(String penaltyType) {
        this.penaltyType = penaltyType;
    }

    public double getPenaltyPercent() {
        return penaltyPercent;
    }

    public void setPenaltyPercent(double penaltyPercent) {
        this.penaltyPercent = penaltyPercent;
    }

    public double getMaxPenaltyPercent() {
        return maxPenaltyPercent;
    }

    public void setMaxPenaltyPercent(double maxPenaltyPercent) {
        this.maxPenaltyPercent = maxPenaltyPercent;
    }

    public static final String TYPE_PERCENT_PER_DAY = "PERCENT_PER_DAY";
    public static final String TYPE_FIXED_PERCENT = "FIXED_PERCENT";
}
