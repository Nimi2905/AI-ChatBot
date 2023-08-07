import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, get, remove } from 'firebase/database';

import { Configuration, OpenAIApi } from 'openai'
import { process } from './env'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const chatbotConversation = document.getElementById('chatbot-conversation')

const instructionObj =
{
    role: "system",
    content: 'You are a helpful assistant that gives short answer.'
}


const appSetting = {
    databaseURL: process.env.Database,
}

const app = initializeApp(appSetting);

const database = getDatabase(app);

const conversationInDb = ref(database);

//gpt-3.5-turbo
document.addEventListener('submit', (e) => {
    e.preventDefault()
    const userInput = document.getElementById('user-input')

    push(conversationInDb, {
        role: 'user',
        content: userInput.value,
    })
    fetchReply();

    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})

function fetchReply() {
    get(conversationInDb).then(async (snapshot) => {
        if (snapshot.exists) {
            const conversationArr = Object.values(snapshot.val());
            conversationArr.unshift(instructionObj);
            //conversationArr.push(...Object.values(snapshot.val()));


            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationArr,
                temperature: 0,
                frequency_penalty: 0.3,
                presence_penalty: 0,
            })
            const conv = response.data.choices[0].message;
            push(conversationInDb, {
                role: conv.role,
                content: conv.content,
            });
            renderTypewriterText(conv.content);
        }
        else {
            console.log("Data is not available")
        }
    })


}

function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i - 1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 50)
}

document.getElementById('clear-btn').addEventListener('click',()=>{
    remove(conversationInDb);
    location.reload()
})

window.onload = function renderConversationFromDb() {
    console.log("hi")
    get(conversationInDb).then((snapshot) => {
        if (snapshot.exists) {
            const conversationArr = Object.values(snapshot.val());
    
            for (let arr of conversationArr) {
                
                const newSpeechBubble = document.createElement('div')
                if(arr.role === 'user')
                    newSpeechBubble.classList.add('speech', 'speech-human')
                else
                    newSpeechBubble.classList.add('speech', 'speech-ai')
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = arr.content;
                chatbotConversation.scrollTop = chatbotConversation.scrollHeight
            
            }
            /* 
               ({ Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
            */
        }
        else {
            console.log("Data not available");
        }
    })


}
