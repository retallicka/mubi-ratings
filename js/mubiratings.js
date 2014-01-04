// Mubi Ratings Chrome Extension. Developed by Vickie Retallick 2013

// Talking to rottentomatoes.com API

var mubiRating = {
  makeAPICall: function (url, func) {
    console.log("make call");
    $.getJSON(url, function (data) {
      func(data);
    });
  },

  requestAPI: function () {
    mubiRating.makeAPICall('http://api.rottentomatoes.com/api/public/v1.0.json' +
      '?apikey=qurnwj6rx3cg5ggb63mju2ku' +
      '&format=json', mubiRating.apiAvailable);
  },

  apiAvailable: function (data) {
    mubiRating.moviesAPI = data.links.movies;
    mubiRating.findFilmInPage();
  },

  findFilmInPage: function () {
    var name = $("meta[property='og:title']").attr("content");
    mubiRating.getFilm(name);
  },

  getFilm: function (filmname) {
    console.log("OK...preparing to search for " + filmname);
    mubiRating.makeAPICall(this.moviesAPI +
      '?apikey=qurnwj6rx3cg5ggb63mju2ku' +
      '&format=json' +
      '&q=' + encodeURIComponent(filmname) +
      '&page_limit=1' +
      '&page=1', mubiRating.filmFound);
  },

  filmFound: function (json) {
    var rating = json.movies[0].ratings.critics_score;
    console.log("This film is rated " + rating);
    mubiRating.setHTML(rating);
  },

  // Mubi Overlay

  injectCSS: function () {
    var url = chrome.extension.getURL('../css/styles.css');
    $("head").append("<link id='mubirating' href='" + url + "' type='text/css' rel='stylesheet' />");
  },

  setHTML: function (score) {
    if ($('#mubi-rating').length === 0) {
      $("body").append('<div id="mubi-rating"><p>' + score + '</p></div>');
    } else {
      $('#mubi-rating').html('<p>' + score + '</p>');
    }
    $("#mubi-rating").animate({opacity: 1}, 500);
  },

  clearPrevious: function (score) {
    if ($('#mubi-rating').length > 0) {
      $("#mubi-rating").animate({opacity: 0}, 200);
    }
  }
};

$(document).ready(function () {
  mubiRating.clearPrevious();
  console.log("reloading~!");
  if (mubiRating.moviesAPI) {
    mubiRating.findFilmInPage();
  } else {
    mubiRating.requestAPI();
  }
});

mubiRating.injectCSS();