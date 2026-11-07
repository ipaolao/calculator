const display = document.querySelector("#display");
const history = document.querySelector("#history");
const buttons = document.querySelector(".calculator-buttons");

let currentValue = "0";
let expression = [];
let waitingForOperand = false;
let justCalculated = false;

function updateDisplay() {
  display.textContent = currentValue;
}

function showExpression() {
  const items = [...expression];

  if (
    currentValue !== "Error" &&
    !waitingForOperand &&
    (items.length === 0 || typeof items.at(-1) === "string")
  ) {
    items.push(Number(currentValue));
  }

  display.textContent = items
    .map((item) => (item === "*" ? "×" : item))
    .join(" ") || currentValue;
}

function clearSelectedOperator() {
  document.querySelectorAll(".operator").forEach((button) => {
    button.classList.remove("is-selected");
  });
}

function calculate(first, second, operator) {
  if (operator === "+") return first + second;
  if (operator === "-") return first - second;
  if (operator === "*") return first * second;
  if (operator === "/") return second === 0 ? NaN : first / second;
  return second;
}

function evaluateExpression(tokens) {
  const values = [tokens[0]];
  const operators = [];

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const number = tokens[index + 1];

    if (operator === "*" || operator === "/") {
      const previous = values.pop();
      values.push(calculate(previous, number, operator));
    } else {
      values.push(number);
      operators.push(operator);
    }
  }

  let result = values[0];
  for (let index = 0; index < operators.length; index += 1) {
    result = calculate(result, values[index + 1], operators[index]);
  }

  return result;
}

function inputNumber(number) {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    if (justCalculated) expression = [];
    currentValue = number;
    waitingForOperand = false;
    justCalculated = false;
  } else if (currentValue === "0") {
    currentValue = number;
  } else if (currentValue.length < 30) {
    currentValue += number;
  }

  showExpression();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    if (justCalculated) expression = [];
    currentValue = "0.";
    waitingForOperand = false;
    justCalculated = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }

  showExpression();
}

function toggleSign() {
  if (currentValue !== "0" && currentValue !== "Error") {
    currentValue = currentValue.startsWith("-")
      ? currentValue.slice(1)
      : `-${currentValue}`;
    showExpression();
  }
}

function inputPercent() {
  if (currentValue !== "Error") {
    currentValue = String(Number(currentValue) / 100);
    showExpression();
  }
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;

  if (!waitingForOperand) {
    expression.push(Number(currentValue));
  }

  if (expression.length === 0 || typeof expression.at(-1) === "number") {
    expression.push(operator);
  } else {
    expression[expression.length - 1] = operator;
  }

  waitingForOperand = true;
  justCalculated = false;
  showExpression();

}

function calculateResult() {
  if (currentValue === "Error") return;

  if (!waitingForOperand) {
    expression.push(Number(currentValue));
  }

  if (expression.length < 3) return;

  const answer = evaluateExpression(expression);
  const expressionText = expression
    .map((item) => (item === "*" ? "×" : item))
    .join(" ");

  currentValue = Number.isFinite(answer) ? String(answer) : "Error";
  history.textContent = `${expressionText} = ${currentValue}`;
  expression = [];
  waitingForOperand = false;
  justCalculated = true;
  clearSelectedOperator();
  updateDisplay();
}

function resetCalculator() {
  currentValue = "0";
  expression = [];
  waitingForOperand = false;
  justCalculated = false;
  history.textContent = "";
  clearSelectedOperator();
  updateDisplay();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  if (button.dataset.operator) chooseOperator(button.dataset.operator);

  switch (button.dataset.action) {
    case "clear": resetCalculator(); break;
    case "decimal": inputDecimal(); break;
    case "sign": toggleSign(); break;
    case "percent": inputPercent(); break;
    case "equals": calculateResult(); break;
    default: break;
  }
});
