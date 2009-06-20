var Exploder = {
  initialize: function() {
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
          backgroundImage: 'url(' + this.picture.src + ')'
        });
        var x = p.left + i*w + (i-1) * offset, y = p.top + j*h + (j-1) * offset;
        this.positions.push({ left: x, top: y });
        this.pieces.push(piece);
        this.container.insert(piece);
      }, this);
    }, this);
    this.picture.setOpacity(0);
  },

  renderPositions: function(pieces) {
    var fx = pieces.map(function(piece, i) {
      return new s2.fx.Morph(piece, {
        style: { left: this.positions[i].left + 'px', top: this.positions[i].top + 'px' }
      });
    }, this);
    this.fx = new s2.fx.Parallel(fx, { duration: .7, transition: 'bounce' }).play();
  },

  explode: function() {
    this.renderPositions(this.pieces);
  }
};