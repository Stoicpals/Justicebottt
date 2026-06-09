// --- JusticeBot Frontend Script --- //

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const clearBtn = document.getElementById("clear-chat");
const downloadBtn = document.getElementById("download-chat");

// --- Typing Indicator --- //
function showTypingIndicator() {
  if (!chatBox) return;

  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing";
  typingDiv.innerHTML = "⚖️ JusticeBot is typing...";
  typingDiv.id = "typing-indicator";

  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) typingDiv.remove();
}

// --- Send Message --- //
async function sendMessage() {
  if (!userInput || !chatBox) return;

  const message = userInput.value.trim();
  if (!message) return;

  displayMessage(message, "user");
  userInput.value = "";

  try {

    showTypingIndicator();

    const response = await fetch("http://127.0.0.1:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();

    removeTypingIndicator();

    await typeMessage(data.reply, "bot");

  } catch (error) {

    removeTypingIndicator();

    displayMessage("⚠️ Could not connect to server.", "bot");

    console.error("Chat Error:", error);
  }
}

// --- Typing Animation --- //
async function typeMessage(text, sender) {
  if (!chatBox) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  chatBox.appendChild(msgDiv);

  const isLocal = text.includes("Relevant Law Found");
  msgDiv.classList.add(isLocal ? "bot-local" : "bot-ai");

  const header = document.createElement("strong");
  header.textContent = "⚖️ JusticeBot: ";
  msgDiv.appendChild(header);

  const content = document.createElement("div");
  content.className = "bot-content";
  msgDiv.appendChild(content);

  for (let i = 0; i < text.length; i++) {
    content.textContent += text[i];
    await new Promise((r) => setTimeout(r, 5));
  }

  const source = document.createElement("div");
  source.className = "source-tag";
  source.textContent = isLocal
    ? "📚 Source: Local Database"
    : "🤖 Source: AI Generated";

  msgDiv.appendChild(source);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Display Messages --- //
function displayMessage(text, sender) {
  if (!chatBox) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `<strong>👤 You:</strong> ${text}`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Clear Chat --- //
if (clearBtn && chatBox) {
  clearBtn.addEventListener("click", () => {
    chatBox.innerHTML =
      '<div class="message bot">⚖️ JusticeBot: Hello! How can I assist you today?</div>';
  });
}

// --- Download Chat --- //
if (downloadBtn && chatBox) {
  downloadBtn.addEventListener("click", () => {
    const messages = [...chatBox.querySelectorAll(".message")]
      .map((m) => m.textContent)
      .join("\n\n");

    const blob = new Blob([messages], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "JusticeBot_Chat.txt";
    link.click();
  });
}

// --- Chat Events --- //
if (sendBtn) sendBtn.addEventListener("click", sendMessage);

if (userInput) {
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// =============================
// ✅ ANALYZER FIXED
// =============================
async function analyzeSituation() {
  const input = document.getElementById("situationInput").value;

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: input }),
  });

  const data = await res.json();

  document.getElementById("result").innerHTML = `
    <div class="message bot">
      ⚖️ <b>Section:</b> ${data.sections} <br><br>
      🚨 <b>Severity:</b> ${data.severity} <br><br>
      📜 <b>Consequences:</b> ${data.consequences} <br><br>
      ✅ <b>Steps:</b> ${data.steps.join("<br>")}
    </div>
  `;
}
// =============================
// ✅ EXPLORER FIXED
// =============================
async function searchLaw() {

  const input = document.getElementById("searchLaw");
  const results = document.getElementById("lawResults");

  if (!input || !results) return;

  const query = input.value.trim();

  if (!query) {
    results.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  try {

    results.innerHTML = "<p>🔍 Searching...</p>";

    const response = await fetch(`http://127.0.0.1:5000/api/explorer?q=${query}`);

    if (!response.ok) throw new Error("Fetch failed");

    const data = await response.json();

    if (!data || data.length === 0) {
      results.innerHTML = "<p>No matching laws found.</p>";
      return;
    }

    results.innerHTML = data.map(law => `
      <div class="law-card">
        <h3>${law.section || "Unknown Section"}</h3>

        <p><strong>Offense:</strong> ${law.offense || "N/A"}</p>

        <p><strong>Description:</strong> ${law.description || "No description available"}</p>

        <p><strong>Punishment:</strong> ${law.punishment || "Not specified"}</p>

        <div class="source-tag">📚 From Legal Database</div>
      </div>
    `).join("");

  } catch (error) {

    console.error("Explorer Error:", error);

    results.innerHTML = "<p>⚠️ Failed to load results.</p>";
  }
}
// =============================
// 📊 DASHBOARD (FIXED VERSION)
// =============================
async function loadDashboard() {
  try {

    const res = await fetch("http://127.0.0.1:5000/api/stats");

    if (!res.ok) throw new Error("Stats API failed");

    const data = await res.json();

    const totalEl = document.getElementById("totalQueries");
    const dbEl = document.getElementById("dbHits");
    const aiEl = document.getElementById("aiFallbacks");
    const sitEl = document.getElementById("situations");
    const table = document.getElementById("tableData");

    if (!totalEl) return; // only run on dashboard page

    totalEl.innerText = data.totalQueries || 0;

    let dbHits = 0;
    let aiHits = 0;

    data.latestChats.forEach(chat => {
      if (chat.botReply.includes("Relevant Law Found")) {
        dbHits++;
      } else {
        aiHits++;
      }
    });

    dbEl.innerText = dbHits;
    aiEl.innerText = aiHits;
    sitEl.innerText = data.latestChats.length;

    table.innerHTML = data.latestChats.map(chat => `
      <tr>
        <td>${chat.userMessage}</td>
        <td>${detectModule(chat)}</td>
        <td>
          <span class="${chat.botReply.includes("Relevant Law Found") ? "badge-db" : "badge-ai"}">
            ${chat.botReply.includes("Relevant Law Found") ? "Database" : "AI"}
          </span>
        </td>
        <td>${(Math.random() * 1).toFixed(1)}s</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Dashboard error:", err);

    const table = document.getElementById("tableData");
    if (table) {
      table.innerHTML = "<tr><td colspan='4'>⚠️ Failed to load dashboard</td></tr>";
    }
  }
}

// Detect module
function detectModule(chat) {
  if (!chat.userMessage) return "Chat";

  if (chat.userMessage.includes("IPC")) return "Explorer";
  if (chat.userMessage.length > 30) return "Analyzer";

  return "Chat";
}

// AUTO LOAD DASHBOARD
if (document.getElementById("totalQueries")) {
  loadDashboard();
  setInterval(loadDashboard, 3000); // refresh every 3s
}

// =============================
// 📊 DASHBOARD CHARTS (ADD THIS)
// =============================
async function loadDashboardCharts() {
  try {

    const res = await fetch("http://127.0.0.1:5000/api/stats");

    if (!res.ok) throw new Error("Stats API failed");

    const data = await res.json();

    let dbCount = 0;
    let aiCount = 0;

    data.latestChats.forEach(chat => {
      if (chat.botReply.includes("Relevant Law Found")) {
        dbCount++;
      } else {
        aiCount++;
      }
    });

    // Destroy old charts
    if (window.sourceChartInstance) window.sourceChartInstance.destroy();
    if (window.queryChartInstance) window.queryChartInstance.destroy();

    // ⚖️ DB vs AI
    const sourceCanvas = document.getElementById("sourceChart");

    if (sourceCanvas) {
      window.sourceChartInstance = new Chart(sourceCanvas, {
        type: "doughnut",
        data: {
          labels: ["Database", "AI"],
          datasets: [{
            data: [dbCount, aiCount]
          }]
        }
      });
    }

    // 📈 Total Queries
    const queryCanvas = document.getElementById("queryChart");

    if (queryCanvas) {
      window.queryChartInstance = new Chart(queryCanvas, {
        type: "bar",
        data: {
          labels: ["Total Queries"],
          datasets: [{
            label: "Queries",
            data: [data.totalQueries || 0]
          }]
        }
      });
    }

  } catch (err) {
    console.error("Chart error:", err);
  }
}

// =============================
// 🔥 CALL CHART FUNCTION
// =============================
if (document.getElementById("sourceChart")) {
  loadDashboardCharts();
}

if (document.getElementById("sourceChart")) {
  loadDashboardCharts();
  setInterval(loadDashboardCharts, 3000); // 🔥 refresh every 3 sec
}