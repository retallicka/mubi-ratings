// Mubi Ratings Chrome Extension. Developed by Victoria Retallick 2013-2016

// console.log("starting")

var mubiRating = {

  makeAPICall: function (url, func) {
    // console.log('making api call to',url);
    chrome.runtime.sendMessage({
      method: 'GET',
      action: 'xhttp',
      url: url
    }, function(response) {
      // console.log('data is',response);
      func($.parseJSON(response));
    });
  },

  cleanName: function(name) {
    var punctuationless = name.replace(/[.\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    return punctuationless.replace(/\s{2,}/g," ");
  },

  findFilmInPage: function (useSecondary) {
    var name = mubiRating.getNameFromPage(useSecondary);
    name = mubiRating.cleanName(name);

    if (name) {
      mubiRating.getFilm(name);
    }
  },

  getNameFromPage: function (useSecondary) {
    var name = $('h1.film-show__titles__title')[0].outerText;
    // console.log("Name is",name);
    if (name == undefined) return;

    var secondary = $('h2.film-show__titles__title-alt');

    if (useSecondary == true && secondary.length > 0) {
      name = secondary[0].outerText;
      // console.log("Alt name is",name);
    }

    mubiRating.setYear();
    return name;
  },

  setYear: function () {
    var numberPattern = /\d+/g;
    mubiRating.year = year = $('div.film-show__country-year')[0].outerText.match(numberPattern)[0];
    // console.log("Year is ",mubiRating.year);
  },

  getFilm: function (filmname) {
    // console.log("OK...preparing to search for " + filmname);
    mubiRating.makeAPICall(mubiRating.moviesAPI +
      '?r=json' +
      '&type=movie' +
      '&tomatoes=' + true +
      '&t=' + encodeURIComponent(filmname), mubiRating.filmFound)
  },

  filmFound: function (json) {
    // console.log('film found',json);
    if (json.Response === 'False' && mubiRating.searchComplete === false) {
      mubiRating.searchAgain();
      mubiRating.searchComplete = true;
    } else {
      if (json.Response != 'False') {
        mubiRating.setRating(json.tomatoMeter, json.tomatoURL);
      }
    }
  },

  searchAgain: function () {
    mubiRating.findFilmInPage(false);
  },

  injectCSS: function () {
    var url = chrome.extension.getURL('../css/styles.css');
    $("head").append("<link id='mubirating' href='" + url + "' type='text/css' rel='stylesheet' />");
  },

  setRating: function (rating, link) {
    if (rating == 'N/A' && link) {
      // console.log("this film does not have enough votes to be rated");
      mubiRating.setHTML('not enough votes', link);
    } else if (rating == 'N/A' && !link) {
      // console.log("this film is unrated");
    } else {
      // console.log("the rating will be",rating);
      mubiRating.setHTML(rating, link);
    }
  },

  setHTML: function (rating, link) {
    var div = $('.film-show__average-rating')

    if ($('#mubi-rating').length !== 0) {
      $('#mubi-rating').remove();
    }
    div.append('<div id="mubi-rating"><a href="' + link + '" target="_blank"><span></span></a><p>' + rating + '</p></div>');
    $("#mubi-rating").animate({opacity: 0.9}, 300);
  },

  clearPrevious: function (score) {
    if ($('#mubi-rating').length > 0) {
      $("#mubi-rating").animate({opacity: 0}, 1<00);
    }
  },

  clickNavigation: function () {
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

$(document).ready(function () {
  mubiRating.searchComplete = false;
  mubiRating.moviesAPI = 'http://www.omdbapi.com/';
  mubiRating.findFilmInPage(true);
});

mubiRating.injectCSS();