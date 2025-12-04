
document.getElementById("chamok-btn").onclick = () => {
  document.getElementById("chamok-box").style.display = "flex";
};

async function sendMsg() {
  let msg = document.getElementById("chat-input").value;
  document.getElementById("chat-input").value = "";

  let box = document.getElementById("chat-body");
  box.innerHTML += `<div><b>You:</b> ${msg}</div>`;

  let res = await fetch("YOUR_SERVER_URL/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: msg })
  });

  let data = await res.json();
  box.innerHTML += `<div><b>AI:</b> ${data.answer}</div>`;
  box.scrollTop = box.scrollHeight;
}
