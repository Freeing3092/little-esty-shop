/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */
;

(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var nonce;

      nonce = null;

      Rails.loadCSPNonce = function() {
        var ref;
        return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
      };

      Rails.cspNonce = function() {
        return nonce != null ? nonce : Rails.loadCSPNonce();
      };

    }).call(this);
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches, preventDefault;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        preventDefault = CustomEvent.prototype.preventDefault;
        CustomEvent.prototype.preventDefault = function() {
          var result;
          result = preventDefault.call(this);
          if (this.cancelable && !this.defaultPrevented) {
            Object.defineProperty(this, 'defaultPrevented', {
              get: function() {
                return true;
              }
            });
          }
          return result;
        };
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;

      cspNonce = Rails.cspNonce, CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var ref, response;
          response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if ((options.beforeSend != null) && !options.beforeSend(xhr, options)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          CSRFProtection(xhr);
        }
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.setAttribute('nonce', cspNonce());
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.preventInsignificantClick = function(e) {
        var data, insignificantMetaClick, link, metaClick, method, nonPrimaryMouseClick;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        insignificantMetaClick = metaClick && method === 'GET' && !data;
        nonPrimaryMouseClick = (e.button != null) && e.button !== 0;
        if (nonPrimaryMouseClick || insignificantMetaClick) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, loadCSPNonce = Rails.loadCSPNonce, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, preventInsignificantClick = Rails.preventInsignificantClick, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null)) {
        if (jQuery.rails) {
          throw new Error('If you load both jquery_ujs and rails-ujs, use rails-ujs only.');
        }
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        document.addEventListener('DOMContentLoaded', loadCSPNonce);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define([ "exports" ], factory) : factory(global.ActiveStorage = {});
})(this, function(exports) {
  "use strict";
  function createCommonjsModule(fn, module) {
    return module = {
      exports: {}
    }, fn(module, module.exports), module.exports;
  }
  var sparkMd5 = createCommonjsModule(function(module, exports) {
    (function(factory) {
      {
        module.exports = factory();
      }
    })(function(undefined) {
      var hex_chr = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f" ];
      function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];
        a += (b & c | ~b & d) + k[0] - 680876936 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[1] - 389564586 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[2] + 606105819 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[4] - 176418897 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[7] - 45705983 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[10] - 42063 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
        a = (a << 7 | a >>> 25) + b | 0;
        d += (a & b | ~a & c) + k[13] - 40341101 | 0;
        d = (d << 12 | d >>> 20) + a | 0;
        c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
        c = (c << 17 | c >>> 15) + d | 0;
        b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
        b = (b << 22 | b >>> 10) + c | 0;
        a += (b & d | c & ~d) + k[1] - 165796510 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[11] + 643717713 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[0] - 373897302 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[5] - 701558691 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[10] + 38016083 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[15] - 660478335 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[4] - 405537848 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[9] + 568446438 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[3] - 187363961 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
        a = (a << 5 | a >>> 27) + b | 0;
        d += (a & c | b & ~c) + k[2] - 51403784 | 0;
        d = (d << 9 | d >>> 23) + a | 0;
        c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
        c = (c << 14 | c >>> 18) + d | 0;
        b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
        b = (b << 20 | b >>> 12) + c | 0;
        a += (b ^ c ^ d) + k[5] - 378558 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[14] - 35309556 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[7] - 155497632 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[13] + 681279174 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[0] - 358537222 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[3] - 722521979 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[6] + 76029189 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (b ^ c ^ d) + k[9] - 640364487 | 0;
        a = (a << 4 | a >>> 28) + b | 0;
        d += (a ^ b ^ c) + k[12] - 421815835 | 0;
        d = (d << 11 | d >>> 21) + a | 0;
        c += (d ^ a ^ b) + k[15] + 530742520 | 0;
        c = (c << 16 | c >>> 16) + d | 0;
        b += (c ^ d ^ a) + k[2] - 995338651 | 0;
        b = (b << 23 | b >>> 9) + c | 0;
        a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
        a = (a << 6 | a >>> 26) + b | 0;
        d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
        d = (d << 10 | d >>> 22) + a | 0;
        c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
        c = (c << 15 | c >>> 17) + d | 0;
        b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
        b = (b << 21 | b >>> 11) + c | 0;
        x[0] = a + x[0] | 0;
        x[1] = b + x[1] | 0;
        x[2] = c + x[2] | 0;
        x[3] = d + x[3] | 0;
      }
      function md5blk(s) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
      }
      function md5blk_array(a) {
        var md5blks = [], i;
        for (i = 0; i < 64; i += 4) {
          md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
        }
        return md5blks;
      }
      function md51(s) {
        var n = s.length, state = [ 1732584193, -271733879, -1732584194, 271733878 ], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        length = s.length;
        tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function md51_array(a) {
        var n = a.length, state = [ 1732584193, -271733879, -1732584194, 271733878 ], i, length, tail, tmp, lo, hi;
        for (i = 64; i <= n; i += 64) {
          md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
        }
        a = i - 64 < n ? a.subarray(i - 64) : new Uint8Array(0);
        length = a.length;
        tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= a[i] << (i % 4 << 3);
        }
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(state, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = n * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(state, tail);
        return state;
      }
      function rhex(n) {
        var s = "", j;
        for (j = 0; j < 4; j += 1) {
          s += hex_chr[n >> j * 8 + 4 & 15] + hex_chr[n >> j * 8 & 15];
        }
        return s;
      }
      function hex(x) {
        var i;
        for (i = 0; i < x.length; i += 1) {
          x[i] = rhex(x[i]);
        }
        return x.join("");
      }
      if (hex(md51("hello")) !== "5d41402abc4b2a76b9719d911017c592") ;
      if (typeof ArrayBuffer !== "undefined" && !ArrayBuffer.prototype.slice) {
        (function() {
          function clamp(val, length) {
            val = val | 0 || 0;
            if (val < 0) {
              return Math.max(val + length, 0);
            }
            return Math.min(val, length);
          }
          ArrayBuffer.prototype.slice = function(from, to) {
            var length = this.byteLength, begin = clamp(from, length), end = length, num, target, targetArray, sourceArray;
            if (to !== undefined) {
              end = clamp(to, length);
            }
            if (begin > end) {
              return new ArrayBuffer(0);
            }
            num = end - begin;
            target = new ArrayBuffer(num);
            targetArray = new Uint8Array(target);
            sourceArray = new Uint8Array(this, begin, num);
            targetArray.set(sourceArray);
            return target;
          };
        })();
      }
      function toUtf8(str) {
        if (/[\u0080-\uFFFF]/.test(str)) {
          str = unescape(encodeURIComponent(str));
        }
        return str;
      }
      function utf8Str2ArrayBuffer(str, returnUInt8Array) {
        var length = str.length, buff = new ArrayBuffer(length), arr = new Uint8Array(buff), i;
        for (i = 0; i < length; i += 1) {
          arr[i] = str.charCodeAt(i);
        }
        return returnUInt8Array ? arr : buff;
      }
      function arrayBuffer2Utf8Str(buff) {
        return String.fromCharCode.apply(null, new Uint8Array(buff));
      }
      function concatenateArrayBuffers(first, second, returnUInt8Array) {
        var result = new Uint8Array(first.byteLength + second.byteLength);
        result.set(new Uint8Array(first));
        result.set(new Uint8Array(second), first.byteLength);
        return returnUInt8Array ? result : result.buffer;
      }
      function hexToBinaryString(hex) {
        var bytes = [], length = hex.length, x;
        for (x = 0; x < length - 1; x += 2) {
          bytes.push(parseInt(hex.substr(x, 2), 16));
        }
        return String.fromCharCode.apply(String, bytes);
      }
      function SparkMD5() {
        this.reset();
      }
      SparkMD5.prototype.append = function(str) {
        this.appendBinary(toUtf8(str));
        return this;
      };
      SparkMD5.prototype.appendBinary = function(contents) {
        this._buff += contents;
        this._length += contents.length;
        var length = this._buff.length, i;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
        }
        this._buff = this._buff.substring(i - 64);
        return this;
      };
      SparkMD5.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, i, tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff.charCodeAt(i) << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD5.prototype.reset = function() {
        this._buff = "";
        this._length = 0;
        this._hash = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
      };
      SparkMD5.prototype.getState = function() {
        return {
          buff: this._buff,
          length: this._length,
          hash: this._hash
        };
      };
      SparkMD5.prototype.setState = function(state) {
        this._buff = state.buff;
        this._length = state.length;
        this._hash = state.hash;
        return this;
      };
      SparkMD5.prototype.destroy = function() {
        delete this._hash;
        delete this._buff;
        delete this._length;
      };
      SparkMD5.prototype._finish = function(tail, length) {
        var i = length, tmp, lo, hi;
        tail[i >> 2] |= 128 << (i % 4 << 3);
        if (i > 55) {
          md5cycle(this._hash, tail);
          for (i = 0; i < 16; i += 1) {
            tail[i] = 0;
          }
        }
        tmp = this._length * 8;
        tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
        lo = parseInt(tmp[2], 16);
        hi = parseInt(tmp[1], 16) || 0;
        tail[14] = lo;
        tail[15] = hi;
        md5cycle(this._hash, tail);
      };
      SparkMD5.hash = function(str, raw) {
        return SparkMD5.hashBinary(toUtf8(str), raw);
      };
      SparkMD5.hashBinary = function(content, raw) {
        var hash = md51(content), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      SparkMD5.ArrayBuffer = function() {
        this.reset();
      };
      SparkMD5.ArrayBuffer.prototype.append = function(arr) {
        var buff = concatenateArrayBuffers(this._buff.buffer, arr, true), length = buff.length, i;
        this._length += arr.byteLength;
        for (i = 64; i <= length; i += 64) {
          md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
        }
        this._buff = i - 64 < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);
        return this;
      };
      SparkMD5.ArrayBuffer.prototype.end = function(raw) {
        var buff = this._buff, length = buff.length, tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], i, ret;
        for (i = 0; i < length; i += 1) {
          tail[i >> 2] |= buff[i] << (i % 4 << 3);
        }
        this._finish(tail, length);
        ret = hex(this._hash);
        if (raw) {
          ret = hexToBinaryString(ret);
        }
        this.reset();
        return ret;
      };
      SparkMD5.ArrayBuffer.prototype.reset = function() {
        this._buff = new Uint8Array(0);
        this._length = 0;
        this._hash = [ 1732584193, -271733879, -1732584194, 271733878 ];
        return this;
      };
      SparkMD5.ArrayBuffer.prototype.getState = function() {
        var state = SparkMD5.prototype.getState.call(this);
        state.buff = arrayBuffer2Utf8Str(state.buff);
        return state;
      };
      SparkMD5.ArrayBuffer.prototype.setState = function(state) {
        state.buff = utf8Str2ArrayBuffer(state.buff, true);
        return SparkMD5.prototype.setState.call(this, state);
      };
      SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;
      SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;
      SparkMD5.ArrayBuffer.hash = function(arr, raw) {
        var hash = md51_array(new Uint8Array(arr)), ret = hex(hash);
        return raw ? hexToBinaryString(ret) : ret;
      };
      return SparkMD5;
    });
  });
  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  var createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();
  var fileSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
  var FileChecksum = function() {
    createClass(FileChecksum, null, [ {
      key: "create",
      value: function create(file, callback) {
        var instance = new FileChecksum(file);
        instance.create(callback);
      }
    } ]);
    function FileChecksum(file) {
      classCallCheck(this, FileChecksum);
      this.file = file;
      this.chunkSize = 2097152;
      this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
      this.chunkIndex = 0;
    }
    createClass(FileChecksum, [ {
      key: "create",
      value: function create(callback) {
        var _this = this;
        this.callback = callback;
        this.md5Buffer = new sparkMd5.ArrayBuffer();
        this.fileReader = new FileReader();
        this.fileReader.addEventListener("load", function(event) {
          return _this.fileReaderDidLoad(event);
        });
        this.fileReader.addEventListener("error", function(event) {
          return _this.fileReaderDidError(event);
        });
        this.readNextChunk();
      }
    }, {
      key: "fileReaderDidLoad",
      value: function fileReaderDidLoad(event) {
        this.md5Buffer.append(event.target.result);
        if (!this.readNextChunk()) {
          var binaryDigest = this.md5Buffer.end(true);
          var base64digest = btoa(binaryDigest);
          this.callback(null, base64digest);
        }
      }
    }, {
      key: "fileReaderDidError",
      value: function fileReaderDidError(event) {
        this.callback("Error reading " + this.file.name);
      }
    }, {
      key: "readNextChunk",
      value: function readNextChunk() {
        if (this.chunkIndex < this.chunkCount || this.chunkIndex == 0 && this.chunkCount == 0) {
          var start = this.chunkIndex * this.chunkSize;
          var end = Math.min(start + this.chunkSize, this.file.size);
          var bytes = fileSlice.call(this.file, start, end);
          this.fileReader.readAsArrayBuffer(bytes);
          this.chunkIndex++;
          return true;
        } else {
          return false;
        }
      }
    } ]);
    return FileChecksum;
  }();
  function getMetaValue(name) {
    var element = findElement(document.head, 'meta[name="' + name + '"]');
    if (element) {
      return element.getAttribute("content");
    }
  }
  function findElements(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    var elements = root.querySelectorAll(selector);
    return toArray$1(elements);
  }
  function findElement(root, selector) {
    if (typeof root == "string") {
      selector = root;
      root = document;
    }
    return root.querySelector(selector);
  }
  function dispatchEvent(element, type) {
    var eventInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var disabled = element.disabled;
    var bubbles = eventInit.bubbles, cancelable = eventInit.cancelable, detail = eventInit.detail;
    var event = document.createEvent("Event");
    event.initEvent(type, bubbles || true, cancelable || true);
    event.detail = detail || {};
    try {
      element.disabled = false;
      element.dispatchEvent(event);
    } finally {
      element.disabled = disabled;
    }
    return event;
  }
  function toArray$1(value) {
    if (Array.isArray(value)) {
      return value;
    } else if (Array.from) {
      return Array.from(value);
    } else {
      return [].slice.call(value);
    }
  }
  var BlobRecord = function() {
    function BlobRecord(file, checksum, url) {
      var _this = this;
      classCallCheck(this, BlobRecord);
      this.file = file;
      this.attributes = {
        filename: file.name,
        content_type: file.type,
        byte_size: file.size,
        checksum: checksum
      };
      this.xhr = new XMLHttpRequest();
      this.xhr.open("POST", url, true);
      this.xhr.responseType = "json";
      this.xhr.setRequestHeader("Content-Type", "application/json");
      this.xhr.setRequestHeader("Accept", "application/json");
      this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      this.xhr.setRequestHeader("X-CSRF-Token", getMetaValue("csrf-token"));
      this.xhr.addEventListener("load", function(event) {
        return _this.requestDidLoad(event);
      });
      this.xhr.addEventListener("error", function(event) {
        return _this.requestDidError(event);
      });
    }
    createClass(BlobRecord, [ {
      key: "create",
      value: function create(callback) {
        this.callback = callback;
        this.xhr.send(JSON.stringify({
          blob: this.attributes
        }));
      }
    }, {
      key: "requestDidLoad",
      value: function requestDidLoad(event) {
        if (this.status >= 200 && this.status < 300) {
          var response = this.response;
          var direct_upload = response.direct_upload;
          delete response.direct_upload;
          this.attributes = response;
          this.directUploadData = direct_upload;
          this.callback(null, this.toJSON());
        } else {
          this.requestDidError(event);
        }
      }
    }, {
      key: "requestDidError",
      value: function requestDidError(event) {
        this.callback('Error creating Blob for "' + this.file.name + '". Status: ' + this.status);
      }
    }, {
      key: "toJSON",
      value: function toJSON() {
        var result = {};
        for (var key in this.attributes) {
          result[key] = this.attributes[key];
        }
        return result;
      }
    }, {
      key: "status",
      get: function get$$1() {
        return this.xhr.status;
      }
    }, {
      key: "response",
      get: function get$$1() {
        var _xhr = this.xhr, responseType = _xhr.responseType, response = _xhr.response;
        if (responseType == "json") {
          return response;
        } else {
          return JSON.parse(response);
        }
      }
    } ]);
    return BlobRecord;
  }();
  var BlobUpload = function() {
    function BlobUpload(blob) {
      var _this = this;
      classCallCheck(this, BlobUpload);
      this.blob = blob;
      this.file = blob.file;
      var _blob$directUploadDat = blob.directUploadData, url = _blob$directUploadDat.url, headers = _blob$directUploadDat.headers;
      this.xhr = new XMLHttpRequest();
      this.xhr.open("PUT", url, true);
      this.xhr.responseType = "text";
      for (var key in headers) {
        this.xhr.setRequestHeader(key, headers[key]);
      }
      this.xhr.addEventListener("load", function(event) {
        return _this.requestDidLoad(event);
      });
      this.xhr.addEventListener("error", function(event) {
        return _this.requestDidError(event);
      });
    }
    createClass(BlobUpload, [ {
      key: "create",
      value: function create(callback) {
        this.callback = callback;
        this.xhr.send(this.file.slice());
      }
    }, {
      key: "requestDidLoad",
      value: function requestDidLoad(event) {
        var _xhr = this.xhr, status = _xhr.status, response = _xhr.response;
        if (status >= 200 && status < 300) {
          this.callback(null, response);
        } else {
          this.requestDidError(event);
        }
      }
    }, {
      key: "requestDidError",
      value: function requestDidError(event) {
        this.callback('Error storing "' + this.file.name + '". Status: ' + this.xhr.status);
      }
    } ]);
    return BlobUpload;
  }();
  var id = 0;
  var DirectUpload = function() {
    function DirectUpload(file, url, delegate) {
      classCallCheck(this, DirectUpload);
      this.id = ++id;
      this.file = file;
      this.url = url;
      this.delegate = delegate;
    }
    createClass(DirectUpload, [ {
      key: "create",
      value: function create(callback) {
        var _this = this;
        FileChecksum.create(this.file, function(error, checksum) {
          if (error) {
            callback(error);
            return;
          }
          var blob = new BlobRecord(_this.file, checksum, _this.url);
          notify(_this.delegate, "directUploadWillCreateBlobWithXHR", blob.xhr);
          blob.create(function(error) {
            if (error) {
              callback(error);
            } else {
              var upload = new BlobUpload(blob);
              notify(_this.delegate, "directUploadWillStoreFileWithXHR", upload.xhr);
              upload.create(function(error) {
                if (error) {
                  callback(error);
                } else {
                  callback(null, blob.toJSON());
                }
              });
            }
          });
        });
      }
    } ]);
    return DirectUpload;
  }();
  function notify(object, methodName) {
    if (object && typeof object[methodName] == "function") {
      for (var _len = arguments.length, messages = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        messages[_key - 2] = arguments[_key];
      }
      return object[methodName].apply(object, messages);
    }
  }
  var DirectUploadController = function() {
    function DirectUploadController(input, file) {
      classCallCheck(this, DirectUploadController);
      this.input = input;
      this.file = file;
      this.directUpload = new DirectUpload(this.file, this.url, this);
      this.dispatch("initialize");
    }
    createClass(DirectUploadController, [ {
      key: "start",
      value: function start(callback) {
        var _this = this;
        var hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = this.input.name;
        this.input.insertAdjacentElement("beforebegin", hiddenInput);
        this.dispatch("start");
        this.directUpload.create(function(error, attributes) {
          if (error) {
            hiddenInput.parentNode.removeChild(hiddenInput);
            _this.dispatchError(error);
          } else {
            hiddenInput.value = attributes.signed_id;
          }
          _this.dispatch("end");
          callback(error);
        });
      }
    }, {
      key: "uploadRequestDidProgress",
      value: function uploadRequestDidProgress(event) {
        var progress = event.loaded / event.total * 100;
        if (progress) {
          this.dispatch("progress", {
            progress: progress
          });
        }
      }
    }, {
      key: "dispatch",
      value: function dispatch(name) {
        var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        detail.file = this.file;
        detail.id = this.directUpload.id;
        return dispatchEvent(this.input, "direct-upload:" + name, {
          detail: detail
        });
      }
    }, {
      key: "dispatchError",
      value: function dispatchError(error) {
        var event = this.dispatch("error", {
          error: error
        });
        if (!event.defaultPrevented) {
          alert(error);
        }
      }
    }, {
      key: "directUploadWillCreateBlobWithXHR",
      value: function directUploadWillCreateBlobWithXHR(xhr) {
        this.dispatch("before-blob-request", {
          xhr: xhr
        });
      }
    }, {
      key: "directUploadWillStoreFileWithXHR",
      value: function directUploadWillStoreFileWithXHR(xhr) {
        var _this2 = this;
        this.dispatch("before-storage-request", {
          xhr: xhr
        });
        xhr.upload.addEventListener("progress", function(event) {
          return _this2.uploadRequestDidProgress(event);
        });
      }
    }, {
      key: "url",
      get: function get$$1() {
        return this.input.getAttribute("data-direct-upload-url");
      }
    } ]);
    return DirectUploadController;
  }();
  var inputSelector = "input[type=file][data-direct-upload-url]:not([disabled])";
  var DirectUploadsController = function() {
    function DirectUploadsController(form) {
      classCallCheck(this, DirectUploadsController);
      this.form = form;
      this.inputs = findElements(form, inputSelector).filter(function(input) {
        return input.files.length;
      });
    }
    createClass(DirectUploadsController, [ {
      key: "start",
      value: function start(callback) {
        var _this = this;
        var controllers = this.createDirectUploadControllers();
        var startNextController = function startNextController() {
          var controller = controllers.shift();
          if (controller) {
            controller.start(function(error) {
              if (error) {
                callback(error);
                _this.dispatch("end");
              } else {
                startNextController();
              }
            });
          } else {
            callback();
            _this.dispatch("end");
          }
        };
        this.dispatch("start");
        startNextController();
      }
    }, {
      key: "createDirectUploadControllers",
      value: function createDirectUploadControllers() {
        var controllers = [];
        this.inputs.forEach(function(input) {
          toArray$1(input.files).forEach(function(file) {
            var controller = new DirectUploadController(input, file);
            controllers.push(controller);
          });
        });
        return controllers;
      }
    }, {
      key: "dispatch",
      value: function dispatch(name) {
        var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return dispatchEvent(this.form, "direct-uploads:" + name, {
          detail: detail
        });
      }
    } ]);
    return DirectUploadsController;
  }();
  var processingAttribute = "data-direct-uploads-processing";
  var submitButtonsByForm = new WeakMap();
  var started = false;
  function start() {
    if (!started) {
      started = true;
      document.addEventListener("click", didClick, true);
      document.addEventListener("submit", didSubmitForm);
      document.addEventListener("ajax:before", didSubmitRemoteElement);
    }
  }
  function didClick(event) {
    var target = event.target;
    if ((target.tagName == "INPUT" || target.tagName == "BUTTON") && target.type == "submit" && target.form) {
      submitButtonsByForm.set(target.form, target);
    }
  }
  function didSubmitForm(event) {
    handleFormSubmissionEvent(event);
  }
  function didSubmitRemoteElement(event) {
    if (event.target.tagName == "FORM") {
      handleFormSubmissionEvent(event);
    }
  }
  function handleFormSubmissionEvent(event) {
    var form = event.target;
    if (form.hasAttribute(processingAttribute)) {
      event.preventDefault();
      return;
    }
    var controller = new DirectUploadsController(form);
    var inputs = controller.inputs;
    if (inputs.length) {
      event.preventDefault();
      form.setAttribute(processingAttribute, "");
      inputs.forEach(disable);
      controller.start(function(error) {
        form.removeAttribute(processingAttribute);
        if (error) {
          inputs.forEach(enable);
        } else {
          submitForm(form);
        }
      });
    }
  }
  function submitForm(form) {
    var button = submitButtonsByForm.get(form) || findElement(form, "input[type=submit], button[type=submit]");
    if (button) {
      var _button = button, disabled = _button.disabled;
      button.disabled = false;
      button.focus();
      button.click();
      button.disabled = disabled;
    } else {
      button = document.createElement("input");
      button.type = "submit";
      button.style.display = "none";
      form.appendChild(button);
      button.click();
      form.removeChild(button);
    }
    submitButtonsByForm.delete(form);
  }
  function disable(input) {
    input.disabled = true;
  }
  function enable(input) {
    input.disabled = false;
  }
  function autostart() {
    if (window.ActiveStorage) {
      start();
    }
  }
  setTimeout(autostart, 1);
  exports.start = start;
  exports.DirectUpload = DirectUpload;
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
});
/*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */

