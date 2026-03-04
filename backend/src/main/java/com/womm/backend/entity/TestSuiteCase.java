package com.womm.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "test_suite_cases")
public class TestSuiteCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "suite_id", nullable = false)
    private TestSuite suite;

    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(name = "expected_output", columnDefinition = "TEXT", nullable = false)
    private String expectedOutput;

    @Column(name = "is_hidden", nullable = false)
    private boolean hidden = false;

    @Column(name = "label")
    private String label;

    public TestSuiteCase() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TestSuite getSuite() { return suite; }
    public void setSuite(TestSuite suite) { this.suite = suite; }
    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public boolean isHidden() { return hidden; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}