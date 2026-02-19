from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_similarity_matrix(submissions: list) -> list:
    """
    Computes a similarity matrix between all normalized submissions.

    Parameters:
        submissions (list): list of dictionaries containing "normalized_code"

    Returns:
        similarity_matrix (2D list): NxN matrix where value[i][j] is similarity score
    """

    # Extract normalized code into a list of strings
    documents = [s["normalized_code"] for s in submissions]

    # TF-IDF converts code into numeric vectors based on token frequency
    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    # Cosine similarity compares each document vector to every other one
    similarity_matrix = cosine_similarity(tfidf_matrix)

    return similarity_matrix


def get_top_similar_pairs(submissions: list, similarity_matrix, threshold: float = 0.7) -> list:
    """
    Finds pairs of submissions that exceed a similarity threshold.

    Parameters:
        submissions (list): list of submission dictionaries
        similarity_matrix: NxN similarity matrix
        threshold (float): minimum similarity score to be flagged

    Returns:
        list of suspicious pairs sorted by similarity score descending
    """
    suspicious_pairs = []

    n = len(submissions)

    for i in range(n):
        for j in range(i + 1, n):
            score = similarity_matrix[i][j]

            if score >= threshold:
                suspicious_pairs.append({
                    "file1": submissions[i]["filename"],
                    "file2": submissions[j]["filename"],
                    "similarity": float(score)
                })

    # Sort highest similarity first
    suspicious_pairs.sort(key=lambda x: x["similarity"], reverse=True)

    return suspicious_pairs


if __name__ == "__main__":
    # Simple test with fake submissions

    test_submissions = [
        {"filename": "A.java", "normalized_code": "int x = 5; System.out.println(x);"},
        {"filename": "B.java", "normalized_code": "int y = 5; System.out.println(y);"},
        {"filename": "C.java", "normalized_code": "def add(a,b): return a+b"}
    ]

    matrix = compute_similarity_matrix(test_submissions)
    pairs = get_top_similar_pairs(test_submissions, matrix, threshold=0.3)

    print("Suspicious pairs:")
    for pair in pairs:
        print(pair)