(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
/**
 * @popperjs/core v2.11.6 - MIT License
 */


!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Popper={})}(this,(function(e){"use strict";function t(e){if(null==e)return window;if("[object Window]"!==e.toString()){var t=e.ownerDocument;return t&&t.defaultView||window}return e}function n(e){return e instanceof t(e).Element||e instanceof Element}function r(e){return e instanceof t(e).HTMLElement||e instanceof HTMLElement}function o(e){return"undefined"!=typeof ShadowRoot&&(e instanceof t(e).ShadowRoot||e instanceof ShadowRoot)}var i=Math.max,a=Math.min,s=Math.round;function f(){var e=navigator.userAgentData;return null!=e&&e.brands?e.brands.map((function(e){return e.brand+"/"+e.version})).join(" "):navigator.userAgent}function c(){return!/^((?!chrome|android).)*safari/i.test(f())}function p(e,o,i){void 0===o&&(o=!1),void 0===i&&(i=!1);var a=e.getBoundingClientRect(),f=1,p=1;o&&r(e)&&(f=e.offsetWidth>0&&s(a.width)/e.offsetWidth||1,p=e.offsetHeight>0&&s(a.height)/e.offsetHeight||1);var u=(n(e)?t(e):window).visualViewport,l=!c()&&i,d=(a.left+(l&&u?u.offsetLeft:0))/f,h=(a.top+(l&&u?u.offsetTop:0))/p,m=a.width/f,v=a.height/p;return{width:m,height:v,top:h,right:d+m,bottom:h+v,left:d,x:d,y:h}}function u(e){var n=t(e);return{scrollLeft:n.pageXOffset,scrollTop:n.pageYOffset}}function l(e){return e?(e.nodeName||"").toLowerCase():null}function d(e){return((n(e)?e.ownerDocument:e.document)||window.document).documentElement}function h(e){return p(d(e)).left+u(e).scrollLeft}function m(e){return t(e).getComputedStyle(e)}function v(e){var t=m(e),n=t.overflow,r=t.overflowX,o=t.overflowY;return/auto|scroll|overlay|hidden/.test(n+o+r)}function y(e,n,o){void 0===o&&(o=!1);var i,a,f=r(n),c=r(n)&&function(e){var t=e.getBoundingClientRect(),n=s(t.width)/e.offsetWidth||1,r=s(t.height)/e.offsetHeight||1;return 1!==n||1!==r}(n),m=d(n),y=p(e,c,o),g={scrollLeft:0,scrollTop:0},b={x:0,y:0};return(f||!f&&!o)&&(("body"!==l(n)||v(m))&&(g=(i=n)!==t(i)&&r(i)?{scrollLeft:(a=i).scrollLeft,scrollTop:a.scrollTop}:u(i)),r(n)?((b=p(n,!0)).x+=n.clientLeft,b.y+=n.clientTop):m&&(b.x=h(m))),{x:y.left+g.scrollLeft-b.x,y:y.top+g.scrollTop-b.y,width:y.width,height:y.height}}function g(e){var t=p(e),n=e.offsetWidth,r=e.offsetHeight;return Math.abs(t.width-n)<=1&&(n=t.width),Math.abs(t.height-r)<=1&&(r=t.height),{x:e.offsetLeft,y:e.offsetTop,width:n,height:r}}function b(e){return"html"===l(e)?e:e.assignedSlot||e.parentNode||(o(e)?e.host:null)||d(e)}function w(e){return["html","body","#document"].indexOf(l(e))>=0?e.ownerDocument.body:r(e)&&v(e)?e:w(b(e))}function x(e,n){var r;void 0===n&&(n=[]);var o=w(e),i=o===(null==(r=e.ownerDocument)?void 0:r.body),a=t(o),s=i?[a].concat(a.visualViewport||[],v(o)?o:[]):o,f=n.concat(s);return i?f:f.concat(x(b(s)))}function O(e){return["table","td","th"].indexOf(l(e))>=0}function j(e){return r(e)&&"fixed"!==m(e).position?e.offsetParent:null}function E(e){for(var n=t(e),i=j(e);i&&O(i)&&"static"===m(i).position;)i=j(i);return i&&("html"===l(i)||"body"===l(i)&&"static"===m(i).position)?n:i||function(e){var t=/firefox/i.test(f());if(/Trident/i.test(f())&&r(e)&&"fixed"===m(e).position)return null;var n=b(e);for(o(n)&&(n=n.host);r(n)&&["html","body"].indexOf(l(n))<0;){var i=m(n);if("none"!==i.transform||"none"!==i.perspective||"paint"===i.contain||-1!==["transform","perspective"].indexOf(i.willChange)||t&&"filter"===i.willChange||t&&i.filter&&"none"!==i.filter)return n;n=n.parentNode}return null}(e)||n}var D="top",A="bottom",L="right",P="left",M="auto",k=[D,A,L,P],W="start",B="end",H="viewport",T="popper",R=k.reduce((function(e,t){return e.concat([t+"-"+W,t+"-"+B])}),[]),S=[].concat(k,[M]).reduce((function(e,t){return e.concat([t,t+"-"+W,t+"-"+B])}),[]),V=["beforeRead","read","afterRead","beforeMain","main","afterMain","beforeWrite","write","afterWrite"];function q(e){var t=new Map,n=new Set,r=[];function o(e){n.add(e.name),[].concat(e.requires||[],e.requiresIfExists||[]).forEach((function(e){if(!n.has(e)){var r=t.get(e);r&&o(r)}})),r.push(e)}return e.forEach((function(e){t.set(e.name,e)})),e.forEach((function(e){n.has(e.name)||o(e)})),r}function C(e){return e.split("-")[0]}function N(e,t){var n=t.getRootNode&&t.getRootNode();if(e.contains(t))return!0;if(n&&o(n)){var r=t;do{if(r&&e.isSameNode(r))return!0;r=r.parentNode||r.host}while(r)}return!1}function I(e){return Object.assign({},e,{left:e.x,top:e.y,right:e.x+e.width,bottom:e.y+e.height})}function _(e,r,o){return r===H?I(function(e,n){var r=t(e),o=d(e),i=r.visualViewport,a=o.clientWidth,s=o.clientHeight,f=0,p=0;if(i){a=i.width,s=i.height;var u=c();(u||!u&&"fixed"===n)&&(f=i.offsetLeft,p=i.offsetTop)}return{width:a,height:s,x:f+h(e),y:p}}(e,o)):n(r)?function(e,t){var n=p(e,!1,"fixed"===t);return n.top=n.top+e.clientTop,n.left=n.left+e.clientLeft,n.bottom=n.top+e.clientHeight,n.right=n.left+e.clientWidth,n.width=e.clientWidth,n.height=e.clientHeight,n.x=n.left,n.y=n.top,n}(r,o):I(function(e){var t,n=d(e),r=u(e),o=null==(t=e.ownerDocument)?void 0:t.body,a=i(n.scrollWidth,n.clientWidth,o?o.scrollWidth:0,o?o.clientWidth:0),s=i(n.scrollHeight,n.clientHeight,o?o.scrollHeight:0,o?o.clientHeight:0),f=-r.scrollLeft+h(e),c=-r.scrollTop;return"rtl"===m(o||n).direction&&(f+=i(n.clientWidth,o?o.clientWidth:0)-a),{width:a,height:s,x:f,y:c}}(d(e)))}function F(e,t,o,s){var f="clippingParents"===t?function(e){var t=x(b(e)),o=["absolute","fixed"].indexOf(m(e).position)>=0&&r(e)?E(e):e;return n(o)?t.filter((function(e){return n(e)&&N(e,o)&&"body"!==l(e)})):[]}(e):[].concat(t),c=[].concat(f,[o]),p=c[0],u=c.reduce((function(t,n){var r=_(e,n,s);return t.top=i(r.top,t.top),t.right=a(r.right,t.right),t.bottom=a(r.bottom,t.bottom),t.left=i(r.left,t.left),t}),_(e,p,s));return u.width=u.right-u.left,u.height=u.bottom-u.top,u.x=u.left,u.y=u.top,u}function U(e){return e.split("-")[1]}function z(e){return["top","bottom"].indexOf(e)>=0?"x":"y"}function X(e){var t,n=e.reference,r=e.element,o=e.placement,i=o?C(o):null,a=o?U(o):null,s=n.x+n.width/2-r.width/2,f=n.y+n.height/2-r.height/2;switch(i){case D:t={x:s,y:n.y-r.height};break;case A:t={x:s,y:n.y+n.height};break;case L:t={x:n.x+n.width,y:f};break;case P:t={x:n.x-r.width,y:f};break;default:t={x:n.x,y:n.y}}var c=i?z(i):null;if(null!=c){var p="y"===c?"height":"width";switch(a){case W:t[c]=t[c]-(n[p]/2-r[p]/2);break;case B:t[c]=t[c]+(n[p]/2-r[p]/2)}}return t}function Y(e){return Object.assign({},{top:0,right:0,bottom:0,left:0},e)}function G(e,t){return t.reduce((function(t,n){return t[n]=e,t}),{})}function J(e,t){void 0===t&&(t={});var r=t,o=r.placement,i=void 0===o?e.placement:o,a=r.strategy,s=void 0===a?e.strategy:a,f=r.boundary,c=void 0===f?"clippingParents":f,u=r.rootBoundary,l=void 0===u?H:u,h=r.elementContext,m=void 0===h?T:h,v=r.altBoundary,y=void 0!==v&&v,g=r.padding,b=void 0===g?0:g,w=Y("number"!=typeof b?b:G(b,k)),x=m===T?"reference":T,O=e.rects.popper,j=e.elements[y?x:m],E=F(n(j)?j:j.contextElement||d(e.elements.popper),c,l,s),P=p(e.elements.reference),M=X({reference:P,element:O,strategy:"absolute",placement:i}),W=I(Object.assign({},O,M)),B=m===T?W:P,R={top:E.top-B.top+w.top,bottom:B.bottom-E.bottom+w.bottom,left:E.left-B.left+w.left,right:B.right-E.right+w.right},S=e.modifiersData.offset;if(m===T&&S){var V=S[i];Object.keys(R).forEach((function(e){var t=[L,A].indexOf(e)>=0?1:-1,n=[D,A].indexOf(e)>=0?"y":"x";R[e]+=V[n]*t}))}return R}var K={placement:"bottom",modifiers:[],strategy:"absolute"};function Q(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return!t.some((function(e){return!(e&&"function"==typeof e.getBoundingClientRect)}))}function Z(e){void 0===e&&(e={});var t=e,r=t.defaultModifiers,o=void 0===r?[]:r,i=t.defaultOptions,a=void 0===i?K:i;return function(e,t,r){void 0===r&&(r=a);var i,s,f={placement:"bottom",orderedModifiers:[],options:Object.assign({},K,a),modifiersData:{},elements:{reference:e,popper:t},attributes:{},styles:{}},c=[],p=!1,u={state:f,setOptions:function(r){var i="function"==typeof r?r(f.options):r;l(),f.options=Object.assign({},a,f.options,i),f.scrollParents={reference:n(e)?x(e):e.contextElement?x(e.contextElement):[],popper:x(t)};var s,p,d=function(e){var t=q(e);return V.reduce((function(e,n){return e.concat(t.filter((function(e){return e.phase===n})))}),[])}((s=[].concat(o,f.options.modifiers),p=s.reduce((function(e,t){var n=e[t.name];return e[t.name]=n?Object.assign({},n,t,{options:Object.assign({},n.options,t.options),data:Object.assign({},n.data,t.data)}):t,e}),{}),Object.keys(p).map((function(e){return p[e]}))));return f.orderedModifiers=d.filter((function(e){return e.enabled})),f.orderedModifiers.forEach((function(e){var t=e.name,n=e.options,r=void 0===n?{}:n,o=e.effect;if("function"==typeof o){var i=o({state:f,name:t,instance:u,options:r}),a=function(){};c.push(i||a)}})),u.update()},forceUpdate:function(){if(!p){var e=f.elements,t=e.reference,n=e.popper;if(Q(t,n)){f.rects={reference:y(t,E(n),"fixed"===f.options.strategy),popper:g(n)},f.reset=!1,f.placement=f.options.placement,f.orderedModifiers.forEach((function(e){return f.modifiersData[e.name]=Object.assign({},e.data)}));for(var r=0;r<f.orderedModifiers.length;r++)if(!0!==f.reset){var o=f.orderedModifiers[r],i=o.fn,a=o.options,s=void 0===a?{}:a,c=o.name;"function"==typeof i&&(f=i({state:f,options:s,name:c,instance:u})||f)}else f.reset=!1,r=-1}}},update:(i=function(){return new Promise((function(e){u.forceUpdate(),e(f)}))},function(){return s||(s=new Promise((function(e){Promise.resolve().then((function(){s=void 0,e(i())}))}))),s}),destroy:function(){l(),p=!0}};if(!Q(e,t))return u;function l(){c.forEach((function(e){return e()})),c=[]}return u.setOptions(r).then((function(e){!p&&r.onFirstUpdate&&r.onFirstUpdate(e)})),u}}var $={passive:!0};var ee={name:"eventListeners",enabled:!0,phase:"write",fn:function(){},effect:function(e){var n=e.state,r=e.instance,o=e.options,i=o.scroll,a=void 0===i||i,s=o.resize,f=void 0===s||s,c=t(n.elements.popper),p=[].concat(n.scrollParents.reference,n.scrollParents.popper);return a&&p.forEach((function(e){e.addEventListener("scroll",r.update,$)})),f&&c.addEventListener("resize",r.update,$),function(){a&&p.forEach((function(e){e.removeEventListener("scroll",r.update,$)})),f&&c.removeEventListener("resize",r.update,$)}},data:{}};var te={name:"popperOffsets",enabled:!0,phase:"read",fn:function(e){var t=e.state,n=e.name;t.modifiersData[n]=X({reference:t.rects.reference,element:t.rects.popper,strategy:"absolute",placement:t.placement})},data:{}},ne={top:"auto",right:"auto",bottom:"auto",left:"auto"};function re(e){var n,r=e.popper,o=e.popperRect,i=e.placement,a=e.variation,f=e.offsets,c=e.position,p=e.gpuAcceleration,u=e.adaptive,l=e.roundOffsets,h=e.isFixed,v=f.x,y=void 0===v?0:v,g=f.y,b=void 0===g?0:g,w="function"==typeof l?l({x:y,y:b}):{x:y,y:b};y=w.x,b=w.y;var x=f.hasOwnProperty("x"),O=f.hasOwnProperty("y"),j=P,M=D,k=window;if(u){var W=E(r),H="clientHeight",T="clientWidth";if(W===t(r)&&"static"!==m(W=d(r)).position&&"absolute"===c&&(H="scrollHeight",T="scrollWidth"),W=W,i===D||(i===P||i===L)&&a===B)M=A,b-=(h&&W===k&&k.visualViewport?k.visualViewport.height:W[H])-o.height,b*=p?1:-1;if(i===P||(i===D||i===A)&&a===B)j=L,y-=(h&&W===k&&k.visualViewport?k.visualViewport.width:W[T])-o.width,y*=p?1:-1}var R,S=Object.assign({position:c},u&&ne),V=!0===l?function(e){var t=e.x,n=e.y,r=window.devicePixelRatio||1;return{x:s(t*r)/r||0,y:s(n*r)/r||0}}({x:y,y:b}):{x:y,y:b};return y=V.x,b=V.y,p?Object.assign({},S,((R={})[M]=O?"0":"",R[j]=x?"0":"",R.transform=(k.devicePixelRatio||1)<=1?"translate("+y+"px, "+b+"px)":"translate3d("+y+"px, "+b+"px, 0)",R)):Object.assign({},S,((n={})[M]=O?b+"px":"",n[j]=x?y+"px":"",n.transform="",n))}var oe={name:"computeStyles",enabled:!0,phase:"beforeWrite",fn:function(e){var t=e.state,n=e.options,r=n.gpuAcceleration,o=void 0===r||r,i=n.adaptive,a=void 0===i||i,s=n.roundOffsets,f=void 0===s||s,c={placement:C(t.placement),variation:U(t.placement),popper:t.elements.popper,popperRect:t.rects.popper,gpuAcceleration:o,isFixed:"fixed"===t.options.strategy};null!=t.modifiersData.popperOffsets&&(t.styles.popper=Object.assign({},t.styles.popper,re(Object.assign({},c,{offsets:t.modifiersData.popperOffsets,position:t.options.strategy,adaptive:a,roundOffsets:f})))),null!=t.modifiersData.arrow&&(t.styles.arrow=Object.assign({},t.styles.arrow,re(Object.assign({},c,{offsets:t.modifiersData.arrow,position:"absolute",adaptive:!1,roundOffsets:f})))),t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-placement":t.placement})},data:{}};var ie={name:"applyStyles",enabled:!0,phase:"write",fn:function(e){var t=e.state;Object.keys(t.elements).forEach((function(e){var n=t.styles[e]||{},o=t.attributes[e]||{},i=t.elements[e];r(i)&&l(i)&&(Object.assign(i.style,n),Object.keys(o).forEach((function(e){var t=o[e];!1===t?i.removeAttribute(e):i.setAttribute(e,!0===t?"":t)})))}))},effect:function(e){var t=e.state,n={popper:{position:t.options.strategy,left:"0",top:"0",margin:"0"},arrow:{position:"absolute"},reference:{}};return Object.assign(t.elements.popper.style,n.popper),t.styles=n,t.elements.arrow&&Object.assign(t.elements.arrow.style,n.arrow),function(){Object.keys(t.elements).forEach((function(e){var o=t.elements[e],i=t.attributes[e]||{},a=Object.keys(t.styles.hasOwnProperty(e)?t.styles[e]:n[e]).reduce((function(e,t){return e[t]="",e}),{});r(o)&&l(o)&&(Object.assign(o.style,a),Object.keys(i).forEach((function(e){o.removeAttribute(e)})))}))}},requires:["computeStyles"]};var ae={name:"offset",enabled:!0,phase:"main",requires:["popperOffsets"],fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.offset,i=void 0===o?[0,0]:o,a=S.reduce((function(e,n){return e[n]=function(e,t,n){var r=C(e),o=[P,D].indexOf(r)>=0?-1:1,i="function"==typeof n?n(Object.assign({},t,{placement:e})):n,a=i[0],s=i[1];return a=a||0,s=(s||0)*o,[P,L].indexOf(r)>=0?{x:s,y:a}:{x:a,y:s}}(n,t.rects,i),e}),{}),s=a[t.placement],f=s.x,c=s.y;null!=t.modifiersData.popperOffsets&&(t.modifiersData.popperOffsets.x+=f,t.modifiersData.popperOffsets.y+=c),t.modifiersData[r]=a}},se={left:"right",right:"left",bottom:"top",top:"bottom"};function fe(e){return e.replace(/left|right|bottom|top/g,(function(e){return se[e]}))}var ce={start:"end",end:"start"};function pe(e){return e.replace(/start|end/g,(function(e){return ce[e]}))}function ue(e,t){void 0===t&&(t={});var n=t,r=n.placement,o=n.boundary,i=n.rootBoundary,a=n.padding,s=n.flipVariations,f=n.allowedAutoPlacements,c=void 0===f?S:f,p=U(r),u=p?s?R:R.filter((function(e){return U(e)===p})):k,l=u.filter((function(e){return c.indexOf(e)>=0}));0===l.length&&(l=u);var d=l.reduce((function(t,n){return t[n]=J(e,{placement:n,boundary:o,rootBoundary:i,padding:a})[C(n)],t}),{});return Object.keys(d).sort((function(e,t){return d[e]-d[t]}))}var le={name:"flip",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name;if(!t.modifiersData[r]._skip){for(var o=n.mainAxis,i=void 0===o||o,a=n.altAxis,s=void 0===a||a,f=n.fallbackPlacements,c=n.padding,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.flipVariations,h=void 0===d||d,m=n.allowedAutoPlacements,v=t.options.placement,y=C(v),g=f||(y===v||!h?[fe(v)]:function(e){if(C(e)===M)return[];var t=fe(e);return[pe(e),t,pe(t)]}(v)),b=[v].concat(g).reduce((function(e,n){return e.concat(C(n)===M?ue(t,{placement:n,boundary:p,rootBoundary:u,padding:c,flipVariations:h,allowedAutoPlacements:m}):n)}),[]),w=t.rects.reference,x=t.rects.popper,O=new Map,j=!0,E=b[0],k=0;k<b.length;k++){var B=b[k],H=C(B),T=U(B)===W,R=[D,A].indexOf(H)>=0,S=R?"width":"height",V=J(t,{placement:B,boundary:p,rootBoundary:u,altBoundary:l,padding:c}),q=R?T?L:P:T?A:D;w[S]>x[S]&&(q=fe(q));var N=fe(q),I=[];if(i&&I.push(V[H]<=0),s&&I.push(V[q]<=0,V[N]<=0),I.every((function(e){return e}))){E=B,j=!1;break}O.set(B,I)}if(j)for(var _=function(e){var t=b.find((function(t){var n=O.get(t);if(n)return n.slice(0,e).every((function(e){return e}))}));if(t)return E=t,"break"},F=h?3:1;F>0;F--){if("break"===_(F))break}t.placement!==E&&(t.modifiersData[r]._skip=!0,t.placement=E,t.reset=!0)}},requiresIfExists:["offset"],data:{_skip:!1}};function de(e,t,n){return i(e,a(t,n))}var he={name:"preventOverflow",enabled:!0,phase:"main",fn:function(e){var t=e.state,n=e.options,r=e.name,o=n.mainAxis,s=void 0===o||o,f=n.altAxis,c=void 0!==f&&f,p=n.boundary,u=n.rootBoundary,l=n.altBoundary,d=n.padding,h=n.tether,m=void 0===h||h,v=n.tetherOffset,y=void 0===v?0:v,b=J(t,{boundary:p,rootBoundary:u,padding:d,altBoundary:l}),w=C(t.placement),x=U(t.placement),O=!x,j=z(w),M="x"===j?"y":"x",k=t.modifiersData.popperOffsets,B=t.rects.reference,H=t.rects.popper,T="function"==typeof y?y(Object.assign({},t.rects,{placement:t.placement})):y,R="number"==typeof T?{mainAxis:T,altAxis:T}:Object.assign({mainAxis:0,altAxis:0},T),S=t.modifiersData.offset?t.modifiersData.offset[t.placement]:null,V={x:0,y:0};if(k){if(s){var q,N="y"===j?D:P,I="y"===j?A:L,_="y"===j?"height":"width",F=k[j],X=F+b[N],Y=F-b[I],G=m?-H[_]/2:0,K=x===W?B[_]:H[_],Q=x===W?-H[_]:-B[_],Z=t.elements.arrow,$=m&&Z?g(Z):{width:0,height:0},ee=t.modifiersData["arrow#persistent"]?t.modifiersData["arrow#persistent"].padding:{top:0,right:0,bottom:0,left:0},te=ee[N],ne=ee[I],re=de(0,B[_],$[_]),oe=O?B[_]/2-G-re-te-R.mainAxis:K-re-te-R.mainAxis,ie=O?-B[_]/2+G+re+ne+R.mainAxis:Q+re+ne+R.mainAxis,ae=t.elements.arrow&&E(t.elements.arrow),se=ae?"y"===j?ae.clientTop||0:ae.clientLeft||0:0,fe=null!=(q=null==S?void 0:S[j])?q:0,ce=F+ie-fe,pe=de(m?a(X,F+oe-fe-se):X,F,m?i(Y,ce):Y);k[j]=pe,V[j]=pe-F}if(c){var ue,le="x"===j?D:P,he="x"===j?A:L,me=k[M],ve="y"===M?"height":"width",ye=me+b[le],ge=me-b[he],be=-1!==[D,P].indexOf(w),we=null!=(ue=null==S?void 0:S[M])?ue:0,xe=be?ye:me-B[ve]-H[ve]-we+R.altAxis,Oe=be?me+B[ve]+H[ve]-we-R.altAxis:ge,je=m&&be?function(e,t,n){var r=de(e,t,n);return r>n?n:r}(xe,me,Oe):de(m?xe:ye,me,m?Oe:ge);k[M]=je,V[M]=je-me}t.modifiersData[r]=V}},requiresIfExists:["offset"]};var me={name:"arrow",enabled:!0,phase:"main",fn:function(e){var t,n=e.state,r=e.name,o=e.options,i=n.elements.arrow,a=n.modifiersData.popperOffsets,s=C(n.placement),f=z(s),c=[P,L].indexOf(s)>=0?"height":"width";if(i&&a){var p=function(e,t){return Y("number"!=typeof(e="function"==typeof e?e(Object.assign({},t.rects,{placement:t.placement})):e)?e:G(e,k))}(o.padding,n),u=g(i),l="y"===f?D:P,d="y"===f?A:L,h=n.rects.reference[c]+n.rects.reference[f]-a[f]-n.rects.popper[c],m=a[f]-n.rects.reference[f],v=E(i),y=v?"y"===f?v.clientHeight||0:v.clientWidth||0:0,b=h/2-m/2,w=p[l],x=y-u[c]-p[d],O=y/2-u[c]/2+b,j=de(w,O,x),M=f;n.modifiersData[r]=((t={})[M]=j,t.centerOffset=j-O,t)}},effect:function(e){var t=e.state,n=e.options.element,r=void 0===n?"[data-popper-arrow]":n;null!=r&&("string"!=typeof r||(r=t.elements.popper.querySelector(r)))&&N(t.elements.popper,r)&&(t.elements.arrow=r)},requires:["popperOffsets"],requiresIfExists:["preventOverflow"]};function ve(e,t,n){return void 0===n&&(n={x:0,y:0}),{top:e.top-t.height-n.y,right:e.right-t.width+n.x,bottom:e.bottom-t.height+n.y,left:e.left-t.width-n.x}}function ye(e){return[D,L,A,P].some((function(t){return e[t]>=0}))}var ge={name:"hide",enabled:!0,phase:"main",requiresIfExists:["preventOverflow"],fn:function(e){var t=e.state,n=e.name,r=t.rects.reference,o=t.rects.popper,i=t.modifiersData.preventOverflow,a=J(t,{elementContext:"reference"}),s=J(t,{altBoundary:!0}),f=ve(a,r),c=ve(s,o,i),p=ye(f),u=ye(c);t.modifiersData[n]={referenceClippingOffsets:f,popperEscapeOffsets:c,isReferenceHidden:p,hasPopperEscaped:u},t.attributes.popper=Object.assign({},t.attributes.popper,{"data-popper-reference-hidden":p,"data-popper-escaped":u})}},be=Z({defaultModifiers:[ee,te,oe,ie]}),we=[ee,te,oe,ie,ae,le,he,me,ge],xe=Z({defaultModifiers:we});e.applyStyles=ie,e.arrow=me,e.computeStyles=oe,e.createPopper=xe,e.createPopperLite=be,e.defaultModifiers=we,e.detectOverflow=J,e.eventListeners=ee,e.flip=le,e.hide=ge,e.offset=ae,e.popperGenerator=Z,e.popperOffsets=te,e.preventOverflow=he,Object.defineProperty(e,"__esModule",{value:!0})}));
/*!
  * Bootstrap v5.2.2 (https://getbootstrap.com/)
  * Copyright 2011-2022 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@popperjs/core')) :
  typeof define === 'function' && define.amd ? define(['@popperjs/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory(global.Popper));
})(this, (function (Popper) { 'use strict';

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
    if (e) {
      for (const k in e) {
        if (k !== 'default') {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }

  const Popper__namespace = /*#__PURE__*/_interopNamespace(Popper);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend'; // Shout-out Angus Croll (https://goo.gl/pxwQGp)

  const toType = object => {
    if (object === null || object === undefined) {
      return `${object}`;
    }

    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  /**
   * Public Util API
   */


  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));

    return prefix;
  };

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');

    if (!selector || selector === '#') {
      let hrefAttribute = element.getAttribute('href'); // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273

      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
        return null;
      } // Just in case some CMS puts out a full URL with the anchor appended


      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
      }

      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    }

    return selector;
  };

  const getSelectorFromElement = element => {
    const selector = getSelector(element);

    if (selector) {
      return document.querySelector(selector) ? selector : null;
    }

    return null;
  };

  const getElementFromSelector = element => {
    const selector = getSelector(element);
    return selector ? document.querySelector(selector) : null;
  };

  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    } // Get transition-duration of the element


    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    } // If multiple durations are defined, take the first


    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };

  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };

  const isElement = object => {
    if (!object || typeof object !== 'object') {
      return false;
    }

    if (typeof object.jquery !== 'undefined') {
      object = object[0];
    }

    return typeof object.nodeType !== 'undefined';
  };

  const getElement = object => {
    // it's a jQuery object or a node element
    if (isElement(object)) {
      return object.jquery ? object[0] : object;
    }

    if (typeof object === 'string' && object.length > 0) {
      return document.querySelector(object);
    }

    return null;
  };

  const isVisible = element => {
    if (!isElement(element) || element.getClientRects().length === 0) {
      return false;
    }

    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'; // Handle `details` element as its content may falsie appear visible when it is closed

    const closedDetails = element.closest('details:not([open])');

    if (!closedDetails) {
      return elementIsVisible;
    }

    if (closedDetails !== element) {
      const summary = element.closest('summary');

      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }

      if (summary === null) {
        return false;
      }
    }

    return elementIsVisible;
  };

  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }

    if (element.classList.contains('disabled')) {
      return true;
    }

    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }

    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };

  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    } // Can find the shadow root otherwise it'll return the document


    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }

    if (element instanceof ShadowRoot) {
      return element;
    } // when we don't find a shadow root


    if (!element.parentNode) {
      return null;
    }

    return findShadowRoot(element.parentNode);
  };

  const noop = () => {};
  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */


  const reflow = element => {
    element.offsetHeight; // eslint-disable-line no-unused-expressions
  };

  const getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return window.jQuery;
    }

    return null;
  };

  const DOMContentLoadedCallbacks = [];

  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          for (const callback of DOMContentLoadedCallbacks) {
            callback();
          }
        });
      }

      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };

  const isRTL = () => document.documentElement.dir === 'rtl';

  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */

      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;

        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };

  const execute = callback => {
    if (typeof callback === 'function') {
      callback();
    }
  };

  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }

    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;

    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }

      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };

    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */


  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement); // if the element does not exist in the list return an element
    // depending on the direction and if cycle is allowed

    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }

    index += shouldGetNext ? 1 : -1;

    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }

    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage

  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);
  /**
   * Private methods
   */

  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }

  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }

  function bootstrapHandler(element, fn) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });

      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }

      return fn.apply(element, [event]);
    };
  }

  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);

      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }

          hydrateObj(event, {
            delegateTarget: target
          });

          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn);
          }

          return fn.apply(target, [event]);
        }
      }
    };
  }

  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
  }

  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === 'string'; // todo: tooltip passes `false` instead of selector, so we need to check

    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);

    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }

    return [isDelegated, callable, typeEvent];
  }

  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }

    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction); // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does

    if (originalTypeEvent in customEvents) {
      const wrapFunction = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };

      callable = wrapFunction(callable);
    }

    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);

    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }

    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn.delegationSelector = isDelegated ? handler : null;
    fn.callable = callable;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, isDelegated);
  }

  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);

    if (!fn) {
      return;
    }

    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }

  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};

    for (const handlerKey of Object.keys(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        const event = storeElementEvent[handlerKey];
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }

  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }

  const EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },

    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },

    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }

      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith('.');

      if (typeof callable !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!Object.keys(storeElementEvent).length) {
          return;
        }

        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }

      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }

      for (const keyHandlers of Object.keys(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');

        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          const event = storeElementEvent[keyHandlers];
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },

    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }

      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;

      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }

      let evt = new Event(event, {
        bubbles,
        cancelable: true
      });
      evt = hydrateObj(evt, args);

      if (defaultPrevented) {
        evt.preventDefault();
      }

      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }

      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }

      return evt;
    }

  };

  function hydrateObj(obj, meta) {
    for (const [key, value] of Object.entries(meta || {})) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,

          get() {
            return value;
          }

        });
      }
    }

    return obj;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * Constants
   */
  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }

      const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used

      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }

      instanceMap.set(key, instance);
    },

    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }

      return null;
    },

    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }

      const instanceMap = elementMap.get(element);
      instanceMap.delete(key); // free up element references if there are no instances left for an element

      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    if (value === Number(value).toString()) {
      return Number(value);
    }

    if (value === '' || value === 'null') {
      return null;
    }

    if (typeof value !== 'string') {
      return value;
    }

    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }

  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }

  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },

    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },

    getDataAttributes(element) {
      if (!element) {
        return {};
      }

      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));

      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }

      return attributes;
    },

    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Class definition
   */

  class Config {
    // Getters
    static get Default() {
      return {};
    }

    static get DefaultType() {
      return {};
    }

    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }

    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);

      this._typeCheckConfig(config);

      return config;
    }

    _configAfterMerge(config) {
      return config;
    }

    _mergeConfigObj(config, element) {
      const jsonConfig = isElement(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

      return { ...this.constructor.Default,
        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
        ...(isElement(element) ? Manipulator.getDataAttributes(element) : {}),
        ...(typeof config === 'object' ? config : {})
      };
    }

    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const property of Object.keys(configTypes)) {
        const expectedTypes = configTypes[property];
        const value = config[property];
        const valueType = isElement(value) ? 'element' : toType(value);

        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const VERSION = '5.2.2';
  /**
   * Class definition
   */

  class BaseComponent extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);

      if (!element) {
        return;
      }

      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    } // Public


    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);

      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }

    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }

    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);

      this._typeCheckConfig(config);

      return config;
    } // Static


    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }

    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }

    static get VERSION() {
      return VERSION;
    }

    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }

    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }

    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }

      if (isDisabled(this)) {
        return;
      }

      const target = getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target); // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method

      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$f = 'alert';
  const DATA_KEY$a = 'bs.alert';
  const EVENT_KEY$b = `.${DATA_KEY$a}`;
  const EVENT_CLOSE = `close${EVENT_KEY$b}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';
  /**
   * Class definition
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    } // Public


    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);

      if (closeEvent.defaultPrevented) {
        return;
      }

      this._element.classList.remove(CLASS_NAME_SHOW$8);

      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);

      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    } // Private


    _destroyElement() {
      this._element.remove();

      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * Data API implementation
   */


  enableDismissTrigger(Alert, 'close');
  /**
   * jQuery
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$e = 'button';
  const DATA_KEY$9 = 'bs.button';
  const EVENT_KEY$a = `.${DATA_KEY$9}`;
  const DATA_API_KEY$6 = '.data-api';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
  /**
   * Class definition
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    } // Public


    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);

        if (config === 'toggle') {
          data[config]();
        }
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },

    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },

    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },

    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);

      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }

      return parents;
    },

    prev(element, selector) {
      let previous = element.previousElementSibling;

      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }

        previous = previous.previousElementSibling;
      }

      return [];
    },

    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;

      while (next) {
        if (next.matches(selector)) {
          return [next];
        }

        next = next.nextElementSibling;
      }

      return [];
    },

    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    }

  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/swipe.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$d = 'swipe';
  const EVENT_KEY$9 = '.bs.swipe';
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SWIPE_THRESHOLD = 40;
  const Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  const DefaultType$c = {
    endCallback: '(function|null)',
    leftCallback: '(function|null)',
    rightCallback: '(function|null)'
  };
  /**
   * Class definition
   */

  class Swipe extends Config {
    constructor(element, config) {
      super();
      this._element = element;

      if (!element || !Swipe.isSupported()) {
        return;
      }

      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);

      this._initEvents();
    } // Getters


    static get Default() {
      return Default$c;
    }

    static get DefaultType() {
      return DefaultType$c;
    }

    static get NAME() {
      return NAME$d;
    } // Public


    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    } // Private


    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }

      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }

    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }

      this._handleSwipe();

      execute(this._config.endCallback);
    }

    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }

    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);

      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }

      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;

      if (!direction) {
        return;
      }

      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }

    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));

        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
      }
    }

    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    } // Static


    static isSupported() {
      return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$c = 'carousel';
  const DATA_KEY$8 = 'bs.carousel';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const ARROW_LEFT_KEY$1 = 'ArrowLeft';
  const ARROW_RIGHT_KEY$1 = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  const EVENT_SLID = `slid${EVENT_KEY$8}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  const Default$b = {
    interval: 5000,
    keyboard: true,
    pause: 'hover',
    ride: false,
    touch: true,
    wrap: true
  };
  const DefaultType$b = {
    interval: '(number|boolean)',
    // TODO:v6 remove boolean support
    keyboard: 'boolean',
    pause: '(string|boolean)',
    ride: '(boolean|string)',
    touch: 'boolean',
    wrap: 'boolean'
  };
  /**
   * Class definition
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);

      this._addEventListeners();

      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    } // Getters


    static get Default() {
      return Default$b;
    }

    static get DefaultType() {
      return DefaultType$b;
    }

    static get NAME() {
      return NAME$c;
    } // Public


    next() {
      this._slide(ORDER_NEXT);
    }

    nextWhenVisible() {
      // FIXME TODO use `document.visibilityState`
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }

    prev() {
      this._slide(ORDER_PREV);
    }

    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }

      this._clearInterval();
    }

    cycle() {
      this._clearInterval();

      this._updateInterval();

      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }

    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }

      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }

      this.cycle();
    }

    to(index) {
      const items = this._getItems();

      if (index > items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }

      const activeIndex = this._getItemIndex(this._getActive());

      if (activeIndex === index) {
        return;
      }

      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;

      this._slide(order, items[index]);
    }

    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }

      super.dispose();
    } // Private


    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }

    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
      }

      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }

      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }

    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
      }

      const endCallBack = () => {
        if (this._config.pause !== 'hover') {
          return;
        } // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling


        this.pause();

        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }

        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };

      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }

    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      const direction = KEY_TO_DIRECTION[event.key];

      if (direction) {
        event.preventDefault();

        this._slide(this._directionToOrder(direction));
      }
    }

    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }

    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }

      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute('aria-current');
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);

      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute('aria-current', 'true');
      }
    }

    _updateInterval() {
      const element = this._activeElement || this._getActive();

      if (!element) {
        return;
      }

      const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }

    _slide(order, element = null) {
      if (this._isSliding) {
        return;
      }

      const activeElement = this._getActive();

      const isNext = order === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);

      if (nextElement === activeElement) {
        return;
      }

      const nextElementIndex = this._getItemIndex(nextElement);

      const triggerEvent = eventName => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };

      const slideEvent = triggerEvent(EVENT_SLIDE);

      if (slideEvent.defaultPrevented) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        // todo: change tests that use empty divs to avoid this check
        return;
      }

      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;

      this._setActiveIndicatorElement(nextElementIndex);

      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);

      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };

      this._queueCallback(completeCallBack, activeElement, this._isAnimated());

      if (isCycling) {
        this.cycle();
      }
    }

    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }

    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }

    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }

    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }

    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }

      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }

    _orderToDirection(order) {
      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }

      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Carousel.getOrCreateInstance(this, config);

        if (typeof config === 'number') {
          data.to(config);
          return;
        }

        if (typeof config === 'string') {
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
    const target = getElementFromSelector(this);

    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }

    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute('data-bs-slide-to');

    if (slideIndex) {
      carousel.to(slideIndex);

      carousel._maybeEnableCycle();

      return;
    }

    if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
      carousel.next();

      carousel._maybeEnableCycle();

      return;
    }

    carousel.prev();

    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);

    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$b = 'collapse';
  const DATA_KEY$7 = 'bs.collapse';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$4 = '.data-api';
  const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  const Default$a = {
    parent: null,
    toggle: true
  };
  const DefaultType$a = {
    parent: '(null|element)',
    toggle: 'boolean'
  };
  /**
   * Class definition
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);

      for (const elem of toggleList) {
        const selector = getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);

        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }

      this._initializeChildren();

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    static get Default() {
      return Default$a;
    }

    static get DefaultType() {
      return DefaultType$a;
    }

    static get NAME() {
      return NAME$b;
    } // Public


    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }

      let activeChildren = []; // find active children

      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }

      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);

      if (startEvent.defaultPrevented) {
        return;
      }

      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }

      const dimension = this._getDimension();

      this._element.classList.remove(CLASS_NAME_COLLAPSE);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.style[dimension] = 0;

      this._addAriaAndCollapsedClass(this._triggerArray, true);

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };

      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;

      this._queueCallback(complete, this._element, true);

      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }

    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }

      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);

      if (startEvent.defaultPrevented) {
        return;
      }

      const dimension = this._getDimension();

      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);

      this._element.classList.add(CLASS_NAME_COLLAPSING);

      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);

      for (const trigger of this._triggerArray) {
        const element = getElementFromSelector(trigger);

        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }

      this._isTransitioning = true;

      const complete = () => {
        this._isTransitioning = false;

        this._element.classList.remove(CLASS_NAME_COLLAPSING);

        this._element.classList.add(CLASS_NAME_COLLAPSE);

        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };

      this._element.style[dimension] = '';

      this._queueCallback(complete, this._element, true);
    }

    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    } // Private


    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle); // Coerce string values

      config.parent = getElement(config.parent);
      return config;
    }

    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }

    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }

      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);

      for (const element of children) {
        const selected = getElementFromSelector(element);

        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }

    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent); // remove children if greater depth

      return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
    }

    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }

      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute('aria-expanded', isOpen);
      }
    } // Static


    static jQueryInterface(config) {
      const _config = {};

      if (typeof config === 'string' && /show|hide/.test(config)) {
        _config.toggle = false;
      }

      return this.each(function () {
        const data = Collapse.getOrCreateInstance(this, _config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config]();
        }
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }

    const selector = getSelectorFromElement(this);
    const selectorElements = SelectorEngine.find(selector);

    for (const element of selectorElements) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Collapse);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$a = 'dropdown';
  const DATA_KEY$6 = 'bs.dropdown';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const TAB_KEY$1 = 'Tab';
  const ARROW_UP_KEY$1 = 'ArrowUp';
  const ARROW_DOWN_KEY$1 = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

  const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
  const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR = '.navbar';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const PLACEMENT_TOPCENTER = 'top';
  const PLACEMENT_BOTTOMCENTER = 'bottom';
  const Default$9 = {
    autoClose: true,
    boundary: 'clippingParents',
    display: 'dynamic',
    offset: [0, 2],
    popperConfig: null,
    reference: 'toggle'
  };
  const DefaultType$9 = {
    autoClose: '(boolean|string)',
    boundary: '(string|element)',
    display: 'string',
    offset: '(array|string|function)',
    popperConfig: '(null|object|function)',
    reference: '(string|element|object)'
  };
  /**
   * Class definition
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode; // dropdown wrapper
      // todo: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.2/forms/input-group/

      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    } // Getters


    static get Default() {
      return Default$9;
    }

    static get DefaultType() {
      return DefaultType$9;
    }

    static get NAME() {
      return NAME$a;
    } // Public


    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }

    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);

      if (showEvent.defaultPrevented) {
        return;
      }

      this._createPopper(); // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      this._menu.classList.add(CLASS_NAME_SHOW$6);

      this._element.classList.add(CLASS_NAME_SHOW$6);

      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }

    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }

      const relatedTarget = {
        relatedTarget: this._element
      };

      this._completeHide(relatedTarget);
    }

    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }

      super.dispose();
    }

    update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper) {
        this._popper.update();
      }
    } // Private


    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);

      if (hideEvent.defaultPrevented) {
        return;
      } // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support


      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }

      if (this._popper) {
        this._popper.destroy();
      }

      this._menu.classList.remove(CLASS_NAME_SHOW$6);

      this._element.classList.remove(CLASS_NAME_SHOW$6);

      this._element.setAttribute('aria-expanded', 'false');

      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }

    _getConfig(config) {
      config = super._getConfig(config);

      if (typeof config.reference === 'object' && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }

      return config;
    }

    _createPopper() {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
      }

      let referenceElement = this._element;

      if (this._config.reference === 'parent') {
        referenceElement = this._parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }

      const popperConfig = this._getPopperConfig();

      this._popper = Popper__namespace.createPopper(referenceElement, this._menu, popperConfig);
    }

    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }

    _getPlacement() {
      const parentDropdown = this._parent;

      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }

      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }

      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }

      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      } // We need to trim the value because custom properties can also include spaces


      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';

      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }

      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }

    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      }; // Disable Popper if we have a static display or Dropdown is in Navbar

      if (this._inNavbar || this._config.display === 'static') {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // todo:v6 remove

        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }

      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));

      if (!items.length) {
        return;
      } // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY


      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
        return;
      }

      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);

      for (const toggle of openToggles) {
        const context = Dropdown.getInstance(toggle);

        if (!context || context._config.autoClose === false) {
          continue;
        }

        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);

        if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
          continue;
        } // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu


        if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }

        const relatedTarget = {
          relatedTarget: context._element
        };

        if (event.type === 'click') {
          relatedTarget.clickEvent = event;
        }

        context._completeHide(relatedTarget);
      }
    }

    static dataApiKeydownHandler(event) {
      // If not an UP | DOWN | ESCAPE key => not a dropdown command
      // If input/textarea && if key is other than ESCAPE => not a dropdown command
      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);

      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }

      if (isInput && !isEscapeEvent) {
        return;
      }

      event.preventDefault(); // todo: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.2/forms/input-group/

      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = Dropdown.getOrCreateInstance(getToggleButton);

      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();

        instance._selectMenuItem(event);

        return;
      }

      if (instance._isShown()) {
        // else is escape and we check if it is shown
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';
  const PROPERTY_PADDING = 'padding-right';
  const PROPERTY_MARGIN = 'margin-right';
  /**
   * Class definition
   */

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    } // Public


    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }

    hide() {
      const width = this.getWidth();

      this._disableOverFlow(); // give padding to element to balance the hidden scrollbar width


      this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width); // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth


      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);

      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
    }

    reset() {
      this._resetElementAttributes(this._element, 'overflow');

      this._resetElementAttributes(this._element, PROPERTY_PADDING);

      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);

      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }

    isOverflowing() {
      return this.getWidth() > 0;
    } // Private


    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');

      this._element.style.overflow = 'hidden';
    }

    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();

      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }

        this._saveInitialAttribute(element, styleProperty);

        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);

      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }

    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProperty); // We only want to remove the property if the value is `null`; the value can also be zero

        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }

        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };

      this._applyManipulationCallback(selector, manipulationCallBack);
    }

    _applyManipulationCallback(selector, callBack) {
      if (isElement(selector)) {
        callBack(selector);
        return;
      }

      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$9 = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$5 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  const Default$8 = {
    className: 'modal-backdrop',
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: 'body' // give the choice to place backdrop under different elements

  };
  const DefaultType$8 = {
    className: 'string',
    clickCallback: '(function|null)',
    isAnimated: 'boolean',
    isVisible: 'boolean',
    rootElement: '(element|string)'
  };
  /**
   * Class definition
   */

  class Backdrop extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    } // Getters


    static get Default() {
      return Default$8;
    }

    static get DefaultType() {
      return DefaultType$8;
    }

    static get NAME() {
      return NAME$9;
    } // Public


    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._append();

      const element = this._getElement();

      if (this._config.isAnimated) {
        reflow(element);
      }

      element.classList.add(CLASS_NAME_SHOW$5);

      this._emulateAnimation(() => {
        execute(callback);
      });
    }

    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }

      this._getElement().classList.remove(CLASS_NAME_SHOW$5);

      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }

    dispose() {
      if (!this._isAppended) {
        return;
      }

      EventHandler.off(this._element, EVENT_MOUSEDOWN);

      this._element.remove();

      this._isAppended = false;
    } // Private


    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;

        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }

        this._element = backdrop;
      }

      return this._element;
    }

    _configAfterMerge(config) {
      // use getElement() with the default "body" to get a fresh Element on each instantiation
      config.rootElement = getElement(config.rootElement);
      return config;
    }

    _append() {
      if (this._isAppended) {
        return;
      }

      const element = this._getElement();

      this._config.rootElement.append(element);

      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }

    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$8 = 'focustrap';
  const DATA_KEY$5 = 'bs.focustrap';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';
  const Default$7 = {
    autofocus: true,
    trapElement: null // The element to trap focus inside of

  };
  const DefaultType$7 = {
    autofocus: 'boolean',
    trapElement: 'element'
  };
  /**
   * Class definition
   */

  class FocusTrap extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    } // Getters


    static get Default() {
      return Default$7;
    }

    static get DefaultType() {
      return DefaultType$7;
    }

    static get NAME() {
      return NAME$8;
    } // Public


    activate() {
      if (this._isActive) {
        return;
      }

      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }

      EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop

      EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }

    deactivate() {
      if (!this._isActive) {
        return;
      }

      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    } // Private


    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;

      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }

      const elements = SelectorEngine.focusableChildren(trapElement);

      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }

    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }

      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$7 = 'modal';
  const DATA_KEY$4 = 'bs.modal';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const DATA_API_KEY$2 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  const Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  const DefaultType$6 = {
    backdrop: '(boolean|string)',
    focus: 'boolean',
    keyboard: 'boolean'
  };
  /**
   * Class definition
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$6;
    }

    static get DefaultType() {
      return DefaultType$6;
    }

    static get NAME() {
      return NAME$7;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;
      this._isTransitioning = true;

      this._scrollBar.hide();

      document.body.classList.add(CLASS_NAME_OPEN);

      this._adjustDialog();

      this._backdrop.show(() => this._showElement(relatedTarget));
    }

    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._isShown = false;
      this._isTransitioning = true;

      this._focustrap.deactivate();

      this._element.classList.remove(CLASS_NAME_SHOW$4);

      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }

    dispose() {
      for (const htmlElement of [window, this._dialog]) {
        EventHandler.off(htmlElement, EVENT_KEY$4);
      }

      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    }

    handleUpdate() {
      this._adjustDialog();
    } // Private


    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _showElement(relatedTarget) {
      // try to append dynamic modal
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);

      if (modalBody) {
        modalBody.scrollTop = 0;
      }

      reflow(this._element);

      this._element.classList.add(CLASS_NAME_SHOW$4);

      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }

        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };

      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }

    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }

        if (this._config.keyboard) {
          event.preventDefault();
          this.hide();
          return;
        }

        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
        // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }

          if (this._config.backdrop === 'static') {
            this._triggerBackdropTransition();

            return;
          }

          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }

    _hideModal() {
      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._element.removeAttribute('role');

      this._isTransitioning = false;

      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);

        this._resetAdjustments();

        this._scrollBar.reset();

        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }

    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }

    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY; // return if the following background transition hasn't yet completed

      if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }

      if (!isModalOverflowing) {
        this._element.style.overflowY = 'hidden';
      }

      this._element.classList.add(CLASS_NAME_STATIC);

      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);

        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);

      this._element.focus();
    }
    /**
     * The following methods are used to handle overflowing modals
     */


    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      const scrollbarWidth = this._scrollBar.getWidth();

      const isBodyOverflowing = scrollbarWidth > 0;

      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? 'paddingLeft' : 'paddingRight';
        this._element.style[property] = `${scrollbarWidth}px`;
      }

      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? 'paddingRight' : 'paddingLeft';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }

    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    } // Static


    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](relatedTarget);
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    EventHandler.one(target, EVENT_SHOW$4, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    }); // avoid conflict when clicking modal toggler while another one is open

    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);

    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }

    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  /**
   * jQuery
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$6 = 'offcanvas';
  const DATA_KEY$3 = 'bs.offcanvas';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const DATA_API_KEY$1 = '.data-api';
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const ESCAPE_KEY = 'Escape';
  const CLASS_NAME_SHOW$3 = 'show';
  const CLASS_NAME_SHOWING$1 = 'showing';
  const CLASS_NAME_HIDING = 'hiding';
  const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    scroll: 'boolean'
  };
  /**
   * Class definition
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();

      this._addEventListeners();
    } // Getters


    static get Default() {
      return Default$5;
    }

    static get DefaultType() {
      return DefaultType$5;
    }

    static get NAME() {
      return NAME$6;
    } // Public


    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }

    show(relatedTarget) {
      if (this._isShown) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });

      if (showEvent.defaultPrevented) {
        return;
      }

      this._isShown = true;

      this._backdrop.show();

      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }

      this._element.setAttribute('aria-modal', true);

      this._element.setAttribute('role', 'dialog');

      this._element.classList.add(CLASS_NAME_SHOWING$1);

      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }

        this._element.classList.add(CLASS_NAME_SHOW$3);

        this._element.classList.remove(CLASS_NAME_SHOWING$1);

        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };

      this._queueCallback(completeCallBack, this._element, true);
    }

    hide() {
      if (!this._isShown) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);

      if (hideEvent.defaultPrevented) {
        return;
      }

      this._focustrap.deactivate();

      this._element.blur();

      this._isShown = false;

      this._element.classList.add(CLASS_NAME_HIDING);

      this._backdrop.hide();

      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);

        this._element.removeAttribute('aria-modal');

        this._element.removeAttribute('role');

        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }

        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };

      this._queueCallback(completeCallback, this._element, true);
    }

    dispose() {
      this._backdrop.dispose();

      this._focustrap.deactivate();

      super.dispose();
    } // Private


    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === 'static') {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }

        this.hide();
      }; // 'static' option will be translated to true, and booleans will keep their value


      const isVisible = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible ? clickCallback : null
      });
    }

    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }

    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }

        if (!this._config.keyboard) {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }

        this.hide();
      });
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config](this);
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
    const target = getElementFromSelector(this);

    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    }); // avoid conflict when clicking a toggler of an offcanvas, while another is open

    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);

    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }

    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
      if (getComputedStyle(element).position !== 'fixed') {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);
  /**
   * jQuery
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  /**
   * A pattern that recognizes a commonly useful subset of URLs that are safe.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/12.2.x/packages/core/src/sanitization/url_sanitizer.ts
   */

  const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;

  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();

    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
      }

      return true;
    } // Check if a regular expression validates the attribute.


    return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
  };

  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }

    if (sanitizeFunction && typeof sanitizeFunction === 'function') {
      return sanitizeFunction(unsafeHtml);
    }

    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));

    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();

      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }

      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);

      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): util/template-factory.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$5 = 'TemplateFactory';
  const Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: '',
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: '<div></div>'
  };
  const DefaultType$4 = {
    allowList: 'object',
    content: 'object',
    extraClass: '(string|function)',
    html: 'boolean',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    template: 'string'
  };
  const DefaultContentType = {
    entry: '(string|element|function|null)',
    selector: '(string|element)'
  };
  /**
   * Class definition
   */

  class TemplateFactory extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    } // Getters


    static get Default() {
      return Default$4;
    }

    static get DefaultType() {
      return DefaultType$4;
    }

    static get NAME() {
      return NAME$5;
    } // Public


    getContent() {
      return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
    }

    hasContent() {
      return this.getContent().length > 0;
    }

    changeContent(content) {
      this._checkContent(content);

      this._config.content = { ...this._config.content,
        ...content
      };
      return this;
    }

    toHtml() {
      const templateWrapper = document.createElement('div');
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);

      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }

      const template = templateWrapper.children[0];

      const extraClass = this._resolvePossibleFunction(this._config.extraClass);

      if (extraClass) {
        template.classList.add(...extraClass.split(' '));
      }

      return template;
    } // Private


    _typeCheckConfig(config) {
      super._typeCheckConfig(config);

      this._checkContent(config.content);
    }

    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }

    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);

      if (!templateElement) {
        return;
      }

      content = this._resolvePossibleFunction(content);

      if (!content) {
        templateElement.remove();
        return;
      }

      if (isElement(content)) {
        this._putElementInTemplate(getElement(content), templateElement);

        return;
      }

      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }

      templateElement.textContent = content;
    }

    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }

    _resolvePossibleFunction(arg) {
      return typeof arg === 'function' ? arg(this) : arg;
    }

    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = '';
        templateElement.append(element);
        return;
      }

      templateElement.textContent = element.textContent;
    }

  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$4 = 'tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$2 = 'show';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.bs.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  const EVENT_HIDE$2 = 'hide';
  const EVENT_HIDDEN$2 = 'hidden';
  const EVENT_SHOW$2 = 'show';
  const EVENT_SHOWN$2 = 'shown';
  const EVENT_INSERTED = 'inserted';
  const EVENT_CLICK$1 = 'click';
  const EVENT_FOCUSIN$1 = 'focusin';
  const EVENT_FOCUSOUT$1 = 'focusout';
  const EVENT_MOUSEENTER = 'mouseenter';
  const EVENT_MOUSELEAVE = 'mouseleave';
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: 'clippingParents',
    container: false,
    customClass: '',
    delay: 0,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    html: false,
    offset: [0, 0],
    placement: 'top',
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    title: '',
    trigger: 'hover focus'
  };
  const DefaultType$3 = {
    allowList: 'object',
    animation: 'boolean',
    boundary: '(string|element)',
    container: '(string|element|boolean)',
    customClass: '(string|function)',
    delay: '(number|object)',
    fallbackPlacements: 'array',
    html: 'boolean',
    offset: '(array|string|function)',
    placement: '(string|function)',
    popperConfig: '(null|object|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    selector: '(string|boolean)',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string'
  };
  /**
   * Class definition
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper__namespace === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
      }

      super(element, config); // Private

      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null; // Protected

      this.tip = null;

      this._setListeners();

      if (!this._config.selector) {
        this._fixTitle();
      }
    } // Getters


    static get Default() {
      return Default$3;
    }

    static get DefaultType() {
      return DefaultType$3;
    }

    static get NAME() {
      return NAME$4;
    } // Public


    enable() {
      this._isEnabled = true;
    }

    disable() {
      this._isEnabled = false;
    }

    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }

    toggle() {
      if (!this._isEnabled) {
        return;
      }

      this._activeTrigger.click = !this._activeTrigger.click;

      if (this._isShown()) {
        this._leave();

        return;
      }

      this._enter();
    }

    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);

      if (this.tip) {
        this.tip.remove();
      }

      if (this._element.getAttribute('data-bs-original-title')) {
        this._element.setAttribute('title', this._element.getAttribute('data-bs-original-title'));
      }

      this._disposePopper();

      super.dispose();
    }

    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }

      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }

      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);

      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);

      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      } // todo v6 remove this OR make it optional


      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }

      const tip = this._getTipElement();

      this._element.setAttribute('aria-describedby', tip.getAttribute('id'));

      const {
        container
      } = this._config;

      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }

      if (this._popper) {
        this._popper.update();
      } else {
        this._popper = this._createPopper(tip);
      }

      tip.classList.add(CLASS_NAME_SHOW$2); // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }

      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));

        if (this._isHovered === false) {
          this._leave();
        }

        this._isHovered = false;
      };

      this._queueCallback(complete, this.tip, this._isAnimated());
    }

    hide() {
      if (!this._isShown()) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));

      if (hideEvent.defaultPrevented) {
        return;
      }

      const tip = this._getTipElement();

      tip.classList.remove(CLASS_NAME_SHOW$2); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }

      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null; // it is a trick to support manual triggering

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }

        if (!this._isHovered) {
          tip.remove();
        }

        this._element.removeAttribute('aria-describedby');

        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));

        this._disposePopper();
      };

      this._queueCallback(complete, this.tip, this._isAnimated());
    }

    update() {
      if (this._popper) {
        this._popper.update();
      }
    } // Protected


    _isWithContent() {
      return Boolean(this._getTitle());
    }

    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }

      return this.tip;
    }

    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml(); // todo: remove this check on v6


      if (!tip) {
        return null;
      }

      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2); // todo: on v6 the following can be achieved with CSS only

      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute('id', tipId);

      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }

      return tip;
    }

    setContent(content) {
      this._newContent = content;

      if (this._isShown()) {
        this._disposePopper();

        this.show();
      }
    }

    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({ ...this._config,
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }

      return this._templateFactory;
    }

    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }

    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-bs-original-title');
    } // Private


    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }

    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }

    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }

    _createPopper(tip) {
      const placement = typeof this._config.placement === 'function' ? this._config.placement.call(this, tip, this._element) : this._config.placement;
      const attachment = AttachmentMap[placement.toUpperCase()];
      return Popper__namespace.createPopper(this._element, tip, this._getPopperConfig(attachment));
    }

    _getOffset() {
      const {
        offset
      } = this._config;

      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }

      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }

      return offset;
    }

    _resolvePossibleFunction(arg) {
      return typeof arg === 'function' ? arg.call(this._element) : arg;
    }

    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'preSetPlacement',
          enabled: true,
          phase: 'beforeMain',
          fn: data => {
            // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
            // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
            this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
          }
        }]
      };
      return { ...defaultBsPopperConfig,
        ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
      };
    }

    _setListeners() {
      const triggers = this._config.trigger.split(' ');

      for (const trigger of triggers) {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);

            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);

            context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;

            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);

            context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);

            context._leave();
          });
        }
      }

      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };

      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }

    _fixTitle() {
      const title = this._element.getAttribute('title');

      if (!title) {
        return;
      }

      if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
        this._element.setAttribute('aria-label', title);
      }

      this._element.setAttribute('data-bs-original-title', title); // DO NOT USE IT. Is only for backwards compatibility


      this._element.removeAttribute('title');
    }

    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }

      this._isHovered = true;

      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }

    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }

      this._isHovered = false;

      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }

    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }

    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }

    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);

      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }

      config = { ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);

      this._typeCheckConfig(config);

      return config;
    }

    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      return config;
    }

    _getDelegateConfig() {
      const config = {};

      for (const key in this._config) {
        if (this.constructor.Default[key] !== this._config[key]) {
          config[key] = this._config[key];
        }
      }

      config.selector = false;
      config.trigger = 'manual'; // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`

      return config;
    }

    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();

        this._popper = null;
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * jQuery
   */


  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$3 = 'popover';
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  const Default$2 = { ...Tooltip.Default,
    content: '',
    offset: [0, 8],
    placement: 'right',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
    trigger: 'click'
  };
  const DefaultType$2 = { ...Tooltip.DefaultType,
    content: '(null|string|element|function)'
  };
  /**
   * Class definition
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }

    static get DefaultType() {
      return DefaultType$2;
    }

    static get NAME() {
      return NAME$3;
    } // Overrides


    _isWithContent() {
      return this._getTitle() || this._getContent();
    } // Private


    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }

    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * jQuery
   */


  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$2 = 'scrollspy';
  const DATA_KEY$2 = 'bs.scrollspy';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  const EVENT_CLICK = `click${EVENT_KEY$2}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_TARGET_LINKS = '[href]';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: '0px 0px -25%',
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  const DefaultType$1 = {
    offset: '(number|null)',
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: 'string',
    smoothScroll: 'boolean',
    target: 'element',
    threshold: 'array'
  };
  /**
   * Class definition
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element, config); // this._element is the observablesContainer and config.target the menu links wrapper

      this._targetLinks = new Map();
      this._observableSections = new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh(); // initialize
    } // Getters


    static get Default() {
      return Default$1;
    }

    static get DefaultType() {
      return DefaultType$1;
    }

    static get NAME() {
      return NAME$2;
    } // Public


    refresh() {
      this._initializeTargetsAndObservables();

      this._maybeEnableSmoothScroll();

      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }

      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }

    dispose() {
      this._observer.disconnect();

      super.dispose();
    } // Private


    _configAfterMerge(config) {
      // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
      config.target = getElement(config.target) || document.body; // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only

      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;

      if (typeof config.threshold === 'string') {
        config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
      }

      return config;
    }

    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      } // unregister any previous listeners


      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
        const observableSection = this._observableSections.get(event.target.hash);

        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;

          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: 'smooth'
            });
            return;
          } // Chrome 60 doesn't support `scrollTo`


          root.scrollTop = height;
        }
      });
    }

    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver(entries => this._observerCallback(entries), options);
    } // The logic of selection


    _observerCallback(entries) {
      const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);

      const activate = entry => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;

        this._process(targetElement(entry));
      };

      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;

      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;

          this._clearActiveClass(targetElement(entry));

          continue;
        }

        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop; // if we are scrolling down, pick the bigger offsetTop

        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry); // if parent isn't scrolled, let's keep the first visible item, breaking the iteration

          if (!parentScrollTop) {
            return;
          }

          continue;
        } // if we are scrolling up, pick the smallest offsetTop


        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }

    _initializeTargetsAndObservables() {
      this._targetLinks = new Map();
      this._observableSections = new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);

      for (const anchor of targetLinks) {
        // ensure that the anchor has an id and is not disabled
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }

        const observableSection = SelectorEngine.findOne(anchor.hash, this._element); // ensure that the observableSection exists & is visible

        if (isVisible(observableSection)) {
          this._targetLinks.set(anchor.hash, anchor);

          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }

    _process(target) {
      if (this._activeTarget === target) {
        return;
      }

      this._clearActiveClass(this._config.target);

      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);

      this._activateParents(target);

      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }

    _activateParents(target) {
      // Activate dropdown parents
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }

      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }

    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);

      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'bs.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const CLASS_DROPDOWN = 'dropdown';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
  const NOT_SELECTOR_DROPDOWN_TOGGLE = ':not(.dropdown-toggle)';
  const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  const SELECTOR_OUTER = '.nav-item, .list-group-item';
  const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // todo:v6: could be only `tab`

  const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
  /**
   * Class definition
   */

  class Tab extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);

      if (!this._parent) {
        return; // todo: should Throw exception on v6
        // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
      } // Set up initial aria attributes


      this._setInitialAttributes(this._parent, this._getChildren());

      EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
    } // Getters


    static get NAME() {
      return NAME$1;
    } // Public


    show() {
      // Shows this elem and deactivate the active sibling if exists
      const innerElem = this._element;

      if (this._elemIsActive(innerElem)) {
        return;
      } // Search for active tab on same parent to deactivate it


      const active = this._getActiveElem();

      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });

      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }

      this._deactivate(active, innerElem);

      this._activate(innerElem, active);
    } // Private


    _activate(element, relatedElem) {
      if (!element) {
        return;
      }

      element.classList.add(CLASS_NAME_ACTIVE);

      this._activate(getElementFromSelector(element)); // Search and activate/show the proper section


      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }

        element.removeAttribute('tabindex');
        element.setAttribute('aria-selected', true);

        this._toggleDropDown(element, true);

        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };

      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }

    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }

      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();

      this._deactivate(getElementFromSelector(element)); // Search and deactivate the shown section too


      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }

        element.setAttribute('aria-selected', false);
        element.setAttribute('tabindex', '-1');

        this._toggleDropDown(element, false);

        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };

      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }

    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
        return;
      }

      event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page

      event.preventDefault();
      const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
      const nextActiveElement = getNextActiveElement(this._getChildren().filter(element => !isDisabled(element)), event.target, isNext, true);

      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }

    _getChildren() {
      // collection of inner elements
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }

    _getActiveElem() {
      return this._getChildren().find(child => this._elemIsActive(child)) || null;
    }

    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, 'role', 'tablist');

      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }

    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);

      const isActive = this._elemIsActive(child);

      const outerElem = this._getOuterElement(child);

      child.setAttribute('aria-selected', isActive);

      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
      }

      if (!isActive) {
        child.setAttribute('tabindex', '-1');
      }

      this._setAttributeIfNotExists(child, 'role', 'tab'); // set attributes to the related panel too


      this._setInitialAttributesOnTargetPanel(child);
    }

    _setInitialAttributesOnTargetPanel(child) {
      const target = getElementFromSelector(child);

      if (!target) {
        return;
      }

      this._setAttributeIfNotExists(target, 'role', 'tabpanel');

      if (child.id) {
        this._setAttributeIfNotExists(target, 'aria-labelledby', `#${child.id}`);
      }
    }

    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);

      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }

      const toggle = (selector, className) => {
        const element = SelectorEngine.findOne(selector, outerElem);

        if (element) {
          element.classList.toggle(className, open);
        }
      };

      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute('aria-expanded', open);
    }

    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }

    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    } // Try to get the inner element (usually the .nav-link)


    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    } // Try to get the outer element (usually the .nav-item)


    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);

        if (typeof config !== 'string') {
          return;
        }

        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }

        data[config]();
      });
    }

  }
  /**
   * Data API implementation
   */


  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }

    if (isDisabled(this)) {
      return;
    }

    Tab.getOrCreateInstance(this).show();
  });
  /**
   * Initialize on focus
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * Constants
   */

  const NAME = 'toast';
  const DATA_KEY = 'bs.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility

  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };
  /**
   * Class definition
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;

      this._setListeners();
    } // Getters


    static get Default() {
      return Default;
    }

    static get DefaultType() {
      return DefaultType;
    }

    static get NAME() {
      return NAME;
    } // Public


    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);

      if (showEvent.defaultPrevented) {
        return;
      }

      this._clearTimeout();

      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }

      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);

        EventHandler.trigger(this._element, EVENT_SHOWN);

        this._maybeScheduleHide();
      };

      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated


      reflow(this._element);

      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    hide() {
      if (!this.isShown()) {
        return;
      }

      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);

      if (hideEvent.defaultPrevented) {
        return;
      }

      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated


        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);

        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };

      this._element.classList.add(CLASS_NAME_SHOWING);

      this._queueCallback(complete, this._element, this._config.animation);
    }

    dispose() {
      this._clearTimeout();

      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }

      super.dispose();
    }

    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    } // Private


    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }

      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }

      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }

    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          {
            this._hasMouseInteraction = isInteracting;
            break;
          }

        case 'focusin':
        case 'focusout':
          {
            this._hasKeyboardInteraction = isInteracting;
            break;
          }
      }

      if (isInteracting) {
        this._clearTimeout();

        return;
      }

      const nextElement = event.relatedTarget;

      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }

      this._maybeScheduleHide();
    }

    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }

    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    } // Static


    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }

          data[config](this);
        }
      });
    }

  }
  /**
   * Data API implementation
   */


  enableDismissTrigger(Toast);
  /**
   * jQuery
   */

  defineJQueryPlugin(Toast);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v5.2.2): index.umd.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */
  const index_umd = {
    Alert,
    Button,
    Carousel,
    Collapse,
    Dropdown,
    Modal,
    Offcanvas,
    Popover,
    ScrollSpy,
    Tab,
    Toast,
    Tooltip
  };

  return index_umd;

}));
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//







;
