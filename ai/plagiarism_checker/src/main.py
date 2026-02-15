from loader import load_code_files
from normalize import normalize_code


def main():
    submissions_folder = "plagiarism_checker/data/submissions"

    print(f"Loading submissions from: {submissions_folder}\n")

    submissions = load_code_files(submissions_folder)

    print(f"Loaded {len(submissions)} code submissions.\n")

    if len(submissions) == 0:
        print("No files found. Make sure you placed .java or .py files in the submissions folder.")
        return

    # Normalize every submission
    for submission in submissions:
        submission["normalized_code"] = normalize_code(
            submission["code"],
            submission["language"]
        )

    # Print a preview so we can verify normalization is working on REAL files
    print("===== NORMALIZED CODE PREVIEW =====\n")

    for submission in submissions:
        print("-----------------------------------")
        print("Filename:", submission["filename"])
        print("Language:", submission["language"])
        print("-----------------------------------")
        print(submission["normalized_code"][:500])
        print("\n")


if __name__ == "__main__":
    main()
