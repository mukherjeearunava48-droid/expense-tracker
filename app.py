from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE"
    return response

DATABASE = "expenses.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


@app.route("/")
def home():
    return "Expense Tracker Backend is Running!"


@app.route("/api/transactions", methods=["GET"])
def get_transactions():

    connection = get_db_connection()

    transactions = connection.execute(
        "SELECT * FROM transactions ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return jsonify([dict(transaction) for transaction in transactions])


@app.route("/api/transactions", methods=["POST"])
def add_transaction():

    data = request.json

    description = data["description"]
    amount = data["amount"]
    transaction_type = data["type"]
    date = data["date"]

    connection = get_db_connection()

    cursor = connection.execute("""
        INSERT INTO transactions
        (description, amount, type, date)
        VALUES (?, ?, ?, ?)
    """, (description, amount, transaction_type, date))

    connection.commit()

    new_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Transaction added successfully",
        "id": new_id
    })


@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):

    connection = get_db_connection()

    connection.execute(
        "DELETE FROM transactions WHERE id = ?",
        (transaction_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Transaction deleted successfully"
    })


if __name__ == "__main__":

    create_database()

    app.run(debug=True)