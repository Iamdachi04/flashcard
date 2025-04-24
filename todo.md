## To-Do List (Split Between 4 People)

**Person 1 (Backend - Database & Practice Logic):**

- Step 1.1: Install `better-sqlite3`.
- Step 1.2: Initialize SQLite connection.
- Step 1.3: Create `flashcards` table.
- Step 6.1 - 6.7: Implement `/api/practice`.
- Step 13.1 - 13.5: Implement `/api/statistics`.

**Person 2 (Backend - Add & Update Card Logic):**

- Step 2.1 - 2.5: Implement `/api/addcard`.
- Step 8.1 - 8.10: Implement `/api/updatepractice`.

**Person 3 (Browser Extension):**

- Step 3.1 - 3.5: Basic extension structure and context menu.
- Step 4.1 - 4.5: Pop-up UI.
- Step 5.1 - 5.6: Populate pop-up and send data to `/api/addcard`.

**Person 4 (Frontend - Practice Flow & Camera):**

- Step 7.1 - 7.4: Request practice cards from `/api/practice`.
- Step 9.1 - 9.4: Basic camera access.
- Step 10.1 - 10.5: TensorFlow.js integration.
- Step 11.1 - 11.4: Basic gesture recognition logic and feedback.
- Step 12.1 - 12.8: Send practice results to `/api/updatepractice`.

## Detailed Blueprint

**Phase 1: Backend Restructuring and Database Integration (Person 1 & 2)**

1.  **Set up SQLite:** Integrate SQLite into the existing backend Node.js application.
2.  **Define Database Schema:** Create the `flashcards` and `practice_records` tables in the SQLite database according to the specified schema.
3.  **Implement `/api/addcard`:** Modify the existing backend to handle POST requests to `/api/addcard`, insert new flashcards into the `flashcards` table (with `scheduledDay` defaulting to 0), and return a success response.
4.  **Implement `/api/updatepractice`:** Create a new API endpoint to handle POST requests to `/api/updatepractice`. This endpoint will:
    - Retrieve `oldDay` from the `flashcards` table.
    - Calculate `newDay` based on the provided `difficulty`.
    - Insert a new record into `practice_records`.
    - Update the `scheduledDay` in the `flashcards` table.
5.  **Implement `/api/practice`:** Create a new API endpoint to handle GET requests to `/api/practice?day=X`. This endpoint will query the `flashcards` table based on the scheduling logic (`day % 2^(scheduledDay) == 0`) and return an array of flashcards.
6.  **Implement Statistics Retrieval:** Create a new API endpoint (e.g., `/api/statistics`) that executes the SQL queries to retrieve the specified statistics and returns them as a JSON object.

**Phase 2: Browser Extension Development (Person 3)**

1.  **Basic Extension Structure:** Create the basic files for a browser extension (manifest.json, background script, content script, pop-up HTML/CSS/JS).
2.  **Context Menu Integration:** Implement the right-click context menu option "Add to Flashcards".
3.  **Pop-up UI:** Develop the UI for the "Add to Flashcards" pop-up with fields for front, back, hint, and tags, and a save button.
4.  **Communication with Backend:** Implement the logic in the pop-up's JavaScript to send a POST request to the backend's `/api/addcard` endpoint with the data entered by the user.
5.  **Basic Error Handling in Extension:** Implement basic error handling for API requests in the extension and display simple feedback to the user.

**Phase 3: Frontend Integration and Camera Handling (Person 4)**

1.  **Request Practice Cards:** Modify the existing frontend to fetch practice cards from the `/api/practice` endpoint, providing the current "day" as a query parameter. The frontend will manage the `currentDay` (starting at 0 and incrementing after each completed practice session).
2.  **Basic Camera Access:** Implement basic camera access in the frontend to display the camera feed to the user during a practice session.
3.  **TensorFlow.js Integration (Handpose/MediaPipe Hands):** Integrate a TensorFlow.js hand tracking model (like Handpose or MediaPipe Hands) into the frontend to detect hand landmarks.
4.  **Gesture Recognition Logic:** Implement the logic to recognize the "easy," "hard," and "wrong" hand gestures based on the detected landmarks. Provide visual feedback of the detected hand and recognized gesture.
5.  **Send Practice Results:** When a gesture is recognized after the answer is revealed, send a POST request to the backend's `/api/updatepractice` endpoint with the `cardId`, current `timestamp`, and the integer representation of the recognized `difficulty`.

## Iterative Chunks and Smaller Steps

Let's break this down into smaller, iterative chunks with even smaller implementation steps.

**Chunk 1: Backend - SQLite Setup and `flashcards` Table (Person 1)**

