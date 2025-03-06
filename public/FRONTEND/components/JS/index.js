import { handleSignupSubmit } from "./signup.js";
import { handleLoginSubmit } from "./login.js";
import { loadContent } from "./loadContent.js";
import { handleChatSubmit } from "./chat.js";
import { handleCreateGroup } from "./chat.js";
import { handleAddParticipant } from "./chat.js";

const signup  = document.getElementById('signup');
const login = document.getElementById('login');
const chatForm = document.getElementById('chatForm');
const createGroup = document.getElementById('createGroup');
const addParticipant = document.getElementById('addParticipantForm');

if(signup)  {
    signup.addEventListener('submit', handleSignupSubmit);
}

if(login)   {
    login.addEventListener('submit', handleLoginSubmit);
}

if(chatForm)  {
    chatForm.addEventListener('submit', handleChatSubmit);
}

if(createGroup) {
    createGroup.addEventListener('submit', handleCreateGroup);
}

if(addParticipant)  {
    addParticipant.addEventListener('submit', handleAddParticipant);
}

document.addEventListener('DOMContentLoaded', loadContent);