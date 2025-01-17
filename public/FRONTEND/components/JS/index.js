import { handleSignupSubmit } from "./signup.js";
import { handleLoginSubmit } from "./login.js";
import { loadContent } from "./loadContent.js";
import { handleChatSubmit } from "./chat.js";
/*import { handleForgotPassword } from "./forgotPassword.js";
import { handleUpdatePassword } from "./updatePassword.js";
import { handleListRange } from "./expenses.js";*/

const signup  = document.getElementById('signup');
const login = document.getElementById('login');
const chatForm = document.getElementById('chatForm');
/*const forgotPassword = document.getElementById('forgotPassword');
const updatePassword = document.getElementById('updatePassword');
const listRange = document.getElementById('listRange');*/

if(signup)  {
    signup.addEventListener('submit', handleSignupSubmit);
}

if(login)   {
    login.addEventListener('submit', handleLoginSubmit);
}

if(chatForm)  {
    chatForm.addEventListener('submit', handleChatSubmit);
}

/*if(forgotPassword)  {
    forgotPassword.addEventListener('submit', handleForgotPassword);
}

if(updatePassword)   {
    updatePassword.addEventListener('submit', handleUpdatePassword);
}

if(listRange)   {
    listRange.addEventListener('change', handleListRange);
}*/

document.addEventListener('DOMContentLoaded', loadContent);