- **Step 1.1:** Install the `better-sqlite3` package in the backend.
- **Step 1.2:** Create a database file (if it doesn't exist) and establish a connection to it in your backend code.
- **Step 1.3:** Write and execute the SQL to create the `flashcards` table with the specified columns and constraints (`id`, `front`, `back`, `hint`, `tags`, `scheduledDay`).

```text
# Prompt 1.1 (Person 1): Backend - Install better-sqlite3
Add the `better-sqlite3` package as a dependency to your existing backend Node.js project using npm or yarn.
```

```text
# Prompt 1.2 (Person 1): Backend - Initialize SQLite Connection
In your main backend file (e.g., `server.ts` or `app.ts`), establish a connection to an SQLite database file named `flashcards.db`. If the file doesn't exist, it should be created. Store the database object in a module-level variable for later use.
```

````text
# Prompt 1.3 (Person 1): Backend - Create flashcards Table
Write and execute an SQL query using the `better-sqlite3` connection to create the `flashcards` table with the following schema:
```sql
CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    hint TEXT,
    tags TEXT,
    scheduledDay INTEGER NOT NULL DEFAULT 0
);
````

Make sure to handle potential errors during table creation (log them to the console).

**Chunk 2: Backend - Implement `/api/addcard` (Person 2)**

- **Step 2.1:** Define a route handler for POST requests to `/api/addcard` in your backend framework (e.g., Express.js).
- **Step 2.2:** Inside the handler, extract the `front`, `back`, `hint`, and `tags` from the request body.
- **Step 2.3:** Construct an SQL `INSERT` statement to add a new row to the `flashcards` table with the extracted data and `scheduledDay` set to 0.
- **Step 2.4:** Execute the `INSERT` statement using the `better-sqlite3` connection.
- **Step 2.5:** Send a JSON response back to the client indicating success (e.g., with a 201 Created status and optionally the new `id`). Implement basic error handling (e.g., if the insertion fails, send a 500 error).

```text
# Prompt 2.1 (Person 2): Backend - Define /api/addcard Route
In your backend routing setup, define a new route that listens for POST requests to the `/api/addcard` endpoint. Link this route to a new handler function (e.g., `handleAddCard`).
```

```text
# Prompt 2.2 (Person 2): Backend - Extract Data in addCard Handler
Inside the `handleAddCard` function, retrieve the `front`, `back`, `hint`, and `tags` properties from the JSON body of the incoming POST request.
```

````text
# Prompt 2.3 (Person 2): Backend - Construct INSERT Query
Construct an SQL `INSERT` statement as a string to insert data into the `flashcards` table. Use placeholders (`?`) for the values to be inserted.
```sql
INSERT INTO flashcards (front, back, hint, tags, scheduledDay) VALUES (?, ?, ?, ?, 0)
````

```text
# Prompt 2.4 (Person 2): Backend - Execute INSERT Query
Using the `better-sqlite3` connection, prepare and execute the `INSERT` statement with the extracted `front`, `back`, `hint`, and `tags` values.
```

```text
# Prompt 2.5 (Person 2): Backend - Send Response for addCard
After successfully executing the `INSERT` statement, send a JSON response to the client with a 201 Created status code and a success message (optionally include the `id` of the newly inserted card). If an error occurs during insertion, send a 500 Internal Server Error response with an error message.
```

**Chunk 3: Browser Extension - Basic Structure and Context Menu (Person 3)**

- **Step 3.1:** Create the `manifest.json` file with the necessary permissions (contextMenus, activeTab, storage) and basic extension information (name, version, description).
- **Step 3.2:** Create a background script (`background.js`) and implement the logic to add a right-click context menu item with the title "Add to Flashcards".
- **Step 3.3:** In the background script, add a listener for clicks on the "Add to Flashcards" context menu item. When clicked, it should send a message to the content script running on the active tab.
- **Step 3.4:** Create a content script (`content.js`) that listens for the message from the background script. When the message is received, it should get the currently selected text on the page.
- **Step 3.5:** For now, log the selected text to the browser's extension console to verify the communication flow.

````text
# Prompt 3.1 (Person 3): Extension - Create manifest.json
Create a `manifest.json` file for your browser extension with the following basic structure and permissions:
```json
{
  "manifest_version": 3,
  "name": "Flashcard Adder",
  "version": "0.1",
  "description": "Add selected text as flashcards",
  "permissions": ["contextMenus", "activeTab", "storage"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
````

```text
# Prompt 3.2 (Person 3): Extension - Implement Context Menu
In your `background.js` file, use the `chrome.contextMenus` API to create a right-click context menu item with the title "Add to Flashcards".
```

```text
# Prompt 3.3 (Person 3): Extension - Listen for Context Menu Click
In `background.js`, add an event listener that triggers when the "Add to Flashcards" context menu item is clicked. Inside the listener, send a message to the content script running in the currently active tab using `chrome.tabs.sendMessage`.
```

```text
# Prompt 3.4 (Person 3): Extension - Get Selected Text in Content Script
In your `content.js` file, add a listener for messages from the background script using `chrome.runtime.onMessage.addListener`. When a message is received, get the currently selected text on the webpage using `window.getSelection().toString()`.
```

```text
# Prompt 3.5 (Person 3): Extension - Log Selected Text
Inside the message listener in `content.js`, log the retrieved selected text to the browser's extension console using `console.log()`. Verify that clicking the context menu item logs the selected text.
```

**Chunk 4: Browser Extension - Pop-up UI (Person 3)**

- **Step 4.1:** Create an HTML file (`popup.html`) for the extension's pop-up. This file should include the input fields for "Front" (textarea), "Back" (textarea), "Hint" (text input), "Tags" (text input), and a "Save" button.
- **Step 4.2:** Create a CSS file (`popup.css`) to style the pop-up UI. Keep it simple for now.
- **Step 4.3:** Link the CSS file to the HTML file.
- **Step 4.4:** Update the `manifest.json` to define the browser action and link it to `popup.html`.
- **Step 4.5:** In the background script (`background.js`), when the "Add to Flashcards" context menu is clicked, instead of sending a message to the content script, open the extension's pop-up.

```text
# Prompt 4.1 (Person 3): Extension - Create popup.html
Create a basic HTML file named `popup.html` for the browser extension's pop-up. Include the following elements:
- A textarea with the ID `frontText` for the "Front" of the card.
- A textarea with the ID `backText` for the "Back" of the card.
- An input field of type "text" with the ID `hintText` for the "Hint".
- An input field of type "text" with the ID `tagsText` for the "Tags".
- A button with the ID `saveButton` labeled "Save".
```

```text
# Prompt 4.2 (Person 3): Extension - Create popup.css
Create a simple CSS file named `popup.css` to style the elements in `popup.html`. Provide basic styling for readability.
```

```text
# Prompt 4.3 (Person 3): Extension - Link CSS to HTML
Link the `popup.css` file to your `popup.html` file using a `<link>` tag in the `<head>` section.
```

````text
# Prompt 4.4 (Person 3): Extension - Update manifest.json for Pop-up
Update your `manifest.json` file to include a `browser_action` (for Manifest V2) or `action` (for Manifest V3) definition that points to your `popup.html` file. This will make the extension's icon clickable and open the pop-up. Remove the `content_scripts` section for now, we'll re-introduce communication later.
```json
{
  "manifest_version": 3,
  "name": "Flashcard Adder",
  "version": "0.1",
  "description": "Add selected text as flashcards",
  "permissions": ["contextMenus", "activeTab", "storage"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
````

(Adjust `manifest_version` and `background` key accordingly if you are using Manifest V2).

```text
# Prompt 4.5 (Person 3): Extension - Open Pop-up on Context Menu Click
Modify your `background.js` file. When the "Add to Flashcards" context menu item is clicked, use `chrome.action.openPopup()` (or `chrome.browserAction.openPopup()` for Manifest V2) instead of sending a message to a content script.
```

**Chunk 5: Browser Extension - Populate Pop-up and Send Data (Person 3)**

- **Step 5.1:** Create a JavaScript file (`popup.js`) and link it to `popup.html`.
- **Step 5.2:** In `popup.js`, when the pop-up is opened, get the currently selected text from the active tab using `chrome.tabs.query` and `chrome.scripting.executeScript` to run code in the content script to get the selection. Populate the "Front" textarea with this text.
- **Step 5.3:** Add an event listener to the "Save" button in `popup.js`.
- **Step 5.4:** When the "Save" button is clicked, retrieve the values from the "Front," "Back," "Hint," and "Tags" input fields in `popup.js`.
- **Step 5.5:** Send a POST request to the backend's `/api/addcard` endpoint with a JSON payload containing this data.
- **Step 5.6:** Handle the response from the backend (log success or error to the pop-up's console).

```text
# Prompt 5.1 (Person 3): Extension - Create popup.js and Link
Create a JavaScript file named `popup.js` and link it to the end of the `<body>` section in your `popup.html` file.
```

```text
# Prompt 5.2 (Person 3): Extension - Populate Front Textarea
In `popup.js`, when the pop-up loads, use `chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { ... });` to get the active tab. Then, use `chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: () => window.getSelection().toString() }, (results) => { ... });` to get the selected text from the content script and populate the `value` of the `frontText` textarea.
```

```text
# Prompt 5.3 (Person 3): Extension - Add Save Button Listener
In `popup.js`, get a reference to the "Save" button using its ID (`saveButton`) and add an event listener that will execute a function when the button is clicked.
```

```text
# Prompt 5.4 (Person 3): Extension - Retrieve Input Values
Inside the "Save" button's event listener in `popup.js`, get the current values from the `frontText`, `backText`, `hintText`, and `tagsText` input fields. For the `tagsText`, split the value by commas to create an array of tags.
```

```text
# Prompt 5.5 (Person 3): Extension - Send POST Request
Using the `fetch` API in `popup.js`, send a POST request to your backend's `/api/addcard` endpoint. Include the retrieved data as a JSON body in the request. Make sure to set the `Content-Type` header to `application/json`.
```

```text
# Prompt 5.6 (Person 3): Extension - Handle Backend Response
In `popup.js`, after sending the `fetch` request, handle the response. Log a success message to the pop-up's console if the backend returns a successful status code (e.g., 201). If there's an error, log an error message to the console.
```

**Chunk 6: Backend - Implement `/api/practice` (Person 1)**

- **Step 6.1:** Define a route handler for GET requests to `/api/practice` in your backend framework.
- **Step 6.2:** Inside the handler, extract the `day` parameter from the query string of the request.
- **Step 6.3:** Construct an SQL `SELECT` statement to retrieve flashcards from the `flashcards` table where the condition `day % CAST(POW(2, scheduledDay) AS INTEGER) == 0` is met. Use a placeholder for the `day` parameter.
- **Step 6.4:** Prepare and execute the SQL query using the `better-sqlite3` connection, binding the received `day` value to the placeholder.
- **Step 6.5:** Fetch all the resulting rows.
- **Step 6.6:** Format the retrieved data into a JSON array of flashcard objects (each object containing `id`, `front`, `back`, `hint`, `tags`).
- **Step 6.7:** Send this JSON array as the response to the frontend. Implement basic error handling (e.g., if the query fails, send a 500 error).

```text
# Prompt 6.1 (Person 1): Backend - Define /api/practice Route
In your backend routing setup, define a new route that listens for GET requests to the `/api/practice` endpoint. Link this route to a new handler function (e.g., `handlePracticeRequest`).
```

```text
# Prompt 6.2 (Person 1): Backend - Extract Day Parameter
Inside the `handlePracticeRequest` function, retrieve the value of the `day` parameter from the query string of the incoming GET request.
```

````text
# Prompt 6.3 (Person 1): Backend - Construct SELECT Query for Practice Cards
Construct an SQL `SELECT` statement as a string to retrieve `id`, `front`, `back`, `hint`, and `tags` from the `flashcards` table. The `WHERE` clause should filter cards based on the condition: `? % CAST(POW(2, scheduledDay) AS INTEGER) == 0`. Use a placeholder (`?`) for the `day` parameter.
```sql
SELECT id, front, back, hint, tags FROM flashcards WHERE ? % CAST(POW(2, scheduledDay) AS INTEGER) == 0
````

```text
# Prompt 6.4 (Person 1): Backend - Execute SELECT Query
Using the `better-sqlite3` connection, prepare and execute the `SELECT` statement with the received `day` value bound to the placeholder.
```

```text
# Prompt 6.5 (Person 1): Backend - Fetch All Results
Fetch all the rows returned by the executed SQL query.
```

````text
# Prompt 6.6 (Person 1): Backend - Format Response for Practice Cards
Format the fetched rows into a JSON array. Each element in the array should be an object representing a flashcard with the keys `id`, `front`, `back`, `hint`, and `tags`.
```json
[
  {"id": 1, "front": "...", "back": "...", "hint": "...", "tags": "..."},
  {"id": 2, "front": "...", "back": "...", "hint": "...", "tags": "..."},
  // ... more cards
]
````

```text
# Prompt 6.7 (Person 1): Backend - Send Response for /api/practice
Send the JSON array of flashcards as the response to the frontend with a 200 OK status code. Implement basic error handling: if the query fails, send a 500 Internal Server Error response with an error message.
```

**Chunk 7: Frontend - Request Practice Cards (Person 4)**

- **Step 7.1:** In your existing frontend code, identify the section where a practice session is initiated.
- **Step 7.2:** Implement a mechanism to store and manage the `currentDay` (initialize it to 0). Ensure this value persists across sessions (e.g., using local storage).
- **Step 7.3:** When the practice session starts, make a GET request to the backend's `/api/practice` endpoint. Include the current value of `currentDay` as a query parameter (e.g., `/api/practice?day=${currentDay}`).
- **Step 7.4:** Handle the response from the backend. If successful, parse the JSON array of flashcards and store it in your frontend state for the practice session. Implement basic error handling (e.g., display an error message to the user if the request fails).

```text
# Prompt 7.1 (Person 4): Frontend - Identify Practice Start
Locate the part of your frontend code that is executed when a user begins a practice session.
```

```text
# Prompt 7.2 (Person 4): Frontend - Manage currentDay
Implement a variable in your frontend to store the `currentDay`. Initialize it to 0 when the application loads or the user logs in. Use `localStorage` to persist this value across browser sessions. Provide functions to get and set the `currentDay`.
```

```text
# Prompt 7.3 (Person 4): Frontend - Fetch Practice Cards
When the practice session starts, use the `fetch` API to make a GET request to the `/api/practice` endpoint on your backend. Append the current value of your `currentDay` variable as a query parameter named `day` in the URL.
```

```text
# Prompt 7.4 (Person 4): Frontend - Handle Practice Card Response
Handle the response from the `/api/practice` request. If the response status is OK, parse the JSON body into an array of flashcard objects and store this array in your frontend's state management system. If the request fails, display an error message to the user indicating that practice cards could not be loaded.
```

**Chunk 8: Backend - Implement `/api/updatepractice` (Person 2)**

- **Step 8.1:** Define a route handler for POST requests to `/api/updatepractice` in your backend framework.
- **Step 8.2:** Inside the handler, extract the `cardId`, `timestamp`, and `difficulty` from the JSON body of the request.
- **Step 8.3:** Construct an SQL `SELECT` statement to retrieve the current `scheduledDay` from the `flashcards` table for the given `cardId`.
- **Step 8.4:** Execute the `SELECT` query and fetch the `scheduledDay` (the `oldDay`).
- **Step 8.5:** Implement the logic to calculate the `newDay` based on the received `difficulty` and the `oldDay`:
  - Easy (e.g., 1): `newDay = oldDay + 1`
  - Hard (e.g., 2): `newDay = Math.max(0, oldDay - 1)`
  - Wrong (e.g., 3): `newDay = 0`
- **Step 8.6:** Construct an SQL `INSERT` statement to add a new record to the `practice_records` table with `cardId`, `timestamp`, `difficulty`, `oldDay`, and `newDay`.
- **Step 8.7:** Execute the `INSERT` statement.
- **Step 8.8:** Construct an SQL `UPDATE` statement to update the `scheduledDay` in the `flashcards` table for the given `cardId` with the calculated `newDay`.
- **Step 8.9:** Execute the `UPDATE` statement.
- **Step 8.10:** Send a JSON response back to the client indicating success. Implement basic error handling (e.g., if any database operation fails, send a 500 error).

```text
# Prompt 8.1 (Person 2): Backend - Define /api/updatepractice Route
In your backend routing setup, define a new route that listens for POST requests to the `/api/updatepractice` endpoint. Link this route to a new handler function (e.g., `handleUpdatePractice`).
```

```text
# Prompt 8.2 (Person 2): Backend - Extract Data in updatePractice Handler
Inside the `handleUpdatePractice` function, retrieve the `cardId`, `timestamp`, and `difficulty` properties from the JSON body of the incoming POST request.
```

````text
# Prompt 8.3 (Person 2): Backend - Construct SELECT Query for oldDay
Construct an SQL `SELECT` statement to retrieve the `scheduledDay` from the `flashcards` table for the given `cardId`.
```sql
SELECT scheduledDay FROM flashcards WHERE id = ?
````

```text
# Prompt 8.4 (Person 2): Backend - Execute SELECT and Fetch oldDay
Using the `better-sqlite3` connection, prepare and execute the `SELECT` statement with the received `cardId`. Fetch the result and store the `scheduledDay` as `oldDay`.
```

```text
# Prompt 8.5 (Person 2): Backend - Calculate newDay
Implement the logic in your `handleUpdatePractice` function to calculate `newDay` based on the received `difficulty` and the retrieved `oldDay` according to the specified rules (easy +1, hard max(0, -1), wrong 0). Assume the frontend sends difficulty as an integer (e.g., 1 for easy, 2 for hard, 3 for wrong).
```

````text
# Prompt 8.6 (Person 2): Backend - Construct INSERT Query for practice_records
Construct an SQL `INSERT` statement as a string to insert a new record into the `practice_records` table with the `cardId`, `timestamp`, `difficulty`, retrieved `oldDay`, and calculated `newDay`.
```sql
INSERT INTO practice_records (cardId, timestamp, difficulty, oldDay, newDay) VALUES (?, ?, ?, ?, ?)
````

```text
# Prompt 8.7 (Person 2): Backend - Execute INSERT for practice_records
Using the `better-sqlite3` connection, prepare and execute the `INSERT` statement with the corresponding values.
```

````text
# Prompt 8.8 (Person 2): Backend - Construct UPDATE Query for flashcards
Construct an SQL `UPDATE` statement as a string to update the `scheduledDay` in the `flashcards` table for the given `cardId` with the calculated `newDay`.
```sql
UPDATE flashcards SET scheduledDay = ? WHERE id = ?
````

```text
# Prompt 8.9 (Person 2): Backend - Execute UPDATE for flashcards
Using the `better-sqlite3` connection, prepare and execute the `UPDATE` statement with the calculated `newDay` and the `cardId`.
```

```text
# Prompt 8.10 (Person 2): Backend - Send Response for updatePractice
After successfully executing the `INSERT` and `UPDATE` statements, send a JSON response to the client with a 200 OK status code and a success message. If any database operation fails, send a 500 Internal Server Error response with an error message.
```

**Chunk 9: Frontend - Basic Camera Access (Person 4)**

- **Step 9.1:** In your frontend practice session view, add a `<video>` element to display the camera feed.
- **Step 9.2:** Using the `navigator.mediaDevices.getUserMedia` API, request access to the user's camera.
- **Step 9.3:** If permission is granted, get the video stream from the camera and set it as the source for the `<video>` element.
- **Step 9.4:** Handle potential errors during camera access (e.g., permission denied) and display an appropriate message to the user.

```text
# Prompt 9.1 (Person 4): Frontend - Add Video Element
In the HTML structure of your practice session view, add a `<video>` element with an ID (e.g., `cameraFeed`) where the camera feed will be displayed.
```

```text
# Prompt 9.2 (Person 4): Frontend - Request Camera Access
In your frontend JavaScript code for the practice session, use `navigator.mediaDevices.getUserMedia({ video: true })` to request access to the user's video input device. This returns a Promise.
```

````text
# Prompt 9.3 (Person 4): Frontend - Display Camera Feed
Inside the `then` block of the `getUserMedia` Promise, if the promise resolves with a `MediaStream` object, set this stream as the `srcObject` of your `<video>` element.
```javascript
const videoElement = document.getElementById('cameraFeed');
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    videoElement.srcObject = stream;
  })
  .catch((error) => {
    console.error('Error accessing camera:', error);
    // Handle error (e.g., display a message to the user)
  });
