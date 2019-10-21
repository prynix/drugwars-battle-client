game.units = {
  build: function (side) {
    game[side].unitsDeck = game.deck.build({
      name: 'units',
      cb: function (deck) {  //console.log(deck.data('cards'));
        deck.addClass(side+' units cemitery').hide().appendTo(game.states.table[side]);
        $.each(JSON.parse(deck.data('cards')), function (i, card) {
          $('#'+card).addClass(side+' unit').data('side', side);
        });
      }
    });
  },
  buyCreeps: function(side, force, catapultforce) {
    var ranged, melee, catapult;
    if (game[side].turn === game.creepTurn || force) {
      game.units.buy(side);
    }
  },
  clone: function (cardEl) {
    var card = $(cardEl).first();
    return card.clone().data(card.data());
  },
  buy: function (side) {
    game[side].picks.forEach(function (pick) {
      var unit = game.units.clone(game[side].unitsDeck.children('.unit-'+pick));
      unit.appendTo(game[side].skills.hand);
      unit.on('mousedown touchstart', game.card.select);
      var xstr = 'X';
      if (game[side].cardsAmount[pick] > 999) xstr = '';
      $('.amount', unit).text(xstr+game[side].cardsAmount[pick]);
      if (!(side == 'player' || game.mode == 'library' || game.mode == 'local')) {
        unit.addClass('flipped');
      }
    });
  },
  buyCatapult: function (side) {
    var ranged = game.units.clone(game[side].unitsDeck.children('.creeps-ranged'));
    ranged.appendTo(game[side].skills.sidehand);
    var melee = game.units.clone(game[side].unitsDeck.children('.creeps-melee'));
    melee.appendTo(game[side].skills.sidehand);
    var catapult = game.units.clone(game[side].unitsDeck.children('.creeps-catapult'));
    catapult.appendTo(game[side].skills.sidehand);
    var summon = game.units.clone(game[side].unitsDeck.children('.summon'));
    if (summon) summon.appendTo(game[side].skills.sidehand);
    ranged.on('mousedown touchstart', game.card.select);
    melee.on('mousedown touchstart', game.card.select);
    catapult.on('mousedown touchstart', game.card.select);
    if (summon) summon.on('mousedown touchstart', game.card.select);
    if (!(side == 'player' || game.mode == 'library' || game.mode == 'local')) {
      ranged.addClass('flipped');
      melee.addClass('flipped');
      catapult.addClass('flipped');
      if (summon) summon.addClass('flipped');
    }
  },
  forestCreep: function (side, target) {
    var forestCreeps = game[side].unitsDeck.children('.forest');
    var r = Math.floor(game.random() * forestCreeps.length);
    var creep = game.units.clone(forestCreeps[r]);
    creep.addClass(side);
    creep.appendTo(target);
    creep.on('mousedown touchstart', game.card.select);
    //if (side == 'enemy') creep.addClass('flipped');
    return creep;
  },
  summonCreep: function(target, to, creep, event) {
    var card = game.selectedCard;
    game.fx.add('spawn-unit', target);
    if (target.hasClass('free')) {
      game.audio.play('activate');
      if (card.canPlay()) game.highlight.clearMap();
      else game.highlight.refresh();
      var end = function() {
        game.fx.text(this.creep, 'z');
        this.creep.place(this.target);
        this.creep.trigger('summon');
      }.bind({
        creep: game.selectedCard,
        target: target.attr('id')
      });
      if (!game.selectedCard.hasClass('dragTarget')) {
        game.skill.animateCast(game.selectedCard, target, event, end);
      } else end();
    }
  }
};