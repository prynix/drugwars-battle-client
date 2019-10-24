game.states.loading = {
  updating: 0,
  totalUpdate: 5, // id, socket, battlejson, ui, dwunits
  build: function () {
    this.el = $('.state.loading').removeClass('hidden');
    this.h2 = $('.state.loading .loadtext');
    this.box = $('.state.loading .box');
  },
  start: function () {
    game.states.loading.json('ui', game.states.loading.updated);
    game.socket.receiveID(game.states.loading.updated); // id, socket, battlejson
    game.socket.dwjson('units', game.states.loading.updated);
  },
  updated: function () { //console.trace(game.states.loading)
    game.states.loading.updating += 1;
    game.states.loading.progress();
  },
  progress: function () {
    var loading = parseInt(game.states.loading.updating / game.states.loading.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.states.loading.updating >= game.states.loading.totalUpdate) {
      game.timeout(100, game.states.loading.finished);
    }
  },
  preloadimgs: ['map/bkg.jpg'],
  imgload: 0,
  finished: function () { console.trace(this)
    if (!game.states.loading.loaded) {
      game.states.loading.box.addClass('hidden');
      game.container.append(game.topbar).addClass('loaded');
      game.options.build();
      game.states.build( function () {
        //preloadimgs
        $.each(game.states.loading.preloadimgs, function () {
          $('<img>').attr('src', 'img/'+this).on('load', function () {
            game.states.loading.imgload++;
            if (game.states.loading.imgload == game.states.loading.preloadimgs.length) {
              game.states.table.el.addClass('loaded');
            }
          }).appendTo(game.hidden);
        });
        game.units.build('player');
        game.units.build('enemy');
        game.timeout(400, function () {
          game.screen.resize();
          game.options.opt.show();
          // FINISHED
          game.history.recover();
        });
      });
    }
    game.states.loading.loaded = true;
  },
  json: function (name, cb, translate) {
    var u = './json/' + name + '.json';
    //if (translate) u = game.dynamicHost +'json/' + game.language.dir + name + '.json';
    $.getJSON(u, function(json) {
      var data = json;
      game.data[name] = data;
      if (cb) {
        cb(data);
      }
    });
  }
};
