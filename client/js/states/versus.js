game.states.vs = {
  build: function () {
    this.parallax = $('<div>').addClass('parallax');
    this.player = $('<div>').addClass('vsplayer slide');
    this.playername = $('<h1>').appendTo(this.player);
    this.playerdeck = $('<div>').addClass('vsdeckplayer').appendTo(this.player);
    this.playerinfo = $('<div>').addClass('vsplayerinfo').appendTo(this.player);
    this.vs = $('<p>').text('VS').addClass('versus').appendTo(this.el);
    this.enemy = $('<div>').addClass('vsenemy slide');
    this.enemyname = $('<h1>').appendTo(this.enemy);
    this.enemydeck = $('<div>').addClass('vsdeckenemy').appendTo(this.enemy);
    this.enemyinfo = $('<div>').addClass('vsenemyinfo').appendTo(this.enemy);
    this.parallax.append(this.player);
    this.parallax.append(this.enemy);
    this.el.append(this.parallax);
  },
  start: function (recover) {
    this.clear();
    game.message.text(game.data.ui.battle);
    game.audio.stopSong();
    if (game.mode !== 'library') {
      game.audio.play('RandomEncounter', /*loop*/false, 'music', game.states.table.music);
    } else {
      setTimeout(game.states.table.music, 1600);
    }
    this.buildPlayer();
    this.buildEnemy();
    this.buildMap();
    this.player.removeClass('slide');
    this.enemy.removeClass('slide');
    this.toTable();
  },
  buildMap: function () {
    if (!game.size) game.size = game.history.size || game.getData('size') || 's5v5';
    game.width = 9;//game.states.config[game.size].width;
    game.height = 6;//game.states.config[game.size].height;
    if (game.map.el) game.map.el.remove();
    game.map.build().prependTo(game.camera);
  },
  buildPlayer: function () {
    this.playername.text(game.player.name);
    if (!game.player.type) game.player.type = 'challenged';
    if (!game.player.picks) game.player.picks = game.states.vs.playerPicks();
    //console.log(game.player.picks)
    game.player.picks.forEach(function (pick) {
      //console.log('.unit-'+pick)
      var unit = game.units.clone(game.player.unitsDeck.children('.unit-'+pick));
      unit.appendTo(game.states.vs.playerdeck);
      var xstr = 'X';
      if (game.player.cardsAmount[pick] > 999) xstr = '';
      $('.amount', unit).text(xstr+game.player.cardsAmount[pick]);
    });
    game.states.vs.playerinfo.text(game.player.totalCards);
  },
  buildEnemy: function () {
    if (game.mode == 'tutorial') game.enemy.name = game.data.ui.tutorial;
    if (game.mode == 'library') game.enemy.name = game.data.ui.library;
    if (game.mode == 'single') game.enemy.name = game.states.campaign.stage.name;
    if (game.mode == 'local') game.enemy.name = 'Challenger';
    game.setData('enemyname', game.enemy.name);
    this.enemyname.text(game.enemy.name);
    if (!game.enemy.type) game.enemy.type = 'challenger';
    if (!game.enemy.picks) game.enemy.picks = game.states.vs.enemyPicks();
    game.enemy.picks.forEach(function (pick) {
      var unit = game.units.clone(game.enemy.unitsDeck.children('.unit-'+pick));
      unit.appendTo(game.states.vs.enemydeck);
      var xstr = 'X';
      if (game.enemy.cardsAmount[pick] > 999) xstr = '';
      $('.amount', unit).text(xstr+game.enemy.cardsAmount[pick]);
    });
    game.states.vs.enemyinfo.text(game.enemy.totalCards);
  },
  playerPicks: function () {
    var hero, picks;
    if (game.mode == 'library') {
      if (game.library.hero) {
        hero = game.library.hero;
      } else {
        hero = game.getData('choose');
        game.library.hero = hero;
      }
      return [hero];
    } else if (game.mode == 'single') {
      if (game.states.campaign.stage.id == 'start') {
        picks = game.player.picks;
        game.single.playerpicks = game.player.picks;
        game.setData('mydeck', game.player.picks.join('|'));
      } else {
        picks = game.single.playerpicks;
        if (!picks) picks = game.getData('mydeck').split('|');
      }
      return picks;
    } else {
      picks = game.player.picks;
      if (!picks && game.recovering) picks = game.getData(game.player.type+'Deck').split('|');
      if (picks && picks.length === 5) return picks;
    }
  },
  enemyPicks: function () {
    var picks;
    if (game.mode == 'library') {
      if (game.size == 's1v1') return [game.library.hero];
      if (game.size == 's3v3') return [ 'ld', 'am', 'wind' ];
      return [ 'lina', 'pud', 'wk', 'com', 'cm' ];
    }
    if (game.mode == 'tutorial') {
      return [ 'wk', 'cm', 'am', 'pud', 'ld' ];
    }
    if (game.mode == 'single') {
      return game.single.enemypicks;
    }
    if (game.mode == 'online' || game.mode == 'local') {
      picks = game.enemy.picks;
      if (!picks && game.recovering) picks = game.getData(game.enemy.type+'Deck').split('|');
      if (picks && picks.length === 5) return picks;
    }
  },
  toTable: function () {
    var t = 2600;
    if (game.mode == 'library') t = 1600;
    game.timeout(t - 300, function () {
      this.player.addClass('slide');
      this.enemy.addClass('slide');
      game.fx.build();
    }.bind(this));
    game.timeout(t, function () {
      game.states.vs.clear();
      game.setData(game.player.type + 'Deck', game.player.picks.join('|'));
      game.setData(game.enemy.type + 'Deck', game.enemy.picks.join('|'));
      game.states.changeTo('table');
    });
  },
  clear: function () {
    $('.card', game.states.vs.el).remove();
  },
  end: function () {
    //this.clear();
  }
};