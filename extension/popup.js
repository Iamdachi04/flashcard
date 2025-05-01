// popup.js

// Log to confirm that this script file has been loaded and parsed by the browser
console.log("popup.js loaded!");

// Wait for the popup's HTML content to be fully loaded and parsed before trying to access elements
document.addEventListener('DOMContentLoaded', () => {

    console.log("Popup DOM fully loaded."); // Log to confirm the DOMContentLoaded event fired

    // --- Get references to ALL necessary input fields and the save button ---
    // We do this once when the popup loads, so we can use these references later.
    const frontInput = document.getElementById('frontText');
    const backInput = document.getElementById('backText');
    const hintInput = document.getElementById('hintText');
    const tagsInput = document.getElementById('tagsText');
    const saveButton = document.getElementById('saveButton');
    // --- End element references ---


    // --- Basic error checking: Make sure we found all the elements ---
    // If any essential element is missing in popup.html, log an error
    // and potentially disable the save button, then stop executing this script.
    if (!frontInput || !backInput || !hintInput || !tagsInput || !saveButton) {
        console.error("One or more required elements not found in popup.html! Check your HTML IDs.");
        // Disable the button if we found it, to prevent clicking a non-functional button
        if (saveButton) saveButton.disabled = true;
        // Stop executing the rest of the script as we can't proceed without these elements
        return;
    }
    // --- End error checking ---


    // --- Step 5.2: Get the currently selected text from the active tab and populate the Front textarea ---
    // Use chrome.tabs.query to find the currently active tab in the current window.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // The callback receives an array 'tabs' matching the query. There should be only one.
        if (tabs && tabs.length > 0) {
            const activeTab = tabs[0]; // Get the first (and only) tab object

            console.log("Active tab found:", activeTab.url); // Log the URL of the tab

            // Optional: Check if the tab URL is one where scripting is allowed
            // chrome:// and chrome-extension:// pages often cannot have scripts injected.
             if (activeTab.url && (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://'))) {
                 console.warn("Flashcard Adder Popup: Cannot get selection from restricted page:", activeTab.url);
                 frontInput.placeholder = "Cannot get selection on this page type.";
                 return; // Stop processing for restricted pages
             }


            // Use chrome.scripting.executeScript to run a function inside the active tab's content environment.
            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTab.id }, // Specify the target tab by its ID
                    // The 'func' property takes a function that will be serialized and run IN THE TAB.
                    func: () => {
                        // This code runs *inside* the web page. window.getSelection() is available here.
                        const selectedText = window.getSelection().toString();
                        // Log from inside the content script execution environment (will appear in the tab's console)
                        console.log("Content script function (via executeScript): Selected text is:", selectedText);
                        return selectedText; // The return value is sent back to the callback in the popup.
                    }
                },
                (results) => { // This callback runs back IN THE POPUP after the script in the tab finishes
                    // 'results' is an array containing the return values from the function executed in each frame.
                    // results[0].result will contain the return value from the main frame.
                    console.log("chrome.scripting.executeScript results received in popup:", results);

                    // Check if we got a valid result back from the script execution
                    if (results && results.length > 0 && results[0] && results[0].result !== undefined) {
                        const selectedText = results[0].result; // Get the returned value (the selected text)

                        // Populate the "Front" textarea in the popup with the retrieved text
                        frontInput.value = selectedText;

                        console.log("Selected text populated into Front textarea:", selectedText); // Confirmation log in popup's console
                    } else {
                         console.warn("No selected text retrieved from the tab or script execution failed.");
                         // If no text was selected or something went wrong, maybe update the placeholder
                         // frontInput.placeholder = "No text selected. Enter manually.";
                    }
                }
            );

        } else {
            // This case is unlikely for a popup associated with a browser action button,
            // but it's good to handle situations where the active tab might not be available.
            console.error("Could not retrieve active tab information.");
            frontInput.placeholder = "Error getting selected text.";
        }
    });
    // --- End Step 5.2 ---


    // --- Step 5.3 & 5.4: Add an event listener to the Save button and retrieve input values when clicked ---
    // Add a 'click' event listener to the save button.
    saveButton.addEventListener('click', async () => { // Made async for future fetch/storage operations
        // This function will be executed every time the user clicks the "Save Flashcard" button.

        console.log("Save button clicked!"); // Log to confirm the button click is detected

        // --- Step 5.4: Retrieve the current values from the input fields ---
        const frontValue = frontInput.value;
        const backValue = backInput.value;
        const hintValue = hintInput.value;
        const tagsValue = tagsInput.value;

        // Process the tags value: split by commas, trim whitespace, and filter out empty strings
        const tagsArray = tagsValue
                            .split(',') // Split the string by commas
                            .map(tag => tag.trim()) // Remove leading/trailing whitespace from each tag
                            .filter(tag => tag.length > 0); // Remove any tags that are empty after trimming

        // Log the retrieved and processed values for debugging
        console.log("Retrieved Values:");
        console.log("Front:", frontValue);
        console.log("Back:", backValue);
        console.log("Hint:", hintValue);
        console.log("Tags Array:", tagsArray); // This will be an array of strings


        // --- Step 5.5: Send a POST request to the backend /api/addcard endpoint ---
        // This part is not implemented yet, but this is where you would add your fetch() call.
        // You would use the variables frontValue, backValue, hintValue, and tagsArray here.

        const flashcardData = {
            front: frontValue,
            back: backValue,
            hint: hintValue,
            tags: tagsArray
        };

        console.log("Flashcard data prepared for sending:", flashcardData);


        const backendUrl = 'http://localhost:3001/api/addcard'; // <--- *** REPLACE THIS URL ***

        try {
            console.log("Attempting to send POST request to:", backendUrl);

            // Use the fetch API to send the request
            const response = await fetch(backendUrl, {
                method: 'POST', // Specify the method
                headers: {
                    // Set the Content-Type header to tell the backend the body is JSON
                    'Content-Type': 'application/json'
                    // *** IMPORTANT: Add any required authentication headers here if your backend needs them ***
                    // e.g., 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                },
                // Convert the JavaScript object to a JSON string for the request body
                body: JSON.stringify(flashcardData)
            });

            // --- Step 5.6 will start here: Handle the response ---
            // Check if the HTTP status code indicates success (2xx status codes are usually success)
            if (!response.ok) {
                // If response.ok is false, it means an HTTP error occurred (e.g., 404, 500, 400).
                // Read the response body to get potential error details from the backend.
                const errorBody = await response.text(); // Or response.json() if your backend sends JSON errors
                console.error(`HTTP error! Status: ${response.status}`, errorBody);
                // Throw an error to be caught by the catch block
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // If the response is OK, parse the JSON response from the backend.
            // This assumes your backend returns JSON on success.
            const result = await response.json();
            console.log("Flashcard saved successfully:", result);

            // Step 5.6: Handle success (e.g., show a message, clear the form, close the popup)
            // Example: Display a simple success message (you might want a better UI element)
            // alert("Flashcard saved successfully!"); // Simple alert
            // Example: Clear the form fields
            // frontInput.value = '';
            // backInput.value = '';
            // hintInput.value = '';
            // tagsInput.value = '';
            // Example: Close the popup after successful save
            // window.close();


        } catch (error) {
            // --- Step 5.6: Handle network errors or errors during the fetch/response process ---
            console.error("Failed to send flashcard data or process response:", error);
            // Example: Show an error message to the user (you might want a better UI element)
            // alert("Failed to save flashcard. Please check the console for details."); // Simple alert
        }


    });
    // --- End Step 5.3 & 5.4 ---


    // Any other code that needs to run after the DOM is ready but is not part of
    // the initial load or button click logic can go here within this listener.

});

// Any code written outside the DOMContentLoaded listener runs as soon as popup.js
// is executed, potentially before the HTML elements are available.
// chrome API calls are generally safe to put outside if they don't interact with the DOM.

