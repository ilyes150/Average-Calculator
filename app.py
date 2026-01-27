from flask import Flask, render_template, jsonify
import os, json

# Ensure static and template folders are correctly mapped
app = Flask(__name__, template_folder="templates", static_folder="src")

# Use absolute path to find the data folder in any environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_ROOT = os.path.join(BASE_DIR, "data")

def build_menu(data_root=DATA_ROOT):
    menu = {}
    # Check if folder exists to avoid deployment crashes
    if not os.path.exists(data_root):
        return menu
    for root, dirs, files in os.walk(data_root):
        if root == data_root:
            for d in dirs: menu[d] = {}
        else:
            rel_path = os.path.relpath(root, data_root)
            parts = rel_path.split(os.sep)
            current = menu
            for p in parts:
                if p not in current: current[p] = {}
                current = current[p]
            for f in files:
                if f.endswith(".json"):
                    # Use forward slashes for URL compatibility
                    current[f] = os.path.join(rel_path, f).replace(os.sep, '/')
    return menu

@app.route("/")
def home():
    menu = build_menu()
    return render_template("home.html", menu=menu)

@app.route("/calculation/<path:semester_file>")
def calculation(semester_file):
    # Pass the path to the template
    return render_template("calculation.html", semester_file=semester_file)

@app.route("/data/<path:semester_file>")
def semester_data(semester_file):
    # Security: Normalize path to prevent directory traversal
    safe_path = os.path.normpath(semester_file)
    json_path = os.path.join(DATA_ROOT, safe_path)
    
    if os.path.exists(json_path):
        try:
            with open(json_path, encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": f"File not found at {json_path}"}), 404

if __name__ == "__main__":
    app.run(debug=True)