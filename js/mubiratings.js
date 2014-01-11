// Mubi Ratings Chrome Extension. Developed by Vickie Retallick 2013

// Talking to rottentomatoes.com API

var mubiRating = {
  makeAPICall: function (url, func) {
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
    mubiRating.findFilmInPage(true);
  },

  findFilmInPage: function (useSecondary) {
    var name = mubiRating.getNameFromPage(useSecondary);

    if (name) {
      mubiRating.getFilm(name);
    }
  },

  getNameFromPage: function (useSecondary) {
    var name;
    var holder = $('.film_slider').find('.film_showcase:visible');
    var prev_nav = $('#prev_film');
    var next_nav = $('#next_film');

    var index = mubiRating.findDisplayedFilmIndex(prev_nav, next_nav);

    name = holder.find('.film_title')[index].outerText;
    if (useSecondary == true) {
      name += " " + holder.find('.film-title-secondary')[index].outerText;
    }

    mubiRating.setYear(holder, index);

    return name;
  },

  setYear: function (holder, index) {
    var year_and_country = holder.find('.film_country_year')[index].outerText;
    var pattern = /[0-9]+/;
    mubiRating.year = year_and_country.match(pattern);
  },

  findDisplayedFilmIndex: function (prev_nav, next_nav) {
    if ((prev_nav.length > 0 && next_nav.length > 0) || next_nav.length > 0) {
      return 1;
    }
    return 0;
  },

  getFilm: function (filmname) {
    console.log("OK...preparing to search for " + filmname);
    mubiRating.makeAPICall(this.moviesAPI +
      '?apikey=qurnwj6rx3cg5ggb63mju2ku' +
      '&format=json' +
      '&q=' + encodeURIComponent(filmname) +
      '&page_limit=10' +
      '&page=1', mubiRating.filmFound);
  },

  filmFound: function (json) {
    if (json.movies.length === 0 && mubiRating.searchComplete === false) {
      console.log("No movies returned");
      mubiRating.searchAgainWithoutSecondary();
      mubiRating.searchComplete = true;
    }

    var closeMatch;
    var match;

    for (i = 0; i < json.movies.length; i++) {
      var rating = json.movies[i].ratings.critics_score;
      console.log("Looking at " + json.movies[i].title);

      if (mubiRating.year == json.movies[i].year) {
        match = i;
        console.log("The year matches :)");
        break;
      } else {
        if (closeMatch == undefined) {
          closeMatch = i;
        }
        console.log("Year mismatch! our movie's year is meant to be " + mubiRating.year + " but we found " + json.movies[i].year);
      }
    }
    if (match != undefined) {
      mubiRating.setRating(json.movies[match].ratings.critics_score);
    } else if (closeMatch != undefined) {
      mubiRating.setRating(json.movies[closeMatch].ratings.critics_score);
    }
  },

  searchAgainWithoutSecondary: function () {
    mubiRating.findFilmInPage(false);
  },

  // Mubi Overlay

  injectCSS: function () {
    var url = chrome.extension.getURL('../css/styles.css');
    $("head").append("<link id='mubirating' href='" + url + "' type='text/css' rel='stylesheet' />");
  },

  setRating: function (rating) {
    if (rating === -1) {
      console.log("this film is unrated");
    } else {
      mubiRating.setHTML(rating);
    }
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

$("#film_navigation").click(function () {
  mubiRating.clearPrevious();
  if (mubiRating.moviesAPI) {
    mubiRating.searchComplete = false;
    mubiRating.findFilmInPage(true);
  }
});

$(document).ready(function () {
  mubiRating.requestAPI();
});

mubiRating.injectCSS();