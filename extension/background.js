chrome.contextMenus.create({
    //this is the naming convention (id) of our extension
    id: "addToFlashcards", 
    title: "Add to Flashcards", 
    contexts: ["selection"] 
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    // if anything in Google chrome was clicked on 
    // info ინფორმაცია დაკლიკვის შესახებ tab - სად დააკლიკა ადამიანმა იმ ტაბის შესახებ ინფორმაცია
    if (info.menuItemId === "addToFlashcards") {
        // if you see it clearly, we compare the id of menuItem and that means that if it is what we just created , we send the id of the tab that we did it on
        // then if there is a click on addtoFlashcard button (i think it has to be called button , but not so sure lol)
        chrome.tabs.sendMessage(tab.id);
    }
});