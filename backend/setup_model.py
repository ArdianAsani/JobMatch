"""
setup_model.py — One-time script to download and save the multilingual embedding model.

Run this once before starting the server for the first time:

    cd backend
    python setup_model.py

What it does:
  1. Downloads paraphrase-multilingual-MiniLM-L12-v2 from HuggingFace (~470 MB).
  2. Saves it to backend/app/ml/paraphrase-multilingual-MiniLM-L12-v2.

After this script completes, the server can start and run entirely offline.
The model directory is excluded from git (see .gitignore).
"""

import os
import sys

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

# Save into backend/app/ml/<MODEL_NAME>, relative to this script's location.
SAVE_PATH = os.path.join(os.path.dirname(__file__), "app", "ml", MODEL_NAME)


def main() -> None:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print("ERROR: sentence-transformers is not installed.")
        print("Run:  pip install -r requirements.txt")
        sys.exit(1)

    abs_save_path = os.path.abspath(SAVE_PATH)

    if os.path.isdir(abs_save_path):
        print(f"Model already exists at: {abs_save_path}")
        print("Nothing to do. Delete the directory to re-download.")
        sys.exit(0)

    print(f"Downloading model: {MODEL_NAME}")
    print("This requires an internet connection and downloads ~470 MB.")
    print("")

    model = SentenceTransformer(MODEL_NAME)

    os.makedirs(abs_save_path, exist_ok=True)
    model.save(abs_save_path)

    print("")
    print(f"Model saved to: {abs_save_path}")
    print("You can now start the server without internet access.")


if __name__ == "__main__":
    main()
