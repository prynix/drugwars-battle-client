game.socket = {
  receiveID: function (cb) {
    // receive ID
    game.socket.cb = cb;
    if (!game.debug) {
      window.addEventListener('message', game.socket.messageListener, false);
      window.opener.postMessage('ready','*');
    } else game.socket.messageListener({data: {id: 'debugID', token: 'debugToken'}});
  },
  messageListener: function(event){
    game.id = event.data.id;
    game.token = event.data.token;
    game.socket.initClient(game.socket.cb);
    game.socket.battlejson(game.socket.cb);
  },
  initClient: function (cb) { // game.websocket = wss://api.drugwars.io || ws://localhost:3000
    game.socket.rawClient = new drugwars.Client(game.websocket); 
    game.client = game.socket.sub(game.socket.rawClient);
    var params = {token: game.token};
    game.client.request('login', params, function (err, result) {
      if (!game.debug && err) {
        game.is_logged = false;
        if (game.debug && typeof(err) == 'string' ) game.overlay.alert(err);
        else console.log(err);
      } else {
        game.is_logged = true;
        cb();
      }
    });
  },
  sub: function (rawClient) {
    rawClient.ws.onclose = function (event) {
      //disconnect
      if (game.debug) console.log('socket disconnected');
    };
    rawClient.subscribe(function (data, message) {
      if (
        message[1].body &&
        message[1].body.type !== undefined &&
        message[1].body.type === 'start_battle'
      ) {
        console.log(message);
      }
    });
    return rawClient;
  },
  dwData: function (name, cb) {
    var data = drugwars.units;
    game.data[name] = game.socket.parseDw(data);
    game.socket.createUnitsStyle();
    if (cb) cb();
    //console.log('loaded '+name+' data', game.data[name])
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
      parsed[npc][i].speed = data[i].walk_speed;
      //parsed[npc][i].id =  npc + '-' + name;
    }
    return parsed;
  },
  battlejson: function (cb) {
    game.mode = 'online';
    var u = 'https://api.drugwars.io/fight/'+game.token+"/"+game.id;
    if (game.debug) u = '/json/player1.json';
    $.ajax({
      type: 'GET',
      url: u,
      complete: function (response) { //console.log(name, response, game.states.loading.updating)*/
        var data;
        try {
           data = JSON.parse(response.responseText);
        } catch (error) {
          data = response.responseText;
          console.log(response,data);
        }
        if (!data.error) {
              //console.log(data);

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
            if (unit.key || unit.unit && unit.amount>0) {
              game.player.picks.push(unit.key || unit.unit);
              game.player.cardsAmount[unit.key || unit.unit] = unit.amount;
              game.player.totalCards += unit.amount;
            }
          });
          data.opponent.units.forEach(function (unit) {
            if (unit.key || unit.unit && unit.amount>0) {
              game.enemy.picks.push(unit.key || unit.unit);
              game.enemy.cardsAmount[unit.key || unit.unit] = unit.amount;
              game.enemy.totalCards += unit.amount;
            }
          });
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
        style += '.units.unit-'+unit+' .img { background-image: url("https://img.drugwars.io/cards/units/'+unit+'.png"); }';
      }
    }
    style += '</style>';
    $(style).appendTo(document.head);
  }
};