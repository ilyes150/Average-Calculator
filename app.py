from flask import Flask, render_template, jsonify
import os, json

app = Flask(__name__, template_folder="templates", static_folder="src")

def build_menu(data_root="data"):
    menu = {}
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
                    current[f] = os.path.join(rel_path, f)
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
    json_path = os.path.join("data", semester_file)
    if os.path.exists(json_path):
        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({"error": "Semester file not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)
