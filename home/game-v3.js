(function () {
  'use strict';

  var missions = [
    { id: 'projects', title: 'PROJECTS', description: '开源工具、自动化、本地AI，以及已经跑起来的实验。', target: '#work', meter: 88, color: '#53e6a5', position: 12 },
    { id: 'tools', title: 'PLAYABLE TOOLS', description: '润值计算器、移民判断工具，以及后面会继续长出来的小东西。', target: 'https://articles.suispasdavinci.com/tools/run-worth/', meter: 72, color: '#ffd54a', position: 37 },
    { id: 'articles', title: 'ARTICLES', description: '加拿大、AI、普通人的重启，以及不适合写成鸡汤的东西。', target: 'https://articles.suispasdavinci.com', meter: 64, color: '#64d8ff', position: 63 },
    { id: 'about', title: 'PLAYER STORY', description: '从Excel混进程序员岗位，一个不太标准的技术工作者。', target: '#about', meter: 96, color: '#b6a1ff', position: 88 }
  ];

  function setupGame() {
    var consoleNode = document.querySelector('[data-game-console]');
    var viewport = document.querySelector('[data-game-viewport]');
    var player = document.querySelector('[data-player]');
    if (!consoleNode || !viewport || !player) return;

    var title = document.querySelector('[data-game-title]');
    var description = document.querySelector('[data-game-description]');
    var count = document.querySelector('[data-game-count]');
    var meter = document.querySelector('[data-game-meter]');
    var hint = document.querySelector('[data-proximity-hint]');
    var startButton = document.querySelector('[data-game-start]');
    var leftButton = document.querySelector('[data-move-left]');
    var rightButton = document.querySelector('[data-move-right]');
    var confirmButton = document.querySelector('[data-game-confirm]');
    var stations = Array.prototype.slice.call(document.querySelectorAll('[data-station]'));
    var stageCards = Array.prototype.slice.call(document.querySelectorAll('[data-stage-id]'));

    var current = 0;
    var playerX = missions[0].position;
    var active = false;
    var leftHeld = false;
    var rightHeld = false;
    var lastFrame = 0;
    var lastDirection = 1;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

    function nearestMissionIndex() {
      var bestIndex = 0;
      var bestDistance = Infinity;
      missions.forEach(function (mission, index) {
        var distance = Math.abs(playerX - mission.position);
        if (distance < bestDistance) { bestDistance = distance; bestIndex = index; }
      });
      return bestIndex;
    }

    function render(index) {
      current = (index + missions.length) % missions.length;
      var mission = missions[current];
      var distance = Math.abs(playerX - mission.position);
      title.textContent = mission.title;
      description.textContent = mission.description;
      count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(missions.length).padStart(2, '0');
      meter.style.width = mission.meter + '%';
      consoleNode.style.setProperty('--mission-color', mission.color);
      hint.textContent = distance <= 7 ? '入口已锁定，按ENTER进入' : '继续靠近入口，按ENTER进入';

      stations.forEach(function (station, stationIndex) {
        station.classList.toggle('is-near', stationIndex === current && distance <= 8);
      });
      stageCards.forEach(function (card) {
        var selected = card.getAttribute('data-stage-id') === mission.id;
        card.classList.toggle('is-game-selected', selected);
        card.style.setProperty('--mission-color', mission.color);
      });
    }

    function updatePlayer() {
      player.style.setProperty('--player-x', playerX.toFixed(2) + '%');
      player.classList.toggle('facing-left', lastDirection < 0);
      render(nearestMissionIndex());
    }

    function startGame() {
      if (!active) {
        active = true;
        consoleNode.classList.add('game-active');
        startButton.innerHTML = '<span>▶</span>GAME ACTIVE';
      }
      try { consoleNode.focus({ preventScroll: true }); }
      catch (error) { consoleNode.focus(); }
    }

    function setDirection(direction, held) {
      startGame();
      if (direction < 0) leftHeld = held;
      if (direction > 0) rightHeld = held;
      if (held) lastDirection = direction;
      player.classList.toggle('is-walking', leftHeld !== rightHeld);
    }

    function nudge(direction) {
      startGame();
      lastDirection = direction;
      player.classList.add('is-walking');
      playerX = clamp(playerX + direction * 8, 5, 95);
      updatePlayer();
      window.setTimeout(function () {
        if (!leftHeld && !rightHeld) player.classList.remove('is-walking');
      }, 180);
    }

    function moveToMission(index) {
      startGame();
      var mission = missions[index];
      lastDirection = mission.position < playerX ? -1 : 1;
      player.classList.add('is-walking');
      playerX = mission.position;
      updatePlayer();
      window.setTimeout(function () {
        if (!leftHeld && !rightHeld) player.classList.remove('is-walking');
      }, reduceMotion ? 0 : 220);
    }

    function confirmMission() {
      startGame();
      var mission = missions[current];
      viewport.classList.remove('is-confirming');
      void viewport.offsetWidth;
      viewport.classList.add('is-confirming');
      window.setTimeout(function () {
        viewport.classList.remove('is-confirming');
        if (mission.target.charAt(0) === '#') {
          var target = document.querySelector(mission.target);
          if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        } else {
          window.open(mission.target, '_blank', 'noopener,noreferrer');
        }
      }, reduceMotion ? 0 : 360);
    }

    function animationFrame(time) {
      if (!lastFrame) lastFrame = time;
      var delta = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      if (active && leftHeld !== rightHeld) {
        var direction = rightHeld ? 1 : -1;
        lastDirection = direction;
        playerX = clamp(playerX + direction * 29 * delta, 5, 95);
        updatePlayer();
      }
      window.requestAnimationFrame(animationFrame);
    }

    function bindHold(button, direction) {
      if (!button) return;
      var pressedAt = 0;
      button.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        pressedAt = performance.now();
        button.setPointerCapture(event.pointerId);
        button.classList.add('is-held');
        setDirection(direction, true);
      });
      function release(event) {
        if (!button.classList.contains('is-held')) return;
        button.classList.remove('is-held');
        setDirection(direction, false);
        if (performance.now() - pressedAt < 150) nudge(direction);
        if (event && button.hasPointerCapture && button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
      }
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', function () {
        button.classList.remove('is-held');
        setDirection(direction, false);
      });
    }

    startButton.addEventListener('click', startGame);
    confirmButton.addEventListener('click', confirmMission);
    bindHold(leftButton, -1);
    bindHold(rightButton, 1);

    consoleNode.addEventListener('keydown', function (event) {
      var key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft' || key === 'a') { event.preventDefault(); setDirection(-1, true); }
      else if (event.key === 'ArrowRight' || key === 'd') { event.preventDefault(); setDirection(1, true); }
      else if (event.key === 'Enter') { event.preventDefault(); confirmMission(); }
    });
    consoleNode.addEventListener('keyup', function (event) {
      var key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft' || key === 'a') setDirection(-1, false);
      if (event.key === 'ArrowRight' || key === 'd') setDirection(1, false);
    });
    window.addEventListener('blur', function () {
      leftHeld = false;
      rightHeld = false;
      player.classList.remove('is-walking');
    });
    stations.forEach(function (station, index) {
      station.addEventListener('click', function () { moveToMission(index); });
      station.addEventListener('focus', function () { render(index); });
      station.addEventListener('dblclick', confirmMission);
    });

    updatePlayer();
    window.requestAnimationFrame(animationFrame);
  }

  document.addEventListener('DOMContentLoaded', setupGame);
})();