````

```text
# Prompt 9.4 (Person 4): Frontend - Handle Camera Access Errors
Inside the `catch` block of the `getUserMedia` Promise, handle potential errors such as `PermissionDeniedError` or other issues that might prevent camera access. Display a user-friendly message in the UI indicating that camera access is required for this feature and how to enable it if necessary.
```

**Chunk 10: Frontend - TensorFlow.js Integration (Person 4)**

- **Step 10.1:** Install the `@tensorflow/tfjs` and `@tensorflow-models/handpose` (or `@tensorflow-models/hand-landmarks` for MediaPipe Hands) packages in your frontend project.
- **Step 10.2:** Import the necessary TensorFlow.js libraries and the hand tracking model into your practice session JavaScript file.
- **Step 10.3:** Initialize the hand tracking model (e.g., load Handpose).
- **Step 10.4:** Create a function that takes the video feed as input and uses the loaded model to detect hand landmarks in the current video frame.
- **Step 10.5:** For now, log the detected hand landmarks (an array of key points with x, y, z coordinates) to the console to verify that the model is working and detecting hands.

```text
# Prompt 10.1 (Person 4): Frontend - Install TensorFlow.js Packages
Install the `@tensorflow/tfjs` core library and the `@tensorflow-models/handpose` (or `@tensorflow-models/hand-landmarks` if you prefer MediaPipe Hands) model as dependencies in your frontend project using npm or yarn.
```

