package com.womm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "rubric_score_labels")
public class RubricScoreLabel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "rubric_item_id", nullable = false)
    private RubricItem rubricItem;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private String label;

    public RubricScoreLabel() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RubricItem getRubricItem() { return rubricItem; }
    public void setRubricItem(RubricItem rubricItem) { this.rubricItem = rubricItem; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}