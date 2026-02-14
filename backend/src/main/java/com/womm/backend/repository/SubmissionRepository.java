package com.womm.backend.repository;

import com.womm.backend.entity.Submission;
import com.womm.backend.id.SubmissionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, SubmissionId> {
}
