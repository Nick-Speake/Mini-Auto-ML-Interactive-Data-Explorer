from flask import Flask, render_template, request, jsonify
import ml_utils
import pandas as pd

app = Flask(__name__)

csv_df = None


@app.route("/")
def renderPage() -> str:
    return render_template("index.html")


@app.route("/get_file", methods=["POST"])
def get_file():
    global csv_df

    file = request.files.get("userFile")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    csv_df = pd.read_csv(file)

    return jsonify({
        "csv_variables": csv_df.columns.tolist(),
        "rows": len(csv_df)
    })

# final form data sent
@app.route("/get_form", methods=['POST'])
def get_form():
    try:
        cat_cols, num_cols, cleaned_df = ml_utils.data_preprocessing(csv_df)
        print("\n\nCat Cols: \n\n", cat_cols)
        print("\nNum Cols: \n\n", num_cols)
        print("REQUEST RECEIVED")
        
        print("\nCleaned DataFrame: \n\n")
        print(cleaned_df.head(10))

        depen_var = request.form.get("depenVar")
        indep_var = request.form.get("indepVar")
        model_mode = request.form.get("modelMode")

        indep_upper = request.form.get("indepConstraintUpper")
        indep_lower = request.form.get("indepConstraintLower")

        depen_upper = request.form.get("depenConstraintUpper")
        depen_lower = request.form.get("depenConstraintLower")

        data = {
            "indep_var": indep_var,
            "depen_var": depen_var,
            "model_mode": model_mode,
            "constraints": {
                "indep": {"lower": indep_lower, "upper": indep_upper},
                "depen": {"lower": depen_lower, "upper": depen_upper},
            }
        }

        if csv_df is None:
            return jsonify({"error": "No dataset loaded"}), 400

    except Exception as e:
        print("BACKEND CRASH:", e)
        return jsonify({"error": str(e)}), 500


# live selection (useful for debugging)
@app.route("/update_selection", methods=["POST"])
def update_selection():

    depen_var = request.form.get('depenVar')
    indep_var = request.form.get('indepVar')

    depen_upper = request.form.get('depenConstraintUpper')
    depen_lower = request.form.get('depenConstraintLower')

    indep_upper = request.form.get('indepConstraintUpper')
    indep_lower = request.form.get('indepConstraintLower')

    print("\n===== LIVE CONSTRAINTS =====\n")
    print("indep_upper:", indep_upper)
    print("indep_lower:", indep_lower)

    print("depen_upper:", depen_upper)
    print("depen_lower:", depen_lower)

    print("\n===== LIVE SELECTION =====\n")
    print("independent:", indep_var)
    print("dependent:", depen_var)

    
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)