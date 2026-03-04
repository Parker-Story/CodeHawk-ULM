package com.codehawk.dto;

public class ExecutionResult {
    private boolean status;
    private String output;
    private String error;
    
    public ExecutionResult() {
        this.status = false;
        this.output = "";
        this.error = "";
    }
    
    public boolean isStatus() {
        return status;
    }
    
    public void setStatus(boolean status) {
        this.status = status;
    }
    
    public String getOutput() {
        return output;
    }
    
    public void setOutput(String output) {
        this.output = output;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    @Override
    public String toString() {
        return "ExecutionResult{" +
                "status=" + status +
                ", output='" + output + '\'' +
                ", error='" + error + '\'' +
                '}';
    }
}
