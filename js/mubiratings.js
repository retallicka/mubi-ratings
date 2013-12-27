// Mubi Ratings Chrome Extension. Developed by Vickie Retallick 2013

var rottenTomatoAPI = {
  makeAPICall: function (url) {
    // only JSONp is available at RottenTomatoes API
    var head = document.head;
    var script = document.createElement("script");
    script.setAttribute('src', url);
    head.appendChild(script);
    head.removeChild(script);
  },

  requestAPI: function () {
    this.makeAPICall('http://api.rottentomatoes.com/api/public/v1.0.json' +
      '?apikey=qurnwj6rx3cg5ggb63mju2ku' +
      '&format=jsonp' +
      '&callback=rottenTomatoAPI.apiAvailable');
  },

  apiAvailable: function (json) {
    console.log("API is available :)");
    //this.listsAPI = json.links.lists;
    this.moviesAPI = json.links.movies;
    this.getFilm("Millions");
  },

  getFilm: function (filmname) {
    console.log("OK...preparing to search for " + filmname);
    this.makeAPICall(this.moviesAPI +
      '?apikey=qurnwj6rx3cg5ggb63mju2ku' +
      '&format=jsonp' +
      '&q=' + encodeURIComponent(filmname) +
      '&page_limit=1' +
      '&page=1' +
      '&callback=rottenTomatoAPI.filmFound');
  },

  filmFound: function (json) {
    console.log("We found some data");
    //console.dir(json);
    var rating = json.movies[0].ratings.critics_score;
    console.log("This film is rated " + rating);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  console.log("requesting API~!");
  rottenTomatoAPI.requestAPI();
  alert('<html>' + document.documentElement.outerHTML + '</html>');
});
