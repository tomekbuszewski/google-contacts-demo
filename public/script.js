const DISCOVERY = ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"]
const SCOPES = "https://www.googleapis.com/auth/contacts";
const CONTACT_SCOPE = "names,emailAddresses,phoneNumbers";

const container = document.querySelector("#contacts");
const loadingContainer = document.querySelector("#loading");

const login = () => {
  gapi.auth2.getAuthInstance().signIn();
}

const logout = () => {
  gapi.auth2.getAuthInstance().signOut();
}

const createRandomContact = async () => {
  const random = Date.now();

  loadingContainer.style.display = "block";

  const userPayload = {
    names: [
      {
        givenName: `Random Person ${random}`,
        displayName: `Random Person ${random}`,
      },
    ],
    emailAddresses: [
      { value: `${random}@random.mail` },
    ],
    phoneNumbers: [
      { value: String(random), }
    ]
  }

  await gapi.client.request({
    method: "POST",
    path: "https://people.googleapis.com/v1/people:createContact",
    datatype: "jsonp",
    body: userPayload,
    parent: "",
  });

  setTimeout(getContacts, 3000);
}

const removeContact = async (param) => {
  loadingContainer.style.display = "block";

  await gapi.client.request({
    method: "DELETE",
    path: `https://people.googleapis.com/v1/${param}:deleteContact`,
    datatype: "jsonp",
  });

  setTimeout(getContacts, 3000);
}

const listenOnSignIn = async (isSignedIn) => {
  const logoutButton = document.querySelector("#signoutButton");
  const loginButton = document.querySelector("#authorizeButton");
  const createNewContact = document.querySelector("#createRandomContact");

  if (isSignedIn) {
    loginButton.style.display = "none";
    logoutButton.style.display = "block";
    logoutButton.onclick = logout;

    createNewContact.style.display = "block";
    createNewContact.onclick = createRandomContact;

    return await getContacts();
  }

  logoutButton.style.display = "none";
  loginButton.style.display = "block";
  loginButton.onclick = login;

  container.innerHTML = "";

  createNewContact.style.display = "none";
}

const populateList = (data) => {
  container.innerHTML = "";

  data.forEach(({ names, phoneNumbers, emailAddresses, resourceName }) => {
    container.innerHTML += `<li>${names && names[0].displayName} (phone: ${phoneNumbers && phoneNumbers[0].value}, email: ${emailAddresses && emailAddresses[0].value}) <button data-contactId="${resourceName}">Delete</button></li>`;
  });
}

const getContacts = async () => {
  try {
    const { result } = await gapi.client.people.people.connections.list({
      "resourceName": "people/me",
      "pageSize": 10,
      "personFields": CONTACT_SCOPE,
    });

    populateList(await result.connections);
    loadingContainer.style.display = "none";
  } catch (e) {
    console.error(e);
  }
}

const init = async () => {
  await gapi.client.init({
    apiKey: window.API_KEY,
    clientId: window.CLIENT_ID,
    discoveryDocs: DISCOVERY,
    scope: SCOPES
  });

  gapi.auth2.getAuthInstance().isSignedIn.listen(listenOnSignIn);
  await listenOnSignIn(gapi.auth2.getAuthInstance().isSignedIn.get());

  document.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON" && event.target.dataset.contactid) {
      removeContact(event.target.dataset.contactid);
    }
  });
}

window.addEventListener("load", () => {
  gapi.load("client:auth2", init);
});