````text
# Prompt 10.2 (Person 4): Frontend - Import Libraries
In your JavaScript file for the practice session, import the `tf` object from `@tensorflow/tfjs` and the `handpose` (or `handlandmarks` and its associated util functions) model from the respective TensorFlow.js model package.
```javascript
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose'; // Or:
// import * as handlandmarks from '@tensorflow-models/hand-landmarks';
// import { MediaPipeHands } from '@mediapipe/hands';
````

````text
# Prompt 10.3 (Person 4): Frontend - Initialize Hand Tracking Model
Create an asynchronous function to load the hand tracking model. Use `handpose.load()` (or `handlandmarks.load(handlandmarks.SupportedModels.MediaPipeHands, { maxHands: 1 })` for MediaPipe Hands) to load the pre-trained model. Call this function when the practice session starts and store the loaded model in a variable.
```javascript
let model;
async function loadHandposeModel() {
  model = await handpose.load(); // Or:
  // model = await handlandmarks.load(handlandmarks.SupportedModels.MediaPipeHands, { maxHands: 1 });
}
loadHandposeModel();
````

````text
# Prompt 10.4 (Person 4): Frontend - Detect Hand Landmarks
Create a function that takes the `<video>` element (or its video stream) as input. Inside this function, use the loaded hand tracking model (`model.estimateHands(videoElement)`) to detect hands and estimate their key points (landmarks) in the current frame. This function should be asynchronous and return the array of detected hands (each hand containing an array of landmarks).
```javascript
async function detectHands(video) {
  if (model) {
    const predictions = await model.estimateHands(video);
    return predictions;
  }
  return [];
}
````

````text
# Prompt 10.5 (Person 4): Frontend - Log Detected Landmarks
In your practice session logic, call the `detectHands` function periodically (e.g., using `requestAnimationFrame` for smoother tracking). For each detected hand, log the array of landmarks to the browser's console. Inspect the output to understand the structure of the landmark data (coordinates of finger tips, knuckles, etc.).
```javascript
const videoElement = document.getElementById('cameraFeed');
function processFrame() {
  detectHands(videoElement).then((predictions) => {
    if (predictions.length > 0) {
      console.log('Hand landmarks:', predictions[0].landmarks); // Or predictions[0].keypoints for MediaPipe Hands
    }
    requestAnimationFrame(processFrame);
  });
}
videoElement.addEventListener('loadeddata', processFrame);
````

