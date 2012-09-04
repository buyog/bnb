<!DOCTYPE html>
<html>
  <head>
    <title>Blak &amp; Bloo</title>

    <link rel="stylesheet" href="/fonts/geometry/stylesheet.css" type="text/css" charset="utf-8">
    <link rel="stylesheet" href="main.css" type="text/css" charset="utf-8">
  </head>
  <body>
    <div class="main">
      <div id="game">
        <canvas id="mainCanvas" width='320' height='240'>
          <p>OOPS!</p>
          <p>Looks like your browser can't speak "canvas".</p>
          <p>This game requires a fairly modern browser; please update and try again.</p>
          <p>Sorry about that.</p>
        </canvas>
        <div id="overlay" class='intro'>
            <p class='banner_0'>LOADING...</p>
            <p class='banner_1'>START</p>
            <p class='banner_2'>LET'S PLAY!</p>
        </div>
      </div>

      <section id="info">
          <strong>Current game state:</strong>
          <p id="status"></p>
      </section>
      <button id="btnGoFS" disabled='disabled' class='hidden'>Fullscreen</button>

    </div>

    <script src="../../require.js" data-main="js/js13k/startup"></script>
  </body>
</html>