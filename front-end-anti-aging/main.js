document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    
    let currentMode = 'chat';
    let chatHistory = []; 

    // Mode Toggle Logic
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
            
            // History reset removed. The chatHistory array remains intact across mode switches.
            const modeText = currentMode === 'chat' 
                ? 'Live Chat enabled. Context retained.' 
                : 'Hypothesis Engine enabled. Awaiting problem statement. Context retained.';
            appendMessage(modeText, 'system');
        });
    });

    // Send Message Logic
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        sendBtn.innerText = 'Computing...';

        try {
            const response = await fetch('http://13.62.87.73:5000/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: text, 
                    mode: currentMode,
                    history: chatHistory 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                appendMessage(data.response, 'assistant');
                
                chatHistory.push({"role": "user", "content": text});
                chatHistory.push({"role": "assistant", "content": data.response});
            } else {
                appendMessage(`Error: ${data.error}`, 'system');
            }
        } catch (error) {
            appendMessage("Network error. Could not reach AWS backend.", 'system');
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerText = 'Send';
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    function appendMessage(text, role) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.textContent = text;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});