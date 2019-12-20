var game = {
  dynamicHost: 'https://battle.drugwars.io/client/',
  websocket: 'wss://api.drugwars.io',
  container: $('.game-container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message'),
  triesCounter: $('<small>').addClass('triescounter'),
  dayLength: 12, // hours = game.time % (game.dayLength * 2)
  defaultSpeed: 3,
  maxSkillCards: 10,
  tries: 0,
  timeToPick: 40,//seconds
  timeToPlay: 99,
  waitLimit: 10,
  connectionLimit: 30,
  deadLength: 3, //turns
  ultTurn: 4,
  creepTurn: 0,
  catapultTurn: 6,
  treeRespawn: 4,
  heroDeathDamage: 4, //HP
  fountainHeal: 12,
  startMoney: 400,
  heroBounty: 150, //money
  unitBounty: 60,
  jungleFarm: 80,
  turnReward: 40,
  libReward: 800,
  maxMoney: 99999,
  seed: 0,
  id: null,
  token: null,
  client: null,
  size: 's5v5',
  timeoutArray: [],
  skills: {},
  data: {},//json {heroes, skills, ui, units, campaign}
  mode: 'online', //online, tutorial, single, library
  currentData: {}, // all game info and moves. should be able to recreate a table
  currentState: 'noscript', //unsupported, loading, vs, table, results
  heroesAI: {}, // heroes default AI behaviour
  build: function () {
    game.utils();
    game.history.build();
    game.events.build();
    game.overlay.build();
    game.hidden = $('<div>').addClass('hidden').appendTo(game.container);
    game.topbar = $('<div>').addClass('topbar');
    game.topbar.append(game.loader, game.message, game.triesCounter);
  },
  start: function () {
    if (window.JSON && window.localStorage && window.btoa && window.atob && window.XMLHttpRequest) {
      if (game.debug) {
        game.container.addClass('debug');
        game.dynamicHost = 'https://battle.drugwars.io/client/';
      }
      game.build();
      game.screen.detectDark();
      game.socket.dwData('units', function () {
        game.states.changeTo('loading');
      });
    } else
      game.states.changeTo('unsupported');
  },
  newId: function (id) {
    game.newSeed();
    game.id = id;
    //game.id = btoa(game.seed) + '|' + btoa(new Date().valueOf());
  },
  setId: function (id) {
    game.id = id;
    game.setSeed(id);
  },
  newSeed: function () {
    game.seed = Math.floor(Math.random() * 1E16);
    game.setData('seed', game.seed);
  },
  setSeed: function (id) {
    //console.trace(id);
    if (id) {
      var n = id.split('|');
      if (n[0].length) {
        game.seed = parseInt(atob(n[0]), 10);
        game.setData('seed', game.seed);
      }
    }
  },
  setData: function (item, data) { //console.trace('set', item, data)
    game.currentData[item] = data;
    localStorage.setItem('DW-data-' + item, JSON.stringify(data));
  },
  getData: function (item) {
    if (!game.currentData[item]) {
      var saved = localStorage.getItem('DW-data-' + item);
      if (typeof (saved) !== undefined) game.currentData[item] = JSON.parse(saved);
    }
    return game.currentData[item];
  },
  canPlay: function () {
    var can = (game.currentTurnSide == 'player');
    if (game.mode == 'local') can = game.currentTurnSide;
    return can;
  },
  opponent: function (side) {
    return (side == 'player') ? 'enemy' : 'player';
  },
  db: function (params, cb) {
    params.token = game.token;
    params.id = game.id;
    game.client.request('battle_client', params, function (err, result) {
      if (err) return cb(err);
      return cb(result);
    });
  },
  random: function () {
    game.seed += 1;
    return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
  },
  validModes: ['tutorial', 'online', 'library', 'single', 'local'],
  setMode: function (mode, recover) {
    if (mode && game[mode] && game[mode].build && game.validModes.indexOf(mode) >= 0) {
      game.mode = mode;
      game.setData('mode', mode);
      game.container.removeClass(game.validModes.join(' '));
      game.container.addClass(mode);
      game[mode].build(recover);
    }
  },
  matchClear: function () {
    game.states.config.clearSize();
    game.size = 's5v5';
    game.recovering = false;
    game.player.picks = false;
    game.enemy.picks = false;
    game.setData('challenger', false);
    game.setData('challenged', false);
    game.setData('challengerDeck', false);
    game.setData('challengedDeck', false);
    game.setData('matchData', false);
    game.setData('seed', false);
  },
  clear: function () {
    game.message.removeClass('alert').html('');
    if (game.mode && game[game.mode] && game[game.mode].clear) {
      game[game.mode].clear();
    }
    game.states.choose.clear();
    game.states.vs.clear();
    game.states.table.clear();
    game.states.result.clear();
    game.container.removeClass(game.validModes.join(' '));
    game.mode = false;
    game.setData('mode', false);
  },
  resolve: function (path, obj) {
    return path.split('.').reduce(function (prev, curr) {
      return prev ? prev[curr] : null;
    }, obj || game);
  },
  reset: function (details) {
    game.overlay.confirm(details, function (confirmed) {
      if (confirmed) {
        //game.clear();
        //game.setData('state', 'menu');
        //location.reload(true);
      }
    });
  }
};
