var Draggable = Class.create({
  initialize: function(element, options) {
    this.element = $(element);
    
    this.options = Object.extend({
      onDrag: Prototype.emptyFunction,
      onDrop: Prototype.emptyFunction
    }, options || { });
    
    Draggable.draggables.push(this.element);
    
    this.element.observe('drag:prepare', this.prepare.bind(this));
    this.element.observe('drag:release', this.release.bind(this));
  },
  
  prepare: function(event) {
    if (this.options.handle) {
      if (event.element().hasClassName(this.options.handle))
        Draggable.active = this;
      else
        return false;
    }
    Draggable.active = this;
  },
  
  setDelta: function(event) {
    this.absolutes = this.element.cumulativeOffset();
    this.delta = { 
      x: event.clientX - this.absolutes.left, 
      y: event.clientY - this.absolutes.top 
    };
  },
  
  release: function(event) {
    this.delta = null;
    Draggable.active = null;
    this.options.onDrop();
  },
  
  onDrag: function(event) {
    if (!this.delta)
      this.setDelta(event);

    var left = event.clientX - this.delta.x;
    var top  = event.clientY - this.delta.y;
    
    if(this.options.beforeDrag) {
      var result = this.options.beforeDrag(this, left, top);
      left = result.left;
      top = result.top;
    }
    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';

    this.options.onDrag();
  }
});

Object.extend(Draggable, {
  draggables: [],
  active: null,
  
  isDraggable: function(element) {
    if (Draggable.draggables.include(element))
      return true;
    else {
      return Draggable.draggables.select(function(draggable) {
        return element.descendantOf(draggable);
      }).length > 0;
    }
  },
  
  isActiveDraggable: function(element) {
    if (Draggable.active)
      return Draggable.active.element == element || element.descendantOf(Draggable.active.element);
    else
      return false;
  }
});

// TODO: make DragRelations more generic, provide callbacks
var DragRelation = Class.create({
  initialize: function(draggables, options) {
    this.draggables = draggables || [];

    this.options = Object.extend({
      snapX: 10,
      snapY: 10
    }, options);

    this.draggables.each(function(draggable){
      draggable.options.beforeDrag = this.checkRelations.bind(this);
    }.bind(this));
  },
  
  checkRelations: function(currentDraggable, proposedLeft, proposedTop) {
    // TODO: Make this performing better, check for smallest delta!
    var left = proposedLeft, top = proposedTop;
    this.draggables.each(function(draggable){
      if(draggable != currentDraggable) {
        
        var deltaX = proposedLeft - draggable.element.offsetLeft;
        var deltaY = proposedTop  - draggable.element.offsetTop;
        
        var x = this.options.snapX, y = this.options.snapY;
        
        if((deltaX < x && deltaX > 0) || (deltaX > -x && deltaX < 0)) {
          left = draggable.element.offsetLeft;
          Ruler.show('x', draggable.element.offsetLeft);
        }
        else {
          Ruler.hide('x');
        }
        
        if((deltaY < y && deltaY > 0) || (deltaY > -y && deltaY < 0)) {
          top = draggable.element.offsetTop;
          Ruler.show('y', draggable.element.offsetTop);
        }
        else {
          Ruler.hide('y');
        }
      }
    }.bind(this));

    return { left: left, top: top };
  },
  
  addDraggable: function(draggable) {
    draggable.options.beforeDrag = this.checkRelations.bind(this);
    this.draggables.push(draggable);
  }
});

Object.extend(String.prototype, {
  toInt: function() {
    return parseInt(this);
  }
});

(function() {
  function checkForDraggables(event) {
    if (Draggable.isDraggable(event.element()))
      event.element().fire('drag:prepare');
  };

  function releaseDraggables(event) {
    // TODO: Release should be done when document fires mouseup. When the mouse is up, no drag can be active.
    if (Draggable.isActiveDraggable(event.element())) {
      event.element().fire('drag:release');
    }
  };

  function drag(event) {
    if (Draggable.active)
      Draggable.active.onDrag(event);
  };

  function processKey(event) {
    if(event.keyCode == Event.KEY_ESC) {
      var customEvent = event.element().fire('escape:pressed');
      if (customEvent.stopped) event.stop();
    }
  };

  document.observe('mousedown', checkForDraggables);
  document.observe('mouseup', releaseDraggables);
  document.observe('mousemove', drag);
  document.observe('keypress', processKey);
})();