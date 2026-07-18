(function(){
  var BUBBLE_ID='ultra-fast-widget-bubble-54722168';
  var KEY='aidDemoWidgetAutoOpened';
  try{if(sessionStorage.getItem(KEY))return;}catch(e){}
  var userTouched=false;
  document.addEventListener('click',function(e){
    if(e.isTrusted&&e.target&&e.target.closest&&e.target.closest('#'+BUBBLE_ID)){userTouched=true;}
  },true);
  var tries=0;
  var t=setInterval(function(){
    tries+=1;
    var b=document.getElementById(BUBBLE_ID);
    if(b&&tries>=7){
      clearInterval(t);
      if(!userTouched){b.click();}
      try{sessionStorage.setItem(KEY,'1');}catch(e){}
    }
    if(tries>30){clearInterval(t);}
  },1000);
})();

(function(){
  // ======================================================
  // prefers-reduced-motion gate (spec: JS-driven, not CSS-only)
  // ======================================================
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reducedMotion(){ return !!motionQuery.matches; }

  // ======================================================
  // SMS thread staged reveal + typing indicators, replayable
  // ======================================================
  var thread = document.getElementById('thread');
  var b0 = document.getElementById('b0');
  var b1 = document.getElementById('b1');
  var b2 = document.getElementById('b2');
  var b3 = document.getElementById('b3');
  var t1 = document.getElementById('typing1');
  var t2 = document.getElementById('typing2');
  var replayBtn = document.getElementById('replayBtn');
  var timers = [];
  var playing = false;

  function clearTimers(){ timers.forEach(function(t){ clearTimeout(t); }); timers = []; }

  function resetThread(){
    [b0,b1,b2,b3].forEach(function(b){ b.classList.remove('show'); });
    [t1,t2].forEach(function(t){ t.classList.remove('show'); });
  }

  function showThreadFinal(){
    clearTimers();
    playing = false;
    [b0,b1,b2,b3].forEach(function(b){ b.classList.add('show'); });
    [t1,t2].forEach(function(t){ t.classList.remove('show'); });
  }

  function playThread(){
    if (reducedMotion()){ showThreadFinal(); return; }
    if (playing) return;
    playing = true;
    clearTimers();
    resetThread();
    var seq = [
      { t: 240,  fn: function(){ b0.classList.add('show'); } },
      { t: 920,  fn: function(){ t1.classList.add('show'); } },
      { t: 1850, fn: function(){ t1.classList.remove('show'); b1.classList.add('show'); } },
      { t: 2700, fn: function(){ b2.classList.add('show'); } },
      { t: 3280, fn: function(){ t2.classList.add('show'); } },
      { t: 4200, fn: function(){ t2.classList.remove('show'); b3.classList.add('show'); playing = false; } }
    ];
    seq.forEach(function(s){ timers.push(setTimeout(s.fn, s.t)); });
  }

  replayBtn.addEventListener('click', function(){
    replayBtn.classList.add('spin');
    setTimeout(function(){ replayBtn.classList.remove('spin'); }, 520);
    playThread();
  });

  // Re-arm on scroll re-entry (spec: nothing plays once and dies)
  if ('IntersectionObserver' in window){
    var demoIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          playThread();
        } else if (!reducedMotion()){
          clearTimers();
          playing = false;
          resetThread();
        }
      });
    }, { threshold: 0.3 });
    demoIO.observe(thread);
  } else {
    playThread();
  }

  // ======================================================
  // Scroll reveal for sections (one-time entrance, honors reduced-motion)
  // ======================================================
  var reveals = document.querySelectorAll('.reveal');
  if (reducedMotion()){
    reveals.forEach(function(el){ el.classList.add('visible'); });
  } else if ('IntersectionObserver' in window){
    var revealIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function(el){ revealIO.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('visible'); });
  }

  // ======================================================
  // Animated counter: $12,000 (NC roof replacement baseline)
  // Source: oldtimersroofing.com/north-carolina-roof-insurance-changes-2026/
  // Stat: NC full replacement $12k-$22k+. Using $12k as the lower-bound anchor.
  // Re-arms on every scroll re-entry + manual replay button.
  // ======================================================
  var statEl = document.getElementById('statNumber');
  var statReplayBtn = document.getElementById('statReplayBtn');
  if (statEl){
    var dollarNode = document.createTextNode('$12');
    var centsSpan = document.createElement('span');
    centsSpan.className = 'cents';
    centsSpan.textContent = ',000';
    statEl.textContent = '';
    statEl.appendChild(dollarNode);
    statEl.appendChild(centsSpan);

    var STAT_TARGET = 12000;
    var countRun = 0;

    function showStatFinal(){
      countRun++;
      dollarNode.textContent = '$' + Math.floor(STAT_TARGET / 1000);
      centsSpan.textContent = ',' + String(STAT_TARGET % 1000).padStart(3, '0');
    }

    function runCount(){
      if (reducedMotion()){ showStatFinal(); return; }
      var runId = ++countRun;
      var dur = 1350;
      var start = null;
      function step(ts){
        if (runId !== countRun) return;
        if (!start) start = ts;
        var progress = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.round(eased * STAT_TARGET);
        var dollars = Math.floor(val / 1000);
        var cents = String(val % 1000).padStart(3, '0');
        dollarNode.textContent = '$' + dollars;
        centsSpan.textContent = ',' + cents;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (reducedMotion()){ showStatFinal(); }

    if ('IntersectionObserver' in window){
      var statIO = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ runCount(); }
        });
      }, { threshold: 0.38 });
      statIO.observe(statEl);
    }

    if (statReplayBtn){
      statReplayBtn.addEventListener('click', function(){
        statReplayBtn.classList.add('spin');
        setTimeout(function(){ statReplayBtn.classList.remove('spin'); }, 520);
        runCount();
      });
    }

    // Mid-session reduced-motion toggle: snap to final state
    if (motionQuery.addEventListener){
      motionQuery.addEventListener('change', function(){
        if (reducedMotion()){ showStatFinal(); showThreadFinal(); }
      });
    }
  }

  // ======================================================
  // A1: Sticky mobile CTA bar -- hide while real CTA panel is in view
  // ======================================================
  var mobileCta = document.getElementById('mobileCta');
  var ctaSection = document.querySelector('.cta-section');
  if (mobileCta && ctaSection && 'IntersectionObserver' in window){
    var ctaIO = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          mobileCta.classList.add('hidden');
        } else {
          mobileCta.classList.remove('hidden');
        }
      });
    }, { threshold: 0.1 });
    ctaIO.observe(ctaSection);
  }

  // Reduced motion from first paint: SMS thread shows fully, no sequence
  if (reducedMotion()){ showThreadFinal(); }
})();