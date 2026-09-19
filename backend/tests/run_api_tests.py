import sys
import subprocess

def test_api():
    print("--- Starting Backend API Automated Verification Suite ---")

    res = subprocess.run(["node", "backend/tests/run_test.js"], capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print(res.stderr)

    if res.returncode == 0:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_api()
