chrome.contextMenus.create({
    //this is the naming convention (id) of our extension
    id: "addToFlashcards", 
    title: "Add to Flashcards", 
    contexts: ["selection"] 
  });
//async because we use await to asynchronously get the information onto the content.js
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    
    // if what we click in contextMenus has an id of addtoflashcard (meaning that we just მოვნიშეთ რაღაც ტექსტი და we right clicked on it and then clicked on add tio flashcard extension)
    //this will trigger this id   id: "addToFlashcards",  და მერე აქ შემოვა ნახავს რომ ეს აიდი არის გამოყენებული და გადააგზავნის ამ ინფოს content.js ში.
    if (info.menuItemId === "addToFlashcards") {
        //await because we need content.js to be running and loaded as well so we wait for this
        // this is one of my reasons why I changed the code for background.js
        // because previously it had some problems sending the text to the content.js , but now he is able to do it.
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
        //now the last step , to just confirm that everything went 'okay'
        console.log("Flashcard Adder: Content script injected successfully.");
        
        await chrome.tabs.sendMessage(tab.id, { action: "get_selected_text" });
        console.log("Flashcard Adder: Message sent to content script.");
    }
});