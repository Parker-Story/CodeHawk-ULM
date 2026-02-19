import os
from loader import load_code_files
from normalize import normalize_code
from similarity import compute_similarity_matrix, get_top_similar_pairs


def main():
    # Get absolute path relative to this file
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    submissions_folder = os.path.join(BASE_DIR, "data", "submissions")

    print(f"Loading submissions from: {submissions_folder}\n")

    submissions = load_code_files(submissions_folder)

    print(f"Loaded {len(submissions)} code submissions.\n")

    if len(submissions) < 2:
        print("Need at least 2 submissions to compare.")
        return

    # Normalize every submission
    for submission in submissions:
        submission["normalized_code"] = normalize_code(
            submission["code"],
            submission["language"]
        )

    print("Computing similarity...\n")

    # Compute similarity matrix
    similarity_matrix = compute_similarity_matrix(submissions)

    # Print similarity matrix
    print("===== SIMILARITY MATRIX =====\n")

    n = len(submissions)
    for i in range(n):
        for j in range(n):
            score = similarity_matrix[i][j]
            print(f"{score:.2f}", end="\t")
        print()

    print("\n===== SUSPICIOUS PAIRS =====\n")

    # Flag pairs above threshold
    threshold = 0.7
    suspicious_pairs = get_top_similar_pairs(submissions, similarity_matrix, threshold)

    if not suspicious_pairs:
        print(f"No pairs above threshold ({threshold}).")
    else:
        for pair in suspicious_pairs:
            print(
                f"{pair['file1']}  <-->  {pair['file2']}  "
                f"Similarity: {pair['similarity']:.2f}"
            )


if __name__ == "__main__":
    main()