import re


def remove_java_block_comments(code: str) -> str:
    """
    Removes Java-style block comments:
        /* comment here */
    including multi-line block comments.
    """
    return re.sub(r"/\*.*?\*/", "", code, flags=re.DOTALL)


def remove_java_line_comments(code: str) -> str:
    """
    Removes Java-style single-line comments:
        // comment here
    """
    return re.sub(r"//.*", "", code)


def remove_python_line_comments(code: str) -> str:
    """
    Removes Python-style single-line comments:
        # comment here

    NOTE:
    This does not perfectly handle '#' inside strings,
    but it is good enough for a first version.
    """
    return re.sub(r"#.*", "", code)


def remove_blank_lines(code: str) -> str:
    """
    Removes empty lines and lines containing only whitespace.
    """
    lines = code.splitlines()
    non_empty_lines = [line for line in lines if line.strip() != ""]
    return "\n".join(non_empty_lines)


def normalize_whitespace(code: str) -> str:
    """
    Standardizes whitespace by:
      - stripping leading/trailing whitespace from each line
      - collapsing multiple spaces into one
    """
    normalized_lines = []

    for line in code.splitlines():
        line = line.strip()
        line = re.sub(r"\s+", " ", line)  # collapse multiple spaces
        normalized_lines.append(line)

    return "\n".join(normalized_lines)


def normalize_code(code: str, language: str) -> str:
    """
    Main normalization function.

    Parameters:
        code (str): raw source code
        language (str): "java" or "python"

    Returns:
        normalized code string
    """
    # Step 1: Remove comments based on language
    if language == "java":
        code = remove_java_block_comments(code)
        code = remove_java_line_comments(code)

    elif language == "python":
        code = remove_python_line_comments(code)

    # Step 2: Remove blank lines
    code = remove_blank_lines(code)

    # Step 3: Normalize whitespace
    code = normalize_whitespace(code)

    return code


if __name__ == "__main__":
    # Quick test to verify normalization works.

    sample_java = """
    public class Test {

        // This is a comment
        public static void main(String[] args) {

            /*
              Multi-line comment
              should be removed
            */

            int x = 5;     // inline comment
            System.out.println(x);

        }
    }
    """

    sample_python = """
    # Python comment
    def add(a, b):
        return a + b   # inline comment


    print(add(2, 3))
    """

    print("===== JAVA BEFORE =====")
    print(sample_java)

    print("\n===== JAVA AFTER =====")
    print(normalize_code(sample_java, "java"))

    print("\n===== PYTHON BEFORE =====")
    print(sample_python)

    print("\n===== PYTHON AFTER =====")
    print(normalize_code(sample_python, "python"))
