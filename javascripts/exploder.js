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
    this.draggables = [];
    var w = this.picture.getWidth() / 3, h = this.picture.getHeight() / 3,
        p = this.picture.cumulativeOffset(), offset = 15;
    (3).times(function(i) {
      (3).times(function(j) {
        var piece = new Element('div', { className: 'piece' }).setStyle({
          width: w + 'px',
          height: h + 'px',
          position: 'absolute',
          left: p.left + j*w + 'px',
          top: p.top + i*h + 'px',
          backgroundPosition: '-' + j*w + 'px' + ' -' + i*h + 'px',
          backgroundImage: 'url(' + this.picture.src + ')',
          cursor: 'move'
        });
        var x = p.left + j*w + (j-1) * offset, y = p.top + i*h + (i-1) * offset;
        this.positions.push({ left: x, top: y });
        this.pieces.push(piece);
        this.container.insert(piece);
        this.draggables.push(new Draggable(piece, { 
          onDrag: this.onDrag.bind(this),
          onDrop: this.onDrop.bind(this)
        }));
      }, this);
    }, this);
    this.picture.setOpacity(0);
  },

  renderPositions: function(pieces, options) {
    options = Object.extend({ 
      omitElement: null,
      after: Prototype.emptyFunction,
      duration: .4
    }, options || {});
    var fx = pieces.map(function(piece, i) {
      if (options.omitElement == piece) {
        return null;
      }
      return new s2.fx.Morph(piece, {
        style: { left: this.positions[i].left + 'px', top: this.positions[i].top + 'px' }
      });
    }, this).compact();
    this.fx = new s2.fx.Parallel(fx, options).play();
  },

  explode: function() {
    this.renderPositions(this.pieces, { 
      transition: 'explode', duration: .4, after: this.shuffle.bind(this)
    });
  },

  shuffle: function() {
    this.pieces = this.pieces.shuffle();
    this.renderPositions(this.pieces);
  },

  reset: function() {
    if (!this.pieces)
      return;
    this.pieces.each(Element.remove);
    this.picture.setOpacity(1);
  },
  
  getDragTarget: function(draggable) {
    function overlap(o1, o2) {
      var overlapping = (o1[0]>=o2[0] && o1[0]<=o2[2] && o1[1]>=o2[1] && o1[1]<=o2[3]) ||
          (o1[2]>=o2[0] && o1[2]<=o2[2] && o1[3]>=o2[1] && o1[3]<=o2[3]) ||
          (o1[0]>=o2[0] && o1[2]<=o2[2] && o1[1]>=o2[1] && o1[3]<=o2[3]) ||
          (o1[2]>=o2[0] && o1[0]<=o2[2] && o1[3]>=o2[1] && o1[1]<=o2[3]);
      if (overlapping) {
        var f1 = (o1[2]-o1[0])*(o1[3]-o1[1]),
            f2 = (o2[2]-o2[0])*(o2[3]-o2[1]),
            ovl = [o1[0]>o2[0]?o1[0]:o2[0], o1[1]>o2[1]?o1[1]:o2[1], o1[3]<o2[3]?o1[2]:o2[2], o1[3]<o2[3]?o1[3]:o2[3]],
            a = ovl[2]-ovl[0],
            b = ovl[3]-ovl[1];
        return f1>f2 ? ((a*b)/f2) : ((a*b)/f1);
      } 
      else {
        return 0;
      }
    }
    return this.pieces.without(draggable).sortBy(function(piece) {
      var o1 = { pos: draggable.cumulativeOffset(), dims: draggable.getDimensions() },
          o2 = { pos: piece.cumulativeOffset(), dims: piece.getDimensions() };
      return overlap(
        [o1.pos.left, o1.pos.top, o1.pos.left+o1.dims.width, o1.pos.top+o1.dims.height],
        [o2.pos.left, o2.pos.top, o2.pos.left+o2.dims.width, o2.pos.top+o2.dims.height]
      );
    }).last();
  },
  
  onDrag: function(event, draggable) {
    var target = this.getDragTarget(draggable);

    if (!target.hasClassName('piece'))
      return;

    this.reorderTo(target, draggable);

    if (this.fx.state == 'running')
      this.fx.cancel();

    this.renderPositions(this.pieces, { 
      omitElement: draggable,
      after: this.checkOrder.bind(this),
      duration: .2
    });  
  },  
  
  onDrop: function(event, draggable) {
    this.renderPositions(this.pieces);
  },
  
  reorderTo: function(target, draggable) {
    var sourceIndex = this.pieces.indexOf(draggable);
    this.pieces.splice(sourceIndex, 1);

    var targetIndex = this.pieces.indexOf(target);

    if (targetIndex >= sourceIndex) targetIndex++;
    this.pieces.splice(targetIndex, 0, draggable);
  },
  
  checkOrder: function() {
    
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

document.ondragstart = function() { return false; };