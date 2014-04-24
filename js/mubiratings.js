// Mubi Ratings Chrome Extension. Developed by Vickie Retallick 2013

console.log("starting")

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
    var name = $('h1.film-title')[0].outerText;
    
    if (name == undefined) return;
    console.log("Name is",name)
    console.log($('h2.film-alternative-title'));

    if (useSecondary == true && $('h2.film-alternative-title').length > 0) {
      name += " " + $('h2.film-alternative-title')[0].outerText;
      console.log("Alt name is",$('h2.film-alternative-title')[0].outerText);
    }

    mubiRating.setYear();
    return name;
  },

  setYear: function () {
    mubiRating.year = year = $('span.year')[0].outerText;
    console.log("Year is ",mubiRating.year)
  },

  findDisplayedFilmIndex: function () {
    var prev_nav = $('.prev_film');
    var next_nav = $('.next_film');

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
      mubiRating.setRating(json.movies[match].ratings.critics_score, json.movies[match].links.alternate);
    } else if (closeMatch != undefined) {
      mubiRating.setRating(json.movies[closeMatch].ratings.critics_score, json.movies[closeMatch].links.alternate);
    }
  },

  searchAgainWithoutSecondary: function () {
    mubiRating.findFilmInPage(false);
  },

  injectCSS: function () {
    var url = chrome.extension.getURL('../css/styles.css');
    $("head").append("<link id='mubirating' href='" + url + "' type='text/css' rel='stylesheet' />");
  },

  setRating: function (rating, link) {
    if (rating === -1) {
      console.log("this film is unrated");
    } else {
      console.log("the rating will be",rating);
      mubiRating.setHTML(rating, link);
    }
  },

  setHTML: function (rating, link) {
    var div = $('.available-on')

    if ($('#mubi-rating').length !== 0) {
      $('#mubi-rating').remove();
    }
    div.append('<div id="mubi-rating"><a href="' + link + '" target="_blank"><span></span></a><p>' + rating + '</p></div>');
    $("#mubi-rating").animate({opacity: 0.9}, 500);
  },

  clearPrevious: function (score) {
    if ($('#mubi-rating').length > 0) {
      $("#mubi-rating").animate({opacity: 0}, 200);
    }
  },

  clickNavigation: function () {
    console.log("click nav");
    mubiRating.clearPrevious();
    if (mubiRating.moviesAPI) {
      mubiRating.searchComplete = false;
      mubiRating.findFilmInPage(true);
    }
  }
};

$("#film_navigation").click(function () {
  mubiRating.clickNavigation();
});

// $("a.film_still_link").click(function () {
//   setTimeout(mubiRating.clickNavigation(), 1000);
// });

$(document).ready(function () {
  console.log("ready");
  mubiRating.searchComplete = false;
  mubiRating.requestAPI();
});

mubiRating.injectCSS();