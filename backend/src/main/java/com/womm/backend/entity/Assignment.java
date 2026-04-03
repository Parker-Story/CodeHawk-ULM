package com.womm.backend.entity;
import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_crn", nullable = false)
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "assignment")
    private List<Submission> submissions;

    @Column(name = "published", nullable = false)
    private boolean published = false;

    @Column(name = "scores_visible", nullable = false)
    private boolean scoresVisible = false;

    @Column(name = "input_mode", nullable = false)
    private String inputMode = "STDIN";

    @Column(name = "input_file_name")
    private String inputFileName;

    @Column(name = "input_file_content", columnDefinition = "LONGTEXT")
    private String inputFileContent;

    @Column(name = "due_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dueDate;

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    // ----- Constructors -----
    public Assignment() {}
    public Assignment(Course course, String title) {
        this.course = course;
        this.title = title;
    }

    // ----- Getters/Setters -----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }
    public boolean isScoresVisible() { return scoresVisible; }
    public void setScoresVisible(boolean scoresVisible) { this.scoresVisible = scoresVisible; }
    public String getInputMode() { return inputMode; }
    public void setInputMode(String inputMode) { this.inputMode = inputMode; }
    public String getInputFileName() { return inputFileName; }
    public void setInputFileName(String inputFileName) { this.inputFileName = inputFileName; }
    public String getInputFileContent() { return inputFileContent; }
    public void setInputFileContent(String inputFileContent) { this.inputFileContent = inputFileContent; }
}