**Chunk 11: Frontend - Gesture Recognition Logic (Person 4)**

- **Step 11.1:** Analyze the landmark data for the "easy" (thumbs up), "hard" (thumbs down), and "wrong" (open palm) gestures. Identify specific landmarks and their relative positions that characterize each gesture.
- **Step 11.2:** Implement functions to recognize each of the three gestures based on the landmark coordinates. These functions should take the landmark array as input and return `true` if the gesture is detected, `false` otherwise. You'll likely need to define thresholds for distances and angles between different landmarks.
- **Step 11.3:** Integrate these gesture recognition functions into your `processFrame` loop. When a hand is detected, check if it matches any of the defined gestures.
- **Step 11.4:** For now, log the recognized gesture to the console whenever one is detected.

```text
# Prompt 11.1 (Person 4): Frontend - Analyze Gesture Landmarks
Examine the structure of the landmark data logged to the console in the previous step. Focus on the landmarks corresponding to the thumb, index finger, and palm for each of the target gestures (thumbs up, thumbs down, open palm). Note down the typical relative positions and orientations of these landmarks for each gesture. For example, for thumbs up, the thumb tip will likely be above the index finger tip, and the palm will be facing away.
```

````text
# Prompt 11.2 (Person 4): Frontend - Implement Gesture Recognition Functions
Create three JavaScript functions: `isEasyGesture(landmarks)`, `isHardGesture(landmarks)`, and `isWrongGesture(landmarks)`. Each function should take the array of hand landmarks as input and use the relative positions and orientations you identified in the previous step to determine if the hand is forming the corresponding gesture. These functions should return `true` if the gesture is recognized within a defined tolerance, and `false` otherwise. You might need to use vector math (e.g., calculating distances between points, angles between fingers) to implement this logic.
```javascript
function isEasyGesture(landmarks) {
  // Example logic (needs refinement based on actual landmark data):
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const palmDirection = // Calculate palm direction vector;
  // Return true if thumbTip.y < indexTip.y and palm is facing away;
  return false; // Placeholder
}

function isHardGesture(landmarks) {
  // Example logic:
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  // Return true if thumbTip.y > indexTip.y and fingers are pointing down;
  return false; // Placeholder
}

function isWrongGesture(landmarks) {
  // Example logic:
  // Check if palm is open and fingers are extended vertically;
  return false; // Placeholder
}
````

````text
# Prompt 11.3 (Person 4): Frontend - Integrate Gesture Recognition
In your `processFrame` function, after detecting hands, call your `isEasyGesture`, `isHardGesture`, and `isWrongGesture` functions with the detected landmarks.
```javascript
async function processFrame() {
  const predictions = await detectHands(videoElement);
  if (predictions.length > 0) {
    const landmarks = predictions[0].landmarks;
    if (isEasyGesture(landmarks)) {
      console.log('Gesture: Easy');
    } else if (isHardGesture(landmarks)) {
      console.log('Gesture: Hard');
    } else if (isWrongGesture(landmarks)) {
      console.log('Gesture: Wrong');
    }
  }
  requestAnimationFrame(processFrame);
}
````

