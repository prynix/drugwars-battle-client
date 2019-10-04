game.states.loading = {
  updating: 0,
  totalUpdate: 6, // values + language + ui + units + package + db
  build: function () {
    //this.box = $('<div>').addClass('box');   
    //this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Updating: </span><span class="progress">0%</span>');
    //this.el.append(this.box);
    this.el = $('.state.loading').removeClass('hidden');
    this.h2 = $('.state.loading .loadtext');
    this.box = $('.state.loading .box');
    window.addEventListener('message', game.states.loading.messageListener, false);
    window.opener.postMessage('ready','*');
  },
  start: function () {
    if (game.debug) game.states.loading.ping();
    game.states.loading.package();
    game.language.load(function loadLanguage() { //console.log('lang', game.states.loading.updating)
      game.states.loading.updated();
      game.states.loading.json('values', game.states.loading.updated);
      // trasnslate
      game.states.loading.dwjson('units', function () {
        game.states.loading.createUnitsStyle();
        game.states.loading.updated();
      });
      // game.states.loading.json('ui', game.states.loading.updated, true);
      // game.states.loading.battlejson(game.states.loading.updated);
    });
    game.states.loading.progress();
  },
  updated: function () { //console.trace(this)
    game.states.loading.updating += 1;
    game.states.loading.progress();
  },
  progress: function () {
    var loading = parseInt(game.states.loading.updating / game.states.loading.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.states.loading.updating >= game.states.loading.totalUpdate) {
      game.states.loading.finished();
    }
  },
  preloadimgs: ['map/bkg.jpg'],
  imgload: 0,
  finished: function () {
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
  },
  json: function (name, cb, translate) {
    var u = game.dynamicHost + 'json/' + name + '.json';
    if (translate) u = game.dynamicHost + 'json/' + game.language.dir + name + '.json';
    $.ajax({
      type: 'GET',
      url: u,
      complete: function (response) { //console.log(name, response, game.states.loading.updating)
        var data = JSON.parse(response.responseText);
        game.data[name] = data;
        if (cb) {
          cb(data);
        }
      }
    });
  },
  dwjson: function (name, cb, translate) {
    var host = 'https://api.drugwars.io/';
    var u = host + name;
    //if (translate) u = game.dynamicHost + 'json/' + game.language.dir + name + '.json';
    var data = drugwars.units;
    game.data[name] = game.states.loading.parseDw(data);
        //console.log('loaded '+name+' data', game.data[name])
    cb(game.data[name]);
  },
  parseDw: function (data) {
    var parsed = {};
    for (var i in data) {
      var name = data[i].id;
      var npc = 'pc';
      if (data[i].npc) {
        npc = 'npc';
      }
      if (!parsed[npc]) parsed[npc] = {};
      parsed[npc][i] = {};
      Object.assign(parsed[npc][i], data[i]);
      parsed[npc][i]['damage type'] = data[i].dmg_type;
      parsed[npc][i].hp = data[i].health;
      parsed[npc][i].damage = data[i].attack;
      parsed[npc][i].description = data[i].desc;
      //parsed[npc][i].id =  npc + '-' + name;
    }
    return parsed;
  },
  messageListener: function(event){
    game.states.loading.battlejson(event.data,game.states.loading.updated);
    game.states.loading.json('ui', game.states.loading.updated, true);
    game.screen.setResolution('auto');
  },
  battlejson: function (id,cb) {
    game.mode = 'online';
    var u = 'https://api.drugwars.io/fight/'+id;
    $.ajax({
      type: 'GET',
      url: u,
      complete: function (response) { //console.log(name, response, game.states.loading.updating)*/
        var data = JSON.parse(response.responseText);
        //console.log(data)
        if (!data.error) {
              game.setData('name',data.me.information.nickname);
              game.player.name = data.me.information.nickname;
              game.player.picture = data.me.information.picture;
              game.player.gang = data.me.information.gang;
              game.player.ticker = data.me.information.ticker;
              game.player.role = data.me.information.role;
              game.player.picks = [];
              game.player.totalCards = 0;
              game.player.cardsAmount = data.me.units;

              game.enemy.name = data.opponent.information.nickname;
              game.enemy.picture = data.opponent.information.picture;
              game.enemy.gang = data.opponent.information.gang;
              game.enemy.ticker = data.opponent.information.ticker;
              game.enemy.role = data.opponent.information.role;
              game.enemy.picks = [];
              game.enemy.totalCards = 0;
              game.enemy.cardsAmount = data.opponent.units;


          // units
          data.me.units.forEach(function (unit) {
            //console.log(unitsData)
            if (unit.key && unit.amount>0) {
              game.player.picks.push(unit.key);
              game.player.cardsAmount[unit.key] = unit.amount;
              game.player.totalCards += unit.amount;
            }
          });
          data.opponent.units.forEach(function (unit) {
            //console.log(unitsData)
            if (unit.key && unit.amount>0) {
              game.enemy.picks.push(unit.key);
              game.enemy.cardsAmount[unit.key] = unit.amount;
              game.enemy.totalCards += unit.amount;
            }
          });
          //console.log('loaded player units', game.player.picks)
          if (cb) {
            cb(data);
          }
        } else {
          game.overlay.alert(data.error);
        }
      }
    });
  },
  createUnitsStyle: function () {
    var style = '<style type = "text/css">';
    for (var unittype in game.data.units) {
      for (var unit in game.data.units[unittype]) {
        style += '.units.unit-'+unit+' .img { background-image: url("//img.drugwars.io/cards/units/'+unit+'.png"); }';
      }
    }
    style += '</style>';
    $(style).appendTo(document.head);
  },
  package: function () {
    $.ajax({
      type: 'GET',
      url: game.dynamicHost + 'package.json',
      complete: function (response) {
        game.states.loading.updated();
        var data = JSON.parse(response.responseText);
        $.each(data, function (name) {
          game[name] = this;
        });
      }
    });
  },
  ping: function (cb) {
    var start = new Date();
    $.ajax({
      type: 'GET',
      url: game.dynamicHost,
      complete: function (response) {
        game.ping = new Date() - start;
        if (response.readyState === 4 && location.host.search('localhost') < 0) {
          game.offline = false;
        } else { game.offline = true; }
        if (cb) { cb(); }
      }
    });
  }
};