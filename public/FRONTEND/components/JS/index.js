import { handleSignupSubmit } from "./signup.js";
//import { handleLoginSubmit } from "./login.js";
import { loadContent } from "./loadContent.js";
/*import { handleExpenseSubmit } from "./expenses.js";
import { handleForgotPassword } from "./forgotPassword.js";
import { handleUpdatePassword } from "./updatePassword.js";
import { handleListRange } from "./expenses.js";*/

const signup  = document.getElementById('signup');
/*const login = document.getElementById('login');
const expenses = document.getElementById('expenses');
const forgotPassword = document.getElementById('forgotPassword');
const updatePassword = document.getElementById('updatePassword');
const listRange = document.getElementById('listRange');*/

if(signup)  {
    signup.addEventListener('submit', handleSignupSubmit);
}

/*if(login)   {
    login.addEventListener('submit', handleLoginSubmit);
}

if(expenses)  {
    expenses.addEventListener('submit', handleExpenseSubmit);
}

if(forgotPassword)  {
    forgotPassword.addEventListener('submit', handleForgotPassword);
}

if(updatePassword)   {
    updatePassword.addEventListener('submit', handleUpdatePassword);
}

if(listRange)   {
    listRange.addEventListener('change', handleListRange);
}*/

document.addEventListener('DOMContentLoaded', loadContent);