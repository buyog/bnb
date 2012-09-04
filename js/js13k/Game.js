/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    ["atto/core", "atto/event", "tangle/AssetCache", "tangle/StateManager", "TileSet"],
    function(atto, AttoEvent, AssetCache, StateManager, TileSet) {
    "use strict";
        function constructor(args) {
            var _assets  = new AssetCache(),
                _states  = new StateManager(),
                _canvas  = args.canvas,
                _overlay = args.overlay,
                _context = null,
                _attrs   = {
                    width: _canvas && _canvas.width || 0,
                    height: _canvas && _canvas.height || 0
                },
                _inputs = {
                    ENTER: 'key_enter',
                    CLICK: 'mouse_click'
                },
                _inputBuffer = [],
                _tiles = new TileSet(8,8);


            /* ----------------------
                initialization stuff
               ---------------------- */
            if (_canvas) {
                _context = _canvas.getContext('2d');
                atto.addEvent(_canvas, 'click', function() { _bufferInput(_inputs.CLICK); });
            }
            atto.addEvent(window, 'keydown', function(e) {
                switch (e.keyCode) {
                    case 13:
                        _bufferInput(_inputs.ENTER);
                    default:
                        break;
                }
            });

            function _bufferInput(inpType) {
                console.log(inpType);
                _inputBuffer.push(inpType);
            }


            // init state machine
            _states.addState({
                id: 0,
                title: 'Loading',
                before: function() {},
                tick: function(game) {
                    if (_assets.ready()) {
                        // assets are ready!
                        return 1;   // change to state 1
                    } else {
                        // still waiting for assets...
                        return;     // no change in state
                    }
                },
                render: function(game, context) {
                    context.fillStyle = "rgb(73,195,79)";
                    context.fillRect(0,0, game.attrs.width, game.attrs.height);

                    context.fillStyle = "#ffffff";
                    context.fillText('Loading...', 25, 25);
                }
            });
            _states.addState({
                id: 1,
                title: 'Title',
                before: function() {
                    //console.log('title:', _overlay);
                    _overlay.className = 'title';
                },
                tick: function(game) {
                    if ((_inputBuffer.indexOf(_inputs.ENTER) > -1)
                        || (_inputBuffer.indexOf(_inputs.CLICK) > -1)) {
                        _inputBuffer = [];
                        return 2;
                    } else {
                        return;
                    }
                },
                render: function(game, context) {
                    var imgSplash = game.assets.getAsset('title');
                    if (imgSplash) {
                        context.drawImage(imgSplash, 0,0, game.attrs.width, game.attrs.height);
                    } else {
                        context.clearRect(0,0, game.attrs.width, game.attrs.height);
                        context.fillText('Hello world!', 25, 25);
                    }
                }
            });
            _states.addState({
                id: 2,
                title: 'Play',
                before: function() {
                    _overlay.className = 'play';
                },
                tick: function(game) {
                    _tiles.tick();
                },
                render: function(game, context) {
                    context.fillStyle = "rgb(73,195,79)";
                    context.fillRect(0,0, game.attrs.width, game.attrs.height);

                    context.fillStyle = "rgb(0,0,0)";   //rgb(168, 131, 64)";
                    context.fillRect(60,20, game.attrs.width-120, game.attrs.height-40);

                    context.strokeWidth = 20;
                    context.strokeStyle = "#ffffff";
                    context.strokeRect(62,22, game.attrs.width-124, game.attrs.height-44);

                    // render the tile grid
                    _tiles.render(context)
                }
            });


            // preload assets
            _assets.addAsset( "title", "assets/title.png" );
            _assets.addAsset( "berries", "assets/berries.png"  );
            //_assets.addAsset( "bgm",   "assets/mushroom_dance_0.ogg" );



            /* ---------------------
                 public interfaces
               --------------------- */
            function _tick() {
                _states.tick(this);
                _states.render(this, _context);
            }

            function _panic() {
                _tiles.panic();
            }

            return {
                tick   : _tick,
                panic  : _panic,

                attrs  : _attrs,
                assets : _assets,
                states : _states,
                ctx    : _context,
                tiles  : _tiles
            };
        } // end of constructor

        return constructor;
    } // end AMD callback function
);
