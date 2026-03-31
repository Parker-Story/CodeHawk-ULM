package com.womm.backend.service;

import com.womm.backend.dto.DetectionResponse;

public interface AiDetectionService {
    DetectionResponse detectAI(String code) throws Exception;
}
