// BUDGET CONTROLLER
const budgetController = (() => {

    // Some code

})();

// UI CONTROLLER
const UIController = (() => {

    // Some code

})();



// GLOBAL APP CONTROLER
const controller = ((budgetCtrl, UICtrl) => {

    const ctrlAddItem = () => {

        //  1. Get the filed input data

        // 2. Add the item to the budget controller

        // 3. Add the item to the UI

        // 4. Calculate budget

        // 5. Display the budget on the UI

        console.log('It works.');
    };

    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', (event) => {

        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();        
        }

    });

})(budgetController, UIController);