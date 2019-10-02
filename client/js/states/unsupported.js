game.states.unsupported = {
  build: function () {
    this.box = $('<div>').addClass('box');
    this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
    this.h2 = $('<h1>').appendTo(this.box).html('DrugWars BattleClient requires a <i>modern browser</i>');
    this.p = $('<p>').appendTo(this.box).html('<a href="http://whatbrowser.org/" target="_blank">How can I get a <i>modern browser</i>?</a>');
    this.el.append(this.box);
  }
};