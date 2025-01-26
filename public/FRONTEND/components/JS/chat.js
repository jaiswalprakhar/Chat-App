const chats = document.getElementsByClassName('chats')[0];
const chatBox = document.getElementsByClassName('chat-box')[0];

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
    //const parentDiv = loginBtn.parentNode;

    //parentDiv.replaceChild(logOutBtn, loginBtn);
    loginBtn.replaceWith(logOutBtn);
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

if (window.location.pathname === '/FRONTEND/components/Layout/chat.html') {
    window.addEventListener("DOMContentLoaded", () => {
        const currentMessage = [];
        let front = -1, rear = -1;
        localStorage.setItem("front", JSON.stringify(front));
        localStorage.setItem("rear", JSON.stringify(rear));
        localStorage.setItem("lastMsgId", 0);
        chats.innerHTML = "";
        /*countChats();

        chatBox.addEventListener("scrollend", () => {
            console.log("Scrolled");
            const totalChats = JSON.parse(localStorage.getItem("totalChats"));
            const lastMsgId = JSON.parse(localStorage.getItem('lastMsgId'));
            //console.log(lastMsgId);
            if(lastMsgId < totalChats)  {
                getChats(lastMsgId, currentMessage);
            }   
            else {
                showToastResult("All Chats are Displayed");
            }
        });*/

        setInterval(() => {
            countChats();
            const totalChats = JSON.parse(localStorage.getItem("totalChats"));
            const lastMsgId = JSON.parse(localStorage.getItem('lastMsgId'));
            //console.log(lastMsgId);
            if(lastMsgId < totalChats)  {
                getChats(lastMsgId, currentMessage);
            }
                console.log("All Chats are Displayed");
        }, 1000);
    });
}

const countChats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/chat/count-chat', { headers: {"Authorization": token} });
        if(response.status === 200) {
            localStorage.setItem("totalChats", response.data.totalChats);
        }
    }
    catch(err) {
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

const getChats = (lastMsgId, currentMessage) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3000/chat/get-chats?lastMsgId=${lastMsgId}`, { headers: {"Authorization": token} })
    .then((response) => {
        const loginBtn = document.getElementById('loginBtn');
        //console.log(response.data);
        //console.log(loginBtn);
        if(loginBtn) {
            showLogOutBtn();
        }
        if(response.data.usersChat.length <= 0)
        {
            showToastResult("No Chats Happened");
        }
        else  {
            //showToastResult(response.data.message);
            //chats.innerHTML = "";
            const decodedToken = parseJwt(token);
            //console.log(decodedToken);

            const lastMsgIdNo = JSON.stringify(response.data.lastMsgId);
            localStorage.setItem("lastMsgId", lastMsgIdNo);

            let front = JSON.parse(localStorage.getItem("front"));
            let rear = JSON.parse(localStorage.getItem("rear"));

            if(rear === 10) {
                currentMessage.shift();
                --rear;
            }
            
            if(rear < 10) {
                if(front === -1 && rear === -1) {
                    ++front;
                    ++rear;
                }
                else {
                    ++rear;
                }
                currentMessage.push(response.data.usersChat);
                //console.log(currentMessage);
                localStorage.setItem("currentMessage", JSON.stringify(currentMessage));

                localStorage.setItem("front", JSON.stringify(front));
                localStorage.setItem("rear", JSON.stringify(rear));
            }
            //console.log(localStorage.getItem("lastMsgId"));
            //console.log(localStorage.getItem("totalChats"));
            const messages = JSON.parse(localStorage.getItem("currentMessage"));
            //console.log(messages[rear]);
            messages[rear].forEach((val) => {
                //console.log(val);
                showChat(val, decodedToken);
            })
        }
    })
    .catch((err) => {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
            /*if(err.response.status === 401) {
                window.location.href = `http://localhost:3000/${err.response.data.redirect}`;
            }*/
        }
    })
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
            //showChat(response.data.newChatMsg, decodedToken);
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
    //console.log(obj, token);
    if(token.userId === obj.userId) {
        const childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word; rounded">You: ${obj.chatMsg}</div>`;
        chats.innerHTML += childNode;
    }
    else {
        const childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">${obj.user.fullName}: ${obj.chatMsg}</div>`;
        chats.innerHTML += childNode;
        //console.log(`Updated response = ${obj}, ${token}`);
    }
}