```text
# Prompt 11.4 (Person 4): Frontend - Visual Feedback (Basic)
As a basic form of visual feedback, when a gesture is recognized, temporarily display a text label on the screen (e.g., "Easy!", "Hard!", "Wrong!") or change the border color of the video feed. This will help the user understand if their gestures are being detected correctly.
```

**Chunk 12: Frontend - Send Practice Results to Backend (Person 4)**

- **Step 12.1:** Identify the point in your frontend code where the user indicates they want to reveal the answer to a flashcard (e.g., a button click).
- **Step 12.2:** After the answer is revealed, instead of showing difficulty buttons, start a 1-second timer and display a progress bar.
- **Step 12.3:** During this 1-second window, continuously check for recognized hand gestures using your gesture recognition functions.
- **Step 12.4:** If a consistent gesture (easy, hard, or wrong) is recognized throughout the 1-second window (you might need to implement logic to ensure the same gesture is detected for a significant portion of the time), stop the timer.
- **Step 12.5:** Once a gesture is confirmed, get the `id` of the currently displayed flashcard.
- **Step 12.6:** Construct a JSON payload with the `cardId`, the current timestamp (as an integer using `Date.now()`), and an integer representing the recognized difficulty (e.g., 1 for easy, 2 for hard, 3 for wrong).
- **Step 12.7:** Send a POST request to the backend's `/api/updatepractice` endpoint with this JSON payload.
- **Step 12.8:** Handle the backend's response (e.g., log success or display a confirmation message). After a successful response, proceed to the next flashcard. Implement basic error handling.

