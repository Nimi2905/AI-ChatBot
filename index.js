
import {process} from "./env";
import { Configuration,OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey:process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

const setupTextarea = document.getElementById('setup-textarea') 
const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')

const exsynopsis=`The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills.
When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds 
with the other pilots, especially the cool and collected Iceman (Val Kilmer). Maverick competing to be the top 
fighter pilot. Maverick gradually earns the respect of his instructors and peers . As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons 
and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
`


document.getElementById("send-btn").addEventListener("click", () => {
  if (setupTextarea.value) {
    const userInput = setupTextarea.value;
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchReply(userInput);
    setTimeout(fetchSynopsis,55000,userInput);
  }
})

async function fetchReply(outline){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate enthusiastic response for idea
    ###
    idea : A group of corrupt lawyers try to send an innocent woman to jail.
    response : Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    idea : ${outline}
    response :
    `,
    max_tokens:50,
  })
  console.log(response);

  movieBossText.innerHTML  = response.data.choices[0].text.trim();
       
}

async function fetchSynopsis(outline){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate movie synopsis based on given idea.Synopsis should include actors name in brackets after each 
    character that suits
    that role.
             ###
             idea : ${exsynopsis}
             ###
             idea : ${outline}
             movie synopsis :

    `,
    max_tokens:500,
  })
  //console.log(response);
  const synopsis = response.data.choices[0].text.trim();
  document.getElementById('output-text').innerHTML  = synopsis;
  fetchTitle(synopsis);
  fetchCast(synopsis);
}

async function fetchTitle(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short and catchy movie title for this synopsis: ${synopsis}`,
    max_tokens: 20,
    temperature: 0.7
  })
  //console.log(response)
  const title=response.data.choices[0].text.trim();
  document.getElementById('output-title').innerText = title;
  
  setTimeout(fetchImagePrompt,70000,title,synopsis);
}

async function fetchCast(synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Extract the names in brackets from the synopsis.
    ###
    synopsis: ${exsynopsis}
    names:Tom Cruise, Val Kilmer
    ###
    synopsis: ${synopsis}
    names:   
    `,
    max_tokens: 30
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
}

async function fetchImagePrompt(title,synopsis){
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate image description based on title and synopsis. There should be no names only visual description.
    ###
    title: Love's Time Warp
    synopsis: When scientist and time traveller Wendy (Emma Watson) is sent back to the 1920s to assassinate a future dictator, she never expected to fall in love with them. As Wendy infiltrates the dictator's inner circle, she soon finds herself torn between her mission and her growing feelings for the leader (Brie Larson). With the help of a mysterious stranger from the future (Josh Brolin), Wendy must decide whether to carry out her mission or follow her heart. But the choices she makes in the 1920s will have far-reaching consequences that reverberate through the ages.
    image description: A silhouetted figure stands in the shadows of a 1920s speakeasy, her face turned away from the camera. In the 
    background, two people are dancing in the dim light, one wearing a flapper-style dress and the other wearing a dapper suit. 
    A semi-transparent image of war is super-imposed over the scene.
    ###
    title:${title}
    synopsis:${synopsis}
    image description:
    `,
    max_tokens: 100,
    temperature:0.8,
  })
  
  fetchImageUrl(response.data.choices[0].text.trim());
}

async function fetchImageUrl(imagePrompt){
  const response = await openai.createImage({
    prompt: `${imagePrompt}. There should be no text in this image.`,
    n: 1,
    size: '256x256',
    response_format: 'b64_json' 
  })
  document.getElementById('output-img-container').innerHTML = `<img src="data:image/png;base64,${response.data.data[0].b64_json}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  movieBossText.innerText = `This idea is so good I'm jealous! It's gonna make you rich for sure! Remember, I want 10% 💰`
  document.getElementById('view-pitch-btn').addEventListener('click', ()=>{
    
    document.getElementById("setup-container").style.display = 'none'
    document.getElementById("output-container").style.display = 'flex'
    
  })
}