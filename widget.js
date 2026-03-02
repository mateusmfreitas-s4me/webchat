(function () {
  "use strict";

  // Evitar dupla inicialização
  if (window.__gcWebchatLoaded) return;
  window.__gcWebchatLoaded = true;

  // ===== 0. Ler configurações dos data-attributes =====
  // IMPORTANTE: capturar currentScript imediatamente (fica null após async)
  var scriptEl = document.currentScript;
  function cfg(attr, fallback) {
    return (scriptEl && scriptEl.getAttribute("data-" + attr)) || fallback;
  }

  // Cores
  var C_PRIMARY            = cfg("primary", "#202AD0");
  var C_LAUNCHER           = cfg("launcher-color", "#66E7E5");
  var C_BUBBLE_AGENT       = cfg("bubble-agent", "#f2f3f5");
  var C_BUBBLE_AGENT_TEXT  = cfg("bubble-agent-text", "#111");
  var C_BUBBLE_CUSTOMER_TEXT = cfg("bubble-customer-text", "#fff");

  // Textos
  var T_TITLE         = cfg("title", "Envie uma mensagem");
  var T_ICON          = cfg("icon", "https://kitsoescola.com/wp-content/uploads/2021/03/unnamed.png");
  var T_PLACEHOLDER   = cfg("placeholder", "Digite sua mensagem\u2026");
  var T_SEND          = cfg("send-text", "Enviar");
  var T_INTRO         = cfg("intro", "Este \u00e9 o in\u00edcio da sua conversa com a gente. Envie uma mensagem pra come\u00e7ar.");
  var T_TYPING        = cfg("typing-text", "Digitando\u2026");
  var T_CLOSE_TITLE   = cfg("close-title", "Encerrar atendimento?");
  var T_CLOSE_MESSAGE = cfg("close-message", "Tem certeza que deseja encerrar esta conversa? Ao confirmar, o hist\u00f3rico ser\u00e1 limpo e a sess\u00e3o ser\u00e1 finalizada.");
  var T_CLOSE_CONFIRM = cfg("close-confirm", "Encerrar");
  var T_CLOSE_CANCEL  = cfg("close-cancel", "Cancelar");
  var T_END_NOTICE    = cfg("end-notice", "A sua conversa foi finalizada");

  // ===== 1. Injetar Genesys bootstrap =====
  (function (g, e, n, es, ys) {
    g["_genesysJs"] = e;
    g[e] =
      g[e] ||
      function () {
        (g[e].q = g[e].q || []).push(arguments);
      };
    g[e].t = 1 * new Date();
    g[e].c = es;
    ys = document.createElement("script");
    ys.async = 1;
    ys.src = n;
    ys.charset = "utf-8";
    document.head.appendChild(ys);
  })(
    window,
    "Genesys",
    "https://apps.sae1.pure.cloud/genesys-bootstrap/genesys.min.js",
    {
      environment: "prod-sae1",
      deploymentId: "1fc215de-9fc1-483d-82a3-ce7c1fd29326",
    }
  );

  // ===== 2. Injetar CSS =====
  var css = "\
    #gc-webchat-root {\
      --g-bg: #fff;\
      --g-border: rgba(0,0,0,.10);\
      --g-shadow: 0 12px 32px rgba(0,0,0,.18);\
      --g-radius: 16px;\
      --g-primary: " + C_PRIMARY + ";\
      --g-subtext: rgba(0,0,0,.65);\
      --g-bubble-customer: var(--g-primary);\
      --g-bubble-agent: " + C_BUBBLE_AGENT + ";\
      --g-bubble-agent-text: " + C_BUBBLE_AGENT_TEXT + ";\
      --g-bubble-customer-text: " + C_BUBBLE_CUSTOMER_TEXT + ";\
      --g-font: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji';\
      font-family: var(--g-font);\
      line-height: 1.5;\
    }\
\
    #gc-webchat-root #myLauncher {\
      position: fixed;\
      right: 20px;\
      bottom: 20px;\
      width: 68px;\
      height: 60px;\
      background: " + C_LAUNCHER + ";\
      border-radius: 50% 90% 90% 90% / 40% 100% 100% 100%;\
      display: grid;\
      place-items: center;\
      border: none;\
      cursor: pointer;\
      box-shadow: 0 18px 28px rgba(0,0,0,.25);\
      -webkit-tap-highlight-color: transparent;\
      z-index: 99998;\
    }\
    #gc-webchat-root #myLauncher:active { transform: translateY(1px); }\
    #gc-webchat-root #myLauncher img {\
      width: 34px;\
      height: 34px;\
      display: block;\
      object-fit: contain;\
    }\
\
    #gc-webchat-root #chatShell {\
      position: fixed;\
      right: 20px;\
      bottom: 88px;\
      width: min(92vw, 380px);\
      height: clamp(420px, 70vh, 640px);\
      background: var(--g-bg);\
      border: 1px solid var(--g-border);\
      border-radius: var(--g-radius);\
      box-shadow: var(--g-shadow);\
      display: flex;\
      flex-direction: column;\
      overflow: hidden;\
      opacity: 0;\
      transform: translateY(18px);\
      pointer-events: none;\
      transition: transform .22s ease, opacity .22s ease;\
      will-change: transform, opacity;\
      z-index: 99999;\
    }\
    #gc-webchat-root #chatShell.open {\
      opacity: 1;\
      transform: translateY(0);\
      pointer-events: auto;\
    }\
\
    #gc-webchat-root #chatHeader {\
      flex: 0 0 56px;\
      display: flex;\
      align-items: center;\
      justify-content: space-between;\
      padding: 0 10px 0 14px;\
      background: var(--g-primary);\
      color: #fff;\
    }\
    #gc-webchat-root #chatHeader .title {\
      font-weight: 600;\
      font-size: 14px;\
    }\
    #gc-webchat-root #chatHeader .headerActions {\
      display: flex;\
      gap: 8px;\
      align-items: center;\
    }\
    #gc-webchat-root #chatHeader .iconBtn {\
      width: 32px;\
      height: 32px;\
      border-radius: 999px;\
      border: none;\
      cursor: pointer;\
      background: rgba(255,255,255,.18);\
      color: #fff;\
      font-size: 18px;\
      line-height: 32px;\
    }\
    #gc-webchat-root #minimizeChat {\
      font-size: 20px;\
      line-height: 30px;\
    }\
\
    #gc-webchat-root #chatMessages {\
      flex: 1 1 auto;\
      min-height: 0;\
      padding: 12px;\
      overflow: auto;\
      background: #fff;\
    }\
\
    #gc-webchat-root .msgRow { display: flex; margin: 8px 0; }\
    #gc-webchat-root .msgRow.customer { justify-content: flex-end; }\
    #gc-webchat-root .msgRow.agent { justify-content: flex-start; }\
\
    #gc-webchat-root .msgRow.customer > div {\
      display: flex;\
      flex-direction: column;\
      align-items: flex-end;\
      width: 100%;\
    }\
    #gc-webchat-root .msgRow.agent > div {\
      display: flex;\
      flex-direction: column;\
      align-items: flex-start;\
      width: 100%;\
    }\
\
    #gc-webchat-root .bubble {\
      width: fit-content;\
      max-width: 88%;\
      padding: 10px 12px;\
      border-radius: 14px;\
      font-size: 14px;\
      white-space: pre-wrap;\
      overflow-wrap: anywhere;\
      word-break: normal;\
    }\
    #gc-webchat-root .agent .bubble {\
      background: var(--g-bubble-agent);\
      color: var(--g-bubble-agent-text);\
      border-bottom-left-radius: 10px;\
      border-bottom-right-radius: 14px;\
    }\
    #gc-webchat-root .customer .bubble {\
      background: var(--g-bubble-customer);\
      color: var(--g-bubble-customer-text);\
      border-bottom-right-radius: 10px;\
    }\
\
    #gc-webchat-root .meta {\
      font-size: 11px;\
      color: var(--g-subtext);\
      margin-top: 4px;\
    }\
    #gc-webchat-root .bubble a {\
      color: inherit;\
      text-decoration: underline;\
      overflow-wrap: anywhere;\
    }\
\
    #gc-webchat-root .quickReplies {\
      display: inline-flex;\
      flex-wrap: wrap;\
      gap: 10px;\
      margin-top: 8px;\
      align-self: flex-end;\
      justify-content: flex-end;\
      max-width: 88%;\
    }\
    #gc-webchat-root .quickReplies button {\
      border: 1px solid rgba(0,0,0,.40);\
      background: #fff;\
      color: #111;\
      padding: 7px 16px;\
      border-radius: 999px;\
      cursor: pointer;\
      font-size: 12px;\
      font-weight: 500;\
      line-height: 1;\
      white-space: nowrap;\
    }\
    #gc-webchat-root .quickReplies button:hover { filter: brightness(.98); }\
    #gc-webchat-root .quickReplies button:active { transform: translateY(1px); }\
    #gc-webchat-root .quickReplies button:disabled { opacity: .55; cursor: not-allowed; }\
\
    #gc-webchat-root .systemNotice {\
      width: 100%;\
      text-align: center;\
      margin: 10px 0;\
      color: rgba(0,0,0,.45);\
      font-size: 12px;\
      line-height: 1.4;\
      user-select: none;\
      white-space: pre-line;\
    }\
    #gc-webchat-root .chatIntro {\
      width: 100%;\
      text-align: center;\
      margin: 10px 0 14px;\
      color: rgba(0,0,0,.45);\
      font-size: 12px;\
      line-height: 1.4;\
      user-select: none;\
    }\
\
    #gc-webchat-root #typing {\
      flex: 0 0 auto;\
      padding: 0 12px 10px;\
      font-size: 12px;\
      color: var(--g-subtext);\
      display: none;\
    }\
\
    #gc-webchat-root #chatComposer {\
      flex: 0 0 auto;\
      border-top: 1px solid var(--g-border);\
      display: flex;\
      gap: 10px;\
      align-items: center;\
      padding: 10px;\
      background: #fff;\
    }\
    #gc-webchat-root #chatInput {\
      flex: 1;\
      height: 40px;\
      border: 1px solid var(--g-border);\
      border-radius: 999px;\
      padding: 0 14px;\
      outline: none;\
      font-size: 14px;\
      font-family: var(--g-font);\
    }\
    #gc-webchat-root #sendBtn {\
      height: 40px;\
      padding: 0 14px;\
      border: none;\
      border-radius: 999px;\
      background: var(--g-primary);\
      color: #fff;\
      cursor: pointer;\
      font-weight: 600;\
    }\
    #gc-webchat-root #attachBtn {\
      width: 36px;\
      height: 36px;\
      border: none;\
      border-radius: 999px;\
      background: transparent;\
      cursor: pointer;\
      display: grid;\
      place-items: center;\
      color: rgba(0,0,0,.55);\
      font-size: 20px;\
      flex-shrink: 0;\
    }\
    #gc-webchat-root #attachBtn:hover { background: rgba(0,0,0,.06); }\
    #gc-webchat-root #fileInput { display: none; }\
\
    #gc-webchat-root .uploadRow {\
      display: flex;\
      align-items: center;\
      gap: 8px;\
      margin: 6px 0;\
      padding: 8px 12px;\
      background: rgba(0,0,0,.04);\
      border-radius: 10px;\
      font-size: 12px;\
      color: rgba(0,0,0,.60);\
    }\
    #gc-webchat-root .uploadRow .uploadName {\
      flex: 1;\
      overflow: hidden;\
      text-overflow: ellipsis;\
      white-space: nowrap;\
    }\
    #gc-webchat-root .uploadRow .uploadBar {\
      width: 60px;\
      height: 4px;\
      background: rgba(0,0,0,.10);\
      border-radius: 2px;\
      overflow: hidden;\
      flex-shrink: 0;\
    }\
    #gc-webchat-root .uploadRow .uploadBar .uploadFill {\
      height: 100%;\
      width: 0%;\
      background: var(--g-primary);\
      border-radius: 2px;\
      transition: width .2s ease;\
    }\
    #gc-webchat-root .uploadRow.done { opacity: .5; }\
\
    #gc-webchat-root .bubble img.chatImage {\
      max-width: 100%;\
      max-height: 260px;\
      border-radius: 8px;\
      display: block;\
      cursor: pointer;\
    }\
\
    #gc-webchat-root #confirmOverlay {\
      position: fixed;\
      inset: 0;\
      background: rgba(0,0,0,.32);\
      display: none;\
      align-items: center;\
      justify-content: center;\
      z-index: 100000;\
    }\
    #gc-webchat-root #confirmOverlay.open { display: flex; }\
\
    #gc-webchat-root #confirmModal {\
      width: min(92vw, 360px);\
      background: #fff;\
      border-radius: 16px;\
      box-shadow: 0 18px 40px rgba(0,0,0,.25);\
      border: 1px solid rgba(0,0,0,.12);\
      overflow: hidden;\
      font-family: var(--g-font);\
    }\
    #gc-webchat-root #confirmModal .cmHeader {\
      padding: 14px 16px;\
      font-weight: 700;\
      font-size: 14px;\
      background: #f6f7f8;\
      border-bottom: 1px solid rgba(0,0,0,.10);\
    }\
    #gc-webchat-root #confirmModal .cmBody {\
      padding: 14px 16px;\
      font-size: 13px;\
      color: rgba(0,0,0,.70);\
      line-height: 1.4;\
    }\
    #gc-webchat-root #confirmModal .cmActions {\
      padding: 12px 16px 16px;\
      display: flex;\
      gap: 10px;\
      justify-content: flex-end;\
    }\
    #gc-webchat-root #confirmModal .cmBtn {\
      height: 36px;\
      padding: 0 14px;\
      border-radius: 999px;\
      border: 1px solid rgba(0,0,0,.18);\
      background: #fff;\
      cursor: pointer;\
      font-weight: 600;\
      font-size: 13px;\
    }\
    #gc-webchat-root #confirmModal .cmBtn.primary {\
      background: var(--g-primary);\
      border-color: var(--g-primary);\
      color: #fff;\
    }\
  ";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ===== 3. Injetar HTML =====
  function init() {
    var root = document.createElement("div");
    root.id = "gc-webchat-root";

    root.innerHTML =
      '<button id="myLauncher" aria-label="Abrir chat" type="button">' +
      '  <img src="' + T_ICON + '" alt="Chat">' +
      "</button>" +
      '<section id="chatShell" aria-label="Chat">' +
      '  <header id="chatHeader">' +
      '    <div class="title">' + T_TITLE + "</div>" +
      '    <div class="headerActions">' +
      '      <button class="iconBtn" id="minimizeChat" aria-label="Minimizar" type="button">\u2013</button>' +
      '      <button class="iconBtn" id="closeChat" aria-label="Fechar" type="button">\u00d7</button>' +
      "    </div>" +
      "  </header>" +
      '  <div id="chatMessages"></div>' +
      '  <div id="typing">' + T_TYPING + "</div>" +
      '  <footer id="chatComposer">' +
      '    <button id="attachBtn" aria-label="Anexar arquivo" type="button">\ud83d\udcce</button>' +
      '    <input id="fileInput" type="file" accept="image/*" multiple />' +
      '    <input id="chatInput" placeholder="' + T_PLACEHOLDER + '" />' +
      '    <button id="sendBtn">' + T_SEND + "</button>" +
      "  </footer>" +
      "</section>" +
      '<div id="confirmOverlay" aria-hidden="true">' +
      '  <div id="confirmModal" role="dialog" aria-modal="true" aria-label="Confirmar encerramento">' +
      '    <div class="cmHeader">' + T_CLOSE_TITLE + "</div>" +
      '    <div class="cmBody">' + T_CLOSE_MESSAGE + "</div>" +
      '    <div class="cmActions">' +
      '      <button class="cmBtn" id="cancelClose" type="button">' + T_CLOSE_CANCEL + "</button>" +
      '      <button class="cmBtn primary" id="confirmClose" type="button">' + T_CLOSE_CONFIRM + "</button>" +
      "    </div>" +
      "  </div>" +
      "</div>";

    document.body.appendChild(root);

    // ===== 4. Lógica do widget =====
    var elShell = root.querySelector("#chatShell");
    var elLauncher = root.querySelector("#myLauncher");
    var elClose = root.querySelector("#closeChat");
    var elMinimize = root.querySelector("#minimizeChat");
    var elMsgs = root.querySelector("#chatMessages");
    var elInput = root.querySelector("#chatInput");
    var elSend = root.querySelector("#sendBtn");
    var elConfirmOverlay = root.querySelector("#confirmOverlay");
    var elCancelClose = root.querySelector("#cancelClose");
    var elConfirmClose = root.querySelector("#confirmClose");
    var elAttachBtn = root.querySelector("#attachBtn");
    var elFileInput = root.querySelector("#fileInput");

    var seenMsgIds = new Set();
    var introShown = false;

    // Upload state
    var uploadBatch = [];  // { key, fileName, done, el }
    var uploadCaption = "";

    var state = {
      ready: false,
      started: false,
      starting: false,
      softResetArmed: false,
      endNoticeShown: false,
    };

    var STORAGE = {
      transcript: "gc_current_transcript",
      chatOpen: "gc_chat_open",
    };

    function saveChatOpenState() {
      try {
        sessionStorage.setItem(STORAGE.chatOpen, isOpen() ? "1" : "0");
      } catch (e) {}
    }

    var transcript = [];
    function addToTranscript(from, text, ts) {
      transcript.push({ from: from, text: text, ts: ts });
      try {
        sessionStorage.setItem(
          STORAGE.transcript,
          JSON.stringify(transcript)
        );
      } catch (e) {}
    }

    function persistTranscript(reason) {
      reason = reason || "ended";
      try {
        var key = "gc_webmsg_history";
        var existing = JSON.parse(localStorage.getItem(key) || "[]");
        existing.push({
          reason: reason,
          endedAt: formatTimestampBrasilia(new Date()),
          messages: transcript.slice(),
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        console.warn("[HISTORY] persistTranscript failed", e);
      }
    }

    function isOpen() {
      return elShell.classList.contains("open");
    }

    function openUI() {
      elShell.classList.add("open");
      saveChatOpenState();
      setTimeout(function () {
        addIntroIfEmpty();
        elMsgs.scrollTop = elMsgs.scrollHeight;
      }, 0);
    }

    function closeUI() {
      elShell.classList.remove("open");
      saveChatOpenState();
    }

    function clearUI() {
      elMsgs.innerHTML = "";
      seenMsgIds.clear();
      introShown = false;
      transcript.length = 0;
      try {
        sessionStorage.removeItem(STORAGE.transcript);
      } catch (e) {}
      saveChatOpenState();
    }

    function formatTimestampBrasilia(dateLike) {
      dateLike = dateLike || Date.now();
      var d = dateLike instanceof Date ? dateLike : new Date(dateLike);

      var dd = String(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          day: "2-digit",
        }).format(d)
      );
      var mm = String(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          month: "2-digit",
        }).format(d)
      );
      var yyyy = String(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
        }).format(d)
      );
      var hhmmss = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(d);

      return dd + "/" + mm + "/" + yyyy + " \u00e0s " + hhmmss;
    }

    function addIntroIfEmpty() {
      if (introShown) return;
      var hasAnyBubble = elMsgs.querySelector(".msgRow");
      var hasSystemNotice = elMsgs.querySelector(".systemNotice");
      if (hasAnyBubble || hasSystemNotice) return;

      var el = document.createElement("div");
      el.className = "chatIntro";
      el.textContent = T_INTRO;
      elMsgs.appendChild(el);
      elMsgs.scrollTop = elMsgs.scrollHeight;
      introShown = true;
    }

    function removeIntro() {
      var el = elMsgs.querySelector(".chatIntro");
      if (el) el.remove();
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function linkify(text) {
      var escaped = escapeHtml(text);
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return escaped
        .replace(
          urlRegex,
          function (url) {
            return (
              '<a href="' +
              url +
              '" target="_blank" rel="noopener noreferrer">' +
              url +
              "</a>"
            );
          }
        )
        .replace(/\n/g, "<br/>");
    }

    function extractQuickRepliesFromStructured(m) {
      var content = Array.isArray(m && m.content) ? m.content : [];
      var buttons = [];
      content.forEach(function (item) {
        if (
          String((item && item.contentType) || "").toLowerCase() !==
          "quickreply"
        )
          return;
        var qr = (item && item.quickReply) || {};
        var label = qr.text != null ? qr.text : "";
        var payload = qr.payload != null ? qr.payload : label;
        if (!label) return;
        buttons.push({ label: label, payload: payload });
      });
      return buttons;
    }

    function isSessionEndedError(err) {
      var msg = String((err && err.message) || err || "").toLowerCase();
      return msg.includes("conversation session has ended");
    }

    function addEndNotice() {
      if (state.endNoticeShown) return;
      state.endNoticeShown = true;
      var el = document.createElement("div");
      el.className = "systemNotice";
      el.textContent =
        T_END_NOTICE + "\n" + formatTimestampBrasilia(new Date());
      elMsgs.appendChild(el);
      elMsgs.scrollTop = elMsgs.scrollHeight;
    }

    // ===== Upload / Imagens =====
    function generateUploadKey(file) {
      return file.name + "_" + file.size + "_" + Date.now();
    }

    function createUploadUI(key, fileName) {
      var row = document.createElement("div");
      row.className = "uploadRow";
      row.setAttribute("data-upload-key", key);

      var name = document.createElement("span");
      name.className = "uploadName";
      name.textContent = fileName;

      var bar = document.createElement("div");
      bar.className = "uploadBar";

      var fill = document.createElement("div");
      fill.className = "uploadFill";

      bar.appendChild(fill);
      row.appendChild(name);
      row.appendChild(bar);
      elMsgs.appendChild(row);
      elMsgs.scrollTop = elMsgs.scrollHeight;

      return row;
    }

    function updateUploadUIByKey(key, percent) {
      for (var i = 0; i < uploadBatch.length; i++) {
        if (uploadBatch[i].key === key && uploadBatch[i].el) {
          var fill = uploadBatch[i].el.querySelector(".uploadFill");
          if (fill) fill.style.width = Math.min(percent, 100) + "%";
          break;
        }
      }
    }

    function markUploadDoneByKey(key) {
      for (var i = 0; i < uploadBatch.length; i++) {
        if (uploadBatch[i].key === key) {
          uploadBatch[i].done = true;
          if (uploadBatch[i].el) {
            uploadBatch[i].el.classList.add("done");
            var fill = uploadBatch[i].el.querySelector(".uploadFill");
            if (fill) fill.style.width = "100%";
          }
          break;
        }
      }
    }

    function removeUploadUI() {
      for (var i = 0; i < uploadBatch.length; i++) {
        if (uploadBatch[i].el && uploadBatch[i].el.parentNode) {
          uploadBatch[i].el.remove();
        }
      }
    }

    function finalizeBatchSendIfComplete() {
      var allDone = uploadBatch.every(function (item) { return item.done; });
      if (!allDone) return;

      console.log("[GENESYS] All uploads done, sending message commit");
      removeUploadUI();

      var payload = uploadCaption ? { message: uploadCaption } : {};
      Genesys(
        "command",
        "MessagingService.sendMessage",
        payload,
        function () {
          console.log("[GENESYS] sendMessage (after upload) success");
        },
        function (err) {
          console.error("[GENESYS] sendMessage (after upload) error", err);
        }
      );

      uploadBatch = [];
      uploadCaption = "";
    }

    function uploadImages(filesArray, caption) {
      ensureFreshSessionIfNeeded().then(function () {
        return startConversationIfNeeded();
      }).then(function (ok) {
        if (!ok) {
          console.warn("[GENESYS] Cannot upload: conversation not started");
          return;
        }

        uploadCaption = caption || "";
        uploadBatch = [];

        var fileList = [];
        filesArray.forEach(function (file) {
          var key = generateUploadKey(file);
          var el = createUploadUI(key, file.name);
          uploadBatch.push({ key: key, fileName: file.name, done: false, el: el });
          fileList.push(file);
        });

        console.log("[GENESYS] Calling MessagingService.requestUpload", fileList.length, "files");

        Genesys(
          "command",
          "MessagingService.requestUpload",
          { file: fileList },
          function () {
            console.log("[GENESYS] requestUpload success");
          },
          function (err) {
            console.error("[GENESYS] requestUpload error", err);
            removeUploadUI();
            uploadBatch = [];
          }
        );
      });
    }

    function isImageAttachment(att) {
      var mime = String(att.mime || att.mediaType || att.contentType || "").toLowerCase();
      return mime.indexOf("image") === 0;
    }

    function extractAttachments(m) {
      // Genesys pode retornar attachments em vários formatos
      var atts = m.attachments || m.content || [];
      if (!Array.isArray(atts)) atts = [];
      return atts.filter(function (a) {
        var type = String(a.contentType || a.type || "").toLowerCase();
        return type === "attachment" || a.url || a.mediaUrl || (a.mime && a.mime.indexOf("image") === 0);
      });
    }

    function renderAttachmentBubble(from, att, ts) {
      var url = att.url || att.mediaUrl || (att.media && att.media.url) || "";
      if (!url) return;

      removeIntro();

      if (isImageAttachment(att)) {
        var row = document.createElement("div");
        row.className = "msgRow " + from;

        var wrap = document.createElement("div");

        var bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.style.padding = "4px";
        bubble.style.background = "transparent";

        var img = document.createElement("img");
        img.className = "chatImage";
        img.src = url;
        img.alt = att.filename || att.name || "Imagem";
        img.addEventListener("click", function () {
          window.open(url, "_blank");
        });

        bubble.appendChild(img);

        var meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = ts || formatTimestampBrasilia(new Date());

        addToTranscript(from, "[imagem] " + url, meta.textContent);

        wrap.appendChild(bubble);
        wrap.appendChild(meta);
        row.appendChild(wrap);
        elMsgs.appendChild(row);
        elMsgs.scrollTop = elMsgs.scrollHeight;
      } else {
        // Arquivo não-imagem: renderiza como link
        var fileName = att.filename || att.name || "Arquivo";
        addBubble({
          from: from,
          text: fileName + "\n" + url,
          time: ts,
        });
      }
    }

    function resetConversationNow() {
      return new Promise(function (resolve) {
        try {
          Genesys(
            "command",
            "MessagingService.resetConversation",
            {},
            function () {
              console.log("[GENESYS] resetConversation success");
              state.started = false;
              state.starting = false;
              state.softResetArmed = false;
              state.endNoticeShown = false;
              seenMsgIds.clear();
              resolve(true);
            },
            function (err) {
              console.warn("[GENESYS] resetConversation error", err);
              resolve(false);
            }
          );
        } catch (e) {
          console.warn("[GENESYS] resetConversation threw", e);
          resolve(false);
        }
      });
    }

    function armSoftReset() {
      state.started = false;
      state.starting = false;
      state.softResetArmed = true;
    }

    function ensureFreshSessionIfNeeded() {
      if (!state.softResetArmed) return Promise.resolve();

      console.log("[GENESYS] Soft reset armed: preparing new session");

      return resetConversationNow().then(function (okReset) {
        if (okReset) {
          state.softResetArmed = false;
          return;
        }

        return new Promise(function (resolve) {
          try {
            Genesys(
              "command",
              "Messenger.clear",
              {},
              function () {
                resolve();
              },
              function () {
                resolve();
              }
            );
          } catch (e) {
            resolve();
          }
        })
          .then(function () {
            return new Promise(function (resolve) {
              try {
                Genesys(
                  "command",
                  "MessagingService.clearConversation",
                  {},
                  function () {
                    resolve();
                  },
                  function () {
                    resolve();
                  }
                );
              } catch (e) {
                resolve();
              }
            });
          })
          .then(function () {
            seenMsgIds.clear();
            state.softResetArmed = false;
            state.started = false;
            state.starting = false;
          });
      });
    }

    function startConversationIfNeeded() {
      if (!state.ready) {
        console.warn("[GENESYS] startConversation blocked: not ready yet");
        return Promise.resolve(false);
      }
      if (state.started || state.starting) return Promise.resolve(true);

      state.starting = true;
      console.log("[GENESYS] Calling MessagingService.startConversation");

      return new Promise(function (resolve) {
        Genesys(
          "command",
          "MessagingService.startConversation",
          {},
          function () {
            console.log("[GENESYS] startConversation success");
            state.started = true;
            state.starting = false;
            state.softResetArmed = false;
            state.endNoticeShown = false;
            resolve(true);
          },
          function (err) {
            console.warn("[GENESYS] startConversation error:", err);
            var msg = String(err || "").toLowerCase();
            if (msg.includes("already an active conversation")) {
              state.started = true;
              state.starting = false;
              state.softResetArmed = false;
              state.endNoticeShown = false;
              resolve(true);
              return;
            }
            state.started = false;
            state.starting = false;
            resolve(false);
          }
        );
      });
    }

    function sendMessageWithRetry(message) {
      return ensureFreshSessionIfNeeded()
        .then(function () {
          return startConversationIfNeeded();
        })
        .then(function (ok) {
          if (!ok) return false;

          return new Promise(function (resolve) {
            console.log("[GENESYS] Calling MessagingService.sendMessage", {
              message: message,
            });

            Genesys(
              "command",
              "MessagingService.sendMessage",
              { message: message },
              function () {
                console.log("[GENESYS] sendMessage success");
                resolve(true);
              },
              function (err) {
                console.error("[GENESYS] sendMessage error", err);

                if (isSessionEndedError(err)) {
                  console.log(
                    "[GENESYS] Detected ended session on send. Persist + reset + retry once."
                  );
                  addEndNotice();
                  persistTranscript("send_failed_session_ended");

                  resetConversationNow()
                    .then(function () {
                      return startConversationIfNeeded();
                    })
                    .then(function (ok2) {
                      if (!ok2) return resolve(false);

                      Genesys(
                        "command",
                        "MessagingService.sendMessage",
                        { message: message },
                        function () {
                          console.log("[GENESYS] sendMessage retry success");
                          resolve(true);
                        },
                        function (err2) {
                          console.error(
                            "[GENESYS] sendMessage retry error",
                            err2
                          );
                          resolve(false);
                        }
                      );
                    });
                  return;
                }

                resolve(false);
              }
            );
          });
        });
    }

    function sendPayload(payload) {
      console.log("[GENESYS] sendMessage (quickReply)", {
        message: payload,
      });
      return sendMessageWithRetry(payload);
    }

    function addBubble(opts) {
      var from = opts.from || "agent";
      var text = opts.text || "";
      var time = opts.time || null;
      var buttons = opts.buttons || [];

      removeIntro();

      var row = document.createElement("div");
      row.className = "msgRow " + from;

      var wrap = document.createElement("div");

      var bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = linkify(text);

      var meta = document.createElement("div");
      meta.className = "meta";
      var tsFinal = time ? time : formatTimestampBrasilia(new Date());
      meta.textContent = tsFinal;

      addToTranscript(from, text, tsFinal);

      wrap.appendChild(bubble);
      wrap.appendChild(meta);

      if (buttons && buttons.length) {
        var qrWrap = document.createElement("div");
        qrWrap.className = "quickReplies";

        buttons.forEach(function (btn) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = btn.label;

          b.addEventListener("click", function () {
            addBubble({
              from: "customer",
              text: btn.label,
              time: formatTimestampBrasilia(new Date()),
            });
            sendPayload(btn.payload);
            var allBtns = qrWrap.querySelectorAll("button");
            for (var i = 0; i < allBtns.length; i++) {
              allBtns[i].disabled = true;
            }
          });

          qrWrap.appendChild(b);
        });

        wrap.appendChild(qrWrap);
      }

      row.appendChild(wrap);
      elMsgs.appendChild(row);
      elMsgs.scrollTop = elMsgs.scrollHeight;
    }

    function addBubbleFromStorage(opts) {
      var from = opts.from || "agent";
      var text = opts.text || "";
      var time = opts.time || null;

      removeIntro();

      var row = document.createElement("div");
      row.className = "msgRow " + from;

      var wrap = document.createElement("div");

      var bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = linkify(text);

      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = time ? time : "";

      wrap.appendChild(bubble);
      wrap.appendChild(meta);
      row.appendChild(wrap);
      elMsgs.appendChild(row);
    }

    function restoreTranscriptFromStorage() {
      var saved = null;
      try {
        var raw = sessionStorage.getItem(STORAGE.transcript);
        if (!raw) return;
        saved = JSON.parse(raw);
      } catch (e) {
        return;
      }

      if (!Array.isArray(saved) || saved.length === 0) return;

      elMsgs.innerHTML = "";
      introShown = false;
      transcript.length = 0;

      saved.forEach(function (m) {
        transcript.push(m);
        addBubbleFromStorage({
          from: m.from,
          text: m.text,
          time: m.ts,
        });
      });

      elMsgs.scrollTop = elMsgs.scrollHeight;
    }

    function sendTextMessage(text) {
      if (!text || !text.trim()) return Promise.resolve();
      addBubble({
        from: "customer",
        text: text,
        time: formatTimestampBrasilia(new Date()),
      });
      return sendMessageWithRetry(text);
    }

    function hardResetLikeNativeBin() {
      persistTranscript("closed_by_user");
      closeUI();
      clearUI();
      state.started = false;
      state.starting = false;
      state.softResetArmed = false;
      state.endNoticeShown = false;

      try {
        Genesys(
          "command",
          "MessagingService.clearConversation",
          {},
          function () {},
          function () {}
        );
      } catch (e) {}
      try {
        Genesys(
          "command",
          "Messenger.clear",
          {},
          function () {},
          function () {}
        );
      } catch (e) {}
      setTimeout(function () {
        window.location.reload();
      }, 400);
    }

    function openConfirmClose() {
      elConfirmOverlay.classList.add("open");
      elConfirmOverlay.setAttribute("aria-hidden", "false");
    }

    function closeConfirmClose() {
      elConfirmOverlay.classList.remove("open");
      elConfirmOverlay.setAttribute("aria-hidden", "true");
    }

    // ===== 5. Event subscriptions =====
    Genesys("subscribe", "MessagingService.ready", function () {
      console.log("[GENESYS] MessagingService.ready");
      state.ready = true;
      restoreTranscriptFromStorage();
      try {
        if (sessionStorage.getItem(STORAGE.chatOpen) === "1") {
          openUI();
        }
      } catch (e) {}
    });

    Genesys("subscribe", "MessagingService.started", function (e) {
      console.log("[GENESYS] MessagingService.started", e);
      state.started = true;
      state.starting = false;
    });

    Genesys(
      "subscribe",
      "MessagingService.conversationDisconnected",
      function (e) {
        console.log(
          "[GENESYS] MessagingService.conversationDisconnected",
          e
        );
        addEndNotice();
        persistTranscript("ended_by_genesys_disconnected");
        state.softResetArmed = true;
        resetConversationNow();
      }
    );

    Genesys("subscribe", "MessagingService.ended", function (e) {
      console.log("[GENESYS] MessagingService.ended", e);
      addEndNotice();
      persistTranscript("ended_by_genesys_ended");
      state.softResetArmed = true;
      resetConversationNow();
    });

    // Upload progress
    Genesys("subscribe", "MessagingService.uploading", function (evt) {
      var percent = (evt && evt.data && evt.data.progress) || (evt && evt.progress) || 0;
      var fileName = (evt && evt.data && evt.data.fileName) || (evt && evt.fileName) || "";

      // Tentar encontrar no batch pelo nome do arquivo
      var keyFound = null;
      for (var i = 0; i < uploadBatch.length; i++) {
        if (!uploadBatch[i].done && (uploadBatch[i].fileName === fileName || !keyFound)) {
          keyFound = uploadBatch[i].key;
          if (uploadBatch[i].fileName === fileName) break;
        }
      }
      if (keyFound) {
        updateUploadUIByKey(keyFound, percent);
      }
    });

    // Upload de arquivo individual concluído
    Genesys("subscribe", "MessagingService.fileUploaded", function (evt) {
      var fileName = (evt && evt.data && evt.data.fileName) || (evt && evt.fileName) || "";
      console.log("[GENESYS] fileUploaded", fileName);

      var keyFound = null;
      for (var i = 0; i < uploadBatch.length; i++) {
        if (!uploadBatch[i].done && (uploadBatch[i].fileName === fileName || !keyFound)) {
          keyFound = uploadBatch[i].key;
          if (uploadBatch[i].fileName === fileName) break;
        }
      }
      if (keyFound) {
        markUploadDoneByKey(keyFound);
        finalizeBatchSendIfComplete();
      }
    });

    Genesys(
      "subscribe",
      "MessagingService.messagesReceived",
      function (event) {
        var msgs =
          (event && event.data && event.data.messages) ||
          (event && event.messages) ||
          [];
        msgs.forEach(function (m) {
          var id =
            m.id ||
            m.messageId ||
            (m.metadata && m.metadata.id);
          if (id && seenMsgIds.has(id)) return;
          if (id) seenMsgIds.add(id);

          if (String(m.direction).toLowerCase() === "inbound") return;

          var type = String(m.type || "").toLowerCase();
          var text =
            m.text ||
            (m.body && m.body.text) ||
            m.message ||
            "";

          var buttons =
            type === "structured"
              ? extractQuickRepliesFromStructured(m)
              : [];

          var tsRaw =
            m.time ||
            m.timestamp ||
            m.createdDate ||
            m.createdAt ||
            (m.metadata && m.metadata.timestamp) ||
            (m.metadata && m.metadata.createdAt) ||
            null;

          var ts = tsRaw
            ? formatTimestampBrasilia(tsRaw)
            : formatTimestampBrasilia(new Date());

          // Attachments (imagens)
          var atts = extractAttachments(m);
          if (atts && atts.length) {
            atts.forEach(function (att) {
              renderAttachmentBubble("agent", att, ts);
            });
          }

          if (!text && !buttons.length) return;

          addBubble({
            from: "agent",
            text: text || "",
            time: ts,
            buttons: buttons,
          });
        });
      }
    );

    // ===== 6. UI event listeners =====
    elLauncher.addEventListener("click", function () {
      if (isOpen()) {
        closeUI();
        return;
      }
      openUI();
      ensureFreshSessionIfNeeded().then(function () {
        startConversationIfNeeded();
      });
    });

    elMinimize.addEventListener("click", function () {
      closeUI();
    });

    elClose.addEventListener("click", function () {
      openConfirmClose();
    });

    elCancelClose.addEventListener("click", function () {
      closeConfirmClose();
    });

    elConfirmClose.addEventListener("click", function () {
      closeConfirmClose();
      hardResetLikeNativeBin();
    });

    elConfirmOverlay.addEventListener("click", function (e) {
      if (e.target === elConfirmOverlay) closeConfirmClose();
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        elConfirmOverlay.classList.contains("open")
      ) {
        closeConfirmClose();
      }
    });

    // Anexo de arquivo
    elAttachBtn.addEventListener("click", function () {
      elFileInput.value = "";
      elFileInput.click();
    });

    elFileInput.addEventListener("change", function () {
      var files = Array.prototype.slice.call(elFileInput.files || []);
      if (!files.length) return;

      var caption = elInput.value.trim();
      elInput.value = "";

      // Preview local para o cliente ver imediatamente
      files.forEach(function (file) {
        if (file.type && file.type.indexOf("image") === 0) {
          var localUrl = URL.createObjectURL(file);
          renderAttachmentBubble("customer", {
            url: localUrl,
            mime: file.type,
            filename: file.name,
          }, formatTimestampBrasilia(new Date()));
        }
      });

      uploadImages(files, caption);
    });

    elSend.addEventListener("click", function () {
      var text = elInput.value;
      elInput.value = "";
      sendTextMessage(text);
    });

    elInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        elSend.click();
      }
    });

    window.addEventListener("beforeunload", function () {
      saveChatOpenState();
    });
  }

  // Inicializar quando o DOM estiver pronto
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
