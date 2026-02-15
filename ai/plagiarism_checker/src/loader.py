import os


# File extensions we allow as student submissions
SUPPORTED_EXTENSIONS = {".java", ".py"}


def detect_language(filename: str) -> str:
    """
    Determines the programming language based on file extension.
    """
    _, ext = os.path.splitext(filename)

    if ext == ".java":
        return "java"
    elif ext == ".py":
        return "python"
    else:
        return "unknown"


def load_code_files(submissions_folder: str) -> list:
    """
    Loads all supported code files from a folder.

    Parameters:
        submissions_folder (str): Path to folder containing student submissions.

    Returns:
        A list of dictionaries. Each dictionary contains:
            - filename: the name of the file
            - filepath: the full file path
            - language: java/python
            - code: the file contents as a string
    """
    submissions = []

    # Walk through the folder and find all files
    for root, _, files in os.walk(submissions_folder):
        for file in files:
            _, ext = os.path.splitext(file)

            # Skip unsupported file types
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            filepath = os.path.join(root, file)

            try:
                # Read file contents safely
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    code = f.read()

                submissions.append({
                    "filename": file,
                    "filepath": filepath,
                    "language": detect_language(file),
                    "code": code
                })

            except Exception as e:
                print(f"ERROR reading {filepath}: {e}")

    return submissions


if __name__ == "__main__":
    # This is just a quick test runner for this file.
    # Later we will remove this test and call load_code_files() from main.py

    test_folder = "plagiarism_checker/data/submissions"

    print(f"Loading submissions from: {test_folder}\n")

    submissions = load_code_files(test_folder)

    print(f"Loaded {len(submissions)} submissions.\n")

    if len(submissions) > 0:
        print("First file loaded:")
        print("Filename:", submissions[0]["filename"])
        print("Language:", submissions[0]["language"])
        print("Path:", submissions[0]["filepath"])
        print("\n--- CODE PREVIEW ---")
        print(submissions[0]["code"][:500])
        
    if len(submissions) > 0:
        print("Second file loaded:")
        print("Filename:", submissions[1]["filename"])
        print("Language:", submissions[1]["language"])
        print("Path:", submissions[1]["filepath"])
        print("\n--- CODE PREVIEW ---")
        print(submissions[1]["code"][:500])

    if len(submissions) > 0:
        print("Third file loaded:")
        print("Filename:", submissions[2]["filename"])
        print("Language:", submissions[2]["language"])
        print("Path:", submissions[2]["filepath"])
        print("\n--- CODE PREVIEW ---")
        print(submissions[2]["code"][:500])