```text
# Prompt 12.1 (Person 4): Frontend - Identify Answer Reveal
Locate the code that is executed when the user reveals the answer to the current flashcard.
```

```text
# Prompt 12.2 (Person 4): Frontend - Implement Timer and Progress Bar
When the answer is revealed, start a 1-second (1000 milliseconds) timer using `setTimeout` or `setInterval`. Simultaneously, display a visual progress bar that fills up over this second.
```

```text
# Prompt 12.3 (Person 4): Frontend - Check for Consistent Gesture
During the 1-second timer, in your `processFrame` loop, if a hand is detected, continuously check if it matches any of the "easy," "hard," or "wrong" gestures. You'll need to store the detected gestures over time within this second.
```

```text
# Prompt 12.4 (Person 4): Frontend - Confirm Consistent Gesture
After the 1-second timer ends, or if a single gesture is consistently detected for a significant portion of that time, determine the final recognized gesture. You might need a threshold (e.g., the same gesture detected for at least 700ms).
```

```text
# Prompt 12.5 (Person 4): Frontend - Get Current Card ID
Retrieve the `id` of the flashcard that was just displayed to the user. This ID should be available in your frontend's state management.
```

````text
# Prompt 12.6 (Person 4): Frontend - Construct Payload
Create a JavaScript object containing the `cardId`, the current timestamp obtained using `Date.now()` (which will be an integer), and an integer representing the recognized difficulty (e.g., 1 for easy, 2 for hard, 3 for wrong).
```javascript
const payload = {
  cardId: currentCardId,
  timestamp: Date.now(),
  difficulty: recognizedDifficulty // 1, 2, or 3 based on the gesture
};
````

```text
# Prompt 12.7 (Person 4): Frontend - Send POST Request to updatepractice
Use the `fetch` API to send a POST request to your backend's `/api/updatepractice` endpoint. Include the `payload` object as the JSON body of the request. Set the `Content-Type` header to `application/json`.
```

```text
# Prompt 12.8 (Person 4): Frontend - Handle Backend Response and Next Card
Handle the response from the `/api/updatepractice` request. If the response status is OK, log a success message or display a confirmation to the user. Then, proceed to display the next flashcard in the practice session. Implement basic error handling to inform the user if the update fails.
```

**Chunk 13: Backend - Implement Statistics Retrieval (`/api/statistics`) (Person 1)**

- **Step 13.1:** Define a route handler for GET requests to `/api/statistics` in your backend framework.
- **Step 13.2:** Inside the handler, execute the following SQL queries using the `better-sqlite3` connection:
  - `SELECT COUNT(*) AS totalCards FROM flashcards;`
  - `SELECT scheduledDay, COUNT(*) AS cardCount FROM flashcards GROUP BY scheduledDay;`
  - `SELECT CAST(SUM(CASE WHEN difficulty = 1 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) AS successRate FROM practice_records;`
  - `SELECT CAST(COUNT(*) AS REAL) / COUNT(DISTINCT cardId) AS averageMovesPerCard FROM practice_records;`
  - `SELECT COUNT(*) AS totalPracticeRecords FROM practice_records;`
- **Step 13.3:** Fetch the results of each query.
- **Step 13.4:** Format the results into a JSON object with keys like `totalCards`, `cardsPerDay`, `successRate`, `averageMovesPerCard`, and `totalPracticeRecords`.
- **Step 13.5:** Send this JSON object as the response to the frontend. Implement basic error handling.

```text
# Prompt 13.1 (Person 1): Backend - Define /api/statistics Route
In your backend routing setup, define a new route that listens for GET requests to the `/api/statistics` endpoint. Link this route to a new handler function (e.g., `handleGetStatistics`).
```

````text
# Prompt 13.2 (Person 1): Backend - Execute Statistics Queries
Inside the `handleGetStatistics` function, use your `better-sqlite3` connection to execute the following SQL queries. Use `db.prepare(...).get()` for single-row results and `db.prepare(...).all()` for multiple rows (like cards per day).
```sql
SELECT COUNT(*) AS totalCards FROM flashcards;
SELECT scheduledDay, COUNT(*) AS cardCount FROM flashcards GROUP BY scheduledDay;
SELECT CAST(SUM(CASE WHEN difficulty = 1 THEN 1 ELSE 0 END) AS REAL) * 100 / COUNT(*) AS successRate FROM practice_records;
SELECT CAST(COUNT(*) AS REAL) / COUNT(DISTINCT cardId) AS averageMovesPerCard FROM practice_records;
SELECT COUNT(*) AS totalPracticeRecords FROM practice_records;
````

```text
# Prompt 13.3 (Person 1): Backend - Fetch Query Results
Fetch the results from each of the executed SQL queries.
```

````text
# Prompt 13.4 (Person 1): Backend - Format Statistics Response
Format the fetched results into a JSON object with the following structure:
```json
{
  "totalCards": 123,
  "cardsPerDay": [
    {"scheduledDay": 0, "cardCount": 10},
    {"scheduledDay": 1, "cardCount": 20},
    // ...
  ],
  "successRate": 75.5,
  "averageMovesPerCard": 2.1,
  "totalPracticeRecords": 300
}
````

```text
# Prompt 13.5 (Person 1): Backend - Send Statistics Response
Send this JSON object as the response to the frontend with a 200 OK status code. Implement basic error handling.
```
