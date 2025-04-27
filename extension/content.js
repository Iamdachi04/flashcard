
// this guy listens message requests from the background.js 
chrome.runtime.onMessage.addListener(

    function(request, sender, sendResponse) {
        // to check somehow that this is what was selected I added action in background.js called get_selected_text;
        if (request.action === "get_selected_text") {
            // curr selected text on the page is in the variable of selectedText
            let selectedText = window.getSelection().toString();
            // we can just print things out to see if they work or not 
            console.log("Flashcard Adder Extension: Received message to get selected text.");
            console.log("Selected Text:", selectedText);
        }
    }
  );