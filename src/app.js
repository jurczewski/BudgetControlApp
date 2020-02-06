// BUDGET CONTROLLER
const budgetController = (() => {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = (totalIncome, val) => {
        // I have taken value from argument, because sth is bugged and this.value is undefined
        if (totalIncome > 0) {
            this.percentage = Math.round((val / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = () => {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percantage: -1
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach(cur => sum += cur.value);
        data.totals[type] = sum;
    };

    return {
        addItem: (type, des, val) => {
            let newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure 
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: (type, id) => {

            const ids = data.allItems[type].map((current) => {
                return current.id;
            });

            const index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: () => {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the bugdet: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percantage of income we spent
            if (data.totals.inc > 0) {
                data.percantage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percantage = -1;
            }
        },

        calculatePercentages: () => {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totals.inc, cur.value);
            });
        },

        getPercentages: () => {
            const allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percantage: data.percantage
            }
        },

        testing: () => {
            return data;
        }
    };

})();

// UI CONTROLLER
const UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = (num, type) => {

        /* RULES
         * + or - before number
         * exactly 2 decimal points
         * coma separaitin
         * 
         * 2310.4595 => + 2,310.46
         * 2000 => 2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        const numSplit = num.split('.');

        let int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        const dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,// Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: (obj, type) => {
            // Create HTM: string with placeholder
            // Replace the placeholder text with some actual data
            let html, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `
                <div class="item clearfix" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = `                        
                <div class="item clearfix" id="exp-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__percentage"></div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`;
            }

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeEnd', html);
        },

        deleteListItem: (selectorId) => {

            const element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);

        },

        clearFields: () => {
            const fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

            const fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(current => {
                current.value = "";
                current.description = "";
            });

            fieldsArray[0].focus();
        },

        displayBudget: (obj) => {

            const type = obj.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percantage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percantage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: (percantages) => {

            const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            const nodeListForEach = (list, callback) => {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, (current, index) => {
                if (percantages[index] > 0) {
                    current.textContent = percantages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: () => {
            const now = new Date();

            const year = now.getFullYear();
            const month = now.toLocaleString('en-us', { month: 'long' });
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        getDOMstrings: () => {
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLER
const controller = ((budgetCtrl, UICtrl) => {

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };

    const updatePercentages = () => {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    const updateBudget = () => {

        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const ctrlAddItem = () => {

        //  1. Get the filed input data
        const input = UICtrl.getInput();

        if (input.description != "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    const ctrlDeleteItem = (event) => {

        const itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            //Pattern: inc-1 / exp-1
            const splitId = itemId.split('-');
            const type = splitId[0];
            const id = parseInt(splitId[1]);

            // 1. Delete the item from the data structue
            budgetCtrl.deleteItem(type, id);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemId);

            // 3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: () => {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percantage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();