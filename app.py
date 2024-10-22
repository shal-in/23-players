from flask import Flask, render_template, redirect, request, jsonify
import os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
import helper

# Firebase stuff
if os.path.exists("firebase-key.json"):
    cred = credentials.Certificate("firebase-key.json")
else:
    cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()


app = Flask(__name__)
app.secret_key = "yoursecretkey"



@app.route("/")
def index():
    return render_template("index.html")

# API ROUTES ETC
@app.route('/api/new-game', methods=['GET'])
def get_new_game():
    game = helper.create_game()

    return jsonify(game)

@app.route("/api/submit-results", methods=["POST"])
def submit_results():
    data = request.get_json()

    client_ip = request.remote_addr
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    data["IP"] = client_ip
    data["time"] = current_time

    helper.add_game_to_db(db, data)

    # Respond to the client with a JSON response
    return jsonify({"message": "Results received successfully"}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)