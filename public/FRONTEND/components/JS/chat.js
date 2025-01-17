const chats = document.getElementsByClassName('chats')[0];

const toastBody = document.getElementsByClassName('toast-body')[0];
const toastLiveExample = document.getElementById('liveToast');

const showToastResult = (message) => {
    toastBody.textContent = message;
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
};

const parseJwt = (token) => {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const showLogOutBtn = () => {
    const logOutBtn = document.createElement('a');
    logOutBtn.className = 'btn btn-light text-light';
    logOutBtn.role = 'button';
    logOutBtn.id = 'logOutBtn';
    logOutBtn.textContent = 'Log Out';
    logOutBtn.onclick = () => { 
        logOut();
        logOutBtn.href = "/FRONTEND/components/Layout/login.html";
    }

    const loginBtn = document.getElementById('loginBtn');
    const parentDiv = loginBtn.parentNode;

    parentDiv.replaceChild(logOutBtn, loginBtn);
}

const logOut = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        showToastResult("User is already logged Out");
        return;
    }

    const tokenDelete = localStorage.removeItem("token");
    showToastResult("User sucessfully logged Out");
}

export const handleChatSubmit = (event) => {
    event.preventDefault();
    const myobj = {
        chatMsg: event.target.chatMsg.value
    }

    event.target.reset();
    createChat(myobj);
}

const createChat = (obj) => {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    //console.log(decodedToken);

    axios.post('http://localhost:3000/chat/create-chat', obj, { headers: {"Authorization": token} })
        .then((response) => {
            //console.log(response.data);
            showChat(response.data.newChatMsg, decodedToken);
            showToastResult(response.data.message); 
        })
        .catch((err) => {
            if(err.response.status === 500) {
                showToastResult("Something went wrong at Backend");
            }
            else  {
                showToastResult(err.response.data.message);
            }
        })
}

const showChat = (obj, token) => {
    if(token.userId === obj.userId) {
        const childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">You: ${obj.chatMsg}</div>`;
        chats.innerHTML += childNode;
    }
    else {
        const childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">${token.name}: ${obj.chatMsg}</div>`;
        chats.innerHTML += childNode;
    }
}