package com.womm.backend.service;

import com.womm.backend.entity.Submission;
import com.womm.backend.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class PlagiarismService {

    private final SubmissionRepository submissionRepository;

    public PlagiarismService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    public List<Map<String, Object>> checkAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (int i = 0; i < submissions.size(); i++) {
            for (int j = i + 1; j < submissions.size(); j++) {
                Submission a = submissions.get(i);
                Submission b = submissions.get(j);

                String codeA = decodeContent(a.getFileContent());
                String codeB = decodeContent(b.getFileContent());

                double similarity = jaccardSimilarity(tokenize(codeA), tokenize(codeB));

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("studentAId", a.getSubmissionId().getUserId());
                result.put("studentAName", a.getUser().getFirstName() + " " + a.getUser().getLastName());
                result.put("studentBId", b.getSubmissionId().getUserId());
                result.put("studentBName", b.getUser().getFirstName() + " " + b.getUser().getLastName());
                result.put("similarity", Math.round(similarity * 100));
                result.put("fileContentA", codeA);
                result.put("fileContentB", codeB);
                results.add(result);
            }
        }

        results.sort((x, y) ->
                Long.compare((Long) y.get("similarity"), (Long) x.get("similarity"))
        );

        return results;
    }

    private String decodeContent(String base64Content) {
        if (base64Content == null) return "";
        try {
            return new String(Base64.getDecoder().decode(base64Content));
        } catch (Exception e) {
            return base64Content;
        }
    }

    private Set<String> tokenize(String code) {
        // Remove single-line comments
        code = code.replaceAll("//[^\n]*", " ");
        // Remove multi-line comments
        code = code.replaceAll("/\\*.*?\\*/", " ");
        // Remove Python comments
        code = code.replaceAll("#[^\n]*", " ");
        // Remove string literals
        code = code.replaceAll("\"[^\"]*\"", " STR ");
        code = code.replaceAll("'[^']*'", " STR ");
        // Lowercase
        code = code.toLowerCase();
        // Split on non-alphanumeric characters
        String[] tokens = code.split("[^a-z0-9_]+");

        Set<String> tokenSet = new HashSet<>();
        for (String token : tokens) {
            if (token.length() > 1) {
                tokenSet.add(token);
            }
        }
        return tokenSet;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }
}