import sys
import os
import subprocess

def test_api():
    print("--- Starting Backend API Automated Verification Suite ---")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_js = os.path.join(script_dir, "run_test.js")

    res = subprocess.run(["node", test_js], capture_output=True, text=True)
    print(res.stdout)
    if res.stderr:
        print(res.stderr)

    if res.returncode == 0:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    test_api()
