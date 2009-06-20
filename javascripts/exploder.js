var Exploder = {
  initialize: function() {
    this.reset();
    this.picture = $('demo');
    this.container = $(document.body);
    this.setup();
    this.explode();
  },

  setup: function() {
    this.pieces = [];
    this.positions = [];
    var w = this.picture.getWidth() / 3, h = this.picture.getHeight() / 3,
        p = this.picture.cumulativeOffset(), offset = 15;
    (3).times(function(i) {
      (3).times(function(j) {
        var piece = new Element('div').setStyle({
          width: w + 'px',
          height: h + 'px',
          position: 'absolute',
          left: p.left + i*w + 'px',
          top: p.top + j*h + 'px',
          backgroundPosition: '-' + i*w + 'px' + ' -' + j*h + 'px',
          backgroundImage: 'url(' + this.picture.src + ')',
          cursor: 'move'
        });
        var x = p.left + i*w + (i-1) * offset, y = p.top + j*h + (j-1) * offset;
        this.positions.push({ left: x, top: y });
        this.pieces.push(piece);
        this.container.insert(piece);
        new Draggable(piece);
      }, this);
    }, this);
    this.picture.setOpacity(0);
  },

  renderPositions: function(pieces, options) {
    var fx = pieces.map(function(piece, i) {
      return new s2.fx.Morph(piece, {
        style: { left: this.positions[i].left + 'px', top: this.positions[i].top + 'px' }
      });
    }, this);
    this.fx = new s2.fx.Parallel(fx, options || { duration: .4 }).play();
  },

  explode: function() {
    this.renderPositions(this.pieces, { 
      transition: 'explode', duration: .4, after: this.shuffle.bind(this)
    });
  },

  shuffle: function() {
    this.renderPositions(this.pieces.shuffle());
  },

  reset: function() {
    if (!this.pieces)
      return;
    this.pieces.each(Element.remove);
    this.picture.setOpacity(1);
  }
};

Object.extend(s2.fx.Transitions, {
  explode: function(pos) {
    return 1 - (Math.cos(pos * -5) * Math.exp(-pos * 1));
  }
});

Array.prototype.shuffle = function(){
  return this.sortBy(Math.random);
};