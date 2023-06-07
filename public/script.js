function isSendButtonEnabled(){
  return !(document.getElementById("send").disabled);
}

document.getElementById("inp_text").focus();
document
  .getElementsByTagName("body")[0]
  .addEventListener("keypress", function (e) {
 
    if (e.key === "Enter" && isSendButtonEnabled()) {
      send();
    }
  });

document.getElementById("send").addEventListener("click", send);

async function query(data) {
  const message = await fetch("/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await message.json();
  console.log("API response:", result);
  return result;
}

let conversation = {
  past_user_inputs: [
    "Act as Medea, the scorned wife seeking revenge on Jason. Respond in character using Medea's voice and emotions. Respond in lengthy sentences. You killed Glauce, the daughter of Creon, and Creon, and your own two children.",
  ],
  generated_responses: [
    "I am Medea. I killed my children for revenge against my unfaithful husband, Jason. I am consumed by anger and betrayal.",
  ],
};

async function getReply(text) {
  const modelRequest = {
    inputs: {
      past_user_inputs: conversation.past_user_inputs,
      generated_responses: conversation.generated_responses,
      text: text,
    },
    options: {
      wait_for_model: true,
    },
  };
  console.log("modelRequest: ", modelRequest);
  const response = await query(modelRequest);
  console.log("getReply response:", response);
  conversation = response.conversation;
  console.log("conversation: ", conversation);
  return response;
}

function send() {
  console.log("Send hit");

  let text = document.getElementById("inp_text").value;
  if (text === "") {
    displayError("Please enter a message.");
  } else {
    displayMessage(text, "input");
    
    const load = document.getElementById("load");
    load.classList.remove("hidden");
    document.getElementById("send").disabled = true;
    document.getElementById("inp_text").value = "";

    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Timeout"));
      }, 25000);
    });

    Promise.race([getReply(text), timeoutPromise])
      .then((response) => {
        console.log("Received response: ", response);
        load.classList.add("hidden");
        document.getElementById("send").disabled = false;
        console.log("response.api", response.generated_text);
        displayMessage(response.generated_text, "response");
        let errorMessage = document.getElementById("error");
        errorMessage.innerText = "";
        errorMessage.style.backgroundColor = "null";
      })
      .catch((error) => {
        load.classList.add("hidden");
        document.getElementById("send").disabled = false;
        console.log("Error:", error);
        displayError(
          "Timeout occurred. Please try again after a few seconds––the model may take a few iterations to load."
        );
      });
  }
}


function displayMessage(displayText, messageType){
  let text;
  let className;
  
  if(messageType === "input"){
    text = "JASON: " + displayText;
    className = "past-input";
    
  }
  if(messageType === "response"){
    text = "MEDEA: " + displayText;
    className = "response";
  }
  
  var response = document.createElement("div");
  response.className = className;
  response.innerText = text;
  const chatContainer = document.getElementsByClassName("chat-container")[0];
  const load = document.getElementById("load");
  chatContainer.insertBefore(response, load);
  
}

function displayError(errorMessage) {
  var error = document.getElementById("error");
  error.innerText = errorMessage;
  error.style.backgroundColor = "red";
  
}
