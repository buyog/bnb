/***************************/
//@Author: Ryan Corradini
//@website: www.buyog.com
//@email: ryancorradini@yahoo.com
//@license: Free to use & modify, but please keep this credits message
/***************************/

define(
    ["atto/core", "atto/event", "tangle/AssetCache", "TileSet"],
    function(atto, AttoEvent, AssetCache, TileSet) {
    "use strict";
        function constructor(args) {
            var _assets  = new AssetCache(),
                _canvas  = args.canvas,
                _context = null,
                _attrs   = {
                    width: _canvas && _canvas.width || 0,
                    height: _canvas && _canvas.height || 0
                },
                _inputs = {
                    CLICK: 'mouse_click'
                },
                _inputBuffer = [],
                _tiles = new TileSet(8,8),
                _currentState = 0,
                _p1score = 0,
                _p2score = 0,
                _activePlayer;
            var bgColor   = "#49C34F",
                textColor = "white",
                blakColor = "black",
                blooColor = "#00c1f1",
                smallFont = "18px cursive, sans-serif",
                bigFont   = "64pt cursive, sans-serif";


            /* ----------------------
                initialization stuff
               ---------------------- */
            if (_canvas) {
                _context = _canvas.getContext('2d');
                atto.addEvent(_canvas, 'mousedown', handleMouseDown);
                atto.addEvent(_canvas, 'click', handleMouseClick);
            }

            function handleMouseDown(e) {
                var p = _getPos(e);
                switch (_currentState) {
                    case 0:     // loading
                        // TODO: draw a "pond ripple" or something if clicked while loading
                        break;

                    case 1:     // title
                        // highlight any clicked menu item
                        if (_inRect(p, 0, 330, 320, 370)) {
                            // "TAP OR CLICK..."
                            _context.fillStyle = "rgba(255,255,255,0.2)";
                            _context.fillRect(0, 330, 320, 40);
                        }
                        break;

                    case 2:     // playing
                        // TODO: check if click is on any virtual buttons, and if so, activate that button
                        if (_inRect(p, 60, 50, 120, 75)) {
                            // P1 score clicked
                            _p1score++;
                            _context.strokeRect(60, 50, 60, 25);
                        } else if (_inRect(p, 190, 50, 250, 75)) {
                            // P2 score clicked
                            _p2score++;
                            _context.strokeRect(190, 50, 60, 25);
                        }
                        break;

                    default:
                        break;
                }
            }

            function handleMouseClick(e) {
                var p = _getPos(e);
                switch (_currentState) {
                    case 0:     // loading
                        break;

                    case 1:     // title
                        // determine which menu item is clicked
                        if (_inRect(p, 0, 330, 320, 370)) {
                            // "TAP OR CLICK..."
                            _changeState(2);
                        } else {
                            _context.beginPath();
                            _context.arc(p.x, p.y, 15, 0, Math.PI*2, true);
                            _context.closePath();
                            _context.fill();
                        }
                        break;

                    case 2:     // playing
                        // if click is in tile backet, buffer & hand it off to the tileset's update call
                        if (_inRect(p, 20,90, 300,370)) {
                            _bufferInput(_inputs.CLICK, p);
                        } else if (_inRect(p, 28,390, 108,470)) {
                            _context.fillStyle = "rgba(128,128,128,0.2)";
                            _context.fillRect(28,390, 80,80);
                            _tiles.panic();

                        } else if (_inRect(p, 210, 390, 290,470)) {
                            _context.fillStyle = "rgba(255,64,64,0.2)";
                            _context.fillRect(210,390, 80,80);
                            _tiles.reload();

                        } else {
                            console.log('click:', p.x, p.y);
                            _context.beginPath();
                            _context.arc(p.x, p.y, 15, 0, Math.PI*2, true);
                            _context.closePath();
                            _context.fill();
                        }
                        break;

                    default:
                        break;
                }
            }

            function _inRect(pos, x0, y0, x1, y1) {
                return (pos.x > x0 && pos.y > y0 && pos.x < x1 && pos.y < y1);
            }

            function _getPos(e) {
                var posx = 0;
                var posy = 0;
                if (!e) var e = window.event;
                if (e.pageX || e.pageY)     {
                    posx = e.pageX;
                    posy = e.pageY;
                }
                else if (e.clientX || e.clientY)    {
                    posx = e.clientX + document.body.scrollLeft
                        + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop
                        + document.documentElement.scrollTop;
                }

                // account for container offset, if any
                if (e.target.offsetLeft) posx = posx - e.target.offsetLeft;
                if (e.target.offsetTop)  posy = posy - e.target.offsetTop;

                // posx and posy contain the mouse position relative to the document
                return {x:posx, y:posy};
            }

            function _bufferInput(inpType, details) {
                // this should probably include a debouncer at some point...
                //console.log(inpType);
                _inputBuffer.push([inpType,details]);
            }

            // preload assets
            _assets.addAsset( "title", "assets/title.png" );
            _assets.addAsset( "board", "assets/board.png" );
            _assets.addAsset( "berries", "assets/berries.png"  );

            function _changeState(n) {
                // do any "before state" stuff here
                var img = null;
                if (_currentState != n) {
                    _currentState = n;
                    switch (n) {
                        case 0:     // loading
                            _context.fillStyle = bgColor;
                            _context.fillRect(0,0, _attrs.width, _attrs.height);

                            _context.font         = bigFont;
                            _context.textBaseline = 'top';
                            _context.fillStyle = textColor;
                            _context.fillText('Loading...', 25, 25);
                            break;

                        case 1:     // title
                            img = _assets.getAsset('title');

                            _context.fillStyle = bgColor;
                            _context.fillRect(0,0, _attrs.width, _attrs.height);
                            _context.fillStyle = textColor;
                            _context.fillRect(0,65, _attrs.width, 195);

                            if (img) {
                                _context.drawImage(img, 20, 90, 289, 269);
                            } else {
                                _context.font = bigFont;
                                _context.textBaseline = 'top';
                                _context.fillStyle = blakColor;
                                _context.fillText('Blak &', 20, 60);

                                _context.fillStyle = blooColor;
                                _context.fillText('Bloo', 135, 135);

                                _context.font      = smallFont;
                                _context.fillStyle = textColor;
                                _context.fillText('TAP OR CLICK TO START', 48, 340);
                            }
                            break;

                        case 2:     // playing
                            _context.fillStyle = bgColor;
                            _context.fillRect(0,0, _attrs.width, _attrs.height);

                            // draw score area
                            img = _assets.getAsset('title');
                            _context.drawImage(img, 0,0, 280,70, 57,10, 120,30);       // "Blak &"
                            _context.drawImage(img, 110,70, 179,70, 187,10, 79,30);    // "Bloo"
                            _context.beginPath();
                            _context.moveTo(40,44);
                            _context.lineTo(280,44);
                            _context.closePath();
                            _context.stroke();

                            // draw buttons (placeholder until I get self-managing game elements / sprites)
                            _context.font = bigFont;
                            _context.textBaseline = 'top';

                            // reload button
                            _context.fillStyle = "pink";
                            _context.fillRect(28,390, 80,80);
                            _context.fillStyle = textColor;
                            _context.fillText('#', 30,366);


                            // reload button
                            _context.fillStyle = "brown";
                            _context.fillRect(210,390, 80,80);
                            _context.fillStyle = textColor;
                            _context.fillText('@', 212,366);

                            break;

                        default:
                            break;
                    }
                }
            }


            /* ---------------------
                 public interfaces
               --------------------- */
            function _tick() {
                switch (_currentState) {
                    case 0:     // loading
                        if (_assets.ready())
                            _changeState(1);
                        break;

                    case 1:     // title
                        break;

                    case 2:     // playing
                        _tiles.tick(this, _inputBuffer.pop());
                        break;

                    default:
                        break;
                }
            }

            function _draw() {
                var img = null;
                switch (_currentState) {
                    case 0:     // loading
                        // TBD: animate a "loading..." marque
                        break;

                    case 1:     // title
                        // TBD: flash the "press any key" marquee
                        break;

                    case 2:     // playing
                        img = _assets.getAsset('board');
                        _context.drawImage(img, 10, 80, 300, 300);

                        // render the tile grid
                        _tiles.render(this, _context)

                        // draw scores
                        _context.fillStyle = bgColor;
                        _context.fillRect(0,50, 320,25);

                        _context.font = smallFont;
                        _context.textBaseline = 'top';
                        _context.fillStyle = textColor;
                        _context.fillText(_p1score, 85, 50);
                        _context.fillText(_p2score, 215, 50);

                        break;

                    default:
                        break;
                }
            }


            function _panic() {
                _tiles.panic();
            }

            return {
                update : _tick,
                render : _draw,
                panic  : _panic,

                attrs  : _attrs,
                assets : _assets,
                ctx    : _context,
                tiles  : _tiles
            };
        } // end of constructor

        return constructor;
    } // end AMD callback function
);
