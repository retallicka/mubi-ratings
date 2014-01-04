// With help from Hartley Brody
// https://github.com/hartleybrody/buzzkill/

// when the extension is first installed
chrome.runtime.onInstalled.addListener(function (details) {
  localStorage.mubi_ratings = true;
});
// Listen for any changes to the URL of any tab.
// see: http://developer.chrome.com/extensions/tabs.html#event-onUpdated
chrome.tabs.onUpdated.addListener(function (id, info, tab) {

  // decide if we're ready to inject content script
  if (tab.status !== "complete") {
    console.log("not yet loaded");
    return;
  }
  if (tab.url.toLowerCase().indexOf("mubi.com") === -1) {
    console.log("this is not mubi");
    return;
  }

  if (localStorage.mubi_ratings === "true") {

    console.log("ratings or not?" + tab.url.toLowerCase().indexOf("mubi.com"));

    // show the page action
    //chrome.pageAction.show(tab.id);

    // inject the content script onto the page
    chrome.tabs.executeScript(null, {"file": "js/mubiratings.js"});
  }

});

// // show the popup when the user clicks on the page action.
// chrome.pageAction.onClicked.addListener(function (tab) {
//   chrome.pageAction.show(tab.id);
// });
