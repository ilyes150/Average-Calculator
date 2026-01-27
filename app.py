from flask import Flask, render_template, jsonify
import os
import json

# Ensure the static folder points to where your JS/CSS actually are
app = Flask(__name__, template_folder="templates", static_folder="src")

# FIX: Define an absolute path for the data root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_ROOT = os.path.join(BASE_DIR, "data")

def build_menu(data_root=DATA_ROOT):
    menu = {}
    if not os.path.exists(data_root):
        return menu
        
    for root, dirs, files in os.walk(data_root):
        if root == data_root:
            for d in dirs:
                menu[d] = {}
        else:
            rel_path = os.path.relpath(root, data_root)
            parts = rel_path.split(os.sep)
            
            current = menu
            for p in parts:
                if p not in current:
                    current[p] = {}
                current = current[p]
            
            for f in files:
                if f.endswith(".json"):
                    # Use forward slashes for URLs
                    current[f] = os.path.join(rel_path, f).replace(os.sep, '/')
    return menu

@app.route("/")
def home():
    menu = build_menu()
    return render_template("home.html", menu=menu)

@app.route("/calculation/<path:semester_file>")
def calculation(semester_file):
    return render_template("calculation.html", semester_file=semester_file)

@app.route("/data/<path:semester_file>")
def semester_data(semester_file):
    # FIX: Use absolute path joining for deployment stability
    json_path = os.path.normpath(os.path.join(DATA_ROOT, semester_file))
    
    # Security check: Ensure the path is within DATA_ROOT
    if not json_path.startswith(DATA_ROOT):
        return jsonify({"error": "Unauthorized path"}), 403

    if os.path.exists(json_path):
        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({"error": "Semester file not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)