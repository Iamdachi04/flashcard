debugger;
// this guy listens message requests from the background.js 
chrome.runtime.onMessage.addListener(

    function(request, sender, sendResponse) {
        // to check somehow that this is what was selected I added action in background.js called get_selected_text;
        if (request.action === "get_selected_text") {
            let selectedText = window.getSelection().toString();
            // we can just print things out to see if they work or not
            console.log("Flashcard Adder Extension: Inside get_selected_text block."); // Log that the IF condition was met
            console.log("Selected Text:", selectedText);
        } else {
            // --- ADD THIS ELSE BLOCK ---
            console.log("Flashcard Adder Extension: Received message, but action is NOT 'get_selected_text'."); // Log if the IF condition was NOT met
        }
    }
  );