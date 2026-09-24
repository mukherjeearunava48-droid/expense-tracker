const form = document.getElementById("expense-form");

const transactionList = document.getElementById("transaction-list");

const totalIncome = document.getElementById("total-income");

const totalExpense = document.getElementById("total-expense");

const balance = document.getElementById("balance");


const API_URL = "http://127.0.0.1:5000/api/transactions";


// Load transactions when page opens
loadTransactions();


// Add transaction
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const description =
        document.getElementById("description").value;

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const date =
        document.getElementById("date").value;


    const transaction = {
        description: description,
        amount: amount,
        type: type,
        date: date
    };


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(transaction)

        });


        if (!response.ok) {
            throw new Error("Failed to add transaction");
        }


        form.reset();

        loadTransactions();


    } catch (error) {

        console.error(error);

        alert("Could not connect to the backend.");

    }

});


// Get transactions from backend
async function loadTransactions() {

    try {

        const response = await fetch(API_URL);

        const transactions = await response.json();


        displayTransactions(transactions);

        updateSummary(transactions);


    } catch (error) {

        console.error(error);

        transactionList.innerHTML =
            '<p class="empty">Could not connect to backend.</p>';

    }

}


// Display transactions
function displayTransactions(transactions) {

    transactionList.innerHTML = "";


    if (transactions.length === 0) {

        transactionList.innerHTML =
            '<p class="empty">No transactions yet.</p>';

        return;

    }


    transactions.forEach(function(transaction) {

        const div = document.createElement("div");

        div.className = "transaction";


        div.innerHTML = `

            <div class="transaction-info">

                <h3>${transaction.description}</h3>

                <p>${transaction.date}</p>

            </div>

            <div>

                <strong class="${transaction.type}">

                    ${transaction.type === "income" ? "+" : "-"}
                    ₹${Number(transaction.amount).toFixed(2)}

                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>

        `;


        transactionList.appendChild(div);

    });

}


// Delete transaction
async function deleteTransaction(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {
            throw new Error("Failed to delete transaction");
        }


        loadTransactions();


    } catch (error) {

        console.error(error);

        alert("Could not delete transaction.");

    }

}


// Update summary
function updateSummary(transactions) {

    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });


    const currentBalance = income - expense;


    totalIncome.textContent =
        "₹" + income.toFixed(2);

    totalExpense.textContent =
        "₹" + expense.toFixed(2);

    balance.textContent =
        "₹" + currentBalance.toFixed(2);

}