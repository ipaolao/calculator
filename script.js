// Get references to the calculator elements
const display = document.querySelector("#display");
const history = document.querySelector("#history");
const buttons = document.querySelector(".calculator-buttons");

// Store the current values
let currentValue = "0";
let expression = [];
let waitingForOperand = false;
let justCalculated = false;

// Shrink the display text until it fits
function shrinkDisplayText() {
  let fontSize = 42;
  display.style.fontSize = `${fontSize}px`;

  while (display.scrollWidth > display.clientWidth && fontSize > 14) {
    fontSize -= 2;
    display.style.fontSize = `${fontSize}px`;
  }
}

// Display text
function renderDisplay(text, allowScientific = false) {
  display.textContent = text;
  shrinkDisplayText();

  if (allowScientific && display.scrollWidth > display.clientWidth) {
    const number = Number(text);

    if (Number.isFinite(number)) {
      display.textContent = number.toExponential(6);
      shrinkDisplayText();
    }
  }
}

function updateDisplay() {
  renderDisplay(currentValue, justCalculated);
}

function showExpression() {
  // Make a copy of the expression for display
  const items = [...expression];

  if (
    currentValue !== "Error" &&
    !waitingForOperand &&
    (items.length === 0 || typeof items.at(-1) === "string")
  ) {
    // Add the current number to the end of the display
    items.push(Number(currentValue));
  }

  // Change values into symbols for display
  const displayText =
    items
      .map((item) => (item === "*" ? "×" : item === "/" ? "÷" : item))
      .join(" ") || currentValue;

  renderDisplay(displayText);
}

// Calculate two numbers using an operator
function calculate(first, second, operator) {
  if (operator === "+") return first + second;
  if (operator === "-") return first - second;
  if (operator === "*") return first * second;
  if (operator === "/") return second === 0 ? NaN : first / second;
  return second;
}

// Input function 
function inputNumber(number) {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    if (justCalculated) expression = [];

    currentValue = number;
    waitingForOperand = false;
    justCalculated = false;
  } else if (currentValue === "0") {
    currentValue = number;
  } else {
    currentValue += number;
  }

  showExpression();
}

// backspace
function backspace() {
  if (currentValue === "Error") {
    resetCalculator();
    return;
  }

  if (waitingForOperand || justCalculated) return;

  currentValue =
    currentValue.length > 1
      ? currentValue.slice(0, -1)
      : "0";

  showExpression();
}

// Add a decimal point 
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

// Change the current number's sign
function toggleSign() {
  if (currentValue !== "0" && currentValue !== "Error") {
    currentValue = currentValue.startsWith("-")
      ? currentValue.slice(1)
      : `-${currentValue}`;

    showExpression();
  }
}

// Divide the current value by 100
function inputPercent() {
  if (currentValue !== "Error") {
    currentValue = String(Number(currentValue) / 100);
    showExpression();
  }
}

// Store an operator and wait for the next input
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

// Evaluate the expression using order of operations
function evaluateExpression(items) {
  const values = [items[0]];
  const operators = [];

  for (let index = 1; index < items.length; index += 2) {
    const operator = items[index];
    const number = items[index + 1];

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

// Calculate 
function calculateResult() {
  // Pressing = again repeats the previous operation
  if (expression.length === 0) {
    if (!justCalculated || lastOperator === null) return;

    const previousResult = Number(currentValue);
    const answer = calculate(previousResult, lastOperand, lastOperator);
    const operatorSymbol =
      lastOperator === "*" ? "×" :
      lastOperator === "/" ? "÷" :
      lastOperator === "-" ? "−" : "+";

    currentValue = Number.isFinite(answer) ? String(answer) : "Error";
    history.textContent =
      `${previousResult} ${operatorSymbol} ${lastOperand} = ${currentValue}`;

    updateDisplay();
    return;
  }

  if (currentValue === "Error" || waitingForOperand) return;

  expression.push(Number(currentValue));

  if (expression.length < 3) return;

  // Save the last operation so = can repeat it
  lastOperator = expression.at(-2);
  lastOperand = expression.at(-1);

  const answer = evaluateExpression(expression);
  const expressionText = expression
    .map((item) => item === "*" ? "×" : item === "/" ? "÷" : item)
    .join(" ");

  currentValue = Number.isFinite(answer) ? String(answer) : "Error";
  history.textContent = `${expressionText} = ${currentValue}`;

  expression = [];
  waitingForOperand = false;
  justCalculated = true;

  updateDisplay();
}

// Reset the calculator
function resetCalculator() {
  currentValue = "0";
  expression = [];
  waitingForOperand = false;
  justCalculated = false;
  history.textContent = "";

  updateDisplay();
}

// Handle button clicks
buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button || !buttons.contains(button)) return;

  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
  }

  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  }

  switch (button.dataset.action) {
    case "clear":
      resetCalculator();
      break;
    case "backspace":backspace();
      break;
    case "decimal":inputDecimal();
      break;
    case "sign":toggleSign();
      break;
    case "percent":inputPercent();
      break;
    case "equals":calculateResult();
      break;
  }
});

// Handle keyboard input
function handleKeyDown(event) {
  let selector;

  if (
    event.key.length === 1 &&
    "0123456789".includes(event.key)
  ) {
    selector = `[data-number="${event.key}"]`;

  } else {
    switch (event.key) {
      case ".":selector = '[data-action="decimal"]';
        break;
      case "+":selector = '[data-operator="+"]';
        break;
      case "-":selector = '[data-operator="-"]';
        break;
      case "*":selector = '[data-operator="*"]';
        break;
      case "/":selector = '[data-operator="/"]';
        break;
      case "Enter":
      case "=":selector = '[data-action="equals"]';
        break;
      case "Backspace":selector = '[data-action="backspace"]';
        break;
      case "c":
      case "C":
      case "Escape":
      Selector = '[data-action="clear"]';
      break;
      case "Escape":selector = '[data-action="clear"]';
        break;
      default: return;
    }
  }

  event.preventDefault();
  buttons.querySelector(selector)?.click();
}

document.addEventListener("keydown", handleKeyDown);
