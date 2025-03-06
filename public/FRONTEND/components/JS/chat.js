const persons = document.getElementsByClassName('persons')[0];
const chats = document.getElementsByClassName('chats')[0];
const chatBox = document.getElementsByClassName('chat-box')[0];
const chatTextBox = document.getElementById('chatTextBox');
const scrollableModalBody = document.getElementById('scrollableModalBody');
const addParticipantDiv = document.getElementById('addParticipantDiv');
const addGroupParticipants = [];

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
    localStorage.removeItem("front");
    localStorage.removeItem("lastMsgId");
    localStorage.removeItem("currentMessage");
    localStorage.removeItem("rear");
    localStorage.removeItem("totalChats");
    showToastResult("User sucessfully logged Out");
}

if (window.location.pathname === '/FRONTEND/components/Layout/chat.html') {
    window.addEventListener("DOMContentLoaded", () => {
        getGroupOrPersonList();
        
        // If clicked on link in chat-
        chats.addEventListener("click", (event) => {
            if (event.target.classList.contains('group-invite-link')) {
                const chatMsg = decodeURIComponent(event.target.dataset.msg);
                groupInviteLink(chatMsg);
            }
        });
    });
}

const getGroupOrPersonList = async () => {
    try {
        const token = localStorage.getItem('token');
        const decodedToken = await parseJwt(token);
        const response = await axios.get(`http://localhost:3000/group/get-persons-groups-list`, { headers: {"Authorization": token} });
        if(response.status === 200) {
            const loginBtn = document.getElementById('loginBtn');
            const newGroupBtn = document.getElementById('newGroupBtn');
            
            if(newGroupBtn.className === "btn btn-light text-light me-2 invisible") {
                newGroupBtn.className = "btn btn-light text-light me-2 visible";
            }
            if(loginBtn) {
                showLogOutBtn();
            }

            if(response.data.groupsListData.length <= 0 && response.data.usersListData.length <= 0) {
                showToastResult("You don't have any Friends or Groups to Chat")
            }
            else {
                response.data.groupsListData.forEach((val) => {
                    showGroups(val);
                })
                response.data.usersListData.forEach((val) => {
                    showPersons(val, decodedToken);
                })
            }
        }        
    } 
    catch (err) {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

if(document.getElementById('createGroupAddParticipant'))  {
    document.getElementById('createGroupAddParticipant').onclick = () => {
        addGroupParticipants.push(document.getElementById('groupMembersList').value);
        document.getElementById('groupMembersList').value = "";
        showToastResult("Phone Number Selected")
    }
}

export const handleCreateGroup = (event) => {
    event.preventDefault();
    const myobj = {
        groupName: event.target.groupName.value,
        userIdList: addGroupParticipants
    }

    event.target.reset();
    createGroup(myobj);
    addGroupParticipants.splice(0, addGroupParticipants.length);
}

const createGroup = (obj) => {  
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);

    axios.post('http://localhost:3000/group/create-group', obj, { headers: {"Authorization": token} })
        .then((response) => {
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
            modal.hide();
            //console.log(response.data.createdGroupData);
            //showChat(response.data.newChatMsg, decodedToken);
            showGroups(response.data.createdGroupData);
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

const showGroups = (obj) => {
    const childNode = document.createElement("div");
    childNode.className = "row person fw-semibold text-center p-3 col";
    childNode.id = `sideGroup-${obj.id}`;
    childNode.style.overflowWrap = "break-word";
    childNode.innerText = `${obj.groupName} (Group)`;
    childNode.onclick = () => {
        showChatBox(obj);
    };

    persons.appendChild(childNode);
}

const showPersons = (obj, token) => {
    const childNode = document.createElement("div");
    childNode.className = "row person fw-semibold text-center p-3 col";
    childNode.id = obj.id;
    childNode.style.overflowWrap = "break-word";
    if(obj.id !== token.userId) {
        childNode.innerText = `${obj.fullName} (+91-${obj.phoneNumber})`;
    }
    else {
        childNode.innerText = `${obj.fullName} (You)`;
    }
    childNode.onclick = () => {
        showChatBox(obj);
    };

    persons.appendChild(childNode);
}

const showChatBox = (obj) => {
    const personDetailsBar = document.getElementsByClassName('person-details')[0];
    personDetailsBar.innerHTML = "";
    //chats.innerHTML = "";

    if(obj.fullName)  {
        const childNode = `<div class="row person-name fw-bold p-3 col" style="word-wrap: break-word;" id="${obj.id}">
                        ${obj.fullName} (+91-${obj.phoneNumber})
                        </div>`;
                        
        personDetailsBar.innerHTML += childNode;
    }
    else {
        const childNode = `<div class="row group-name" id="groupBar-${obj.id}">
                                <div class="col col-sm-9 col-md-9 col-lg-10 col-xl-10 col-xxl-10 
                                align-self-center fw-bold p-3" id="group-name-${obj.id}" 
                                style="word-wrap: break-word;">
                                    ${obj.groupName} (Group)
                                </div>
                                <div class="col col-sm-3 col-md-3 col-lg-2 col-xl-2 col-xxl-2 
                                align-self-center">
                                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" 
                                    data-bs-target="#exampleModalCenteredScrollable" id="GroupDetailsModalBtn">
                                        Group Participants
                                    </button>
                                </div>
                           </div>`;
                        
        personDetailsBar.innerHTML += childNode;
    }

    if(obj.groupName) {
        document.getElementById('GroupDetailsModalBtn').onclick = () => {
            getGroupData(obj.id);
        }
    }

    console.log(obj.id);
    if(chatTextBox.className === "input-group chat-input invisible") {
        chatTextBox.className = "input-group chat-input visible";
    }

    const currentMessage = [];
    let front = -1, rear = -1;
    localStorage.setItem("front", JSON.stringify(front));
    localStorage.setItem("rear", JSON.stringify(rear));
    localStorage.setItem("lastMsgId", 0);
    chats.innerHTML = "";

    //setInterval(() => {
        countChats();
        const totalChats = JSON.parse(localStorage.getItem("totalChats"));
        const lastMsgId = JSON.parse(localStorage.getItem('lastMsgId'));
        //console.log(lastMsgId);
        if(lastMsgId <= totalChats)  {
            if(obj.groupName) {
                getChats(lastMsgId, currentMessage, obj.id, null);
            }
            else {
                getChats(lastMsgId, currentMessage, null, obj.id);
            }
        }
            //console.log("All Chats are Displayed");
    //}, 1000);
}

const getGroupData = async (groupId) => {
    try {
        const token = localStorage.getItem('token');
        const decodedToken = parseJwt(token);
        const response = await axios.get(`http://localhost:3000/group/get-group-data/${groupId}`, 
        { headers: { "Authorization": token } });

        if(response.status === 200) {
            //console.log(response.data.groupData);
            showGroupData(response.data.groupData, decodedToken, response.data.isAdmin);
        }
    }
    catch(err) {
        console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

const showGroupData = (groupData, token, isAdmin) => {
    const modalBodyContent = document.getElementById('GroupDetailsModal');
    modalBodyContent.innerHTML = "";
    //console.log(groupData, token.userId);
    //<a href="#" class="copyGroupInvite text-decoration-none" style="word-wrap: break-word;">http://localhost:3000/FRONTEND/components/Layout/chat.html/${groupData.groupInvite}</a>
    const groupInviteNode = `<div class="row groupInvite" id="${groupData.id}">
                    <div class="fs-6 fw-semibold col-auto">
                        Invite via link - 
                    </div>
                    <div class="col-auto mb-3">
                        <a href="#" class="copyGroupInvite text-decoration-none" style="word-wrap: break-word;">http://localhost:3000/chat-app/groupInvite/${groupData.groupInvite}</a>
                    </div>
                    <div class="copyGroupInviteBtn col-auto mb-3">
                        <button type="click" class="btn btn-primary" onclick="copyToClipboard()">
                        Copy Link
                        </button>
                    </div>
                </div>
                <hr />`;
                
    modalBodyContent.innerHTML += groupInviteNode;

    window.copyToClipboard = async () => {
        const element = document.querySelector(".copyGroupInvite");
        const link = await navigator.clipboard.writeText(element.textContent);
        showToastResult("Group Invite link copied");
    }

    groupData.users.forEach((val) => {
        showgroupDetails(val, token, groupData.id, isAdmin);
    })

    document.getElementById('createdGroupName').value = groupData.groupName;
}

const showgroupDetails = (val, token, groupId, isAdmin) => {
    const modalBodyContent = document.getElementById('GroupDetailsModal');
    if(isAdmin) {
        if(val.userGroup.userId === token.userId) {
            addParticipantDiv.className = "visible";
            const childNode = `<div class="row adminDetails justify-content-between g-3 mb-3" id="${val.id}">
                <div class="person fs-6 fw-semibold col-auto text-center">
                    ${val.fullName}(+91-${val.phoneNumber}) - You
                </div>
                <div class="fs-6 fw-semibold col-auto bg-success rounded">
                    Group Admin
                </div>
            </div>
            <hr/>`;

            modalBodyContent.innerHTML += childNode;
        }
        else {
            if(val.userGroup.admin) {
                const childNode = `<div class="row personDetails justify-content-start g-3 mb-3" id="${val.id}">
                    <div class="person fs-6 fw-semibold col-auto text-center">
                        ${val.fullName}(+91-${val.phoneNumber})
                    </div>
                    <div class="col-auto">
                        <button type="click" class="btn btn-primary" id="adminBtn"
                        onclick="handleUpdateGroupAdminData(${val.id}, ${groupId}, ${val.userGroup.admin})">Dismiss Admin</button>
                    </div>
                    <div class="col-auto">
                        <button type="click" class="btn btn-primary" id="removeParticipantBtn"
                        onclick="handleRemoveParticipant(${val.id}, ${groupId})">Remove</button>
                    </div>
                    <div class="col-2 fs-6 fw-semibold bg-success rounded text-center text-wrap">
                        Group Admin
                    </div>
                </div>
                <hr/>`;

                modalBodyContent.innerHTML += childNode;
            }
            else {
                const childNode = `<div class="row personDetails justify-content-between g-3 mb-3" id="${val.id}">
                    <div class="person fs-6 fw-semibold col-auto text-center">
                        ${val.fullName}(+91-${val.phoneNumber})
                    </div>
                    <div class="col-auto">
                        <button type="click" class="btn btn-primary" id="adminBtn"
                        onclick="handleUpdateGroupAdminData(${val.id}, ${groupId}, ${val.userGroup.admin})">Make Group Admin</button>
                    </div>
                    <div class="col-auto">
                        <button type="click" class="btn btn-primary" id="removeParticipantBtn"
                        onclick="handleRemoveParticipant(${val.id}, ${groupId})">Remove</button>
                    </div>
                </div>
                <hr/>`;

                modalBodyContent.innerHTML += childNode;
            }
        }
    }
    else {
        if(document.getElementById('addParticipantDiv')) {
            scrollableModalBody.removeChild(addParticipantDiv);
        }
        if(val.userGroup.userId === token.userId) {
            const childNode = `<div class="row adminDetails justify-content-start g-3 mb-3" id="${val.id}">
                                    <div class="person fs-6 fw-semibold col-auto text-center">
                                        ${val.fullName}(+91-${val.phoneNumber}) - You
                                    </div>
                                </div>
                                <hr/>`;

            modalBodyContent.innerHTML += childNode;
        }
        else {
            if(val.userGroup.admin) {
                const childNode = `<div class="row personDetails justify-content-between g-3 mb-3" id="${val.id}">
                    <div class="person fs-6 fw-semibold col-auto text-center">
                        ${val.fullName}(+91-${val.phoneNumber})
                    </div>
                    <div class="col-auto fs-6 fw-semibold bg-success rounded text-center text-wrap">
                        Group Admin
                    </div>
                </div>
                <hr/>`;

                modalBodyContent.innerHTML += childNode;
            }
            else {
                const childNode = `<div class="row personDetails justify-content-start g-3 mb-3" id="${val.id}">
                    <div class="person fs-6 fw-semibold col-auto text-center">
                        ${val.fullName}(+91-${val.phoneNumber})
                    </div>
                </div>
                <hr/>`;

                modalBodyContent.innerHTML += childNode;
            }  
        }
    }
};

export const handleAddParticipant = (event) => {
    event.preventDefault();
    const phoneNumber = event.target.participantNumber.value;
    const obj = {
        phoneNumber: phoneNumber,
        groupId: document.getElementsByClassName('groupInvite')[0].id
    }

    event.target.reset();
    addParticipant(obj);
}

const addParticipant = async (obj) => {
    const token = localStorage.getItem('token');
    const decodedToken = await parseJwt(token);

    try {
        const response = await axios.post('http://localhost:3000/group/add-participant', 
        obj, { headers: { "Authorization": token } });
        //console.log(response.data);
        if(response.status === 201) {
            //showgroupDetails(response.data.userAddedData[0], decodedToken, response.data.userAddedData);
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModalCenteredScrollable"));
            modal.hide();
            showToastResult(response.data.message);
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

window.handleUpdateGroupAdminData = (userId, groupId, isAdmin) => {
    isAdmin = isAdmin ? false : true;
    const obj = {
        userId: userId,
        groupId: groupId,
        isAdmin: isAdmin
    }
    
    updateGroupAdminData(obj);
}

const updateGroupAdminData = async (obj) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch('http://localhost:3000/group/update-admin', 
        obj, { headers: { "Authorization": token } });
        //console.log(response);
        if(response.status === 200) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModalCenteredScrollable"));
            modal.hide();
            showToastResult(response.data.message);
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

window.handleRemoveParticipant = (userId, groupId) => {
    const obj = {
        userId: userId,
        groupId: groupId,
    }
    
    removeParticipantData(obj);
}

const removeParticipantData = async (obj) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.delete('http://localhost:3000/group/remove-participant', 
        {
            headers: { "Authorization": token },
            data: obj
        });
        if(response.status === 200) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModalCenteredScrollable"));
            modal.hide();
            showToastResult(response.data.message);
        }
    }
    catch (err) {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

const countChats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/chat/count-chat', { headers: {"Authorization": token} });
        if(response.status === 200) {
            showToastResult(response.data.message);
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

const getChats = (lastMsgId, currentMessage, groupId, receiverId) => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:3000/chat/get-chats?lastMsgId=${lastMsgId}&groupId=${groupId}
     &receiverId=${receiverId}`, { headers: {"Authorization": token} })
    .then((response) => {
        if(response.data.usersChat.length <= 0)
        {
            showToastResult("No Chats Happened");
        }
        else  {
            showToastResult(response.data.message);
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
    let receiverId = null;
    let groupId = null;
    if(document.getElementsByClassName('person-name')[0]) {
        receiverId = document.getElementsByClassName('person-name')[0].id;
    }
    else {
        groupId = document.getElementsByClassName('group-name')[0].id;
        groupId = Number(groupId.slice(9));
    }
    const myobj = {
        chatMsg: event.target.chatMsg.value,
        receiverId: receiverId,
        groupId: groupId
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
    //console.log(obj, token);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isLink = urlRegex.test(obj.chatMsg);
    let childNode="";
    if(obj.userId === token.userId) {
        if(isLink)  {
            childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">
            You: <a class="link-primary group-invite-link" data-userid="${obj.userId}"
            data-msg="${encodeURIComponent(obj.chatMsg)}" style=" cursor: pointer;">${obj.chatMsg}</a>
            </div>`;
        }
        else {
            childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">You: ${obj.chatMsg}</div>`;
        }
    }
    else {
        if(isLink)  {
            childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">
            ${obj.user.fullName}: <a class="link-primary group-invite-link" data-userid="${obj.userId}"
            data-msg="${encodeURIComponent(obj.chatMsg)}" style=" cursor: pointer;">${obj.chatMsg}</a>
            </div>`;
        }
        else {
            childNode = `<div class="chat fw-semibold p-3 col" style="word-wrap: break-word;">${obj.user.fullName}: ${obj.chatMsg}</div>`;
        }
    }

    chats.innerHTML += childNode;
}

const groupInviteLink = (chatMsg) => {
    const token = localStorage.getItem('token');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const inviteLink = chatMsg.match(urlRegex);
    inviteLink.forEach((val) => {
        const link = val.slice(43);
        if(val === `http://localhost:3000/chat-app/groupInvite/${link}`)   {
            const obj = {
                groupInvite: link
            }

            groupInviteJoinGroup(obj);
        }
        else {
            window.open(val, '_blank', 'noopener,noreferrer');
        }
    })
};

const groupInviteJoinGroup = async (obj) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:3000/group/join-group-invite`,
        obj, { headers: { "Authorization": token } });

        if(response.status === 201) {
            //console.log(response.data);
            showGroups(response.data.groupData);
            showToastResult(response.data.message);
        }
    }
    catch(err) {
        console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

if(document.getElementById('renameGroupBtn'))   {
    document.getElementById('renameGroupBtn').onclick = () => {
        const myobj = {
            groupName: document.getElementById('createdGroupName').value,
        }
    
        renameGroup(myobj);
    }
}

const renameGroup = async (myobj) => {
    try {
        const token = localStorage.getItem('token');
        const groupId = document.getElementsByClassName('groupInvite')[0].id;

        const response = await axios.patch(`http://localhost:3000/group/rename-group/${groupId}`, 
        myobj, { headers: { "Authorization": token } });
        //console.log(response);
        if(response.status === 201) {
            //console.log(response.data.updatedGroupData);
            const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModalCenteredScrollable"));
            modal.hide();
            showToastResult(response.data.message);
            renameGroupElements(response.data.updatedGroupData);
        }
    } 
    catch (err) {
        //console.log(err);
        if(err.response.status === 500) {
            showToastResult("Something went wrong at Backend");
        }
        else  {
            showToastResult(err.response.data.message);
        }
    }
}

const renameGroupElements = (groupData) => {
    const groupListChild = document.getElementById(`sideGroup-${groupData.id}`);
    groupListChild.innerText = `${groupData.groupName} (Group)`;

    const groupDetailsBarChild = document.getElementById(`group-name-${groupData.id}`);
    groupDetailsBarChild.innerText = `${groupData.groupName} (Group)`;
}

if(document.getElementById('exitGroupBtn')) {
    document.getElementById('exitGroupBtn').onclick = () => {
        const token = localStorage.getItem('token');
        const decodedToken = parseJwt(token);
    
        const myobj = {
            groupId: document.getElementsByClassName('groupInvite')[0].id,
            userId: decodedToken.userId,
        }
    
        removeParticipantData(myobj);
        //removeParticipant(myobj.groupId);
        chatTextBox.className = "input-group chat-input invisible";
        //chats.innerHTML += `<h1 class="fw-bold text-center" style="color: #6610f2;">Group Left</h1>`;
    };
}

/*const removeParticipant = (groupId) => {
    const childNode1 = document.getElementById(`sideGroup-${groupId}`);
    const sideGroupParent = childNode1.parentNode;
    //sideGroupParent.removeChild(childNode1);
    const childNode2 = document.getElementById(`groupBar-${groupId}`);
    const groupBarParent = childNode2.parentNode;
    //groupBarParent.removeChild(childNode2);
    chatTextBox.className = "input-group chat-input invisible";
    chats.innerHTML += `<h1 class="fw-bold text-center" style="color: #6610f2;">Group Left</h1>`;
}*/