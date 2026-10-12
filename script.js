let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let myChart = null;
const budgetLimits = {
  Food: 5000,
  Travel: 3000,
  Shopping: 4000,
  Education: 150000,
  Other: 20000
};
function addExpense() {
    const name = document.getElementById("expenseName").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (name === "" || amount <= 0 || category === "" || date === "") {
        alert("Please fill all the details!");
        return;
    }

    const expense = {
        name: name,
        amount: amount,
        category: category,
        date: date
    };

    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();

    document.getElementById("expenseName").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
}

function displayExpenses() {
    const expenseList = document.getElementById("expenseList");
    const totalElement = document.getElementById("total");

    expenseList.innerHTML = "";
    let total = 0;

    expenses.forEach((expense, index) => {
        total += expense.amount;

        const div = document.createElement("div");
        div.className = "expense-item";

        div.innerHTML = `
            <div>
                <strong>${expense.name}</strong><br>
                Category: ${expense.category}<br>
                Date: ${expense.date}<br>
                Amount: ₹${expense.amount}
            </div>
            <button onclick="editExpense(${index})">Edit</button>
            <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
        `;

        expenseList.appendChild(div);
    });

    totalElement.textContent = total;
    updateChart();
    updateBudgetUI();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();
}

function editExpense(index) {
    const expense = expenses[index];
    document.getElementById("expenseName").value = expense.name;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;

    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();
}

function clearAllExpenses() {
    expenses = [];
    localStorage.removeItem("expenses");
    displayExpenses();
}

// Chart render chese function
function updateChart() {
    const canvas = document.getElementById("expenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Category-wise totals calculate chestundi
    const categoryTotals = {
        Food: 0,
        Travel: 0,
        Shopping: 0,
        Education: 0,
        Other: 0
    };

    expenses.forEach(item => {
        if (categoryTotals[item.category] !== undefined) {
            categoryTotals[item.category] += item.amount;
        } else {
            categoryTotals["Other"] += item.amount;
        }
    });
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: 'Expenses (₹)',
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
displayExpenses();
function updateBudgetUI() {
  const container = document.getElementById("budget-section");
  if (!container) return;
  
  container.innerHTML = "<h3 style='margin-top:20px;'>Category Budget Limits</h3>";

  const totals = { Food: 0, Travel: 0, Shopping: 0, Education: 0, Other: 0 };
  expenses.forEach(exp => {
    if (totals[exp.category] !== undefined) {
      totals[exp.category] += Number(exp.amount);
    } else {
      totals["Other"] += Number(exp.amount);
    }
  });

  Object.keys(budgetLimits).forEach(cat => {
    const spent = totals[cat] || 0;
    const limit = budgetLimits[cat];
    const percent = Math.min((spent / limit) * 100, 100);

    let color = "green";
    let msg = "";

    if (spent >= limit) {
      color = "red";
      msg = " ⚠️ Limit Exceeded!";
    } else if (percent >= 75) {
      color = "orange";
      msg = " ⚠️ Near Limit!";
    }

    container.innerHTML += `
      <div style="margin: 10px 0; padding: 12px; border: 1px solid #ccc; border-radius: 8px; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color:#333;">${cat}</strong>
          <span style="font-size: 14px;">₹${spent} / ₹${limit} <b style="color:${color}">${msg}</b></span>
        </div>
        <div style="background: #e0e0e0; height: 10px; border-radius: 5px; margin-top: 8px; overflow: hidden;">
          <div style="width: ${percent}%; background: ${color}; height: 100%; border-radius: 5px; transition: width 0.3s ease;"></div>
        </div>
      </div>
    `;
  });
}