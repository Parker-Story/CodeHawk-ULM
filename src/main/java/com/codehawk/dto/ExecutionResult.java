package com.codehawk.dto;

/**
 * DTO class to hold the result of code execution
 */
public class ExecutionResult {
    private boolean status;  // true if execution succeeded, false otherwise
    private String output;   // Program output (stdout)
    private String error;    // Error message if execution failed
    
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
