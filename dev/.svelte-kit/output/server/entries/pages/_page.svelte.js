import { F as ATTACHMENT_KEY, G as current_component, x as setContext, D as getContext, I as fallback, A as slot, J as bind_props, y as pop, w as push, K as spread_attributes, M as clsx$1, N as ensure_array_like, O as attr_class, E as escape_html, P as stringify, Q as hasContext, R as derived$1, S as run, T as getAllContexts, U as props_id, V as attr_style, W as copy_payload, X as assign_payload, Y as spread_props, Z as element, _ as store_get, $ as unsubscribe_stores, a0 as attr } from "../../chunks/index2.js";
import { r as readable, d as derived, g as get$2, w as writable } from "../../chunks/index.js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import parse from "style-to-object";
import { o as on } from "../../chunks/events.js";
import { tabbable, focusable, isFocusable, isTabbable } from "tabbable";
import { computePosition, offset, shift, flip, size, arrow, hide, limitShift } from "@floating-ui/dom";
import { tv } from "tailwind-variants";
import { noop as noop$1, notifyManager, QueryObserver, QueryClient } from "@tanstack/query-core";
import { z } from "zod";
function createAttachmentKey() {
  return Symbol(ATTACHMENT_KEY);
}
function lifecycle_function_unavailable(name) {
  const error = new Error(`lifecycle_function_unavailable
\`${name}(...)\` is not available on the server
https://svelte.dev/e/lifecycle_function_unavailable`);
  error.name = "Svelte error";
  throw error;
}
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function mount() {
  lifecycle_function_unavailable("mount");
}
function unmount() {
  lifecycle_function_unavailable("unmount");
}
async function tick() {
}
const _contextKey = "$$_queryClient";
const getQueryClientContext = () => {
  const client = getContext(_contextKey);
  if (!client) {
    throw new Error("No QueryClient was found in Svelte context. Did you forget to wrap your component with QueryClientProvider?");
  }
  return client;
};
const setQueryClientContext = (client) => {
  setContext(_contextKey, client);
};
const _isRestoringContextKey = "$$_isRestoring";
const getIsRestoringContext = () => {
  try {
    const isRestoring = getContext(_isRestoringContextKey);
    return isRestoring ? isRestoring : readable(false);
  } catch (error) {
    return readable(false);
  }
};
function useIsRestoring() {
  return getIsRestoringContext();
}
function useQueryClient(queryClient) {
  return getQueryClientContext();
}
function isSvelteStore(obj) {
  return "subscribe" in obj && typeof obj.subscribe === "function";
}
function createBaseQuery(options, Observer, queryClient) {
  const client = useQueryClient();
  const isRestoring = useIsRestoring();
  const optionsStore = isSvelteStore(options) ? options : readable(options);
  const defaultedOptionsStore = derived([optionsStore, isRestoring], ([$optionsStore, $isRestoring]) => {
    const defaultedOptions = client.defaultQueryOptions($optionsStore);
    defaultedOptions._optimisticResults = $isRestoring ? "isRestoring" : "optimistic";
    return defaultedOptions;
  });
  const observer = new Observer(client, get$2(defaultedOptionsStore));
  defaultedOptionsStore.subscribe(($defaultedOptions) => {
    observer.setOptions($defaultedOptions);
  });
  const result = derived(isRestoring, ($isRestoring, set) => {
    const unsubscribe = $isRestoring ? noop$1 : observer.subscribe(notifyManager.batchCalls(set));
    observer.updateResult();
    return unsubscribe;
  });
  const { subscribe } = derived([result, defaultedOptionsStore], ([$result, $defaultedOptionsStore]) => {
    $result = observer.getOptimisticResult($defaultedOptionsStore);
    return !$defaultedOptionsStore.notifyOnChangeProps ? observer.trackResult($result) : $result;
  });
  return { subscribe };
}
function createQuery(options, queryClient) {
  return createBaseQuery(options, QueryObserver);
}
function QueryClientProvider($$payload, $$props) {
  push();
  let client = fallback($$props["client"], () => new QueryClient(), true);
  setQueryClientContext(client);
  onDestroy(() => {
    client.unmount();
  });
  $$payload.out.push(`<!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!---->`);
  bind_props($$props, { client });
  pop();
}
const SCROLL_RESTORE_VIEWS = ["home", "events-list", "brands-detail", "venues-detail"];
const MAX_NAVIGATION_ENTRIES = 20;
const initialState$1 = {
  webApp: null,
  isLoading: true,
  error: "",
  currentView: "home",
  selectedEventId: void 0,
  selectedVenueId: void 0,
  selectedBrandId: void 0,
  selectedEvent: null,
  selectedVenue: null,
  navigationHistory: [],
  backgroundColor: "#f9fafb",
  textColor: "#1f2937",
  bookingState: null
};
const baseAppStore = writable(initialState$1);
const appStore = derived(
  baseAppStore,
  ($base) => ({
    ...$base,
    canGoBack: $base.navigationHistory.length > 0
  })
);
const appActions = {
  setWebApp: (app) => {
    baseAppStore.update((state) => ({ ...state, webApp: app }));
  },
  setLoading: (loading) => {
    baseAppStore.update((state) => ({ ...state, isLoading: loading }));
  },
  setError: (err) => {
    baseAppStore.update((state) => ({ ...state, error: err }));
  },
  navigate: (view) => {
    baseAppStore.update((state) => {
      let newHistory = [...state.navigationHistory];
      newHistory.push({
        view: state.currentView,
        scrollPosition: window.scrollY || 0
      });
      if (newHistory.length > MAX_NAVIGATION_ENTRIES) {
        newHistory.shift();
      }
      return {
        ...state,
        navigationHistory: newHistory,
        currentView: view
      };
    });
  },
  goBack: () => {
    baseAppStore.update((state) => {
      if (state.navigationHistory.length > 0) {
        const newHistory = [...state.navigationHistory];
        const lastEntry = newHistory.pop();
        if (lastEntry) {
          if (SCROLL_RESTORE_VIEWS.includes(lastEntry.view)) {
            setTimeout(() => {
              window.scrollTo(0, lastEntry.scrollPosition);
            }, 0);
          }
          return {
            ...state,
            navigationHistory: newHistory,
            currentView: lastEntry.view
          };
        }
      }
      return state;
    });
  },
  clearHistory: () => {
    baseAppStore.update((state) => ({ ...state, navigationHistory: [] }));
  },
  setSelectedEventId: (eventId) => {
    baseAppStore.update((state) => ({
      ...state,
      selectedEventId: eventId
    }));
  },
  setSelectedVenueId: (venueId) => {
    baseAppStore.update((state) => ({
      ...state,
      selectedVenueId: venueId
    }));
  },
  setSelectedBrandId: (brandId) => {
    baseAppStore.update((state) => ({
      ...state,
      selectedBrandId: brandId
    }));
  },
  setSelectedEvent: (event, venue) => {
    baseAppStore.update((state) => ({
      ...state,
      selectedEvent: event,
      selectedEventId: event?.eventid.toString(),
      selectedVenue: venue || null
    }));
  },
  setThemeFromWebApp: () => {
    baseAppStore.update((state) => {
      if (state.webApp?.themeParams) {
        return {
          ...state,
          backgroundColor: state.webApp.themeParams.header_bg_color || initialState$1.backgroundColor,
          textColor: state.webApp.themeParams.text_color || initialState$1.textColor
        };
      }
      return state;
    });
  },
  startBooking: (eventId) => {
    baseAppStore.update((state) => ({
      ...state,
      bookingState: {
        eventId,
        selectedBrands: {},
        guests: 1,
        phone: "",
        comment: "",
        paymentMethod: "",
        currentStep: 1
      }
    }));
  },
  updateBookingState: (updates) => {
    baseAppStore.update((state) => ({
      ...state,
      bookingState: state.bookingState ? { ...state.bookingState, ...updates } : state.bookingState
    }));
  },
  clearBooking: () => {
    baseAppStore.update((state) => ({ ...state, bookingState: null }));
  },
  handleDeepLink: (startParam) => {
    baseAppStore.update((state) => {
      let updates = { navigationHistory: [] };
      if (startParam) {
        const [type, id] = startParam.split("_");
        if (type === "event" && id) {
          updates.selectedEventId = id;
          updates.currentView = "events-detail";
        } else if (type === "venue" && id) {
          updates.selectedVenueId = id;
          updates.currentView = "venues-detail";
        } else if (type === "brand" && id) {
          updates.selectedBrandId = id;
          updates.currentView = "brands-detail";
        }
      }
      return { ...state, ...updates };
    });
  },
  reset: () => {
    baseAppStore.set(initialState$1);
  }
};
const initialState = {
  userData: null,
  userError: null,
  userDataLoaded: false,
  userSelectedCity: null,
  userSelectedLanguage: null,
  initData: "",
  selectedLanguage: "en",
  selectedCity: null,
  isUserDataLoaded: false,
  userInfo: null
};
const baseUserStore = writable(initialState);
const userStore = derived(
  [baseUserStore, appStore],
  ([$base, $app]) => {
    const selectedLanguage = $base.userSelectedLanguage || ($base.userData?.success && $base.userData.user ? $base.userData.user.language : null) || "en";
    const selectedCity = $base.userSelectedCity || ($base.userData?.success && $base.userData.user ? $base.userData.user.cityid === 0 ? null : $base.userData.user.cityid.toString() : null);
    const isUserDataLoaded = $base.userDataLoaded;
    const userInfo = $app.webApp?.initDataUnsafe?.user || null;
    return {
      ...$base,
      selectedLanguage,
      selectedCity,
      isUserDataLoaded,
      userInfo
    };
  }
);
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Skeleton($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "skeleton",
      class: clsx$1(cn("bg-accent animate-pulse rounded-md", className)),
      ...restProps
    }
  )}></div>`);
  bind_props($$props, { ref });
  pop();
}
function Loading($$payload, $$props) {
  let {
    variant,
    count = 3,
    size: size2 = "md",
    message = "Loading...",
    showMessage = true
  } = $$props;
  const textSizeClasses = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  if (variant === "list") {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(Array(count));
    $$payload.out.push(`<div class="space-y-3"><!--[-->`);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      each_array[index];
      $$payload.out.push(`<div class="flex gap-3 p-4">`);
      Skeleton($$payload, { class: "w-16 h-16 rounded" });
      $$payload.out.push(`<!----> <div class="flex-1 space-y-2">`);
      Skeleton($$payload, { class: "h-4 w-3/4" });
      $$payload.out.push(`<!----> `);
      Skeleton($$payload, { class: "h-3 w-1/2" });
      $$payload.out.push(`<!----></div></div>`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (variant === "detail") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="p-4 space-y-4">`);
      Skeleton($$payload, { class: "w-full h-48 rounded" });
      $$payload.out.push(`<!----> `);
      Skeleton($$payload, { class: "h-6 w-3/4" });
      $$payload.out.push(`<!----> `);
      Skeleton($$payload, { class: "h-4 w-full" });
      $$payload.out.push(`<!----> `);
      Skeleton($$payload, { class: "h-4 w-2/3" });
      $$payload.out.push(`<!----></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (variant === "booking") {
        $$payload.out.push("<!--[-->");
        const each_array_1 = ensure_array_like(Array(4));
        $$payload.out.push(`<div class="p-4 space-y-4">`);
        Skeleton($$payload, { class: "h-4 w-1/3" });
        $$payload.out.push(`<!----> <div class="grid grid-cols-2 gap-3"><!--[-->`);
        for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
          each_array_1[index];
          Skeleton($$payload, { class: "h-16 w-full rounded" });
        }
        $$payload.out.push(`<!--]--></div> `);
        Skeleton($$payload, { class: "h-10 w-full" });
        $$payload.out.push(`<!----> `);
        Skeleton($$payload, { class: "h-10 w-full" });
        $$payload.out.push(`<!----></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<div class="flex items-center justify-center gap-4 p-8">`);
        if (showMessage) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p${attr_class(`text-muted-foreground text-center font-medium ${stringify(textSizeClasses[size2])}`)}>${escape_html(message)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isObject(value) {
  return value !== null && typeof value === "object";
}
const CLASS_VALUE_PRIMITIVE_TYPES = ["string", "number", "bigint", "boolean"];
function isClassValue(value) {
  if (value === null || value === void 0)
    return true;
  if (CLASS_VALUE_PRIMITIVE_TYPES.includes(typeof value))
    return true;
  if (Array.isArray(value))
    return value.every((item) => isClassValue(item));
  if (typeof value === "object") {
    if (Object.getPrototypeOf(value) !== Object.prototype)
      return false;
    return true;
  }
  return false;
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function isBox(value) {
  return isObject(value) && BoxSymbol in value;
}
function isWritableBox(value) {
  return box.isBox(value) && isWritableSymbol in value;
}
function box(initialValue) {
  let current = initialValue;
  return {
    [BoxSymbol]: true,
    [isWritableSymbol]: true,
    get current() {
      return current;
    },
    set current(v) {
      current = v;
    }
  };
}
function boxWith(getter, setter) {
  const derived2 = getter();
  if (setter) {
    return {
      [BoxSymbol]: true,
      [isWritableSymbol]: true,
      get current() {
        return derived2;
      },
      set current(v) {
        setter(v);
      }
    };
  }
  return {
    [BoxSymbol]: true,
    get current() {
      return getter();
    }
  };
}
function boxFrom(value) {
  if (box.isBox(value)) return value;
  if (isFunction$1(value)) return box.with(value);
  return box(value);
}
function boxFlatten(boxes) {
  return Object.entries(boxes).reduce(
    (acc, [key, b]) => {
      if (!box.isBox(b)) {
        return Object.assign(acc, { [key]: b });
      }
      if (box.isWritableBox(b)) {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          set(v) {
            b.current = v;
          }
        });
      } else {
        Object.defineProperty(acc, key, {
          get() {
            return b.current;
          }
        });
      }
      return acc;
    },
    {}
  );
}
function toReadonlyBox(b) {
  if (!box.isWritableBox(b)) return b;
  return {
    [BoxSymbol]: true,
    get current() {
      return b.current;
    }
  };
}
box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
function composeHandlers(...handlers) {
  return function(e) {
    for (const handler of handlers) {
      if (!handler)
        continue;
      if (e.defaultPrevented)
        return;
      if (typeof handler === "function") {
        handler.call(this, e);
      } else {
        handler.current?.call(this, e);
      }
    }
  };
}
const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char))
    return void 0;
  return char !== char.toLowerCase();
}
function splitByCase(str) {
  const parts = [];
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = STR_SPLITTERS.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function pascalCase(str) {
  if (!str)
    return "";
  return splitByCase(str).map((p) => upperFirst(p)).join("");
}
function camelCase(str) {
  return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
  return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
  if (!css)
    return {};
  const styleObj = {};
  function iterator(name, value) {
    if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
      styleObj[pascalCase(name)] = value;
      return;
    }
    if (name.startsWith("--")) {
      styleObj[name] = value;
      return;
    }
    styleObj[camelCase(name)] = value;
  }
  parse(css, iterator);
  return styleObj;
}
function executeCallbacks(...callbacks) {
  return (...args) => {
    for (const callback of callbacks) {
      if (typeof callback === "function") {
        callback(...args);
      }
    }
  };
}
function createParser(matcher, replacer) {
  const regex = RegExp(matcher, "g");
  return (str) => {
    if (typeof str !== "string") {
      throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
    }
    if (!str.match(regex))
      return str;
    return str.replace(regex, replacer);
  };
}
const camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
  if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) {
    throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
  }
  return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
  return styleToCSS(style).replace("\n", " ");
}
const srOnlyStyles = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
  transform: "translateX(-100%)"
};
const srOnlyStylesString = styleToString(srOnlyStyles);
const EVENT_LIST = [
  "onabort",
  "onanimationcancel",
  "onanimationend",
  "onanimationiteration",
  "onanimationstart",
  "onauxclick",
  "onbeforeinput",
  "onbeforetoggle",
  "onblur",
  "oncancel",
  "oncanplay",
  "oncanplaythrough",
  "onchange",
  "onclick",
  "onclose",
  "oncompositionend",
  "oncompositionstart",
  "oncompositionupdate",
  "oncontextlost",
  "oncontextmenu",
  "oncontextrestored",
  "oncopy",
  "oncuechange",
  "oncut",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "ondurationchange",
  "onemptied",
  "onended",
  "onerror",
  "onfocus",
  "onfocusin",
  "onfocusout",
  "onformdata",
  "ongotpointercapture",
  "oninput",
  "oninvalid",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onlostpointercapture",
  "onmousedown",
  "onmouseenter",
  "onmouseleave",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onpaste",
  "onpause",
  "onplay",
  "onplaying",
  "onpointercancel",
  "onpointerdown",
  "onpointerenter",
  "onpointerleave",
  "onpointermove",
  "onpointerout",
  "onpointerover",
  "onpointerup",
  "onprogress",
  "onratechange",
  "onreset",
  "onresize",
  "onscroll",
  "onscrollend",
  "onsecuritypolicyviolation",
  "onseeked",
  "onseeking",
  "onselect",
  "onselectionchange",
  "onselectstart",
  "onslotchange",
  "onstalled",
  "onsubmit",
  "onsuspend",
  "ontimeupdate",
  "ontoggle",
  "ontouchcancel",
  "ontouchend",
  "ontouchmove",
  "ontouchstart",
  "ontransitioncancel",
  "ontransitionend",
  "ontransitionrun",
  "ontransitionstart",
  "onvolumechange",
  "onwaiting",
  "onwebkitanimationend",
  "onwebkitanimationiteration",
  "onwebkitanimationstart",
  "onwebkittransitionend",
  "onwheel"
];
const EVENT_LIST_SET = new Set(EVENT_LIST);
function isEventHandler(key) {
  return EVENT_LIST_SET.has(key);
}
function mergeProps(...args) {
  const result = { ...args[0] };
  for (let i = 1; i < args.length; i++) {
    const props = args[i];
    if (!props)
      continue;
    for (const key of Object.keys(props)) {
      const a = result[key];
      const b = props[key];
      const aIsFunction = typeof a === "function";
      const bIsFunction = typeof b === "function";
      if (aIsFunction && typeof bIsFunction && isEventHandler(key)) {
        const aHandler = a;
        const bHandler = b;
        result[key] = composeHandlers(aHandler, bHandler);
      } else if (aIsFunction && bIsFunction) {
        result[key] = executeCallbacks(a, b);
      } else if (key === "class") {
        const aIsClassValue = isClassValue(a);
        const bIsClassValue = isClassValue(b);
        if (aIsClassValue && bIsClassValue) {
          result[key] = clsx(a, b);
        } else if (aIsClassValue) {
          result[key] = clsx(a);
        } else if (bIsClassValue) {
          result[key] = clsx(b);
        }
      } else if (key === "style") {
        const aIsObject = typeof a === "object";
        const bIsObject = typeof b === "object";
        const aIsString = typeof a === "string";
        const bIsString = typeof b === "string";
        if (aIsObject && bIsObject) {
          result[key] = { ...a, ...b };
        } else if (aIsObject && bIsString) {
          const parsedStyle = cssToStyleObj(b);
          result[key] = { ...a, ...parsedStyle };
        } else if (aIsString && bIsObject) {
          const parsedStyle = cssToStyleObj(a);
          result[key] = { ...parsedStyle, ...b };
        } else if (aIsString && bIsString) {
          const parsedStyleA = cssToStyleObj(a);
          const parsedStyleB = cssToStyleObj(b);
          result[key] = { ...parsedStyleA, ...parsedStyleB };
        } else if (aIsObject) {
          result[key] = a;
        } else if (bIsObject) {
          result[key] = b;
        } else if (aIsString) {
          result[key] = a;
        } else if (bIsString) {
          result[key] = b;
        }
      } else {
        result[key] = b !== void 0 ? b : a;
      }
    }
    for (const key of Object.getOwnPropertySymbols(props)) {
      const a = result[key];
      const b = props[key];
      result[key] = b !== void 0 ? b : a;
    }
  }
  if (typeof result.style === "object") {
    result.style = styleToString(result.style).replaceAll("\n", " ");
  }
  if (result.hidden !== true) {
    result.hidden = void 0;
    delete result.hidden;
  }
  if (result.disabled !== true) {
    result.disabled = void 0;
    delete result.disabled;
  }
  return result;
}
const defaultWindow = void 0;
function getActiveElement$1(document2) {
  let activeElement = document2.activeElement;
  while (activeElement?.shadowRoot) {
    const node = activeElement.shadowRoot.activeElement;
    if (node === activeElement)
      break;
    else
      activeElement = node;
  }
  return activeElement;
}
const SvelteMap = globalThis.Map;
function createSubscriber(_) {
  return () => {
  };
}
class ActiveElement {
  #document;
  #subscribe;
  constructor(options = {}) {
    const { window: window2 = defaultWindow, document: document2 = window2?.document } = options;
    if (window2 === void 0) return;
    this.#document = document2;
    this.#subscribe = createSubscriber();
  }
  get current() {
    this.#subscribe?.();
    if (!this.#document) return null;
    return getActiveElement$1(this.#document);
  }
}
new ActiveElement();
function isFunction(value) {
  return typeof value === "function";
}
class Context {
  #name;
  #key;
  /**
   * @param name The name of the context.
   * This is used for generating the context key and error messages.
   */
  constructor(name) {
    this.#name = name;
    this.#key = Symbol(name);
  }
  /**
   * The key used to get and set the context.
   *
   * It is not recommended to use this value directly.
   * Instead, use the methods provided by this class.
   */
  get key() {
    return this.#key;
  }
  /**
   * Checks whether this has been set in the context of a parent component.
   *
   * Must be called during component initialisation.
   */
  exists() {
    return hasContext(this.#key);
  }
  /**
   * Retrieves the context that belongs to the closest parent component.
   *
   * Must be called during component initialisation.
   *
   * @throws An error if the context does not exist.
   */
  get() {
    const context = getContext(this.#key);
    if (context === void 0) {
      throw new Error(`Context "${this.#name}" not found`);
    }
    return context;
  }
  /**
   * Retrieves the context that belongs to the closest parent component,
   * or the given fallback value if the context does not exist.
   *
   * Must be called during component initialisation.
   */
  getOr(fallback2) {
    const context = getContext(this.#key);
    if (context === void 0) {
      return fallback2;
    }
    return context;
  }
  /**
   * Associates the given value with the current component and returns it.
   *
   * Must be called during component initialisation.
   */
  set(context) {
    return setContext(this.#key, context);
  }
}
function runWatcher(sources, flush, effect, options = {}) {
  const { lazy = false } = options;
}
function watch(sources, effect, options) {
  runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
  runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
function get$1(value) {
  if (isFunction(value)) {
    return value();
  }
  return value;
}
class ElementSize {
  // no need to use `$state` here since we are using createSubscriber
  #size = { width: 0, height: 0 };
  #observed = false;
  #options;
  #node;
  #window;
  // we use a derived here to extract the width so that if the width doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #width = derived$1(() => {
    this.#subscribe()?.();
    return this.getSize().width;
  });
  // we use a derived here to extract the height so that if the height doesn't change we don't get a state update
  // which we would get if we would just use a getter since the version of the subscriber will be changing
  #height = derived$1(() => {
    this.#subscribe()?.();
    return this.getSize().height;
  });
  // we need to use a derived here because the class will be created before the node is bound to the ref
  #subscribe = derived$1(() => {
    const node$ = get$1(this.#node);
    if (!node$) return;
    return createSubscriber();
  });
  constructor(node, options = { box: "border-box" }) {
    this.#window = options.window ?? defaultWindow;
    this.#options = options;
    this.#node = node;
    this.#size = { width: 0, height: 0 };
  }
  calculateSize() {
    const element2 = get$1(this.#node);
    if (!element2 || !this.#window) {
      return;
    }
    const offsetWidth = element2.offsetWidth;
    const offsetHeight = element2.offsetHeight;
    if (this.#options.box === "border-box") {
      return { width: offsetWidth, height: offsetHeight };
    }
    const style = this.#window.getComputedStyle(element2);
    const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const contentWidth = offsetWidth - paddingWidth - borderWidth;
    const contentHeight = offsetHeight - paddingHeight - borderHeight;
    return { width: contentWidth, height: contentHeight };
  }
  getSize() {
    return this.#observed ? this.#size : this.calculateSize() ?? this.#size;
  }
  get current() {
    this.#subscribe()?.();
    return this.getSize();
  }
  get width() {
    return this.#width();
  }
  get height() {
    return this.#height();
  }
}
class Previous {
  #previous = void 0;
  constructor(getter, initialValue) {
    if (initialValue !== void 0) this.#previous = initialValue;
    watch(() => getter(), (_, v) => {
      this.#previous = v;
    });
  }
  get current() {
    return this.#previous;
  }
}
function afterSleep(ms, cb) {
  return setTimeout(cb, ms);
}
function afterTick(fn) {
  tick().then(fn);
}
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
function isHTMLElement$1(node) {
  return isObject(node) && node.nodeType === ELEMENT_NODE && typeof node.nodeName === "string";
}
function isDocument(node) {
  return isObject(node) && node.nodeType === DOCUMENT_NODE;
}
function isWindow(node) {
  return isObject(node) && node.constructor?.name === "VisualViewport";
}
function isNode(node) {
  return isObject(node) && node.nodeType !== void 0;
}
function isShadowRoot(node) {
  return isNode(node) && node.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in node;
}
function contains(parent, child) {
  if (!parent || !child)
    return false;
  if (!isHTMLElement$1(parent) || !isHTMLElement$1(child))
    return false;
  const rootNode = child.getRootNode?.();
  if (parent === child)
    return true;
  if (parent.contains(child))
    return true;
  if (rootNode && isShadowRoot(rootNode)) {
    let next2 = child;
    while (next2) {
      if (parent === next2)
        return true;
      next2 = next2.parentNode || next2.host;
    }
  }
  return false;
}
function getDocument(node) {
  if (isDocument(node))
    return node;
  if (isWindow(node))
    return node.document;
  return node?.ownerDocument ?? document;
}
function getWindow(node) {
  if (isShadowRoot(node))
    return getWindow(node.host);
  if (isDocument(node))
    return node.defaultView ?? window;
  if (isHTMLElement$1(node))
    return node.ownerDocument?.defaultView ?? window;
  return window;
}
function getActiveElement(rootNode) {
  let activeElement = rootNode.activeElement;
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement;
    if (el === activeElement)
      break;
    else
      activeElement = el;
  }
  return activeElement;
}
class DOMContext {
  element;
  #root = derived$1(() => {
    if (!this.element.current) return document;
    const rootNode = this.element.current.getRootNode() ?? document;
    return rootNode;
  });
  get root() {
    return this.#root();
  }
  set root($$value) {
    return this.#root($$value);
  }
  constructor(element2) {
    if (typeof element2 === "function") {
      this.element = box.with(element2);
    } else {
      this.element = element2;
    }
  }
  getDocument = () => {
    return getDocument(this.root);
  };
  getWindow = () => {
    return this.getDocument().defaultView ?? window;
  };
  getActiveElement = () => {
    return getActiveElement(this.root);
  };
  isActiveElement = (node) => {
    return node === this.getActiveElement();
  };
  getElementById(id) {
    return this.root.getElementById(id);
  }
  querySelector = (selector) => {
    if (!this.root) return null;
    return this.root.querySelector(selector);
  };
  querySelectorAll = (selector) => {
    if (!this.root) return [];
    return this.root.querySelectorAll(selector);
  };
  setTimeout = (callback, delay) => {
    return this.getWindow().setTimeout(callback, delay);
  };
  clearTimeout = (timeoutId) => {
    return this.getWindow().clearTimeout(timeoutId);
  };
}
function attachRef(ref, onChange) {
  return {
    [createAttachmentKey()]: (node) => {
      if (box.isBox(ref)) {
        ref.current = node;
        run(() => onChange?.(node));
        return () => {
          if ("isConnected" in node && node.isConnected)
            return;
          ref.current = null;
          onChange?.(null);
        };
      }
      ref(node);
      run(() => onChange?.(node));
      return () => {
        if ("isConnected" in node && node.isConnected)
          return;
        ref(null);
        onChange?.(null);
      };
    }
  };
}
function getDataOpenClosed(condition) {
  return condition ? "open" : "closed";
}
function getAriaDisabled(condition) {
  return condition ? "true" : "false";
}
function getAriaExpanded(condition) {
  return condition ? "true" : "false";
}
function getDataDisabled(condition) {
  return condition ? "" : void 0;
}
function getAriaRequired(condition) {
  return condition ? "true" : "false";
}
function getAriaChecked(checked, indeterminate) {
  return checked ? "true" : "false";
}
function getAriaOrientation(orientation) {
  return orientation;
}
function getAriaHidden(condition) {
  return condition ? "true" : void 0;
}
function getDataOrientation(orientation) {
  return orientation;
}
function getDataReadonly(condition) {
  return condition ? "" : void 0;
}
function getDisabled(condition) {
  return condition ? true : void 0;
}
function getRequired(condition) {
  return condition ? true : void 0;
}
class BitsAttrs {
  #variant;
  #prefix;
  attrs;
  constructor(config) {
    this.#variant = config.getVariant ? config.getVariant() : null;
    this.#prefix = this.#variant ? `data-${this.#variant}-` : `data-${config.component}-`;
    this.getAttr = this.getAttr.bind(this);
    this.selector = this.selector.bind(this);
    this.attrs = Object.fromEntries(config.parts.map((part) => [part, this.getAttr(part)]));
  }
  getAttr(part, variantOverride) {
    if (variantOverride)
      return `data-${variantOverride}-${part}`;
    return `${this.#prefix}${part}`;
  }
  selector(part, variantOverride) {
    return `[${this.getAttr(part, variantOverride)}]`;
  }
}
function createBitsAttrs(config) {
  const bitsAttrs = new BitsAttrs(config);
  return {
    ...bitsAttrs.attrs,
    selector: bitsAttrs.selector,
    getAttr: bitsAttrs.getAttr
  };
}
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const END = "End";
const ENTER = "Enter";
const ESCAPE = "Escape";
const HOME = "Home";
const PAGE_DOWN = "PageDown";
const PAGE_UP = "PageUp";
const SPACE = " ";
const TAB = "Tab";
function getElemDirection(elem) {
  const style = window.getComputedStyle(elem);
  const direction = style.getPropertyValue("direction");
  return direction;
}
function getNextKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_LEFT : ARROW_RIGHT,
    vertical: ARROW_DOWN
  }[orientation];
}
function getPrevKey(dir = "ltr", orientation = "horizontal") {
  return {
    horizontal: dir === "rtl" ? ARROW_RIGHT : ARROW_LEFT,
    vertical: ARROW_UP
  }[orientation];
}
function getDirectionalKeys(dir = "ltr", orientation = "horizontal") {
  if (!["ltr", "rtl"].includes(dir))
    dir = "ltr";
  if (!["horizontal", "vertical"].includes(orientation))
    orientation = "horizontal";
  return {
    nextKey: getNextKey(dir, orientation),
    prevKey: getPrevKey(dir, orientation)
  };
}
const isBrowser = typeof document !== "undefined";
const isIOS = getIsIOS();
function getIsIOS() {
  return isBrowser && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || // The new iPad Pro Gen3 does not identify itself as iPad, but as Macintosh.
  window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function isHTMLElement(element2) {
  return element2 instanceof HTMLElement;
}
function isElement(element2) {
  return element2 instanceof Element;
}
function isElementOrSVGElement(element2) {
  return element2 instanceof Element || element2 instanceof SVGElement;
}
function isNotNull(value) {
  return value !== null;
}
function isSelectableInput(element2) {
  return element2 instanceof HTMLInputElement && "select" in element2;
}
class RovingFocusGroup {
  #opts;
  #currentTabStopId = box(null);
  constructor(opts) {
    this.#opts = opts;
  }
  getCandidateNodes() {
    return [];
  }
  focusFirstCandidate() {
    const items = this.getCandidateNodes();
    if (!items.length)
      return;
    items[0]?.focus();
  }
  handleKeydown(node, e, both = false) {
    const rootNode = this.#opts.rootNode.current;
    if (!rootNode || !node)
      return;
    const items = this.getCandidateNodes();
    if (!items.length)
      return;
    const currentIndex = items.indexOf(node);
    const dir = getElemDirection(rootNode);
    const { nextKey, prevKey } = getDirectionalKeys(dir, this.#opts.orientation.current);
    const loop = this.#opts.loop.current;
    const keyToIndex = {
      [nextKey]: currentIndex + 1,
      [prevKey]: currentIndex - 1,
      [HOME]: 0,
      [END]: items.length - 1
    };
    if (both) {
      const altNextKey = nextKey === ARROW_DOWN ? ARROW_RIGHT : ARROW_DOWN;
      const altPrevKey = prevKey === ARROW_UP ? ARROW_LEFT : ARROW_UP;
      keyToIndex[altNextKey] = currentIndex + 1;
      keyToIndex[altPrevKey] = currentIndex - 1;
    }
    let itemIndex = keyToIndex[e.key];
    if (itemIndex === void 0)
      return;
    e.preventDefault();
    if (itemIndex < 0 && loop) {
      itemIndex = items.length - 1;
    } else if (itemIndex === items.length && loop) {
      itemIndex = 0;
    }
    const itemToFocus = items[itemIndex];
    if (!itemToFocus)
      return;
    itemToFocus.focus();
    this.#currentTabStopId.current = itemToFocus.id;
    this.#opts.onCandidateFocus?.(itemToFocus);
    return itemToFocus;
  }
  getTabIndex(node) {
    const items = this.getCandidateNodes();
    const anyActive = this.#currentTabStopId.current !== null;
    if (node && !anyActive && items[0] === node) {
      this.#currentTabStopId.current = node.id;
      return 0;
    } else if (node?.id === this.#currentTabStopId.current) {
      return 0;
    }
    return -1;
  }
  setCurrentTabStopId(id) {
    this.#currentTabStopId.current = id;
  }
  focusCurrentTabStop() {
    const currentTabStopId = this.#currentTabStopId.current;
    if (!currentTabStopId)
      return;
    const currentTabStop = this.#opts.rootNode.current?.querySelector(`#${currentTabStopId}`);
    if (!currentTabStop || !isHTMLElement(currentTabStop))
      return;
    currentTabStop.focus();
  }
}
function noop() {
}
function createId(prefixOrUid, uid) {
  return `bits-${prefixOrUid}`;
}
class StateMachine {
  state;
  #machine;
  constructor(initialState2, machine) {
    this.state = box(initialState2);
    this.#machine = machine;
    this.dispatch = this.dispatch.bind(this);
  }
  #reducer(event) {
    const nextState = this.#machine[this.state.current][event];
    return nextState ?? this.state.current;
  }
  dispatch(event) {
    this.state.current = this.#reducer(event);
  }
}
const presenceMachine = {
  mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
  unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
  unmounted: { MOUNT: "mounted" }
};
class Presence {
  opts;
  prevAnimationNameState = "none";
  styles = {};
  initialStatus;
  previousPresent;
  machine;
  present;
  constructor(opts) {
    this.opts = opts;
    this.present = this.opts.open;
    this.initialStatus = opts.open.current ? "mounted" : "unmounted";
    this.previousPresent = new Previous(() => this.present.current);
    this.machine = new StateMachine(this.initialStatus, presenceMachine);
    this.handleAnimationEnd = this.handleAnimationEnd.bind(this);
    this.handleAnimationStart = this.handleAnimationStart.bind(this);
    watchPresenceChange(this);
    watchStatusChange(this);
    watchRefChange(this);
  }
  /**
   * Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
   * event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
   * make sure we only trigger ANIMATION_END for the currently active animation.
   */
  handleAnimationEnd(event) {
    if (!this.opts.ref.current) return;
    const currAnimationName = getAnimationName(this.opts.ref.current);
    const isCurrentAnimation = currAnimationName.includes(event.animationName) || currAnimationName === "none";
    if (event.target === this.opts.ref.current && isCurrentAnimation) {
      this.machine.dispatch("ANIMATION_END");
    }
  }
  handleAnimationStart(event) {
    if (!this.opts.ref.current) return;
    if (event.target === this.opts.ref.current) {
      this.prevAnimationNameState = getAnimationName(this.opts.ref.current);
    }
  }
  #isPresent = derived$1(() => {
    return ["mounted", "unmountSuspended"].includes(this.machine.state.current);
  });
  get isPresent() {
    return this.#isPresent();
  }
  set isPresent($$value) {
    return this.#isPresent($$value);
  }
}
function watchPresenceChange(state) {
  watch(() => state.present.current, () => {
    if (!state.opts.ref.current) return;
    const hasPresentChanged = state.present.current !== state.previousPresent.current;
    if (!hasPresentChanged) return;
    const prevAnimationName = state.prevAnimationNameState;
    const currAnimationName = getAnimationName(state.opts.ref.current);
    if (state.present.current) {
      state.machine.dispatch("MOUNT");
    } else if (currAnimationName === "none" || state.styles.display === "none") {
      state.machine.dispatch("UNMOUNT");
    } else {
      const isAnimating = prevAnimationName !== currAnimationName;
      if (state.previousPresent.current && isAnimating) {
        state.machine.dispatch("ANIMATION_OUT");
      } else {
        state.machine.dispatch("UNMOUNT");
      }
    }
  });
}
function watchStatusChange(state) {
  watch(() => state.machine.state.current, () => {
    if (!state.opts.ref.current) return;
    const currAnimationName = getAnimationName(state.opts.ref.current);
    state.prevAnimationNameState = state.machine.state.current === "mounted" ? currAnimationName : "none";
  });
}
function watchRefChange(state) {
  watch(() => state.opts.ref.current, () => {
    if (!state.opts.ref.current) return;
    state.styles = getComputedStyle(state.opts.ref.current);
    return executeCallbacks(on(state.opts.ref.current, "animationstart", state.handleAnimationStart), on(state.opts.ref.current, "animationcancel", state.handleAnimationEnd), on(state.opts.ref.current, "animationend", state.handleAnimationEnd));
  });
}
function getAnimationName(node) {
  return node ? getComputedStyle(node).animationName || "none" : "none";
}
function Presence_layer($$payload, $$props) {
  push();
  let { open, forceMount, presence, ref } = $$props;
  const presenceState = new Presence({ open: box.with(() => open), ref });
  if (forceMount || open || presenceState.isPresent) {
    $$payload.out.push("<!--[-->");
    presence?.($$payload, { present: presenceState.isPresent });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
class AnimationsComplete {
  #opts;
  #currentFrame = void 0;
  #isRunning = false;
  constructor(opts) {
    this.#opts = opts;
  }
  #cleanup() {
    if (this.#currentFrame) {
      window.cancelAnimationFrame(this.#currentFrame);
      this.#currentFrame = void 0;
    }
    this.#isRunning = false;
  }
  run(fn) {
    if (this.#isRunning)
      return;
    this.#cleanup();
    this.#isRunning = true;
    const node = this.#opts.ref.current;
    if (!node) {
      this.#isRunning = false;
      return;
    }
    if (typeof node.getAnimations !== "function") {
      this.#executeCallback(fn);
      return;
    }
    this.#currentFrame = window.requestAnimationFrame(() => {
      const animations = node.getAnimations();
      if (animations.length === 0) {
        this.#executeCallback(fn);
        return;
      }
      Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        this.#executeCallback(fn);
      });
    });
  }
  #executeCallback(fn) {
    const execute = () => {
      fn();
      this.#isRunning = false;
    };
    if (this.#opts.afterTick) {
      afterTick(execute);
    } else {
      execute();
    }
  }
}
class OpenChangeComplete {
  #opts;
  #enabled;
  #afterAnimations;
  constructor(opts) {
    this.#opts = opts;
    this.#enabled = opts.enabled ?? true;
    this.#afterAnimations = new AnimationsComplete({
      ref: this.#opts.ref,
      afterTick: this.#opts.open
    });
    watch([() => this.#opts.open.current], ([open]) => {
      if (!this.#enabled)
        return;
      this.#afterAnimations.run(() => {
        if (open === this.#opts.open.current) {
          this.#opts.onComplete();
        }
      });
    });
  }
}
const BitsConfigContext = new Context("BitsConfig");
function getBitsConfig() {
  const fallback2 = new BitsConfigState(null, {});
  return BitsConfigContext.getOr(fallback2).opts;
}
class BitsConfigState {
  opts;
  constructor(parent, opts) {
    const resolveConfigOption = createConfigResolver(parent, opts);
    this.opts = {
      defaultPortalTo: resolveConfigOption((config) => config.defaultPortalTo),
      defaultLocale: resolveConfigOption((config) => config.defaultLocale)
    };
  }
}
function createConfigResolver(parent, currentOpts) {
  return (getter) => {
    const configOption = box.with(() => {
      const value = getter(currentOpts)?.current;
      if (value !== void 0)
        return value;
      if (parent === null)
        return void 0;
      return getter(parent.opts)?.current;
    });
    return configOption;
  };
}
function createPropResolver(configOption, fallback2) {
  return (getProp) => {
    const config = getBitsConfig();
    return box.with(() => {
      const propValue = getProp();
      if (propValue !== void 0)
        return propValue;
      const option = configOption(config).current;
      if (option !== void 0)
        return option;
      return fallback2;
    });
  };
}
const resolvePortalToProp = createPropResolver((config) => config.defaultPortalTo, "body");
function Portal($$payload, $$props) {
  push();
  let { to: toProp, children, disabled } = $$props;
  const to = resolvePortalToProp(() => toProp);
  getAllContexts();
  let target = getTarget();
  function getTarget() {
    if (!isBrowser || disabled) return null;
    let localTarget = null;
    if (typeof to.current === "string") {
      const target2 = document.querySelector(to.current);
      localTarget = target2;
    } else {
      localTarget = to.current;
    }
    return localTarget;
  }
  let instance;
  function unmountInstance() {
    if (instance) {
      unmount();
      instance = null;
    }
  }
  watch([() => target, () => disabled], ([target2, disabled2]) => {
    if (!target2 || disabled2) {
      unmountInstance();
      return;
    }
    instance = mount();
    return () => {
      unmountInstance();
    };
  });
  if (disabled) {
    $$payload.out.push("<!--[-->");
    children?.($$payload);
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function addEventListener(target, event, handler, options) {
  const events = Array.isArray(event) ? event : [event];
  events.forEach((_event) => target.addEventListener(_event, handler, options));
  return () => {
    events.forEach((_event) => target.removeEventListener(_event, handler, options));
  };
}
class CustomEventDispatcher {
  eventName;
  options;
  constructor(eventName, options = { bubbles: true, cancelable: true }) {
    this.eventName = eventName;
    this.options = options;
  }
  createEvent(detail) {
    return new CustomEvent(this.eventName, {
      ...this.options,
      detail
    });
  }
  dispatch(element2, detail) {
    const event = this.createEvent(detail);
    element2.dispatchEvent(event);
    return event;
  }
  listen(element2, callback, options) {
    const handler = (event) => {
      callback(event);
    };
    return on(element2, this.eventName, handler, options);
  }
}
function debounce(fn, wait = 500) {
  let timeout = null;
  const debounced = (...args) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
  debounced.destroy = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
}
function isOrContainsTarget(node, target) {
  return node === target || node.contains(target);
}
function getOwnerDocument(el) {
  return el?.ownerDocument ?? document;
}
function isClickTrulyOutside(event, contentNode) {
  const { clientX, clientY } = event;
  const rect = contentNode.getBoundingClientRect();
  return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
class DismissibleLayerState {
  static create(opts) {
    return new DismissibleLayerState(opts);
  }
  opts;
  #interactOutsideProp;
  #behaviorType;
  #interceptedEvents = { pointerdown: false };
  #isResponsibleLayer = false;
  #isFocusInsideDOMTree = false;
  #documentObj = void 0;
  #onFocusOutside;
  #unsubClickListener = noop;
  constructor(opts) {
    this.opts = opts;
    this.#behaviorType = opts.interactOutsideBehavior;
    this.#interactOutsideProp = opts.onInteractOutside;
    this.#onFocusOutside = opts.onFocusOutside;
    let unsubEvents = noop;
    const cleanup = () => {
      this.#resetState();
      globalThis.bitsDismissableLayers.delete(this);
      this.#handleInteractOutside.destroy();
      unsubEvents();
    };
    watch([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
      if (!this.opts.enabled.current || !this.opts.ref.current) return;
      afterSleep(1, () => {
        if (!this.opts.ref.current) return;
        globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      });
      return cleanup;
    });
  }
  #handleFocus = (event) => {
    if (event.defaultPrevented) return;
    if (!this.opts.ref.current) return;
    afterTick(() => {
      if (!this.opts.ref.current || this.#isTargetWithinLayer(event.target)) return;
      if (event.target && !this.#isFocusInsideDOMTree) {
        this.#onFocusOutside.current?.(event);
      }
    });
  };
  #addEventListeners() {
    return executeCallbacks(
      /**
       * CAPTURE INTERACTION START
       * mark interaction-start event as intercepted.
       * mark responsible layer during interaction start
       * to avoid checking if is responsible layer during interaction end
       * when a new floating element may have been opened.
       */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }),
      /**
       * BUBBLE INTERACTION START
       * Mark interaction-start event as non-intercepted. Debounce `onInteractOutsideStart`
       * to avoid prematurely checking if other events were intercepted.
       */
      on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)),
      /**
       * HANDLE FOCUS OUTSIDE
       */
      on(this.#documentObj, "focusin", this.#handleFocus)
    );
  }
  #handleDismiss = (e) => {
    let event = e;
    if (event.defaultPrevented) {
      event = createWrappedEvent(e);
    }
    this.#interactOutsideProp.current(e);
  };
  #handleInteractOutside = debounce(
    (e) => {
      if (!this.opts.ref.current) {
        this.#unsubClickListener();
        return;
      }
      const isEventValid = this.opts.isValidEvent.current(e, this.opts.ref.current) || isValidEvent(e, this.opts.ref.current);
      if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
        this.#unsubClickListener();
        return;
      }
      let event = e;
      if (event.defaultPrevented) {
        event = createWrappedEvent(event);
      }
      if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
        this.#unsubClickListener();
        return;
      }
      if (e.pointerType === "touch") {
        this.#unsubClickListener();
        this.#unsubClickListener = addEventListener(this.#documentObj, "click", this.#handleDismiss, { once: true });
      } else {
        this.#interactOutsideProp.current(event);
      }
    },
    10
  );
  #markInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = true;
  };
  #markNonInterceptedEvent = (e) => {
    this.#interceptedEvents[e.type] = false;
  };
  #markResponsibleLayer = () => {
    if (!this.opts.ref.current) return;
    this.#isResponsibleLayer = isResponsibleLayer(this.opts.ref.current);
  };
  #isTargetWithinLayer = (target) => {
    if (!this.opts.ref.current) return false;
    return isOrContainsTarget(this.opts.ref.current, target);
  };
  #resetState = debounce(
    () => {
      for (const eventType in this.#interceptedEvents) {
        this.#interceptedEvents[eventType] = false;
      }
      this.#isResponsibleLayer = false;
    },
    20
  );
  #isAnyEventIntercepted() {
    const i = Object.values(this.#interceptedEvents).some(Boolean);
    return i;
  }
  #onfocuscapture = () => {
    this.#isFocusInsideDOMTree = true;
  };
  #onblurcapture = () => {
    this.#isFocusInsideDOMTree = false;
  };
  props = {
    onfocuscapture: this.#onfocuscapture,
    onblurcapture: this.#onblurcapture
  };
}
function getTopMostLayer(layersArr) {
  return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
  const layersArr = [...globalThis.bitsDismissableLayers];
  const topMostLayer = getTopMostLayer(layersArr);
  if (topMostLayer) return topMostLayer[0].opts.ref.current === node;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode.opts.ref.current === node;
}
function isValidEvent(e, node) {
  if ("button" in e && e.button > 0) return false;
  const target = e.target;
  if (!isElement(target)) return false;
  const ownerDocument = getOwnerDocument(target);
  const isValid = ownerDocument.documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
  return isValid;
}
function createWrappedEvent(e) {
  const capturedCurrentTarget = e.currentTarget;
  const capturedTarget = e.target;
  let newEvent;
  if (e instanceof PointerEvent) {
    newEvent = new PointerEvent(e.type, e);
  } else {
    newEvent = new PointerEvent("pointerdown", e);
  }
  let isPrevented = false;
  const wrappedEvent = new Proxy(newEvent, {
    get: (target, prop) => {
      if (prop === "currentTarget") {
        return capturedCurrentTarget;
      }
      if (prop === "target") {
        return capturedTarget;
      }
      if (prop === "preventDefault") {
        return () => {
          isPrevented = true;
          if (typeof target.preventDefault === "function") {
            target.preventDefault();
          }
        };
      }
      if (prop === "defaultPrevented") {
        return isPrevented;
      }
      if (prop in target) {
        return target[prop];
      }
      return e[prop];
    }
  });
  return wrappedEvent;
}
function Dismissible_layer($$payload, $$props) {
  push();
  let {
    interactOutsideBehavior = "close",
    onInteractOutside = noop,
    onFocusOutside = noop,
    id,
    children,
    enabled,
    isValidEvent: isValidEvent2 = () => false,
    ref
  } = $$props;
  const dismissibleLayerState = DismissibleLayerState.create({
    id: box.with(() => id),
    interactOutsideBehavior: box.with(() => interactOutsideBehavior),
    onInteractOutside: box.with(() => onInteractOutside),
    enabled: box.with(() => enabled),
    onFocusOutside: box.with(() => onFocusOutside),
    isValidEvent: box.with(() => isValidEvent2),
    ref
  });
  children?.($$payload, { props: dismissibleLayerState.props });
  $$payload.out.push(`<!---->`);
  pop();
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
class EscapeLayerState {
  static create(opts) {
    return new EscapeLayerState(opts);
  }
  opts;
  domContext;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(this.opts.ref);
    let unsubEvents = noop;
    watch(() => opts.enabled.current, (enabled) => {
      if (enabled) {
        globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
        unsubEvents = this.#addEventListener();
      }
      return () => {
        unsubEvents();
        globalThis.bitsEscapeLayers.delete(this);
      };
    });
  }
  #addEventListener = () => {
    return on(this.domContext.getDocument(), "keydown", this.#onkeydown, { passive: false });
  };
  #onkeydown = (e) => {
    if (e.key !== ESCAPE || !isResponsibleEscapeLayer(this)) return;
    const clonedEvent = new KeyboardEvent(e.type, e);
    e.preventDefault();
    const behaviorType = this.opts.escapeKeydownBehavior.current;
    if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
    this.opts.onEscapeKeydown.current(clonedEvent);
  };
}
function isResponsibleEscapeLayer(instance) {
  const layersArr = [...globalThis.bitsEscapeLayers];
  const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
  if (topMostLayer) return topMostLayer[0] === instance;
  const [firstLayerNode] = layersArr[0];
  return firstLayerNode === instance;
}
function Escape_layer($$payload, $$props) {
  push();
  let {
    escapeKeydownBehavior = "close",
    onEscapeKeydown = noop,
    children,
    enabled,
    ref
  } = $$props;
  EscapeLayerState.create({
    escapeKeydownBehavior: box.with(() => escapeKeydownBehavior),
    onEscapeKeydown: box.with(() => onEscapeKeydown),
    enabled: box.with(() => enabled),
    ref
  });
  children?.($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
class FocusScopeManager {
  static instance;
  #scopeStack = box([]);
  #focusHistory = /* @__PURE__ */ new WeakMap();
  #preFocusHistory = /* @__PURE__ */ new WeakMap();
  static getInstance() {
    if (!this.instance) {
      this.instance = new FocusScopeManager();
    }
    return this.instance;
  }
  register(scope) {
    const current = this.getActive();
    if (current && current !== scope) {
      current.pause();
    }
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      this.#preFocusHistory.set(scope, activeElement);
    }
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    this.#scopeStack.current.unshift(scope);
  }
  unregister(scope) {
    this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
    const next2 = this.getActive();
    if (next2) {
      next2.resume();
    }
  }
  getActive() {
    return this.#scopeStack.current[0];
  }
  setFocusMemory(scope, element2) {
    this.#focusHistory.set(scope, element2);
  }
  getFocusMemory(scope) {
    return this.#focusHistory.get(scope);
  }
  isActiveScope(scope) {
    return this.getActive() === scope;
  }
  setPreFocusMemory(scope, element2) {
    this.#preFocusHistory.set(scope, element2);
  }
  getPreFocusMemory(scope) {
    return this.#preFocusHistory.get(scope);
  }
  clearPreFocusMemory(scope) {
    this.#preFocusHistory.delete(scope);
  }
}
class FocusScope {
  #paused = false;
  #container = null;
  #manager = FocusScopeManager.getInstance();
  #cleanupFns = [];
  #opts;
  constructor(opts) {
    this.#opts = opts;
  }
  get paused() {
    return this.#paused;
  }
  pause() {
    this.#paused = true;
  }
  resume() {
    this.#paused = false;
  }
  #cleanup() {
    for (const fn of this.#cleanupFns) {
      fn();
    }
    this.#cleanupFns = [];
  }
  mount(container) {
    if (this.#container) {
      this.unmount();
    }
    this.#container = container;
    this.#manager.register(this);
    this.#setupEventListeners();
    this.#handleOpenAutoFocus();
  }
  unmount() {
    if (!this.#container) return;
    this.#cleanup();
    this.#handleCloseAutoFocus();
    this.#manager.unregister(this);
    this.#manager.clearPreFocusMemory(this);
    this.#container = null;
  }
  #handleOpenAutoFocus() {
    if (!this.#container) return;
    const event = new CustomEvent("focusScope.onOpenAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onOpenAutoFocus.current(event);
    if (!event.defaultPrevented) {
      requestAnimationFrame(() => {
        if (!this.#container) return;
        const firstTabbable = this.#getFirstTabbable();
        if (firstTabbable) {
          firstTabbable.focus();
          this.#manager.setFocusMemory(this, firstTabbable);
        } else {
          this.#container.focus();
        }
      });
    }
  }
  #handleCloseAutoFocus() {
    const event = new CustomEvent("focusScope.onCloseAutoFocus", { bubbles: false, cancelable: true });
    this.#opts.onCloseAutoFocus.current?.(event);
    if (!event.defaultPrevented) {
      const preFocusedElement = this.#manager.getPreFocusMemory(this);
      if (preFocusedElement && document.contains(preFocusedElement)) {
        try {
          preFocusedElement.focus();
        } catch {
          document.body.focus();
        }
      }
    }
  }
  #setupEventListeners() {
    if (!this.#container || !this.#opts.trap.current) return;
    const container = this.#container;
    const doc = container.ownerDocument;
    const handleFocus = (e) => {
      if (this.#paused || !this.#manager.isActiveScope(this)) return;
      const target = e.target;
      if (!target) return;
      const isInside = container.contains(target);
      if (isInside) {
        this.#manager.setFocusMemory(this, target);
      } else {
        const lastFocused = this.#manager.getFocusMemory(this);
        if (lastFocused && container.contains(lastFocused) && isFocusable(lastFocused)) {
          e.preventDefault();
          lastFocused.focus();
        } else {
          const firstTabbable = this.#getFirstTabbable();
          const firstFocusable = this.#getAllFocusables()[0];
          (firstTabbable || firstFocusable || container).focus();
        }
      }
    };
    const handleKeydown = (e) => {
      if (!this.#opts.loop || this.#paused || e.key !== "Tab") return;
      if (!this.#manager.isActiveScope(this)) return;
      const tabbables = this.#getTabbables();
      if (tabbables.length < 2) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    this.#cleanupFns.push(on(doc, "focusin", handleFocus, { capture: true }), on(container, "keydown", handleKeydown));
    const observer = new MutationObserver(() => {
      const lastFocused = this.#manager.getFocusMemory(this);
      if (lastFocused && !container.contains(lastFocused)) {
        const firstTabbable = this.#getFirstTabbable();
        const firstFocusable = this.#getAllFocusables()[0];
        const elementToFocus = firstTabbable || firstFocusable;
        if (elementToFocus) {
          elementToFocus.focus();
          this.#manager.setFocusMemory(this, elementToFocus);
        } else {
          container.focus();
        }
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    this.#cleanupFns.push(() => observer.disconnect());
  }
  #getTabbables() {
    if (!this.#container) return [];
    return tabbable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  #getFirstTabbable() {
    const tabbables = this.#getTabbables();
    return tabbables[0] || null;
  }
  #getAllFocusables() {
    if (!this.#container) return [];
    return focusable(this.#container, { includeContainer: false, getShadowRoot: true });
  }
  static use(opts) {
    let scope = null;
    watch([() => opts.ref.current, () => opts.enabled.current], ([ref, enabled]) => {
      if (ref && enabled) {
        if (!scope) {
          scope = new FocusScope(opts);
        }
        scope.mount(ref);
      } else if (scope) {
        scope.unmount();
        scope = null;
      }
    });
    return {
      get props() {
        return { tabindex: -1 };
      }
    };
  }
}
function Focus_scope($$payload, $$props) {
  push();
  let {
    enabled = false,
    trapFocus = false,
    loop = false,
    onCloseAutoFocus = noop,
    onOpenAutoFocus = noop,
    focusScope,
    ref
  } = $$props;
  const focusScopeState = FocusScope.use({
    enabled: box.with(() => enabled),
    trap: box.with(() => trapFocus),
    loop,
    onCloseAutoFocus: box.with(() => onCloseAutoFocus),
    onOpenAutoFocus: box.with(() => onOpenAutoFocus),
    ref
  });
  focusScope?.($$payload, { props: focusScopeState.props });
  $$payload.out.push(`<!---->`);
  pop();
}
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
class TextSelectionLayerState {
  static create(opts) {
    return new TextSelectionLayerState(opts);
  }
  opts;
  domContext;
  #unsubSelectionLock = noop;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(opts.ref);
    let unsubEvents = noop;
    watch(() => this.opts.enabled.current, (isEnabled) => {
      if (isEnabled) {
        globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
        unsubEvents();
        unsubEvents = this.#addEventListeners();
      }
      return () => {
        unsubEvents();
        this.#resetSelectionLock();
        globalThis.bitsTextSelectionLayers.delete(this);
      };
    });
  }
  #addEventListeners() {
    return executeCallbacks(on(this.domContext.getDocument(), "pointerdown", this.#pointerdown), on(this.domContext.getDocument(), "pointerup", composeHandlers(this.#resetSelectionLock, this.opts.onPointerUp.current)));
  }
  #pointerdown = (e) => {
    const node = this.opts.ref.current;
    const target = e.target;
    if (!isHTMLElement(node) || !isHTMLElement(target) || !this.opts.enabled.current) return;
    if (!isHighestLayer(this) || !contains(node, target)) return;
    this.opts.onPointerDown.current(e);
    if (e.defaultPrevented) return;
    this.#unsubSelectionLock = preventTextSelectionOverflow(node, this.domContext.getDocument().body);
  };
  #resetSelectionLock = () => {
    this.#unsubSelectionLock();
    this.#unsubSelectionLock = noop;
  };
}
const getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node, body) {
  const originalBodyUserSelect = getUserSelect(body);
  const originalNodeUserSelect = getUserSelect(node);
  setUserSelect(body, "none");
  setUserSelect(node, "text");
  return () => {
    setUserSelect(body, originalBodyUserSelect);
    setUserSelect(node, originalNodeUserSelect);
  };
}
function setUserSelect(node, value) {
  node.style.userSelect = value;
  node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
  const layersArr = [...globalThis.bitsTextSelectionLayers];
  if (!layersArr.length) return false;
  const highestLayer = layersArr.at(-1);
  if (!highestLayer) return false;
  return highestLayer[0] === instance;
}
function Text_selection_layer($$payload, $$props) {
  push();
  let {
    preventOverflowTextSelection = true,
    onPointerDown = noop,
    onPointerUp = noop,
    id,
    children,
    enabled,
    ref
  } = $$props;
  TextSelectionLayerState.create({
    id: box.with(() => id),
    onPointerDown: box.with(() => onPointerDown),
    onPointerUp: box.with(() => onPointerUp),
    enabled: box.with(() => enabled && preventOverflowTextSelection),
    ref
  });
  children?.($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
globalThis.bitsIdCounter ??= { current: 0 };
function useId(prefix = "bits") {
  globalThis.bitsIdCounter.current++;
  return `${prefix}-${globalThis.bitsIdCounter.current}`;
}
class SharedState {
  #factory;
  #subscribers = 0;
  #state;
  #scope;
  constructor(factory) {
    this.#factory = factory;
  }
  #dispose() {
    this.#subscribers -= 1;
    if (this.#scope && this.#subscribers <= 0) {
      this.#scope();
      this.#state = void 0;
      this.#scope = void 0;
    }
  }
  get(...args) {
    this.#subscribers += 1;
    if (this.#state === void 0) {
      this.#scope = () => {
      };
    }
    return this.#state;
  }
}
const lockMap = new SvelteMap();
let initialBodyStyle = null;
let cleanupTimeoutId = null;
let isInCleanupTransition = false;
const anyLocked = box.with(() => {
  for (const value of lockMap.values()) {
    if (value) return true;
  }
  return false;
});
let cleanupScheduledAt = null;
const bodyLockStackCount = new SharedState(() => {
  function resetBodyStyle() {
    return;
  }
  function cancelPendingCleanup() {
    if (cleanupTimeoutId === null) return;
    window.clearTimeout(cleanupTimeoutId);
    cleanupTimeoutId = null;
  }
  function scheduleCleanupIfNoNewLocks(delay, callback) {
    cancelPendingCleanup();
    isInCleanupTransition = true;
    cleanupScheduledAt = Date.now();
    const currentCleanupId = cleanupScheduledAt;
    const cleanupFn = () => {
      cleanupTimeoutId = null;
      if (cleanupScheduledAt !== currentCleanupId) return;
      if (!isAnyLocked(lockMap)) {
        isInCleanupTransition = false;
        callback();
      } else {
        isInCleanupTransition = false;
      }
    };
    const actualDelay = delay === null ? 24 : delay;
    cleanupTimeoutId = window.setTimeout(cleanupFn, actualDelay);
  }
  function ensureInitialStyleCaptured() {
    if (initialBodyStyle === null && lockMap.size === 0 && !isInCleanupTransition) {
      initialBodyStyle = document.body.getAttribute("style");
    }
  }
  watch(() => anyLocked.current, () => {
    if (!anyLocked.current) return;
    ensureInitialStyleCaptured();
    isInCleanupTransition = false;
    const bodyStyle = getComputedStyle(document.body);
    const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const paddingRight = Number.parseInt(bodyStyle.paddingRight ?? "0", 10);
    const config = {
      padding: paddingRight + verticalScrollbarWidth,
      margin: Number.parseInt(bodyStyle.marginRight ?? "0", 10)
    };
    if (verticalScrollbarWidth > 0) {
      document.body.style.paddingRight = `${config.padding}px`;
      document.body.style.marginRight = `${config.margin}px`;
      document.body.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
      document.body.style.overflow = "hidden";
    }
    if (isIOS) {
      addEventListener(
        document,
        "touchmove",
        (e) => {
          if (e.target !== document.documentElement) return;
          if (e.touches.length > 1) return;
          e.preventDefault();
        },
        { passive: false }
      );
    }
    afterTick(() => {
      document.body.style.pointerEvents = "none";
      document.body.style.overflow = "hidden";
    });
  });
  return {
    get lockMap() {
      return lockMap;
    },
    resetBodyStyle,
    scheduleCleanupIfNoNewLocks,
    cancelPendingCleanup,
    ensureInitialStyleCaptured
  };
});
class BodyScrollLock {
  #id = useId();
  #initialState;
  #restoreScrollDelay = () => null;
  #countState;
  locked;
  constructor(initialState2, restoreScrollDelay = () => null) {
    this.#initialState = initialState2;
    this.#restoreScrollDelay = restoreScrollDelay;
    this.#countState = bodyLockStackCount.get();
    if (!this.#countState) return;
    this.#countState.cancelPendingCleanup();
    this.#countState.ensureInitialStyleCaptured();
    this.#countState.lockMap.set(this.#id, this.#initialState ?? false);
    this.locked = box.with(() => this.#countState.lockMap.get(this.#id) ?? false, (v) => this.#countState.lockMap.set(this.#id, v));
  }
}
function isAnyLocked(map) {
  for (const [_, value] of map) {
    if (value) return true;
  }
  return false;
}
function Scroll_lock($$payload, $$props) {
  push();
  let { preventScroll = true, restoreScrollDelay = null } = $$props;
  if (preventScroll) {
    new BodyScrollLock(preventScroll, () => restoreScrollDelay);
  }
  pop();
}
const aspectRatioAttrs = createBitsAttrs({ component: "aspect-ratio", parts: ["root"] });
class AspectRatioRootState {
  static create(opts) {
    return new AspectRatioRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    [aspectRatioAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Aspect_ratio$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    ratio = 1,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = AspectRatioRootState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    ratio: box.with(() => ratio)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  $$payload.out.push(`<div${attr_style("", {
    position: "relative",
    width: "100%",
    "padding-bottom": `${stringify(ratio ? 100 / ratio : 0)}%`
  })}>`);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { ref });
  pop();
}
const avatarAttrs = createBitsAttrs({ component: "avatar", parts: ["root", "image", "fallback"] });
const AvatarRootContext = new Context("Avatar.Root");
class AvatarRootState {
  static create(opts) {
    return AvatarRootContext.set(new AvatarRootState(opts));
  }
  opts;
  domContext;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.domContext = new DOMContext(this.opts.ref);
    this.loadImage = this.loadImage.bind(this);
    this.attachment = attachRef(this.opts.ref);
  }
  loadImage(src, crossorigin, referrerPolicy) {
    if (this.opts.loadingStatus.current === "loaded") return;
    let imageTimerId;
    const image = new Image();
    image.src = src;
    if (crossorigin !== void 0) image.crossOrigin = crossorigin;
    if (referrerPolicy) image.referrerPolicy = referrerPolicy;
    this.opts.loadingStatus.current = "loading";
    image.onload = () => {
      imageTimerId = this.domContext.setTimeout(
        () => {
          this.opts.loadingStatus.current = "loaded";
        },
        this.opts.delayMs.current
      );
    };
    image.onerror = () => {
      this.opts.loadingStatus.current = "error";
    };
    return () => {
      if (!imageTimerId) return;
      this.domContext.clearTimeout(imageTimerId);
    };
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    [avatarAttrs.root]: "",
    "data-status": this.opts.loadingStatus.current,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class AvatarImageState {
  static create(opts) {
    return new AvatarImageState(opts, AvatarRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    watch.pre(
      [
        () => this.opts.src.current,
        () => this.opts.crossOrigin.current
      ],
      ([src, crossOrigin]) => {
        if (!src) {
          this.root.opts.loadingStatus.current = "error";
          return;
        }
        this.root.loadImage(src, crossOrigin, this.opts.referrerPolicy.current);
      }
    );
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    style: {
      display: this.root.opts.loadingStatus.current === "loaded" ? "block" : "none"
    },
    "data-status": this.root.opts.loadingStatus.current,
    [avatarAttrs.image]: "",
    src: this.opts.src.current,
    crossorigin: this.opts.crossOrigin.current,
    referrerpolicy: this.opts.referrerPolicy.current,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class AvatarFallbackState {
  static create(opts) {
    return new AvatarFallbackState(opts, AvatarRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #style = derived$1(() => this.root.opts.loadingStatus.current === "loaded" ? { display: "none" } : void 0);
  get style() {
    return this.#style();
  }
  set style($$value) {
    return this.#style($$value);
  }
  #props = derived$1(() => ({
    style: this.style,
    "data-status": this.root.opts.loadingStatus.current,
    [avatarAttrs.fallback]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Avatar$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    delayMs = 0,
    loadingStatus = "loading",
    onLoadingStatusChange,
    child,
    children,
    id = createId(uid),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = AvatarRootState.create({
    delayMs: box.with(() => delayMs),
    loadingStatus: box.with(() => loadingStatus, (v) => {
      if (loadingStatus !== v) {
        loadingStatus = v;
        onLoadingStatusChange?.(v);
      }
    }),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { loadingStatus, ref });
  pop();
}
function Avatar_image$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    src,
    child,
    id = createId(uid),
    ref = null,
    crossorigin = void 0,
    referrerpolicy = void 0,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const imageState = AvatarImageState.create({
    src: box.with(() => src),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    crossOrigin: box.with(() => crossorigin),
    referrerPolicy: box.with(() => referrerpolicy)
  });
  const mergedProps = mergeProps(restProps, imageState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<img${spread_attributes({ ...mergedProps, src })} onload="this.__e=event" onerror="this.__e=event"/>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Avatar_fallback$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const fallbackState = AvatarFallbackState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, fallbackState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<span${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></span>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function next(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  if (array.length === 1 && index === 0)
    return array[0];
  if (index === array.length - 1)
    return loop ? array[0] : void 0;
  return array[index + 1];
}
function prev(array, index, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  if (array.length === 1 && index === 0)
    return array[0];
  if (index === 0)
    return loop ? array[array.length - 1] : void 0;
  return array[index - 1];
}
function forward(array, index, increment, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  let targetIndex = index + increment;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function backward(array, index, decrement, loop = true) {
  if (array.length === 0 || index < 0 || index >= array.length)
    return;
  let targetIndex = index - decrement;
  if (loop) {
    targetIndex = (targetIndex % array.length + array.length) % array.length;
  } else {
    targetIndex = Math.max(0, Math.min(targetIndex, array.length - 1));
  }
  return array[targetIndex];
}
function getNextMatch(values, search, currentMatch) {
  const lowerSearch = search.toLowerCase();
  if (lowerSearch.endsWith(" ")) {
    const searchWithoutSpace = lowerSearch.slice(0, -1);
    const matchesWithoutSpace = values.filter((value) => value.toLowerCase().startsWith(searchWithoutSpace));
    if (matchesWithoutSpace.length <= 1) {
      return getNextMatch(values, searchWithoutSpace, currentMatch);
    }
    const currentMatchLowercase = currentMatch?.toLowerCase();
    if (currentMatchLowercase && currentMatchLowercase.startsWith(searchWithoutSpace) && currentMatchLowercase.charAt(searchWithoutSpace.length) === " " && search.trim() === searchWithoutSpace) {
      return currentMatch;
    }
    const spacedMatches = values.filter((value) => value.toLowerCase().startsWith(lowerSearch));
    if (spacedMatches.length > 0) {
      const currentMatchIndex2 = currentMatch ? values.indexOf(currentMatch) : -1;
      let wrappedMatches = wrapArray(spacedMatches, Math.max(currentMatchIndex2, 0));
      const nextMatch2 = wrappedMatches.find((match) => match !== currentMatch);
      return nextMatch2 || currentMatch;
    }
  }
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const normalizedLowerSearch = normalizedSearch.toLowerCase();
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch)
    wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find((value) => value?.toLowerCase().startsWith(normalizedLowerSearch));
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function Hidden_input($$payload, $$props) {
  push();
  let { value = void 0, $$slots, $$events, ...restProps } = $$props;
  const mergedProps = mergeProps(restProps, {
    "aria-hidden": "true",
    tabindex: -1,
    style: srOnlyStylesString
  });
  if (mergedProps.type === "checkbox") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<input${spread_attributes({ ...mergedProps, value }, null, void 0, void 0, 4)}/>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<input${spread_attributes({ value, ...mergedProps }, null, void 0, void 0, 4)}/>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { value });
  pop();
}
function get(valueOrGetValue) {
  return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element2) {
  if (typeof window === "undefined") return 1;
  const win = element2.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element2, value) {
  const dpr = getDPR(element2);
  return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
  return {
    [`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
    [`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
    [`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
    [`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
    [`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
  };
}
function useFloating(options) {
  const openOption = get(options.open) ?? true;
  const middlewareOption = get(options.middleware);
  const transformOption = get(options.transform) ?? true;
  const placementOption = get(options.placement) ?? "bottom";
  const strategyOption = get(options.strategy) ?? "absolute";
  const sideOffsetOption = get(options.sideOffset) ?? 0;
  const alignOffsetOption = get(options.alignOffset) ?? 0;
  const reference = options.reference;
  let x = 0;
  let y = 0;
  const floating = box(null);
  let strategy = strategyOption;
  let placement = placementOption;
  let middlewareData = {};
  let isPositioned = false;
  const floatingStyles = (() => {
    const xVal = floating.current ? roundByDPR(floating.current, x) : x;
    const yVal = floating.current ? roundByDPR(floating.current, y) : y;
    if (transformOption) {
      return {
        position: strategy,
        left: "0",
        top: "0",
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...floating.current && getDPR(floating.current) >= 1.5 && { willChange: "transform" }
      };
    }
    return { position: strategy, left: `${xVal}px`, top: `${yVal}px` };
  })();
  function update() {
    if (reference.current === null || floating.current === null) return;
    computePosition(reference.current, floating.current, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    }).then((position) => {
      if (!openOption && x !== 0 && y !== 0) {
        const maxExpectedOffset = Math.max(Math.abs(sideOffsetOption), Math.abs(alignOffsetOption), 15);
        if (position.x <= maxExpectedOffset && position.y <= maxExpectedOffset) return;
      }
      x = position.x;
      y = position.y;
      strategy = position.strategy;
      placement = position.placement;
      middlewareData = position.middlewareData;
      isPositioned = true;
    });
  }
  return {
    floating,
    reference,
    get strategy() {
      return strategy;
    },
    get placement() {
      return placement;
    },
    get middlewareData() {
      return middlewareData;
    },
    get isPositioned() {
      return isPositioned;
    },
    get floatingStyles() {
      return floatingStyles;
    },
    get update() {
      return update;
    }
  };
}
const OPPOSITE_SIDE = { top: "bottom", right: "left", bottom: "top", left: "right" };
const FloatingRootContext = new Context("Floating.Root");
const FloatingContentContext = new Context("Floating.Content");
const FloatingTooltipRootContext = new Context("Floating.Root");
class FloatingRootState {
  static create(tooltip = false) {
    return tooltip ? FloatingTooltipRootContext.set(new FloatingRootState()) : FloatingRootContext.set(new FloatingRootState());
  }
  anchorNode = box(null);
  customAnchorNode = box(null);
  triggerNode = box(null);
  constructor() {
  }
}
class FloatingContentState {
  static create(opts, tooltip = false) {
    return tooltip ? FloatingContentContext.set(new FloatingContentState(opts, FloatingTooltipRootContext.get())) : FloatingContentContext.set(new FloatingContentState(opts, FloatingRootContext.get()));
  }
  opts;
  root;
  // nodes
  contentRef = box(null);
  wrapperRef = box(null);
  arrowRef = box(null);
  contentAttachment = attachRef(this.contentRef);
  wrapperAttachment = attachRef(this.wrapperRef);
  arrowAttachment = attachRef(this.arrowRef);
  // ids
  arrowId = box(useId());
  #transformedStyle = derived$1(() => {
    if (typeof this.opts.style === "string") return cssToStyleObj(this.opts.style);
    if (!this.opts.style) return {};
  });
  #updatePositionStrategy = void 0;
  #arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
  #arrowWidth = derived$1(() => this.#arrowSize?.width ?? 0);
  #arrowHeight = derived$1(() => this.#arrowSize?.height ?? 0);
  #desiredPlacement = derived$1(() => this.opts.side?.current + (this.opts.align.current !== "center" ? `-${this.opts.align.current}` : ""));
  #boundary = derived$1(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
  #hasExplicitBoundaries = derived$1(() => this.#boundary().length > 0);
  get hasExplicitBoundaries() {
    return this.#hasExplicitBoundaries();
  }
  set hasExplicitBoundaries($$value) {
    return this.#hasExplicitBoundaries($$value);
  }
  #detectOverflowOptions = derived$1(() => ({
    padding: this.opts.collisionPadding.current,
    boundary: this.#boundary().filter(isNotNull),
    altBoundary: this.hasExplicitBoundaries
  }));
  get detectOverflowOptions() {
    return this.#detectOverflowOptions();
  }
  set detectOverflowOptions($$value) {
    return this.#detectOverflowOptions($$value);
  }
  #availableWidth = void 0;
  #availableHeight = void 0;
  #anchorWidth = void 0;
  #anchorHeight = void 0;
  #middleware = derived$1(() => [
    offset({
      mainAxis: this.opts.sideOffset.current + this.#arrowHeight(),
      alignmentAxis: this.opts.alignOffset.current
    }),
    this.opts.avoidCollisions.current && shift({
      mainAxis: true,
      crossAxis: false,
      limiter: this.opts.sticky.current === "partial" ? limitShift() : void 0,
      ...this.detectOverflowOptions
    }),
    this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
    size({
      ...this.detectOverflowOptions,
      apply: ({ rects, availableWidth, availableHeight }) => {
        const { width: anchorWidth, height: anchorHeight } = rects.reference;
        this.#availableWidth = availableWidth;
        this.#availableHeight = availableHeight;
        this.#anchorWidth = anchorWidth;
        this.#anchorHeight = anchorHeight;
      }
    }),
    this.arrowRef.current && arrow({
      element: this.arrowRef.current,
      padding: this.opts.arrowPadding.current
    }),
    transformOrigin({
      arrowWidth: this.#arrowWidth(),
      arrowHeight: this.#arrowHeight()
    }),
    this.opts.hideWhenDetached.current && hide({ strategy: "referenceHidden", ...this.detectOverflowOptions })
  ].filter(Boolean));
  get middleware() {
    return this.#middleware();
  }
  set middleware($$value) {
    return this.#middleware($$value);
  }
  floating;
  #placedSide = derived$1(() => getSideFromPlacement(this.floating.placement));
  get placedSide() {
    return this.#placedSide();
  }
  set placedSide($$value) {
    return this.#placedSide($$value);
  }
  #placedAlign = derived$1(() => getAlignFromPlacement(this.floating.placement));
  get placedAlign() {
    return this.#placedAlign();
  }
  set placedAlign($$value) {
    return this.#placedAlign($$value);
  }
  #arrowX = derived$1(() => this.floating.middlewareData.arrow?.x ?? 0);
  get arrowX() {
    return this.#arrowX();
  }
  set arrowX($$value) {
    return this.#arrowX($$value);
  }
  #arrowY = derived$1(() => this.floating.middlewareData.arrow?.y ?? 0);
  get arrowY() {
    return this.#arrowY();
  }
  set arrowY($$value) {
    return this.#arrowY($$value);
  }
  #cannotCenterArrow = derived$1(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
  get cannotCenterArrow() {
    return this.#cannotCenterArrow();
  }
  set cannotCenterArrow($$value) {
    return this.#cannotCenterArrow($$value);
  }
  contentZIndex;
  #arrowBaseSide = derived$1(() => OPPOSITE_SIDE[this.placedSide]);
  get arrowBaseSide() {
    return this.#arrowBaseSide();
  }
  set arrowBaseSide($$value) {
    return this.#arrowBaseSide($$value);
  }
  #wrapperProps = derived$1(() => ({
    id: this.opts.wrapperId.current,
    "data-bits-floating-content-wrapper": "",
    style: {
      ...this.floating.floatingStyles,
      transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
      minWidth: "max-content",
      zIndex: this.contentZIndex,
      "--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
      "--bits-floating-available-width": `${this.#availableWidth}px`,
      "--bits-floating-available-height": `${this.#availableHeight}px`,
      "--bits-floating-anchor-width": `${this.#anchorWidth}px`,
      "--bits-floating-anchor-height": `${this.#anchorHeight}px`,
      ...this.floating.middlewareData.hide?.referenceHidden && { visibility: "hidden", "pointer-events": "none" },
      ...this.#transformedStyle()
    },
    dir: this.opts.dir.current,
    ...this.wrapperAttachment
  }));
  get wrapperProps() {
    return this.#wrapperProps();
  }
  set wrapperProps($$value) {
    return this.#wrapperProps($$value);
  }
  #props = derived$1(() => ({
    "data-side": this.placedSide,
    "data-align": this.placedAlign,
    style: styleToString({ ...this.#transformedStyle() }),
    ...this.contentAttachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  #arrowStyle = derived$1(() => ({
    position: "absolute",
    left: this.arrowX ? `${this.arrowX}px` : void 0,
    top: this.arrowY ? `${this.arrowY}px` : void 0,
    [this.arrowBaseSide]: 0,
    "transform-origin": { top: "", right: "0 0", bottom: "center 0", left: "100% 0" }[this.placedSide],
    transform: {
      top: "translateY(100%)",
      right: "translateY(50%) rotate(90deg) translateX(-50%)",
      bottom: "rotate(180deg)",
      left: "translateY(50%) rotate(-90deg) translateX(50%)"
    }[this.placedSide],
    visibility: this.cannotCenterArrow ? "hidden" : void 0
  }));
  get arrowStyle() {
    return this.#arrowStyle();
  }
  set arrowStyle($$value) {
    return this.#arrowStyle($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.customAnchor) {
      this.root.customAnchorNode.current = opts.customAnchor.current;
    }
    watch(() => opts.customAnchor.current, (customAnchor) => {
      this.root.customAnchorNode.current = customAnchor;
    });
    this.floating = useFloating({
      strategy: () => this.opts.strategy.current,
      placement: () => this.#desiredPlacement(),
      middleware: () => this.middleware,
      reference: this.root.anchorNode,
      open: () => this.opts.enabled.current,
      sideOffset: () => this.opts.sideOffset.current,
      alignOffset: () => this.opts.alignOffset.current
    });
    watch(() => this.contentRef.current, (contentNode) => {
      if (!contentNode) return;
      const win = getWindow(contentNode);
      this.contentZIndex = win.getComputedStyle(contentNode).zIndex;
    });
  }
}
class FloatingAnchorState {
  static create(opts, tooltip = false) {
    return tooltip ? new FloatingAnchorState(opts, FloatingTooltipRootContext.get()) : new FloatingAnchorState(opts, FloatingRootContext.get());
  }
  opts;
  root;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    if (opts.virtualEl && opts.virtualEl.current) {
      root.triggerNode = box.from(opts.virtualEl.current);
    } else {
      root.triggerNode = opts.ref;
    }
  }
}
function transformOrigin(options) {
  return {
    name: "transformOrigin",
    options,
    fn(data) {
      const { placement, rects, middlewareData } = data;
      const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
      const isArrowHidden = cannotCenterArrow;
      const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
      const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
      const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
      const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
      const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
      const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
      let x = "";
      let y = "";
      if (placedSide === "bottom") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${-arrowHeight}px`;
      } else if (placedSide === "top") {
        x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
        y = `${rects.floating.height + arrowHeight}px`;
      } else if (placedSide === "right") {
        x = `${-arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      } else if (placedSide === "left") {
        x = `${rects.floating.width + arrowHeight}px`;
        y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
      }
      return { data: { x, y } };
    }
  };
}
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
function getSideFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
  return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$payload, $$props) {
  push();
  let { children, tooltip = false } = $$props;
  FloatingRootState.create(tooltip);
  children?.($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
const defaultOptions = { afterMs: 1e4, onChange: noop };
function boxAutoReset(defaultValue, options) {
  const { afterMs, onChange, getWindow: getWindow2 } = { ...defaultOptions, ...options };
  let timeout = null;
  let value = defaultValue;
  function resetAfter() {
    return getWindow2().setTimeout(
      () => {
        value = defaultValue;
        onChange?.(defaultValue);
      },
      afterMs
    );
  }
  return box.with(() => value, (v) => {
    value = v;
    onChange?.(v);
    if (timeout) getWindow2().clearTimeout(timeout);
    timeout = resetAfter();
  });
}
class DataTypeahead {
  #opts;
  #candidateValues = derived$1(() => this.#opts.candidateValues());
  #search;
  constructor(opts) {
    this.#opts = opts;
    this.#search = boxAutoReset("", { afterMs: 1e3, getWindow: this.#opts.getWindow });
    this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
    this.resetTypeahead = this.resetTypeahead.bind(this);
  }
  handleTypeaheadSearch(key) {
    if (!this.#opts.enabled() || !this.#candidateValues().length) return;
    this.#search.current = this.#search.current + key;
    const currentItem = this.#opts.getCurrentItem();
    const currentMatch = this.#candidateValues().find((item) => item === currentItem) ?? "";
    const values = this.#candidateValues().map((item) => item ?? "");
    const nextMatch = getNextMatch(values, this.#search.current, currentMatch);
    const newItem = this.#candidateValues().find((item) => item === nextMatch);
    if (newItem) {
      this.#opts.onMatch(newItem);
    }
    return newItem;
  }
  resetTypeahead() {
    this.#search.current = "";
  }
}
class DOMTypeahead {
  #opts;
  #search;
  #onMatch = derived$1(() => {
    if (this.#opts.onMatch) return this.#opts.onMatch;
    return (node) => node.focus();
  });
  #getCurrentItem = derived$1(() => {
    if (this.#opts.getCurrentItem) return this.#opts.getCurrentItem;
    return this.#opts.getActiveElement;
  });
  constructor(opts) {
    this.#opts = opts;
    this.#search = boxAutoReset("", { afterMs: 1e3, getWindow: opts.getWindow });
    this.handleTypeaheadSearch = this.handleTypeaheadSearch.bind(this);
    this.resetTypeahead = this.resetTypeahead.bind(this);
  }
  handleTypeaheadSearch(key, candidates) {
    if (!candidates.length) return;
    this.#search.current = this.#search.current + key;
    const currentItem = this.#getCurrentItem()();
    const currentMatch = candidates.find((item) => item === currentItem)?.textContent?.trim() ?? "";
    const values = candidates.map((item) => item.textContent?.trim() ?? "");
    const nextMatch = getNextMatch(values, this.#search.current, currentMatch);
    const newItem = candidates.find((item) => item.textContent?.trim() === nextMatch);
    if (newItem) this.#onMatch()(newItem);
    return newItem;
  }
  resetTypeahead() {
    this.#search.current = "";
  }
  get search() {
    return this.#search.current;
  }
}
const FIRST_KEYS$1 = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS$1 = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS$1 = [...FIRST_KEYS$1, ...LAST_KEYS$1];
const selectAttrs = createBitsAttrs({
  component: "select",
  parts: [
    "trigger",
    "content",
    "item",
    "viewport",
    "scroll-up-button",
    "scroll-down-button",
    "group",
    "group-label",
    "separator",
    "arrow",
    "input",
    "content-wrapper",
    "item-text",
    "value"
  ]
});
const SelectRootContext = new Context("Select.Root | Combobox.Root");
const SelectContentContext = new Context("Select.Content | Combobox.Content");
class SelectBaseRootState {
  opts;
  touchedInput = false;
  inputNode = null;
  contentNode = null;
  triggerNode = null;
  valueId = "";
  highlightedNode = null;
  #highlightedValue = derived$1(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-value");
  });
  get highlightedValue() {
    return this.#highlightedValue();
  }
  set highlightedValue($$value) {
    return this.#highlightedValue($$value);
  }
  #highlightedId = derived$1(() => {
    if (!this.highlightedNode) return void 0;
    return this.highlightedNode.id;
  });
  get highlightedId() {
    return this.#highlightedId();
  }
  set highlightedId($$value) {
    return this.#highlightedId($$value);
  }
  #highlightedLabel = derived$1(() => {
    if (!this.highlightedNode) return null;
    return this.highlightedNode.getAttribute("data-label");
  });
  get highlightedLabel() {
    return this.#highlightedLabel();
  }
  set highlightedLabel($$value) {
    return this.#highlightedLabel($$value);
  }
  isUsingKeyboard = false;
  isCombobox = false;
  domContext = new DOMContext(() => null);
  constructor(opts) {
    this.opts = opts;
    this.isCombobox = opts.isCombobox;
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
  }
  #debouncedSetHighlightedToFirstCandidate = debounce(this.setHighlightedToFirstCandidate.bind(this), 20);
  setHighlightedNode(node, initial = false) {
    this.highlightedNode = node;
    if (node && (this.isUsingKeyboard || initial)) {
      node.scrollIntoView({ block: this.opts.scrollAlignment.current });
    }
  }
  getCandidateNodes() {
    const node = this.contentNode;
    if (!node) return [];
    return Array.from(node.querySelectorAll(`[${this.getBitsAttr("item")}]:not([data-disabled])`));
  }
  setHighlightedToFirstCandidate(options = { debounced: false }) {
    if (options.debounced) {
      this.#debouncedSetHighlightedToFirstCandidate();
      return;
    }
    this.setHighlightedNode(null);
    const candidateNodes = this.getCandidateNodes();
    if (!candidateNodes.length) return;
    this.setHighlightedNode(candidateNodes[0]);
  }
  getNodeByValue(value) {
    const candidateNodes = this.getCandidateNodes();
    return candidateNodes.find((node) => node.dataset.value === value) ?? null;
  }
  setOpen(open) {
    this.opts.open.current = open;
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  handleOpen() {
    this.setOpen(true);
  }
  handleClose() {
    this.setHighlightedNode(null);
    this.setOpen(false);
  }
  toggleMenu() {
    this.toggleOpen();
  }
  getBitsAttr = (part) => {
    return selectAttrs.getAttr(part, this.isCombobox ? "combobox" : void 0);
  };
}
class SelectSingleRootState extends SelectBaseRootState {
  opts;
  isMulti = false;
  #hasValue = derived$1(() => this.opts.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  set hasValue($$value) {
    return this.#hasValue($$value);
  }
  #currentLabel = derived$1(() => {
    if (!this.opts.items.current.length) return "";
    const match = this.opts.items.current.find((item) => item.value === this.opts.value.current)?.label;
    return match ?? "";
  });
  get currentLabel() {
    return this.#currentLabel();
  }
  set currentLabel($$value) {
    return this.#currentLabel($$value);
  }
  #candidateLabels = derived$1(() => {
    if (!this.opts.items.current.length) return [];
    const filteredItems = this.opts.items.current.filter((item) => !item.disabled);
    return filteredItems.map((item) => item.label);
  });
  get candidateLabels() {
    return this.#candidateLabels();
  }
  set candidateLabels($$value) {
    return this.#candidateLabels($$value);
  }
  #dataTypeaheadEnabled = derived$1(() => {
    if (this.isMulti) return false;
    if (this.opts.items.current.length === 0) return false;
    return true;
  });
  get dataTypeaheadEnabled() {
    return this.#dataTypeaheadEnabled();
  }
  set dataTypeaheadEnabled($$value) {
    return this.#dataTypeaheadEnabled($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current === itemValue;
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    this.opts.value.current = this.includesItem(itemValue) ? "" : itemValue;
    this.opts.inputValue.current = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
      if (this.opts.value.current !== "") {
        const node = this.getNodeByValue(this.opts.value.current);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectMultipleRootState extends SelectBaseRootState {
  opts;
  isMulti = true;
  #hasValue = derived$1(() => this.opts.value.current.length > 0);
  get hasValue() {
    return this.#hasValue();
  }
  set hasValue($$value) {
    return this.#hasValue($$value);
  }
  constructor(opts) {
    super(opts);
    this.opts = opts;
    watch(() => this.opts.open.current, () => {
      if (!this.opts.open.current) return;
      this.setInitialHighlightedNode();
    });
  }
  includesItem(itemValue) {
    return this.opts.value.current.includes(itemValue);
  }
  toggleItem(itemValue, itemLabel = itemValue) {
    if (this.includesItem(itemValue)) {
      this.opts.value.current = this.opts.value.current.filter((v) => v !== itemValue);
    } else {
      this.opts.value.current = [...this.opts.value.current, itemValue];
    }
    this.opts.inputValue.current = itemLabel;
  }
  setInitialHighlightedNode() {
    afterTick(() => {
      if (!this.domContext) return;
      if (this.highlightedNode && this.domContext.getDocument().contains(this.highlightedNode)) return;
      if (this.opts.value.current.length && this.opts.value.current[0] !== "") {
        const node = this.getNodeByValue(this.opts.value.current[0]);
        if (node) {
          this.setHighlightedNode(node, true);
          return;
        }
      }
      const firstCandidate = this.getCandidateNodes()[0];
      if (!firstCandidate) return;
      this.setHighlightedNode(firstCandidate, true);
    });
  }
}
class SelectRootState {
  static create(props) {
    const { type, ...rest } = props;
    const rootState = type === "single" ? new SelectSingleRootState(rest) : new SelectMultipleRootState(rest);
    return SelectRootContext.set(rootState);
  }
}
class SelectTriggerState {
  static create(opts) {
    return new SelectTriggerState(opts, SelectRootContext.get());
  }
  opts;
  root;
  attachment;
  #domTypeahead;
  #dataTypeahead;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref, (v) => this.root.triggerNode = v);
    this.root.domContext = new DOMContext(opts.ref);
    this.#domTypeahead = new DOMTypeahead({
      getCurrentItem: () => this.root.highlightedNode,
      onMatch: (node) => {
        this.root.setHighlightedNode(node);
      },
      getActiveElement: () => this.root.domContext.getActiveElement(),
      getWindow: () => this.root.domContext.getWindow()
    });
    this.#dataTypeahead = new DataTypeahead({
      getCurrentItem: () => {
        if (this.root.isMulti) return "";
        return this.root.currentLabel;
      },
      onMatch: (label) => {
        if (this.root.isMulti) return;
        if (!this.root.opts.items.current) return;
        const matchedItem = this.root.opts.items.current.find((item) => item.label === label);
        if (!matchedItem) return;
        this.root.opts.value.current = matchedItem.value;
      },
      enabled: () => !this.root.isMulti && this.root.dataTypeaheadEnabled,
      candidateValues: () => this.root.isMulti ? [] : this.root.candidateLabels,
      getWindow: () => this.root.domContext.getWindow()
    });
    this.onkeydown = this.onkeydown.bind(this);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onclick = this.onclick.bind(this);
  }
  #handleOpen() {
    this.root.opts.open.current = true;
    this.#dataTypeahead.resetTypeahead();
    this.#domTypeahead.resetTypeahead();
  }
  #handlePointerOpen(_) {
    this.#handleOpen();
  }
  /**
   * Logic used to handle keyboard selection/deselection.
   *
   * If it returns true, it means the item was selected and whatever is calling
   * this function should return early
   *
   */
  #handleKeyboardSelection() {
    const isCurrentSelectedValue = this.root.highlightedValue === this.root.opts.value.current;
    if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return true;
    }
    if (this.root.highlightedValue !== null) {
      this.root.toggleItem(this.root.highlightedValue, this.root.highlightedLabel ?? void 0);
    }
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
      return true;
    }
    return false;
  }
  onkeydown(e) {
    this.root.isUsingKeyboard = true;
    if (e.key === ARROW_UP || e.key === ARROW_DOWN) e.preventDefault();
    if (!this.root.opts.open.current) {
      if (e.key === ENTER || e.key === SPACE || e.key === ARROW_DOWN || e.key === ARROW_UP) {
        e.preventDefault();
        this.root.handleOpen();
      } else if (!this.root.isMulti && this.root.dataTypeaheadEnabled) {
        this.#dataTypeahead.handleTypeaheadSearch(e.key);
        return;
      }
      if (this.root.hasValue) return;
      const candidateNodes2 = this.root.getCandidateNodes();
      if (!candidateNodes2.length) return;
      if (e.key === ARROW_DOWN) {
        const firstCandidate = candidateNodes2[0];
        this.root.setHighlightedNode(firstCandidate);
      } else if (e.key === ARROW_UP) {
        const lastCandidate = candidateNodes2[candidateNodes2.length - 1];
        this.root.setHighlightedNode(lastCandidate);
      }
      return;
    }
    if (e.key === TAB) {
      this.root.handleClose();
      return;
    }
    if ((e.key === ENTER || // if we're currently "typing ahead", we don't want to select the item
    // just yet as the item the user is trying to get to may have a space in it,
    // so we defer handling the close for this case until further down
    e.key === SPACE && this.#domTypeahead.search === "") && !e.isComposing) {
      e.preventDefault();
      const shouldReturn = this.#handleKeyboardSelection();
      if (shouldReturn) return;
    }
    if (e.key === ARROW_UP && e.altKey) {
      this.root.handleClose();
    }
    if (FIRST_LAST_KEYS$1.includes(e.key)) {
      e.preventDefault();
      const candidateNodes2 = this.root.getCandidateNodes();
      const currHighlightedNode = this.root.highlightedNode;
      const currIndex = currHighlightedNode ? candidateNodes2.indexOf(currHighlightedNode) : -1;
      const loop = this.root.opts.loop.current;
      let nextItem;
      if (e.key === ARROW_DOWN) {
        nextItem = next(candidateNodes2, currIndex, loop);
      } else if (e.key === ARROW_UP) {
        nextItem = prev(candidateNodes2, currIndex, loop);
      } else if (e.key === PAGE_DOWN) {
        nextItem = forward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === PAGE_UP) {
        nextItem = backward(candidateNodes2, currIndex, 10, loop);
      } else if (e.key === HOME) {
        nextItem = candidateNodes2[0];
      } else if (e.key === END) {
        nextItem = candidateNodes2[candidateNodes2.length - 1];
      }
      if (!nextItem) return;
      this.root.setHighlightedNode(nextItem);
      return;
    }
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    const isSpaceKey = e.key === SPACE;
    const candidateNodes = this.root.getCandidateNodes();
    if (e.key === TAB) return;
    if (!isModifierKey && (isCharacterKey || isSpaceKey)) {
      const matchedNode = this.#domTypeahead.handleTypeaheadSearch(e.key, candidateNodes);
      if (!matchedNode && isSpaceKey) {
        e.preventDefault();
        this.#handleKeyboardSelection();
      }
      return;
    }
    if (!this.root.highlightedNode) {
      this.root.setHighlightedToFirstCandidate();
    }
  }
  onclick(e) {
    const currTarget = e.currentTarget;
    currTarget.focus();
  }
  onpointerdown(e) {
    if (this.root.opts.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    const target = e.target;
    if (target?.hasPointerCapture(e.pointerId)) {
      target?.releasePointerCapture(e.pointerId);
    }
    if (e.button === 0 && e.ctrlKey === false) {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  onpointerup(e) {
    if (this.root.opts.disabled.current) return;
    e.preventDefault();
    if (e.pointerType === "touch") {
      if (this.root.opts.open.current === false) {
        this.#handlePointerOpen(e);
      } else {
        this.root.handleClose();
      }
    }
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    disabled: this.root.opts.disabled.current ? true : void 0,
    "aria-haspopup": "listbox",
    "aria-expanded": getAriaExpanded(this.root.opts.open.current),
    "aria-activedescendant": this.root.highlightedId,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    "data-disabled": getDataDisabled(this.root.opts.disabled.current),
    "data-placeholder": this.root.hasValue ? void 0 : "",
    [this.root.getBitsAttr("trigger")]: "",
    onpointerdown: this.onpointerdown,
    onkeydown: this.onkeydown,
    onclick: this.onclick,
    onpointerup: this.onpointerup,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectContentState {
  static create(opts) {
    return SelectContentContext.set(new SelectContentState(opts, SelectRootContext.get()));
  }
  opts;
  root;
  attachment;
  viewportNode = null;
  isPositioned = false;
  domContext;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref, (v) => this.root.contentNode = v);
    this.domContext = new DOMContext(this.opts.ref);
    if (this.root.domContext === null) {
      this.root.domContext = this.domContext;
    }
    watch(() => this.root.opts.open.current, () => {
      if (this.root.opts.open.current) return;
      this.isPositioned = false;
    });
    this.onpointermove = this.onpointermove.bind(this);
  }
  onpointermove(_) {
    this.root.isUsingKeyboard = false;
  }
  #styles = derived$1(() => {
    return getFloatingContentCSSVars(this.root.isCombobox ? "combobox" : "select");
  });
  onInteractOutside = (e) => {
    if (e.target === this.root.triggerNode || e.target === this.root.inputNode) {
      e.preventDefault();
      return;
    }
    this.opts.onInteractOutside.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onEscapeKeydown = (e) => {
    this.opts.onEscapeKeydown.current(e);
    if (e.defaultPrevented) return;
    this.root.handleClose();
  };
  onOpenAutoFocus = (e) => {
    e.preventDefault();
  };
  onCloseAutoFocus = (e) => {
    e.preventDefault();
  };
  #snippetProps = derived$1(() => ({ open: this.root.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "listbox",
    "aria-multiselectable": this.root.isMulti ? "true" : void 0,
    "data-state": getDataOpenClosed(this.root.opts.open.current),
    [this.root.getBitsAttr("content")]: "",
    style: {
      display: "flex",
      flexDirection: "column",
      outline: "none",
      boxSizing: "border-box",
      pointerEvents: "auto",
      ...this.#styles()
    },
    onpointermove: this.onpointermove,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = {
    onInteractOutside: this.onInteractOutside,
    onEscapeKeydown: this.onEscapeKeydown,
    onOpenAutoFocus: this.onOpenAutoFocus,
    onCloseAutoFocus: this.onCloseAutoFocus,
    trapFocus: false,
    loop: false,
    onPlaced: () => {
      if (this.root.opts.open.current) {
        this.isPositioned = true;
      }
    }
  };
}
class SelectItemState {
  static create(opts) {
    return new SelectItemState(opts, SelectRootContext.get());
  }
  opts;
  root;
  attachment;
  #isSelected = derived$1(() => this.root.includesItem(this.opts.value.current));
  get isSelected() {
    return this.#isSelected();
  }
  set isSelected($$value) {
    return this.#isSelected($$value);
  }
  #isHighlighted = derived$1(() => this.root.highlightedValue === this.opts.value.current);
  get isHighlighted() {
    return this.#isHighlighted();
  }
  set isHighlighted($$value) {
    return this.#isHighlighted($$value);
  }
  prevHighlighted = new Previous(() => this.isHighlighted);
  mounted = false;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(opts.ref);
    watch([() => this.isHighlighted, () => this.prevHighlighted.current], () => {
      if (this.isHighlighted) {
        this.opts.onHighlight.current();
      } else if (this.prevHighlighted.current) {
        this.opts.onUnhighlight.current();
      }
    });
    watch(() => this.mounted, () => {
      if (!this.mounted) return;
      this.root.setInitialHighlightedNode();
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
  }
  handleSelect() {
    if (this.opts.disabled.current) return;
    const isCurrentSelectedValue = this.opts.value.current === this.root.opts.value.current;
    if (!this.root.opts.allowDeselect.current && isCurrentSelectedValue && !this.root.isMulti) {
      this.root.handleClose();
      return;
    }
    this.root.toggleItem(this.opts.value.current, this.opts.label.current);
    if (!this.root.isMulti && !isCurrentSelectedValue) {
      this.root.handleClose();
    }
  }
  #snippetProps = derived$1(() => ({ selected: this.isSelected, highlighted: this.isHighlighted }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  onpointerdown(e) {
    e.preventDefault();
  }
  /**
   * Using `pointerup` instead of `click` allows power users to pointerdown
   * the trigger, then release pointerup on an item to select it vs having to do
   * multiple clicks.
   */
  onpointerup(e) {
    if (e.defaultPrevented || !this.opts.ref.current) return;
    if (e.pointerType === "touch" && !isIOS) {
      on(
        this.opts.ref.current,
        "click",
        () => {
          this.handleSelect();
          this.root.setHighlightedNode(this.opts.ref.current);
        },
        { once: true }
      );
      return;
    }
    e.preventDefault();
    this.handleSelect();
    if (e.pointerType === "touch") {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  onpointermove(e) {
    if (e.pointerType === "touch") return;
    if (this.root.highlightedNode !== this.opts.ref.current) {
      this.root.setHighlightedNode(this.opts.ref.current);
    }
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "option",
    "aria-selected": this.root.includesItem(this.opts.value.current) ? "true" : void 0,
    "data-value": this.opts.value.current,
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-highlighted": this.root.highlightedValue === this.opts.value.current && !this.opts.disabled.current ? "" : void 0,
    "data-selected": this.root.includesItem(this.opts.value.current) ? "" : void 0,
    "data-label": this.opts.label.current,
    [this.root.getBitsAttr("item")]: "",
    onpointermove: this.onpointermove,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectHiddenInputState {
  static create(opts) {
    return new SelectHiddenInputState(opts, SelectRootContext.get());
  }
  opts;
  root;
  #shouldRender = derived$1(() => this.root.opts.name.current !== "");
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.onfocus = this.onfocus.bind(this);
  }
  onfocus(e) {
    e.preventDefault();
    if (!this.root.isCombobox) {
      this.root.triggerNode?.focus();
    } else {
      this.root.inputNode?.focus();
    }
  }
  #props = derived$1(() => ({
    disabled: getDisabled(this.root.opts.disabled.current),
    required: getRequired(this.root.opts.required.current),
    name: this.root.opts.name.current,
    value: this.opts.value.current,
    onfocus: this.onfocus
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectViewportState {
  static create(opts) {
    return new SelectViewportState(opts, SelectContentContext.get());
  }
  opts;
  content;
  root;
  attachment;
  prevScrollTop = 0;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    this.attachment = attachRef(opts.ref, (v) => this.content.viewportNode = v);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "presentation",
    [this.root.getBitsAttr("viewport")]: "",
    style: {
      // we use position: 'relative' here on the `viewport` so that when we call
      // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
      // (independent of the scrollUpButton).
      position: "relative",
      flex: 1,
      overflow: "auto"
    },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollButtonImplState {
  opts;
  content;
  root;
  attachment;
  autoScrollTimer = null;
  userScrollTimer = -1;
  isUserScrolling = false;
  onAutoScroll = noop;
  mounted = false;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.root = content.root;
    this.attachment = attachRef(opts.ref);
    watch([() => this.mounted], () => {
      if (!this.mounted) {
        this.isUserScrolling = false;
        return;
      }
      if (this.isUserScrolling) return;
    });
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
  }
  handleUserScroll() {
    this.content.domContext.clearTimeout(this.userScrollTimer);
    this.isUserScrolling = true;
    this.userScrollTimer = this.content.domContext.setTimeout(
      () => {
        this.isUserScrolling = false;
      },
      200
    );
  }
  clearAutoScrollInterval() {
    if (this.autoScrollTimer === null) return;
    this.content.domContext.clearTimeout(this.autoScrollTimer);
    this.autoScrollTimer = null;
  }
  onpointerdown(_) {
    if (this.autoScrollTimer !== null) return;
    const autoScroll = (tick2) => {
      this.onAutoScroll();
      this.autoScrollTimer = this.content.domContext.setTimeout(() => autoScroll(tick2 + 1), this.opts.delay.current(tick2));
    };
    this.autoScrollTimer = this.content.domContext.setTimeout(() => autoScroll(1), this.opts.delay.current(0));
  }
  onpointermove(e) {
    this.onpointerdown(e);
  }
  onpointerleave(_) {
    this.clearAutoScrollInterval();
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    "aria-hidden": getAriaHidden(true),
    style: { flexShrink: 0 },
    onpointerdown: this.onpointerdown,
    onpointermove: this.onpointermove,
    onpointerleave: this.onpointerleave,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollDownButtonState {
  static create(opts) {
    return new SelectScrollDownButtonState(new SelectScrollButtonImplState(opts, SelectContentContext.get()));
  }
  scrollButtonState;
  content;
  root;
  canScrollDown = false;
  scrollIntoViewTimer = null;
  constructor(scrollButtonState) {
    this.scrollButtonState = scrollButtonState;
    this.content = scrollButtonState.content;
    this.root = scrollButtonState.root;
    this.scrollButtonState.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) return;
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
    watch(() => this.scrollButtonState.mounted, () => {
      if (!this.scrollButtonState.mounted) return;
      if (this.scrollIntoViewTimer) {
        clearTimeout(this.scrollIntoViewTimer);
      }
      this.scrollIntoViewTimer = afterSleep(5, () => {
        const activeItem = this.root.highlightedNode;
        activeItem?.scrollIntoView({ block: this.root.opts.scrollAlignment.current });
      });
    });
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.scrollButtonState.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const maxScroll = this.content.viewportNode.scrollHeight - this.content.viewportNode.clientHeight;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollDown = Math.ceil(this.content.viewportNode.scrollTop) < maxScroll - paddingTop;
  };
  handleAutoScroll = () => {
    const viewport = this.content.viewportNode;
    const selectedItem = this.root.highlightedNode;
    if (!viewport || !selectedItem) return;
    viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
  };
  #props = derived$1(() => ({
    ...this.scrollButtonState.props,
    [this.root.getBitsAttr("scroll-down-button")]: ""
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class SelectScrollUpButtonState {
  static create(opts) {
    return new SelectScrollUpButtonState(new SelectScrollButtonImplState(opts, SelectContentContext.get()));
  }
  scrollButtonState;
  content;
  root;
  canScrollUp = false;
  constructor(scrollButtonState) {
    this.scrollButtonState = scrollButtonState;
    this.content = scrollButtonState.content;
    this.root = scrollButtonState.root;
    this.scrollButtonState.onAutoScroll = this.handleAutoScroll;
    watch(
      [
        () => this.content.viewportNode,
        () => this.content.isPositioned
      ],
      () => {
        if (!this.content.viewportNode || !this.content.isPositioned) return;
        this.handleScroll(true);
        return on(this.content.viewportNode, "scroll", () => this.handleScroll());
      }
    );
  }
  /**
   * @param manual - if true, it means the function was invoked manually outside of an event
   * listener, so we don't call `handleUserScroll` to prevent the auto scroll from kicking in.
   */
  handleScroll = (manual = false) => {
    if (!manual) {
      this.scrollButtonState.handleUserScroll();
    }
    if (!this.content.viewportNode) return;
    const paddingTop = Number.parseInt(getComputedStyle(this.content.viewportNode).paddingTop, 10);
    this.canScrollUp = this.content.viewportNode.scrollTop - paddingTop > 0.1;
  };
  handleAutoScroll = () => {
    if (!this.content.viewportNode || !this.root.highlightedNode) return;
    this.content.viewportNode.scrollTop = this.content.viewportNode.scrollTop - this.root.highlightedNode.offsetHeight;
  };
  #props = derived$1(() => ({
    ...this.scrollButtonState.props,
    [this.root.getBitsAttr("scroll-up-button")]: ""
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Select_hidden_input($$payload, $$props) {
  push();
  let { value = "", autocomplete } = $$props;
  const hiddenInputState = SelectHiddenInputState.create({ value: box.with(() => value) });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (hiddenInputState.shouldRender) {
      $$payload2.out.push("<!--[-->");
      Hidden_input($$payload2, spread_props([
        hiddenInputState.props,
        {
          autocomplete,
          get value() {
            return value;
          },
          set value($$value) {
            value = $$value;
            $$settled = false;
          }
        }
      ]));
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value });
  pop();
}
function Floating_layer_anchor($$payload, $$props) {
  push();
  let { id, children, virtualEl, ref, tooltip = false } = $$props;
  FloatingAnchorState.create(
    {
      id: box.with(() => id),
      virtualEl: box.with(() => virtualEl),
      ref
    },
    tooltip
  );
  children?.($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
function Floating_layer_content($$payload, $$props) {
  push();
  let {
    content,
    side = "bottom",
    sideOffset = 0,
    align = "center",
    alignOffset = 0,
    id,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 0,
    hideWhenDetached = false,
    onPlaced = () => {
    },
    sticky = "partial",
    updatePositionStrategy = "optimized",
    strategy = "fixed",
    dir = "ltr",
    style = {},
    wrapperId = useId(),
    customAnchor = null,
    enabled,
    tooltip = false
  } = $$props;
  const contentState = FloatingContentState.create(
    {
      side: box.with(() => side),
      sideOffset: box.with(() => sideOffset),
      align: box.with(() => align),
      alignOffset: box.with(() => alignOffset),
      id: box.with(() => id),
      arrowPadding: box.with(() => arrowPadding),
      avoidCollisions: box.with(() => avoidCollisions),
      collisionBoundary: box.with(() => collisionBoundary),
      collisionPadding: box.with(() => collisionPadding),
      hideWhenDetached: box.with(() => hideWhenDetached),
      onPlaced: box.with(() => onPlaced),
      sticky: box.with(() => sticky),
      updatePositionStrategy: box.with(() => updatePositionStrategy),
      strategy: box.with(() => strategy),
      dir: box.with(() => dir),
      style: box.with(() => style),
      enabled: box.with(() => enabled),
      wrapperId: box.with(() => wrapperId),
      customAnchor: box.with(() => customAnchor)
    },
    tooltip
  );
  const mergedProps = mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } });
  content?.($$payload, { props: contentState.props, wrapperProps: mergedProps });
  $$payload.out.push(`<!---->`);
  pop();
}
function Floating_layer_content_static($$payload, $$props) {
  push();
  let { content } = $$props;
  content?.($$payload, { props: {}, wrapperProps: {} });
  $$payload.out.push(`<!---->`);
  pop();
}
const separatorAttrs = createBitsAttrs({ component: "separator", parts: ["root"] });
class SeparatorRootState {
  static create(opts) {
    return new SeparatorRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(opts.ref);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: this.opts.decorative.current ? "none" : "separator",
    "aria-orientation": getAriaOrientation(this.opts.orientation.current),
    "aria-hidden": getAriaHidden(this.opts.decorative.current),
    "data-orientation": getDataOrientation(this.opts.orientation.current),
    [separatorAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Separator$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    decorative = false,
    orientation = "horizontal",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = SeparatorRootState.create({
    ref: box.with(() => ref, (v) => ref = v),
    id: box.with(() => id),
    decorative: box.with(() => decorative),
    orientation: box.with(() => orientation)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Popper_content($$payload, $$props) {
  let {
    content,
    isStatic = false,
    onPlaced,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (isStatic) {
    $$payload.out.push("<!--[-->");
    Floating_layer_content_static($$payload, { content });
  } else {
    $$payload.out.push("<!--[!-->");
    Floating_layer_content($$payload, spread_props([{ content, onPlaced }, restProps]));
  }
  $$payload.out.push(`<!--]-->`);
}
function Popper_layer_inner($$payload, $$props) {
  push();
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    ref,
    tooltip = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let content = function($$payload2, { props: floatingProps, wrapperProps }) {
      if (restProps.forceMount && enabled) {
        $$payload2.out.push("<!--[-->");
        Scroll_lock($$payload2, { preventScroll });
      } else {
        $$payload2.out.push("<!--[!-->");
        if (!restProps.forceMount) {
          $$payload2.out.push("<!--[-->");
          Scroll_lock($$payload2, { preventScroll });
        } else {
          $$payload2.out.push("<!--[!-->");
        }
        $$payload2.out.push(`<!--]-->`);
      }
      $$payload2.out.push(`<!--]--> `);
      {
        let focusScope = function($$payload3, { props: focusScopeProps }) {
          Escape_layer($$payload3, {
            onEscapeKeydown,
            escapeKeydownBehavior,
            enabled,
            ref,
            children: ($$payload4) => {
              {
                let children = function($$payload5, { props: dismissibleProps }) {
                  Text_selection_layer($$payload5, {
                    id,
                    preventOverflowTextSelection,
                    onPointerDown,
                    onPointerUp,
                    enabled,
                    ref,
                    children: ($$payload6) => {
                      popper?.($$payload6, {
                        props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: "auto" } }),
                        wrapperProps
                      });
                      $$payload6.out.push(`<!---->`);
                    }
                  });
                };
                Dismissible_layer($$payload4, {
                  id,
                  onInteractOutside,
                  onFocusOutside,
                  interactOutsideBehavior,
                  isValidEvent: isValidEvent2,
                  enabled,
                  ref,
                  children
                });
              }
            }
          });
        };
        Focus_scope($$payload2, {
          onOpenAutoFocus,
          onCloseAutoFocus,
          loop,
          enabled,
          trapFocus,
          forceMount: restProps.forceMount,
          ref,
          focusScope
        });
      }
      $$payload2.out.push(`<!---->`);
    };
    Popper_content($$payload, {
      isStatic,
      id,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      enabled,
      tooltip,
      content,
      $$slots: { content: true }
    });
  }
  pop();
}
function Popper_layer($$payload, $$props) {
  let {
    popper,
    open,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    ref,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  {
    let presence = function($$payload2) {
      Popper_layer_inner($$payload2, spread_props([
        {
          popper,
          onEscapeKeydown,
          escapeKeydownBehavior,
          preventOverflowTextSelection,
          id,
          onPointerDown,
          onPointerUp,
          side,
          sideOffset,
          align,
          alignOffset,
          arrowPadding,
          avoidCollisions,
          collisionBoundary,
          collisionPadding,
          sticky,
          hideWhenDetached,
          updatePositionStrategy,
          strategy,
          dir,
          preventScroll,
          wrapperId,
          style,
          onPlaced,
          customAnchor,
          isStatic,
          enabled: open,
          onInteractOutside,
          onCloseAutoFocus,
          onOpenAutoFocus,
          interactOutsideBehavior,
          loop,
          trapFocus,
          isValidEvent: isValidEvent2,
          onFocusOutside,
          forceMount: false,
          ref
        },
        restProps
      ]));
    };
    Presence_layer($$payload, { open, ref, presence });
  }
}
function Popper_layer_force_mount($$payload, $$props) {
  let {
    popper,
    onEscapeKeydown,
    escapeKeydownBehavior,
    preventOverflowTextSelection,
    id,
    onPointerDown,
    onPointerUp,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    sticky,
    hideWhenDetached,
    updatePositionStrategy,
    strategy,
    dir,
    preventScroll,
    wrapperId,
    style,
    onPlaced,
    onInteractOutside,
    onCloseAutoFocus,
    onOpenAutoFocus,
    onFocusOutside,
    interactOutsideBehavior = "close",
    loop,
    trapFocus = true,
    isValidEvent: isValidEvent2 = () => false,
    customAnchor = null,
    isStatic = false,
    enabled,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  Popper_layer_inner($$payload, spread_props([
    {
      popper,
      onEscapeKeydown,
      escapeKeydownBehavior,
      preventOverflowTextSelection,
      id,
      onPointerDown,
      onPointerUp,
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      updatePositionStrategy,
      strategy,
      dir,
      preventScroll,
      wrapperId,
      style,
      onPlaced,
      customAnchor,
      isStatic,
      enabled,
      onInteractOutside,
      onCloseAutoFocus,
      onOpenAutoFocus,
      interactOutsideBehavior,
      loop,
      trapFocus,
      isValidEvent: isValidEvent2,
      onFocusOutside
    },
    restProps,
    { forceMount: true }
  ]));
}
function Select_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    forceMount = false,
    side = "bottom",
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    children,
    child,
    preventScroll = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = SelectContentState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    onInteractOutside: box.with(() => onInteractOutside),
    onEscapeKeydown: box.with(() => onEscapeKeydown)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  if (forceMount) {
    $$payload.out.push("<!--[-->");
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: contentState.props.style });
        if (child) {
          $$payload2.out.push("<!--[-->");
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out.push(`<!---->`);
        } else {
          $$payload2.out.push("<!--[!-->");
          $$payload2.out.push(`<div${spread_attributes({ ...wrapperProps })}><div${spread_attributes({ ...finalProps })}>`);
          children?.($$payload2);
          $$payload2.out.push(`<!----></div></div>`);
        }
        $$payload2.out.push(`<!--]-->`);
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          side,
          enabled: contentState.root.opts.open.current,
          id,
          preventScroll,
          forceMount: true,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out.push("<!--[!-->");
    if (!forceMount) {
      $$payload.out.push("<!--[-->");
      {
        let popper = function($$payload2, { props, wrapperProps }) {
          const finalProps = mergeProps(props, { style: contentState.props.style });
          if (child) {
            $$payload2.out.push("<!--[-->");
            child($$payload2, {
              props: finalProps,
              wrapperProps,
              ...contentState.snippetProps
            });
            $$payload2.out.push(`<!---->`);
          } else {
            $$payload2.out.push("<!--[!-->");
            $$payload2.out.push(`<div${spread_attributes({ ...wrapperProps })}><div${spread_attributes({ ...finalProps })}>`);
            children?.($$payload2);
            $$payload2.out.push(`<!----></div></div>`);
          }
          $$payload2.out.push(`<!--]-->`);
        };
        Popper_layer($$payload, spread_props([
          mergedProps,
          contentState.popperProps,
          {
            ref: contentState.opts.ref,
            side,
            open: contentState.root.opts.open.current,
            id,
            preventScroll,
            forceMount: false,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Mounted($$payload, $$props) {
  push();
  let { mounted = false, onMountedChange = noop } = $$props;
  bind_props($$props, { mounted });
  pop();
}
function Select_item$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    value,
    label = value,
    disabled = false,
    children,
    child,
    onHighlight = noop,
    onUnhighlight = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = SelectItemState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    value: box.with(() => value),
    disabled: box.with(() => disabled),
    label: box.with(() => label),
    onHighlight: box.with(() => onHighlight),
    onUnhighlight: box.with(() => onUnhighlight)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (child) {
      $$payload2.out.push("<!--[-->");
      child($$payload2, { props: mergedProps, ...itemState.snippetProps });
      $$payload2.out.push(`<!---->`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
      children?.($$payload2, itemState.snippetProps);
      $$payload2.out.push(`<!----></div>`);
    }
    $$payload2.out.push(`<!--]--> `);
    Mounted($$payload2, {
      get mounted() {
        return itemState.mounted;
      },
      set mounted($$value) {
        itemState.mounted = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_viewport($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    children,
    child,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const viewportState = SelectViewportState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, viewportState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_down_button$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    delay = () => 50,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = SelectScrollDownButtonState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    delay: box.with(() => delay)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollDown) {
      $$payload2.out.push("<!--[-->");
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.scrollButtonState.mounted;
        },
        set mounted($$value) {
          scrollButtonState.scrollButtonState.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out.push(`<!----> `);
      if (child) {
        $$payload2.out.push("<!--[-->");
        child($$payload2, { props: restProps });
        $$payload2.out.push(`<!---->`);
      } else {
        $$payload2.out.push("<!--[!-->");
        $$payload2.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
        children?.($$payload2);
        $$payload2.out.push(`<!----></div>`);
      }
      $$payload2.out.push(`<!--]-->`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_scroll_up_button$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    delay = () => 50,
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const scrollButtonState = SelectScrollUpButtonState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v),
    delay: box.with(() => delay)
  });
  const mergedProps = mergeProps(restProps, scrollButtonState.props);
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (scrollButtonState.canScrollUp) {
      $$payload2.out.push("<!--[-->");
      Mounted($$payload2, {
        get mounted() {
          return scrollButtonState.scrollButtonState.mounted;
        },
        set mounted($$value) {
          scrollButtonState.scrollButtonState.mounted = $$value;
          $$settled = false;
        }
      });
      $$payload2.out.push(`<!----> `);
      if (child) {
        $$payload2.out.push("<!--[-->");
        child($$payload2, { props: restProps });
        $$payload2.out.push(`<!---->`);
      } else {
        $$payload2.out.push("<!--[!-->");
        $$payload2.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
        children?.($$payload2);
        $$payload2.out.push(`<!----></div>`);
      }
      $$payload2.out.push(`<!--]-->`);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const SELECTION_KEYS = [ENTER, SPACE];
const FIRST_KEYS = [ARROW_DOWN, PAGE_UP, HOME];
const LAST_KEYS = [ARROW_UP, PAGE_DOWN, END];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
function isMouseEvent(event) {
  return event.pointerType === "mouse";
}
function focus(element2, { select = false } = {}) {
  if (!element2 || !element2.focus)
    return;
  const doc = getDocument(element2);
  if (doc.activeElement === element2)
    return;
  const previouslyFocusedElement = doc.activeElement;
  element2.focus({ preventScroll: true });
  if (element2 !== previouslyFocusedElement && isSelectableInput(element2) && select) {
    element2.select();
  }
}
function focusFirst(candidates, { select = false } = {}, getActiveElement2) {
  const previouslyFocusedElement = getActiveElement2();
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (getActiveElement2() !== previouslyFocusedElement)
      return true;
  }
}
function getTabbableOptions() {
  return {
    getShadowRoot: true,
    displayCheck: (
      // JSDOM does not support the `tabbable` library. To solve this we can
      // check if `ResizeObserver` is a real function (not polyfilled), which
      // determines if the current environment is JSDOM-like.
      typeof ResizeObserver === "function" && ResizeObserver.toString().includes("[native code]") ? "full" : "none"
    )
  };
}
function getTabbableFrom(currentNode, direction) {
  if (!isTabbable(currentNode, getTabbableOptions())) {
    return getTabbableFromFocusable(currentNode, direction);
  }
  const doc = getDocument(currentNode);
  const allTabbable = tabbable(doc.body, getTabbableOptions());
  if (direction === "prev")
    allTabbable.reverse();
  const activeIndex = allTabbable.indexOf(currentNode);
  if (activeIndex === -1)
    return doc.body;
  const nextTabbableElements = allTabbable.slice(activeIndex + 1);
  return nextTabbableElements[0];
}
function getTabbableFromFocusable(currentNode, direction) {
  const doc = getDocument(currentNode);
  if (!isFocusable(currentNode, getTabbableOptions()))
    return doc.body;
  const allFocusable = focusable(doc.body, getTabbableOptions());
  if (direction === "prev")
    allFocusable.reverse();
  const activeIndex = allFocusable.indexOf(currentNode);
  if (activeIndex === -1)
    return doc.body;
  const nextFocusableElements = allFocusable.slice(activeIndex + 1);
  return nextFocusableElements.find((node) => isTabbable(node, getTabbableOptions())) ?? doc.body;
}
class GraceArea {
  #opts;
  #enabled;
  #isPointerInTransit;
  #pointerGraceArea = null;
  constructor(opts) {
    this.#opts = opts;
    this.#enabled = derived$1(() => this.#opts.enabled());
    this.#isPointerInTransit = boxAutoReset(false, {
      afterMs: opts.transitTimeout ?? 300,
      onChange: (value) => {
        if (!this.#enabled()) return;
        this.#opts.setIsPointerInTransit?.(value);
      },
      getWindow: () => getWindow(this.#opts.triggerNode())
    });
    watch([opts.triggerNode, opts.contentNode, opts.enabled], ([triggerNode, contentNode, enabled]) => {
      if (!triggerNode || !contentNode || !enabled) return;
      const handleTriggerLeave = (e) => {
        this.#createGraceArea(e, contentNode);
      };
      const handleContentLeave = (e) => {
        this.#createGraceArea(e, triggerNode);
      };
      return executeCallbacks(on(triggerNode, "pointerleave", handleTriggerLeave), on(contentNode, "pointerleave", handleContentLeave));
    });
    watch(() => this.#pointerGraceArea, () => {
      const handleTrackPointerGrace = (e) => {
        if (!this.#pointerGraceArea) return;
        const target = e.target;
        if (!isElement(target)) return;
        const pointerPosition = { x: e.clientX, y: e.clientY };
        const hasEnteredTarget = opts.triggerNode()?.contains(target) || opts.contentNode()?.contains(target);
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, this.#pointerGraceArea);
        if (hasEnteredTarget) {
          this.#removeGraceArea();
        } else if (isPointerOutsideGraceArea) {
          this.#removeGraceArea();
          opts.onPointerExit();
        }
      };
      const doc = getDocument(opts.triggerNode() ?? opts.contentNode());
      if (!doc) return;
      return on(doc, "pointermove", handleTrackPointerGrace);
    });
  }
  #removeGraceArea() {
    this.#pointerGraceArea = null;
    this.#isPointerInTransit.current = false;
  }
  #createGraceArea(e, hoverTarget) {
    const currentTarget = e.currentTarget;
    if (!isHTMLElement(currentTarget)) return;
    const exitPoint = { x: e.clientX, y: e.clientY };
    const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
    const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
    const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
    const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
    this.#pointerGraceArea = graceArea;
    this.#isPointerInTransit.current = true;
  }
}
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const tipPadding = padding * 1.5;
  switch (exitSide) {
    case "top":
      return [
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x, y: exitPoint.y - tipPadding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      ];
    case "bottom":
      return [
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x, y: exitPoint.y + tipPadding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding }
      ];
    case "left":
      return [
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x - tipPadding, y: exitPoint.y },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      ];
    case "right":
      return [
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + tipPadding, y: exitPoint.y },
        { x: exitPoint.x - padding, y: exitPoint.y + padding }
      ];
  }
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) return upperHull;
  else return upperHull.concat(lowerHull);
}
const MenuRootContext = new Context("Menu.Root");
const MenuMenuContext = new Context("Menu.Root | Menu.Sub");
const MenuContentContext = new Context("Menu.Content");
const MenuOpenEvent = new CustomEventDispatcher("bitsmenuopen", { bubbles: false, cancelable: true });
const menuAttrs = createBitsAttrs({
  component: "menu",
  parts: [
    "trigger",
    "content",
    "sub-trigger",
    "item",
    "group",
    "group-heading",
    "checkbox-group",
    "checkbox-item",
    "radio-group",
    "radio-item",
    "separator",
    "sub-content",
    "arrow"
  ]
});
class MenuRootState {
  static create(opts) {
    const root = new MenuRootState(opts);
    return MenuRootContext.set(root);
  }
  opts;
  isUsingKeyboard = new IsUsingKeyboard();
  ignoreCloseAutoFocus = false;
  isPointerInTransit = false;
  constructor(opts) {
    this.opts = opts;
  }
  getBitsAttr = (part) => {
    return menuAttrs.getAttr(part, this.opts.variant.current);
  };
}
class MenuMenuState {
  static create(opts, root) {
    return MenuMenuContext.set(new MenuMenuState(opts, root, null));
  }
  opts;
  root;
  parentMenu;
  contentId = box.with(() => "");
  contentNode = null;
  triggerNode = null;
  constructor(opts, root, parentMenu) {
    this.opts = opts;
    this.root = root;
    this.parentMenu = parentMenu;
    new OpenChangeComplete({
      ref: box.with(() => this.contentNode),
      open: this.opts.open,
      onComplete: () => {
        this.opts.onOpenChangeComplete.current(this.opts.open.current);
      }
    });
    if (parentMenu) {
      watch(() => parentMenu.opts.open.current, () => {
        if (parentMenu.opts.open.current) return;
        this.opts.open.current = false;
      });
    }
  }
  toggleOpen() {
    this.opts.open.current = !this.opts.open.current;
  }
  onOpen() {
    this.opts.open.current = true;
  }
  onClose() {
    this.opts.open.current = false;
  }
}
class MenuContentState {
  static create(opts) {
    return MenuContentContext.set(new MenuContentState(opts, MenuMenuContext.get()));
  }
  opts;
  parentMenu;
  rovingFocusGroup;
  domContext;
  attachment;
  search = "";
  #timer = 0;
  #handleTypeaheadSearch;
  mounted = false;
  #isSub;
  constructor(opts, parentMenu) {
    this.opts = opts;
    this.parentMenu = parentMenu;
    this.domContext = new DOMContext(opts.ref);
    this.attachment = attachRef(this.opts.ref, (v) => {
      if (this.parentMenu.contentNode !== v) {
        this.parentMenu.contentNode = v;
      }
    });
    parentMenu.contentId = opts.id;
    this.#isSub = opts.isSub ?? false;
    this.onkeydown = this.onkeydown.bind(this);
    this.onblur = this.onblur.bind(this);
    this.onfocus = this.onfocus.bind(this);
    this.handleInteractOutside = this.handleInteractOutside.bind(this);
    new GraceArea({
      contentNode: () => this.parentMenu.contentNode,
      triggerNode: () => this.parentMenu.triggerNode,
      enabled: () => this.parentMenu.opts.open.current && Boolean(this.parentMenu.triggerNode?.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))),
      onPointerExit: () => {
        this.parentMenu.opts.open.current = false;
      },
      setIsPointerInTransit: (value) => {
        this.parentMenu.root.isPointerInTransit = value;
      }
    });
    this.#handleTypeaheadSearch = new DOMTypeahead({
      getActiveElement: () => this.domContext.getActiveElement(),
      getWindow: () => this.domContext.getWindow()
    }).handleTypeaheadSearch;
    this.rovingFocusGroup = new RovingFocusGroup({
      rootNode: box.with(() => this.parentMenu.contentNode),
      candidateAttr: this.parentMenu.root.getBitsAttr("item"),
      loop: this.opts.loop,
      orientation: box.with(() => "vertical")
    });
    watch(() => this.parentMenu.contentNode, (contentNode) => {
      if (!contentNode) return;
      const handler = () => {
        afterTick(() => {
          if (!this.parentMenu.root.isUsingKeyboard.current) return;
          this.rovingFocusGroup.focusFirstCandidate();
        });
      };
      return MenuOpenEvent.listen(contentNode, handler);
    });
  }
  #getCandidateNodes() {
    const node = this.parentMenu.contentNode;
    if (!node) return [];
    const candidates = Array.from(node.querySelectorAll(`[${this.parentMenu.root.getBitsAttr("item")}]:not([data-disabled])`));
    return candidates;
  }
  #isPointerMovingToSubmenu() {
    return this.parentMenu.root.isPointerInTransit;
  }
  onCloseAutoFocus = (e) => {
    this.opts.onCloseAutoFocus.current?.(e);
    if (e.defaultPrevented || this.#isSub) return;
    if (this.parentMenu.triggerNode && isTabbable(this.parentMenu.triggerNode)) {
      this.parentMenu.triggerNode.focus();
    }
  };
  handleTabKeyDown(e) {
    let rootMenu = this.parentMenu;
    while (rootMenu.parentMenu !== null) {
      rootMenu = rootMenu.parentMenu;
    }
    if (!rootMenu.triggerNode) return;
    e.preventDefault();
    const nodeToFocus = getTabbableFrom(rootMenu.triggerNode, e.shiftKey ? "prev" : "next");
    if (nodeToFocus) {
      this.parentMenu.root.ignoreCloseAutoFocus = true;
      rootMenu.onClose();
      afterTick(() => {
        nodeToFocus.focus();
        afterTick(() => {
          this.parentMenu.root.ignoreCloseAutoFocus = false;
        });
      });
    } else {
      this.domContext.getDocument().body.focus();
    }
  }
  onkeydown(e) {
    if (e.defaultPrevented) return;
    if (e.key === TAB) {
      this.handleTabKeyDown(e);
      return;
    }
    const target = e.target;
    const currentTarget = e.currentTarget;
    if (!isHTMLElement(target) || !isHTMLElement(currentTarget)) return;
    const isKeydownInside = target.closest(`[${this.parentMenu.root.getBitsAttr("content")}]`)?.id === this.parentMenu.contentId.current;
    const isModifierKey = e.ctrlKey || e.altKey || e.metaKey;
    const isCharacterKey = e.key.length === 1;
    const kbdFocusedEl = this.rovingFocusGroup.handleKeydown(target, e);
    if (kbdFocusedEl) return;
    if (e.code === "Space") return;
    const candidateNodes = this.#getCandidateNodes();
    if (isKeydownInside) {
      if (!isModifierKey && isCharacterKey) {
        this.#handleTypeaheadSearch(e.key, candidateNodes);
      }
    }
    if (e.target?.id !== this.parentMenu.contentId.current) return;
    if (!FIRST_LAST_KEYS.includes(e.key)) return;
    e.preventDefault();
    if (LAST_KEYS.includes(e.key)) {
      candidateNodes.reverse();
    }
    focusFirst(candidateNodes, { select: false }, () => this.domContext.getActiveElement());
  }
  onblur(e) {
    if (!isElement(e.currentTarget)) return;
    if (!isElement(e.target)) return;
    if (!e.currentTarget.contains?.(e.target)) {
      this.domContext.getWindow().clearTimeout(this.#timer);
      this.search = "";
    }
  }
  onfocus(_) {
    if (!this.parentMenu.root.isUsingKeyboard.current) return;
    afterTick(() => this.rovingFocusGroup.focusFirstCandidate());
  }
  onItemEnter() {
    return this.#isPointerMovingToSubmenu();
  }
  onItemLeave(e) {
    if (e.currentTarget.hasAttribute(this.parentMenu.root.getBitsAttr("sub-trigger"))) return;
    if (this.#isPointerMovingToSubmenu() || this.parentMenu.root.isUsingKeyboard.current) return;
    const contentNode = this.parentMenu.contentNode;
    contentNode?.focus();
    this.rovingFocusGroup.setCurrentTabStopId("");
  }
  onTriggerLeave() {
    if (this.#isPointerMovingToSubmenu()) return true;
    return false;
  }
  onOpenAutoFocus = (e) => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    const contentNode = this.parentMenu.contentNode;
    contentNode?.focus();
  };
  handleInteractOutside(e) {
    if (!isElementOrSVGElement(e.target)) return;
    const triggerId = this.parentMenu.triggerNode?.id;
    if (e.target.id === triggerId) {
      e.preventDefault();
      return;
    }
    if (e.target.closest(`#${triggerId}`)) {
      e.preventDefault();
    }
  }
  #snippetProps = derived$1(() => ({ open: this.parentMenu.opts.open.current }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "menu",
    "aria-orientation": getAriaOrientation("vertical"),
    [this.parentMenu.root.getBitsAttr("content")]: "",
    "data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
    onkeydown: this.onkeydown,
    onblur: this.onblur,
    onfocus: this.onfocus,
    dir: this.parentMenu.root.opts.dir.current,
    style: { pointerEvents: "auto" },
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
  popperProps = { onCloseAutoFocus: (e) => this.onCloseAutoFocus(e) };
}
class MenuItemSharedState {
  opts;
  content;
  attachment;
  #isFocused = false;
  constructor(opts, content) {
    this.opts = opts;
    this.content = content;
    this.attachment = attachRef(this.opts.ref);
    this.onpointermove = this.onpointermove.bind(this);
    this.onpointerleave = this.onpointerleave.bind(this);
    this.onfocus = this.onfocus.bind(this);
    this.onblur = this.onblur.bind(this);
  }
  onpointermove(e) {
    if (e.defaultPrevented) return;
    if (!isMouseEvent(e)) return;
    if (this.opts.disabled.current) {
      this.content.onItemLeave(e);
    } else {
      const defaultPrevented = this.content.onItemEnter();
      if (defaultPrevented) return;
      const item = e.currentTarget;
      if (!isHTMLElement(item)) return;
      item.focus();
    }
  }
  onpointerleave(e) {
    if (e.defaultPrevented) return;
    if (!isMouseEvent(e)) return;
    this.content.onItemLeave(e);
  }
  onfocus(e) {
    afterTick(() => {
      if (e.defaultPrevented || this.opts.disabled.current) return;
      this.#isFocused = true;
    });
  }
  onblur(e) {
    afterTick(() => {
      if (e.defaultPrevented) return;
      this.#isFocused = false;
    });
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    tabindex: -1,
    role: "menuitem",
    "aria-disabled": getAriaDisabled(this.opts.disabled.current),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-highlighted": this.#isFocused ? "" : void 0,
    [this.content.parentMenu.root.getBitsAttr("item")]: "",
    //
    onpointermove: this.onpointermove,
    onpointerleave: this.onpointerleave,
    onfocus: this.onfocus,
    onblur: this.onblur,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class MenuItemState {
  static create(opts) {
    const item = new MenuItemSharedState(opts, MenuContentContext.get());
    return new MenuItemState(opts, item);
  }
  opts;
  item;
  root;
  #isPointerDown = false;
  constructor(opts, item) {
    this.opts = opts;
    this.item = item;
    this.root = item.content.parentMenu.root;
    this.onkeydown = this.onkeydown.bind(this);
    this.onclick = this.onclick.bind(this);
    this.onpointerdown = this.onpointerdown.bind(this);
    this.onpointerup = this.onpointerup.bind(this);
  }
  #handleSelect() {
    if (this.item.opts.disabled.current) return;
    const selectEvent = new CustomEvent("menuitemselect", { bubbles: true, cancelable: true });
    this.opts.onSelect.current(selectEvent);
    if (selectEvent.defaultPrevented) {
      this.item.content.parentMenu.root.isUsingKeyboard.current = false;
      return;
    }
    if (this.opts.closeOnSelect.current) {
      this.item.content.parentMenu.root.opts.onClose();
    }
  }
  onkeydown(e) {
    const isTypingAhead = this.item.content.search !== "";
    if (this.item.opts.disabled.current || isTypingAhead && e.key === SPACE) return;
    if (SELECTION_KEYS.includes(e.key)) {
      if (!isHTMLElement(e.currentTarget)) return;
      e.currentTarget.click();
      e.preventDefault();
    }
  }
  onclick(_) {
    if (this.item.opts.disabled.current) return;
    this.#handleSelect();
  }
  onpointerup(e) {
    if (e.defaultPrevented) return;
    if (!this.#isPointerDown) {
      if (!isHTMLElement(e.currentTarget)) return;
      e.currentTarget?.click();
    }
  }
  onpointerdown(_) {
    this.#isPointerDown = true;
  }
  #props = derived$1(() => mergeProps(this.item.props, {
    onclick: this.onclick,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    onkeydown: this.onkeydown
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class MenuSeparatorState {
  static create(opts) {
    return new MenuSeparatorState(opts, MenuRootContext.get());
  }
  opts;
  root;
  attachment;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "group",
    [this.root.getBitsAttr("separator")]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class DropdownMenuTriggerState {
  static create(opts) {
    return new DropdownMenuTriggerState(opts, MenuMenuContext.get());
  }
  opts;
  parentMenu;
  attachment;
  constructor(opts, parentMenu) {
    this.opts = opts;
    this.parentMenu = parentMenu;
    this.attachment = attachRef(this.opts.ref, (v) => this.parentMenu.triggerNode = v);
  }
  onclick = (e) => {
    if (this.opts.disabled.current || e.detail !== 0) return;
    this.parentMenu.toggleOpen();
    e.preventDefault();
  };
  onpointerdown = (e) => {
    if (this.opts.disabled.current) return;
    if (e.pointerType === "touch") return e.preventDefault();
    if (e.button === 0 && e.ctrlKey === false) {
      this.parentMenu.toggleOpen();
      if (!this.parentMenu.opts.open.current) e.preventDefault();
    }
  };
  onpointerup = (e) => {
    if (this.opts.disabled.current) return;
    if (e.pointerType === "touch") {
      e.preventDefault();
      this.parentMenu.toggleOpen();
    }
  };
  onkeydown = (e) => {
    if (this.opts.disabled.current) return;
    if (e.key === SPACE || e.key === ENTER) {
      this.parentMenu.toggleOpen();
      e.preventDefault();
      return;
    }
    if (e.key === ARROW_DOWN) {
      this.parentMenu.onOpen();
      e.preventDefault();
    }
  };
  #ariaControls = derived$1(() => {
    if (this.parentMenu.opts.open.current && this.parentMenu.contentId.current) return this.parentMenu.contentId.current;
    return void 0;
  });
  #props = derived$1(() => ({
    id: this.opts.id.current,
    disabled: this.opts.disabled.current,
    "aria-haspopup": "menu",
    "aria-expanded": getAriaExpanded(this.parentMenu.opts.open.current),
    "aria-controls": this.#ariaControls(),
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-state": getDataOpenClosed(this.parentMenu.opts.open.current),
    [this.parentMenu.root.getBitsAttr("trigger")]: "",
    //
    onclick: this.onclick,
    onpointerdown: this.onpointerdown,
    onpointerup: this.onpointerup,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Menu_item($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    ref = null,
    id = createId(uid),
    disabled = false,
    onSelect = noop,
    closeOnSelect = true,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = MenuItemState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled),
    onSelect: box.with(() => onSelect),
    ref: box.with(() => ref, (v) => ref = v),
    closeOnSelect: box.with(() => closeOnSelect)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Menu_separator($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    ref = null,
    id = createId(uid),
    child,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const separatorState = MenuSeparatorState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, separatorState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Menu($$payload, $$props) {
  push();
  let {
    open = false,
    dir = "ltr",
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    _internal_variant: variant = "dropdown-menu",
    children
  } = $$props;
  const root = MenuRootState.create({
    variant: box.with(() => variant),
    dir: box.with(() => dir),
    onClose: () => {
      open = false;
      onOpenChange(false);
    }
  });
  MenuMenuState.create(
    {
      open: box.with(() => open, (v) => {
        open = v;
        onOpenChange(v);
      }),
      onOpenChangeComplete: box.with(() => onOpenChangeComplete)
    },
    root
  );
  Floating_layer($$payload, {
    children: ($$payload2) => {
      children?.($$payload2);
      $$payload2.out.push(`<!---->`);
    }
  });
  bind_props($$props, { open });
  pop();
}
function Dropdown_menu_content$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    child,
    children,
    ref = null,
    loop = true,
    onInteractOutside = noop,
    onEscapeKeydown = noop,
    onCloseAutoFocus = noop,
    forceMount = false,
    trapFocus = false,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const contentState = MenuContentState.create({
    id: box.with(() => id),
    loop: box.with(() => loop),
    ref: box.with(() => ref, (v) => ref = v),
    onCloseAutoFocus: box.with(() => onCloseAutoFocus)
  });
  const mergedProps = mergeProps(restProps, contentState.props);
  function handleInteractOutside(e) {
    contentState.handleInteractOutside(e);
    if (e.defaultPrevented) return;
    onInteractOutside(e);
    if (e.defaultPrevented) return;
    if (e.target && e.target instanceof Element) {
      const subContentSelector = `[${contentState.parentMenu.root.getBitsAttr("sub-content")}]`;
      if (e.target.closest(subContentSelector)) return;
    }
    contentState.parentMenu.onClose();
  }
  function handleEscapeKeydown(e) {
    onEscapeKeydown(e);
    if (e.defaultPrevented) return;
    contentState.parentMenu.onClose();
  }
  if (forceMount) {
    $$payload.out.push("<!--[-->");
    {
      let popper = function($$payload2, { props, wrapperProps }) {
        const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") });
        if (child) {
          $$payload2.out.push("<!--[-->");
          child($$payload2, {
            props: finalProps,
            wrapperProps,
            ...contentState.snippetProps
          });
          $$payload2.out.push(`<!---->`);
        } else {
          $$payload2.out.push("<!--[!-->");
          $$payload2.out.push(`<div${spread_attributes({ ...wrapperProps })}><div${spread_attributes({ ...finalProps })}>`);
          children?.($$payload2);
          $$payload2.out.push(`<!----></div></div>`);
        }
        $$payload2.out.push(`<!--]-->`);
      };
      Popper_layer_force_mount($$payload, spread_props([
        mergedProps,
        contentState.popperProps,
        {
          ref: contentState.opts.ref,
          enabled: contentState.parentMenu.opts.open.current,
          onInteractOutside: handleInteractOutside,
          onEscapeKeydown: handleEscapeKeydown,
          trapFocus,
          loop,
          forceMount: true,
          id,
          popper,
          $$slots: { popper: true }
        }
      ]));
    }
  } else {
    $$payload.out.push("<!--[!-->");
    if (!forceMount) {
      $$payload.out.push("<!--[-->");
      {
        let popper = function($$payload2, { props, wrapperProps }) {
          const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("dropdown-menu") });
          if (child) {
            $$payload2.out.push("<!--[-->");
            child($$payload2, {
              props: finalProps,
              wrapperProps,
              ...contentState.snippetProps
            });
            $$payload2.out.push(`<!---->`);
          } else {
            $$payload2.out.push("<!--[!-->");
            $$payload2.out.push(`<div${spread_attributes({ ...wrapperProps })}><div${spread_attributes({ ...finalProps })}>`);
            children?.($$payload2);
            $$payload2.out.push(`<!----></div></div>`);
          }
          $$payload2.out.push(`<!--]-->`);
        };
        Popper_layer($$payload, spread_props([
          mergedProps,
          contentState.popperProps,
          {
            ref: contentState.opts.ref,
            open: contentState.parentMenu.opts.open.current,
            onInteractOutside: handleInteractOutside,
            onEscapeKeydown: handleEscapeKeydown,
            trapFocus,
            loop,
            forceMount: false,
            id,
            popper,
            $$slots: { popper: true }
          }
        ]));
      }
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Menu_trigger($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    disabled = false,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = DropdownMenuTriggerState.create({
    id: box.with(() => id),
    disabled: box.with(() => disabled ?? false),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out.push("<!--[-->");
        child($$payload2, { props: mergedProps });
        $$payload2.out.push(`<!---->`);
      } else {
        $$payload2.out.push("<!--[!-->");
        $$payload2.out.push(`<button${spread_attributes({ ...mergedProps })}>`);
        children?.($$payload2);
        $$payload2.out.push(`<!----></button>`);
      }
      $$payload2.out.push(`<!--]-->`);
    }
  });
  bind_props($$props, { ref });
  pop();
}
const labelAttrs = createBitsAttrs({ component: "label", parts: ["root"] });
class LabelRootState {
  static create(opts) {
    return new LabelRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
    this.onmousedown = this.onmousedown.bind(this);
  }
  onmousedown(e) {
    if (e.detail > 1) e.preventDefault();
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    [labelAttrs.root]: "",
    onmousedown: this.onmousedown,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Label$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    children,
    child,
    id = createId(uid),
    ref = null,
    for: forProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = LabelRootState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props, { for: forProp });
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<label${spread_attributes({ ...mergedProps, for: forProp })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></label>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
const progressAttrs = createBitsAttrs({ component: "progress", parts: ["root"] });
class ProgressRootState {
  static create(opts) {
    return new ProgressRootState(opts);
  }
  opts;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
  }
  #props = derived$1(() => ({
    role: "progressbar",
    value: this.opts.value.current,
    "aria-valuemin": this.opts.min.current,
    "aria-valuemax": this.opts.max.current,
    "aria-valuenow": this.opts.value.current === null ? void 0 : this.opts.value.current,
    "data-value": this.opts.value.current === null ? void 0 : this.opts.value.current,
    "data-state": getProgressDataState(this.opts.value.current, this.opts.max.current),
    "data-max": this.opts.max.current,
    "data-min": this.opts.min.current,
    "data-indeterminate": this.opts.value.current === null ? "" : void 0,
    [progressAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function getProgressDataState(value, max) {
  if (value === null) return "indeterminate";
  return value === max ? "loaded" : "loading";
}
function Progress$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    child,
    children,
    value = 0,
    max = 100,
    min = 0,
    id = createId(uid),
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = ProgressRootState.create({
    value: box.with(() => value),
    max: box.with(() => max),
    min: box.with(() => min),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
const radioGroupAttrs = createBitsAttrs({ component: "radio-group", parts: ["root", "item"] });
const RadioGroupRootContext = new Context("RadioGroup.Root");
class RadioGroupRootState {
  static create(opts) {
    return RadioGroupRootContext.set(new RadioGroupRootState(opts));
  }
  opts;
  #hasValue = derived$1(() => this.opts.value.current !== "");
  get hasValue() {
    return this.#hasValue();
  }
  set hasValue($$value) {
    return this.#hasValue($$value);
  }
  rovingFocusGroup;
  attachment;
  constructor(opts) {
    this.opts = opts;
    this.attachment = attachRef(this.opts.ref);
    this.rovingFocusGroup = new RovingFocusGroup({
      rootNode: this.opts.ref,
      candidateAttr: radioGroupAttrs.item,
      loop: this.opts.loop,
      orientation: this.opts.orientation
    });
  }
  isChecked(value) {
    return this.opts.value.current === value;
  }
  setValue(value) {
    this.opts.value.current = value;
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    role: "radiogroup",
    "aria-required": getAriaRequired(this.opts.required.current),
    "aria-disabled": getAriaDisabled(this.opts.disabled.current),
    "aria-readonly": this.opts.readonly.current ? "true" : void 0,
    "data-disabled": getDataDisabled(this.opts.disabled.current),
    "data-readonly": getDataReadonly(this.opts.readonly.current),
    "data-orientation": this.opts.orientation.current,
    [radioGroupAttrs.root]: "",
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class RadioGroupItemState {
  static create(opts) {
    return new RadioGroupItemState(opts, RadioGroupRootContext.get());
  }
  opts;
  root;
  attachment;
  #checked = derived$1(() => this.root.opts.value.current === this.opts.value.current);
  get checked() {
    return this.#checked();
  }
  set checked($$value) {
    return this.#checked($$value);
  }
  #isDisabled = derived$1(() => this.opts.disabled.current || this.root.opts.disabled.current);
  #isReadonly = derived$1(() => this.root.opts.readonly.current);
  #isChecked = derived$1(() => this.root.isChecked(this.opts.value.current));
  #tabIndex = -1;
  constructor(opts, root) {
    this.opts = opts;
    this.root = root;
    this.attachment = attachRef(this.opts.ref);
    if (this.opts.value.current === this.root.opts.value.current) {
      this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
      this.#tabIndex = 0;
    } else if (!this.root.opts.value.current) {
      this.#tabIndex = 0;
    }
    watch(
      [
        () => this.opts.value.current,
        () => this.root.opts.value.current
      ],
      () => {
        if (this.opts.value.current === this.root.opts.value.current) {
          this.root.rovingFocusGroup.setCurrentTabStopId(this.opts.id.current);
          this.#tabIndex = 0;
        }
      }
    );
    this.onclick = this.onclick.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    this.onfocus = this.onfocus.bind(this);
  }
  onclick(_) {
    if (this.opts.disabled.current || this.#isReadonly()) return;
    this.root.setValue(this.opts.value.current);
  }
  onfocus(_) {
    if (!this.root.hasValue || this.#isReadonly()) return;
    this.root.setValue(this.opts.value.current);
  }
  onkeydown(e) {
    if (this.#isDisabled()) return;
    if (e.key === SPACE) {
      e.preventDefault();
      if (!this.#isReadonly()) {
        this.root.setValue(this.opts.value.current);
      }
      return;
    }
    this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e, true);
  }
  #snippetProps = derived$1(() => ({ checked: this.#isChecked() }));
  get snippetProps() {
    return this.#snippetProps();
  }
  set snippetProps($$value) {
    return this.#snippetProps($$value);
  }
  #props = derived$1(() => ({
    id: this.opts.id.current,
    disabled: this.#isDisabled() ? true : void 0,
    "data-value": this.opts.value.current,
    "data-orientation": this.root.opts.orientation.current,
    "data-disabled": getDataDisabled(this.#isDisabled()),
    "data-readonly": getDataReadonly(this.#isReadonly()),
    "data-state": this.#isChecked() ? "checked" : "unchecked",
    "aria-checked": getAriaChecked(this.#isChecked()),
    [radioGroupAttrs.item]: "",
    type: "button",
    role: "radio",
    tabindex: this.#tabIndex,
    onkeydown: this.onkeydown,
    onfocus: this.onfocus,
    onclick: this.onclick,
    ...this.attachment
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
class RadioGroupInputState {
  static create() {
    return new RadioGroupInputState(RadioGroupRootContext.get());
  }
  root;
  #shouldRender = derived$1(() => this.root.opts.name.current !== void 0);
  get shouldRender() {
    return this.#shouldRender();
  }
  set shouldRender($$value) {
    return this.#shouldRender($$value);
  }
  constructor(root) {
    this.root = root;
    this.onfocus = this.onfocus.bind(this);
  }
  onfocus(_) {
    this.root.rovingFocusGroup.focusCurrentTabStop();
  }
  #props = derived$1(() => ({
    name: this.root.opts.name.current,
    value: this.root.opts.value.current,
    required: this.root.opts.required.current,
    disabled: this.root.opts.disabled.current,
    onfocus: this.onfocus
  }));
  get props() {
    return this.#props();
  }
  set props($$value) {
    return this.#props($$value);
  }
}
function Radio_group_input($$payload, $$props) {
  push();
  const inputState = RadioGroupInputState.create();
  if (inputState.shouldRender) {
    $$payload.out.push("<!--[-->");
    Hidden_input($$payload, spread_props([inputState.props]));
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function Radio_group$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    disabled = false,
    children,
    child,
    value = "",
    ref = null,
    orientation = "vertical",
    loop = true,
    name = void 0,
    required = false,
    readonly = false,
    id = createId(uid),
    onValueChange = noop,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const rootState = RadioGroupRootState.create({
    orientation: box.with(() => orientation),
    disabled: box.with(() => disabled),
    loop: box.with(() => loop),
    name: box.with(() => name),
    required: box.with(() => required),
    readonly: box.with(() => readonly),
    id: box.with(() => id),
    value: box.with(() => value, (v) => {
      if (v === value) return;
      value = v;
      onValueChange?.(v);
    }),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, rootState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  Radio_group_input($$payload);
  $$payload.out.push(`<!---->`);
  bind_props($$props, { value, ref });
  pop();
}
function Radio_group_item$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    children,
    child,
    value,
    disabled = false,
    ref = null,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const itemState = RadioGroupItemState.create({
    value: box.with(() => value),
    disabled: box.with(() => disabled ?? false),
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, itemState.props);
  if (child) {
    $$payload.out.push("<!--[-->");
    child($$payload, { props: mergedProps, ...itemState.snippetProps });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<button${spread_attributes({ ...mergedProps })}>`);
    children?.($$payload, itemState.snippetProps);
    $$payload.out.push(`<!----></button>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Select($$payload, $$props) {
  push();
  let {
    value = void 0,
    onValueChange = noop,
    name = "",
    disabled = false,
    type,
    open = false,
    onOpenChange = noop,
    onOpenChangeComplete = noop,
    loop = false,
    scrollAlignment = "nearest",
    required = false,
    items = [],
    allowDeselect = false,
    autocomplete,
    children
  } = $$props;
  function handleDefaultValue() {
    if (value !== void 0) return;
    value = type === "single" ? "" : [];
  }
  handleDefaultValue();
  watch.pre(() => value, () => {
    handleDefaultValue();
  });
  let inputValue = "";
  const rootState = SelectRootState.create({
    type,
    value: box.with(() => value, (v) => {
      value = v;
      onValueChange(v);
    }),
    disabled: box.with(() => disabled),
    required: box.with(() => required),
    open: box.with(() => open, (v) => {
      open = v;
      onOpenChange(v);
    }),
    loop: box.with(() => loop),
    scrollAlignment: box.with(() => scrollAlignment),
    name: box.with(() => name),
    isCombobox: false,
    items: box.with(() => items),
    allowDeselect: box.with(() => allowDeselect),
    inputValue: box.with(() => inputValue, (v) => inputValue = v),
    onOpenChangeComplete: box.with(() => onOpenChangeComplete)
  });
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    Floating_layer($$payload2, {
      children: ($$payload3) => {
        children?.($$payload3);
        $$payload3.out.push(`<!---->`);
      }
    });
    $$payload2.out.push(`<!----> `);
    if (Array.isArray(rootState.opts.value.current)) {
      $$payload2.out.push("<!--[-->");
      if (rootState.opts.value.current.length === 0) {
        $$payload2.out.push("<!--[-->");
        Select_hidden_input($$payload2, { autocomplete });
      } else {
        $$payload2.out.push("<!--[!-->");
        const each_array = ensure_array_like(rootState.opts.value.current);
        $$payload2.out.push(`<!--[-->`);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          Select_hidden_input($$payload2, { value: item, autocomplete });
        }
        $$payload2.out.push(`<!--]-->`);
      }
      $$payload2.out.push(`<!--]-->`);
    } else {
      $$payload2.out.push("<!--[!-->");
      Select_hidden_input($$payload2, {
        autocomplete,
        get value() {
          return rootState.opts.value.current;
        },
        set value($$value) {
          rootState.opts.value.current = $$value;
          $$settled = false;
        }
      });
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { value, open });
  pop();
}
function Select_trigger$1($$payload, $$props) {
  push();
  const uid = props_id($$payload);
  let {
    id = createId(uid),
    ref = null,
    child,
    children,
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const triggerState = SelectTriggerState.create({
    id: box.with(() => id),
    ref: box.with(() => ref, (v) => ref = v)
  });
  const mergedProps = mergeProps(restProps, triggerState.props, { type });
  $$payload.out.push(`<!---->`);
  Floating_layer_anchor($$payload, {
    id,
    ref: triggerState.opts.ref,
    children: ($$payload2) => {
      if (child) {
        $$payload2.out.push("<!--[-->");
        child($$payload2, { props: mergedProps });
        $$payload2.out.push(`<!---->`);
      } else {
        $$payload2.out.push("<!--[!-->");
        $$payload2.out.push(`<button${spread_attributes({ ...mergedProps })}>`);
        children?.($$payload2);
        $$payload2.out.push(`<!----></button>`);
      }
      $$payload2.out.push(`<!--]-->`);
    }
  });
  $$payload.out.push(`<!---->`);
  bind_props($$props, { ref });
  pop();
}
let isUsingKeyboard = false;
class IsUsingKeyboard {
  static _refs = 0;
  // Reference counting to avoid multiple listeners.
  static _cleanup;
  constructor() {
  }
  get current() {
    return isUsingKeyboard;
  }
  set current(value) {
    isUsingKeyboard = value;
  }
}
function Separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Separator$1($$payload2, spread_props([
      {
        "data-slot": "separator",
        class: cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Avatar($$payload, $$props) {
  push();
  let {
    ref = null,
    loadingStatus = "loading",
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Avatar$1($$payload2, spread_props([
      {
        "data-slot": "avatar",
        class: cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get loadingStatus() {
          return loadingStatus;
        },
        set loadingStatus($$value) {
          loadingStatus = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, loadingStatus });
  pop();
}
function Avatar_image($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Avatar_image$1($$payload2, spread_props([
      {
        "data-slot": "avatar-image",
        class: cn("aspect-square size-full", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Avatar_fallback($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Avatar_fallback$1($$payload2, spread_props([
      {
        "data-slot": "avatar-fallback",
        class: cn("bg-muted flex size-full items-center justify-center rounded-full", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
/**
 * @license @lucide/svelte v0.544.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  push();
  const {
    name,
    color = "currentColor",
    size: size2 = 24,
    strokeWidth = 2,
    absoluteStrokeWidth = false,
    iconNode = [],
    children,
    $$slots,
    $$events,
    ...props
  } = $$props;
  const each_array = ensure_array_like(iconNode);
  $$payload.out.push(`<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...props,
      width: size2,
      height: size2,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size2) : strokeWidth,
      class: clsx$1(["lucide-icon lucide", name && `lucide-${name}`, props.class])
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out.push(`${spread_attributes({ ...attrs }, null, void 0, void 0, 3)}`);
    });
  }
  $$payload.out.push(`<!--]-->`);
  children?.($$payload);
  $$payload.out.push(`<!----></svg>`);
  pop();
}
function Check($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$payload, spread_props([
    { name: "check" },
    /**
     * @component @name Check
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Dropdown_menu_content($$payload, $$props) {
  push();
  let {
    ref = null,
    sideOffset = 4,
    portalProps,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out.push(`<!---->`);
          Dropdown_menu_content$1($$payload3, spread_props([
            {
              "data-slot": "dropdown-menu-content",
              sideOffset,
              class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--bits-dropdown-menu-content-available-height) origin-(--bits-dropdown-menu-content-transform-origin) z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border p-1 shadow-md outline-none", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              }
            }
          ]));
          $$payload3.out.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    inset,
    variant = "default",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Menu_item($$payload2, spread_props([
      {
        "data-slot": "dropdown-menu-item",
        "data-inset": inset,
        "data-variant": variant,
        class: cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[disabled]:pointer-events-none data-[inset]:pl-8 data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_label($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    inset,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      class: clsx$1(cn("px-2 py-1.5 text-sm font-semibold data-[inset]:pl-8", className)),
      ...restProps
    }
  )}>`);
  children?.($$payload);
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { ref });
  pop();
}
function Circle($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["circle", { "cx": "12", "cy": "12", "r": "10" }]];
  Icon($$payload, spread_props([
    { name: "circle" },
    /**
     * @component @name Circle
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/circle
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Dropdown_menu_separator($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Menu_separator($$payload2, spread_props([
      {
        "data-slot": "dropdown-menu-separator",
        class: cn("bg-border -mx-1 my-1 h-px", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Dropdown_menu_trigger($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Menu_trigger($$payload2, spread_props([
      { "data-slot": "dropdown-menu-trigger" },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root$1 = Menu;
function Select_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value,
    label,
    children: childrenProp,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    {
      let children = function($$payload3, { selected, highlighted }) {
        $$payload3.out.push(`<span class="absolute right-2 flex size-3.5 items-center justify-center">`);
        if (selected) {
          $$payload3.out.push("<!--[-->");
          Check($$payload3, { class: "size-4" });
        } else {
          $$payload3.out.push("<!--[!-->");
        }
        $$payload3.out.push(`<!--]--></span> `);
        if (childrenProp) {
          $$payload3.out.push("<!--[-->");
          childrenProp($$payload3, { selected, highlighted });
          $$payload3.out.push(`<!---->`);
        } else {
          $$payload3.out.push("<!--[!-->");
          $$payload3.out.push(`${escape_html(label || value)}`);
        }
        $$payload3.out.push(`<!--]-->`);
      };
      Select_item$1($$payload2, spread_props([
        {
          value,
          "data-slot": "select-item",
          class: cn("data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_up($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "m18 15-6-6-6 6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-up" },
    /**
     * @component @name ChevronUp
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTggMTUtNi02LTYgNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/chevron-up
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Select_scroll_up_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Select_scroll_up_button$1($$payload2, spread_props([
      {
        "data-slot": "select-scroll-up-button",
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_up($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Chevron_down($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [["path", { "d": "m6 9 6 6 6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-down" },
    /**
     * @component @name ChevronDown
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtNiA5IDYgNiA2LTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/chevron-down
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Select_scroll_down_button($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Select_scroll_down_button$1($$payload2, spread_props([
      {
        "data-slot": "select-scroll-down-button",
        class: cn("flex cursor-default items-center justify-center py-1", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          Chevron_down($$payload3, { class: "size-4" });
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    sideOffset = 4,
    portalProps,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Portal($$payload2, spread_props([
      portalProps,
      {
        children: ($$payload3) => {
          $$payload3.out.push(`<!---->`);
          Select_content$1($$payload3, spread_props([
            {
              sideOffset,
              "data-slot": "select-content",
              class: cn("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-h-(--bits-select-content-available-height) origin-(--bits-select-content-transform-origin) relative z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)
            },
            restProps,
            {
              get ref() {
                return ref;
              },
              set ref($$value) {
                ref = $$value;
                $$settled = false;
              },
              children: ($$payload4) => {
                Select_scroll_up_button($$payload4, {});
                $$payload4.out.push(`<!----> <!---->`);
                Select_viewport($$payload4, {
                  class: cn("h-(--bits-select-anchor-height) min-w-(--bits-select-anchor-width) w-full scroll-my-1 p-1"),
                  children: ($$payload5) => {
                    children?.($$payload5);
                    $$payload5.out.push(`<!---->`);
                  },
                  $$slots: { default: true }
                });
                $$payload4.out.push(`<!----> `);
                Select_scroll_down_button($$payload4, {});
                $$payload4.out.push(`<!---->`);
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Select_trigger($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    size: size2 = "default",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Select_trigger$1($$payload2, spread_props([
      {
        "data-slot": "select-trigger",
        "data-size": size2,
        class: cn("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 shadow-xs flex w-fit select-none items-center justify-between gap-2 whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          children?.($$payload3);
          $$payload3.out.push(`<!----> `);
          Chevron_down($$payload3, { class: "size-4 opacity-50" });
          $$payload3.out.push(`<!---->`);
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const Root = Select;
const buttonVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      destructive: "bg-destructive shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white",
      outline: "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Button($$payload, $$props) {
  push();
  let {
    class: className,
    variant = "default",
    size: size2 = "default",
    ref = null,
    href = void 0,
    type = "button",
    disabled,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (href) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<a${spread_attributes(
      {
        "data-slot": "button",
        class: clsx$1(cn(buttonVariants({ variant, size: size2 }), className)),
        href: disabled ? void 0 : href,
        "aria-disabled": disabled,
        role: disabled ? "link" : void 0,
        tabindex: disabled ? -1 : void 0,
        ...restProps
      }
    )}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></a>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<button${spread_attributes(
      {
        "data-slot": "button",
        class: clsx$1(cn(buttonVariants({ variant, size: size2 }), className)),
        type,
        disabled,
        ...restProps
      }
    )}>`);
    children?.($$payload);
    $$payload.out.push(`<!----></button>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref });
  pop();
}
function Share_2($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    ["circle", { "cx": "18", "cy": "5", "r": "3" }],
    ["circle", { "cx": "6", "cy": "12", "r": "3" }],
    ["circle", { "cx": "18", "cy": "19", "r": "3" }],
    [
      "line",
      { "x1": "8.59", "x2": "15.42", "y1": "13.51", "y2": "17.49" }
    ],
    [
      "line",
      { "x1": "15.41", "x2": "8.59", "y1": "6.51", "y2": "10.49" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "share-2" },
    /**
     * @component @name Share2
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxOCIgY3k9IjUiIHI9IjMiIC8+CiAgPGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIzIiAvPgogIDxjaXJjbGUgY3g9IjE4IiBjeT0iMTkiIHI9IjMiIC8+CiAgPGxpbmUgeDE9IjguNTkiIHgyPSIxNS40MiIgeTE9IjEzLjUxIiB5Mj0iMTcuNDkiIC8+CiAgPGxpbmUgeDE9IjE1LjQxIiB4Mj0iOC41OSIgeTE9IjYuNTEiIHkyPSIxMC40OSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/share-2
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Star($$payload, $$props) {
  push();
  /**
   * @license @lucide/svelte v0.544.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  let { $$slots, $$events, ...props } = $$props;
  const iconNode = [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "star" },
    /**
     * @component @name Star
     * @description Lucide SVG icon component, renders SVG Element with children.
     *
     * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTI1IDIuMjk1YS41My41MyAwIDAgMSAuOTUgMGwyLjMxIDQuNjc5YTIuMTIzIDIuMTIzIDAgMCAwIDEuNTk1IDEuMTZsNS4xNjYuNzU2YS41My41MyAwIDAgMSAuMjk0LjkwNGwtMy43MzYgMy42MzhhMi4xMjMgMi4xMjMgMCAwIDAtLjYxMSAxLjg3OGwuODgyIDUuMTRhLjUzLjUzIDAgMCAxLS43NzEuNTZsLTQuNjE4LTIuNDI4YTIuMTIyIDIuMTIyIDAgMCAwLTEuOTczIDBMNi4zOTYgMjEuMDFhLjUzLjUzIDAgMCAxLS43Ny0uNTZsLjg4MS01LjEzOWEyLjEyMiAyLjEyMiAwIDAgMC0uNjExLTEuODc5TDIuMTYgOS43OTVhLjUzLjUzIDAgMCAxIC4yOTQtLjkwNmw1LjE2NS0uNzU1YTIuMTIyIDIuMTIyIDAgMCAwIDEuNTk3LTEuMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/star
     * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
     *
     * @param {Object} props - Lucide icons props and any valid SVG attribute
     * @returns {FunctionalComponent} Svelte component
     *
     */
    props,
    {
      iconNode,
      children: ($$payload2) => {
        props.children?.($$payload2);
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
  pop();
}
function Header($$payload, $$props) {
  push();
  var $$store_subs;
  const commonQuery = createQuery({
    queryKey: [
      "common",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage
    ],
    queryFn: async () => {
      const response = await fetch(`/api/common.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}`);
      if (!response.ok) throw new Error("Failed to fetch common data");
      return response.json();
    }
  });
  const currentCitySid = () => {
    const city = store_get($$store_subs ??= {}, "$commonQuery", commonQuery).data?.cities?.find((c) => c.cityid.toString() === store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity);
    return city?.citysid?.toUpperCase() || "...";
  };
  const userInitials = () => !store_get($$store_subs ??= {}, "$userStore", userStore).userInfo?.first_name ? "?" : store_get($$store_subs ??= {}, "$userStore", userStore).userInfo.first_name.charAt(0).toUpperCase() + (store_get($$store_subs ??= {}, "$userStore", userStore).userInfo.last_name?.charAt(0)?.toUpperCase() || "");
  function handleCityChange(city) {
  }
  function handleLanguageChange(language) {
  }
  function handleShareToStory() {
  }
  function handleAccountAction(action) {
  }
  $$payload.out.push(`<header class="mx-auto w-full max-w-2xl px-4 pt-4 pb-4"><div class="grid grid-cols-[1fr_auto_1fr] items-center pb-4"><div class="flex items-center gap-5 justify-start"><!---->`);
  Root$1($$payload, {
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->`);
      {
        let child = function($$payload3, { props }) {
          $$payload3.out.push(`<!---->`);
          Avatar($$payload3, spread_props([
            props,
            {
              class: "cursor-pointer hover:opacity-80 transition-opacity",
              children: ($$payload4) => {
                if (store_get($$store_subs ??= {}, "$userStore", userStore).userInfo?.photo_url) {
                  $$payload4.out.push("<!--[-->");
                  $$payload4.out.push(`<!---->`);
                  Avatar_image($$payload4, {
                    src: store_get($$store_subs ??= {}, "$userStore", userStore).userInfo.photo_url,
                    alt: "User"
                  });
                  $$payload4.out.push(`<!---->`);
                } else {
                  $$payload4.out.push("<!--[!-->");
                }
                $$payload4.out.push(`<!--]--> <!---->`);
                Avatar_fallback($$payload4, {
                  children: ($$payload5) => {
                    $$payload5.out.push(`<!---->${escape_html(userInitials())}`);
                  },
                  $$slots: { default: true }
                });
                $$payload4.out.push(`<!---->`);
              },
              $$slots: { default: true }
            }
          ]));
          $$payload3.out.push(`<!---->`);
        };
        Dropdown_menu_trigger($$payload2, { child, $$slots: { child: true } });
      }
      $$payload2.out.push(`<!----> <!---->`);
      Dropdown_menu_content($$payload2, {
        class: "w-56 z-[60]",
        align: "start",
        children: ($$payload3) => {
          $$payload3.out.push(`<!---->`);
          Dropdown_menu_label($$payload3, {
            children: ($$payload4) => {
              $$payload4.out.push(`<!---->My Account`);
            },
            $$slots: { default: true }
          });
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_separator($$payload3, {});
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_item($$payload3, {
            onclick: () => handleAccountAction(),
            children: ($$payload4) => {
              $$payload4.out.push(`<!---->⚙️ Account Settings`);
            },
            $$slots: { default: true }
          });
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_item($$payload3, {
            onclick: () => handleAccountAction(),
            children: ($$payload4) => {
              $$payload4.out.push(`<!---->📢 Channel Subscription`);
            },
            $$slots: { default: true }
          });
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_item($$payload3, {
            onclick: () => handleAccountAction(),
            children: ($$payload4) => {
              $$payload4.out.push(`<!---->📋 My Bookings`);
            },
            $$slots: { default: true }
          });
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_separator($$payload3, {});
          $$payload3.out.push(`<!----> <!---->`);
          Dropdown_menu_item($$payload3, {
            onclick: () => handleAccountAction(),
            children: ($$payload4) => {
              $$payload4.out.push(`<!---->💬 Support`);
            },
            $$slots: { default: true }
          });
          $$payload3.out.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$payload2.out.push(`<!---->`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----> <!---->`);
  Root($$payload, {
    type: "single",
    value: store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity,
    onValueChange: handleCityChange,
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->`);
      Select_trigger($$payload2, {
        class: "w-20",
        disabled: store_get($$store_subs ??= {}, "$commonQuery", commonQuery).isLoading,
        children: ($$payload3) => {
          if (store_get($$store_subs ??= {}, "$commonQuery", commonQuery).isLoading) {
            $$payload3.out.push("<!--[-->");
            $$payload3.out.push(`...`);
          } else {
            $$payload3.out.push("<!--[!-->");
            $$payload3.out.push(`${escape_html(currentCitySid())}`);
          }
          $$payload3.out.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$payload2.out.push(`<!----> <!---->`);
      Select_content($$payload2, {
        children: ($$payload3) => {
          const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$commonQuery", commonQuery).data?.cities || []);
          $$payload3.out.push(`<!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let city = each_array[$$index];
            $$payload3.out.push(`<!---->`);
            Select_item($$payload3, {
              value: city.cityid.toString(),
              children: ($$payload4) => {
                $$payload4.out.push(`<!---->${escape_html(city.cityname)}`);
              },
              $$slots: { default: true }
            });
            $$payload3.out.push(`<!---->`);
          }
          $$payload3.out.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$payload2.out.push(`<!---->`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----></div> <div class="flex items-center justify-center"></div> <div class="flex items-center gap-2 justify-end"><!---->`);
  Root($$payload, {
    type: "single",
    value: store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
    onValueChange: handleLanguageChange,
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->`);
      Select_trigger($$payload2, {
        class: "w-16",
        disabled: store_get($$store_subs ??= {}, "$commonQuery", commonQuery).isLoading,
        children: ($$payload3) => {
          if (store_get($$store_subs ??= {}, "$commonQuery", commonQuery).isLoading) {
            $$payload3.out.push("<!--[-->");
            $$payload3.out.push(`...`);
          } else {
            $$payload3.out.push("<!--[!-->");
            $$payload3.out.push(`${escape_html(store_get($$store_subs ??= {}, "$commonQuery", commonQuery).data?.languages?.find((l) => l.languagesid === store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage)?.languageflag)}`);
          }
          $$payload3.out.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$payload2.out.push(`<!----> <!---->`);
      Select_content($$payload2, {
        children: ($$payload3) => {
          const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$commonQuery", commonQuery).data?.languages || []);
          $$payload3.out.push(`<!--[-->`);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let lang = each_array_1[$$index_1];
            $$payload3.out.push(`<!---->`);
            Select_item($$payload3, {
              value: lang.languagesid,
              children: ($$payload4) => {
                $$payload4.out.push(`<!---->${escape_html(lang.languageflag)} ${escape_html(lang.languagename)}`);
              },
              $$slots: { default: true }
            });
            $$payload3.out.push(`<!---->`);
          }
          $$payload3.out.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$payload2.out.push(`<!---->`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----> <!---->`);
  Button($$payload, {
    variant: "ghost",
    size: "sm",
    onclick: handleShareToStory,
    children: ($$payload2) => {
      Share_2($$payload2, { size: 16 });
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----></div></div> `);
  Separator($$payload, { class: "mb-6" });
  $$payload.out.push(`<!----></header>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Card($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "card",
      class: clsx$1(cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)),
      ...restProps
    }
  )}>`);
  children?.($$payload);
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { ref });
  pop();
}
function Card_content($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "card-content",
      class: clsx$1(cn("px-6", className)),
      ...restProps
    }
  )}>`);
  children?.($$payload);
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { ref });
  pop();
}
function Card_header($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "card-header",
      class: clsx$1(cn("@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6", className)),
      ...restProps
    }
  )}>`);
  children?.($$payload);
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { ref });
  pop();
}
function Card_title($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<div${spread_attributes(
    {
      "data-slot": "card-title",
      class: clsx$1(cn("font-semibold leading-none", className)),
      ...restProps
    }
  )}>`);
  children?.($$payload);
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { ref });
  pop();
}
function Aspect_ratio($$payload, $$props) {
  push();
  let { ref = null, $$slots, $$events, ...restProps } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Aspect_ratio$1($$payload2, spread_props([
      { "data-slot": "aspect-ratio" },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
const badgeVariants = tv({
  base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
      secondary: "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
      destructive: "bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white",
      outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
    }
  },
  defaultVariants: { variant: "default" }
});
function Badge($$payload, $$props) {
  push();
  let {
    ref = null,
    href,
    class: className,
    variant = "default",
    children,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  element(
    $$payload,
    href ? "a" : "span",
    () => {
      $$payload.out.push(`${spread_attributes(
        {
          "data-slot": "badge",
          href,
          class: clsx$1(cn(badgeVariants({ variant }), className)),
          ...restProps
        }
      )}`);
    },
    () => {
      children?.($$payload);
      $$payload.out.push(`<!---->`);
    }
  );
  bind_props($$props, { ref });
  pop();
}
function EventList($$payload, $$props) {
  push();
  let { events, venueData = [], brandData = [], onEventClick } = $$props;
  if (events) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(events);
    $$payload.out.push(`<!--[-->`);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let event = each_array[$$index_1];
      const venue = venueData.find((v) => v.venueid === event.venueid);
      const eventBrandIds = event.brandid.split(",").map((id) => id.replace(/\^/g, ""));
      const eventBrands = brandData.filter((b) => eventBrandIds.includes(b.brandid.toString()));
      $$payload.out.push(`<!---->`);
      Card($$payload, {
        class: "py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
        onclick: () => onEventClick(event.eventid.toString()),
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->`);
          Card_header($$payload2, {
            class: "gap-0 pb-4",
            children: ($$payload3) => {
              $$payload3.out.push(`<div class="flex justify-between items-center"><div class="flex items-center gap-4"><div class="space-y-2"><!---->`);
              Card_title($$payload3, {
                class: "text-3xl font-bold",
                children: ($$payload4) => {
                  $$payload4.out.push(`<!---->${escape_html(event.eventtitle)}`);
                },
                $$slots: { default: true }
              });
              $$payload3.out.push(`<!----> <div class="flex gap-2">`);
              if (event.eventfeatured) {
                $$payload3.out.push("<!--[-->");
                Badge($$payload3, {
                  children: ($$payload4) => {
                    Star($$payload4, {});
                    $$payload4.out.push(`<!----> Featured`);
                  },
                  $$slots: { default: true }
                });
              } else {
                $$payload3.out.push("<!--[!-->");
              }
              $$payload3.out.push(`<!--]--></div></div></div></div>`);
            },
            $$slots: { default: true }
          });
          $$payload2.out.push(`<!----> `);
          if (event.eventfeatured && event.eventpic) {
            $$payload2.out.push("<!--[-->");
            Aspect_ratio($$payload2, {
              class: "pb-2",
              ratio: 4 / 5,
              children: ($$payload3) => {
                $$payload3.out.push(`<img${attr("src", `/pic/event/${stringify(event.eventpic)}`)}${attr("alt", event.eventtitle)} class="w-full h-full object-cover"/>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$payload2.out.push("<!--[!-->");
          }
          $$payload2.out.push(`<!--]--> <!---->`);
          Card_content($$payload2, {
            class: "p-4 pb-4 space-y-4",
            children: ($$payload3) => {
              const each_array_1 = ensure_array_like(eventBrands);
              $$payload3.out.push(`<div class="text-sm text-muted-foreground">📅 ${escape_html(new Date(event.eventdate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</div> `);
              if (venue) {
                $$payload3.out.push("<!--[-->");
                $$payload3.out.push(`<div class="text-sm">📍 ${escape_html(venue.venuename)} <a${attr("href", venue.venuelink)} target="_blank" rel="noopener noreferrer">🔗</a></div>`);
              } else {
                $$payload3.out.push("<!--[!-->");
              }
              $$payload3.out.push(`<!--]--> `);
              if (event.eventartist) {
                $$payload3.out.push("<!--[-->");
                $$payload3.out.push(`<div class="text-sm">🎵 ${escape_html(event.eventartist)}</div>`);
              } else {
                $$payload3.out.push("<!--[!-->");
              }
              $$payload3.out.push(`<!--]--> <div class="flex gap-2 items-center"><!--[-->`);
              for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                let brand = each_array_1[$$index];
                $$payload3.out.push(`<!---->`);
                Avatar($$payload3, {
                  class: "w-8 h-8 rounded-lg",
                  children: ($$payload4) => {
                    $$payload4.out.push(`<!---->`);
                    Avatar_image($$payload4, {
                      src: `/pic/brand/${stringify(brand.brandpic1)}`,
                      alt: brand.brandname,
                      class: "rounded-lg"
                    });
                    $$payload4.out.push(`<!----> <!---->`);
                    Avatar_fallback($$payload4, { class: "rounded-lg bg-muted" });
                    $$payload4.out.push(`<!---->`);
                  },
                  $$slots: { default: true }
                });
                $$payload3.out.push(`<!---->`);
              }
              $$payload3.out.push(`<!--]--> `);
              if (event.eventschema) {
                $$payload3.out.push("<!--[-->");
                $$payload3.out.push(`<span class="text-sm text-muted-foreground mr-2">💰 ${escape_html(event.eventschema)}</span>`);
              } else {
                $$payload3.out.push("<!--[!-->");
              }
              $$payload3.out.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
          $$payload2.out.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function Home($$payload, $$props) {
  push();
  var $$store_subs;
  const featuredEventsQuery = createQuery({
    queryKey: [
      "events",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity,
      "featured"
    ],
    queryFn: async () => {
      const response = await fetch(`/api/events.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}&featured=1`);
      if (!response.ok) throw new Error("Failed to fetch featured events");
      return response.json();
    }
  });
  const venuesQuery = createQuery({
    queryKey: [
      "venues",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/venues.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    },
    enabled: () => (store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).data || []).length > 0
  });
  const brandsQuery = createQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch(`/api/brands.php`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    },
    enabled: () => (store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).data || []).length > 0
  });
  function goToEvent(eventId) {
  }
  function handleNavigate(page) {
  }
  $$payload.out.push(`<div class="space-y-8"><div class="text-center space-y-4"><h1 class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Let's Trojeak</h1> <p class="text-lg text-muted-foreground">🇰🇭 Cambodia #1 event app</p></div> `);
  if (store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).isLoading) {
    $$payload.out.push("<!--[-->");
    Loading($$payload, { variant: "list" });
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).error) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<!---->`);
      Card($$payload, {
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->`);
          Card_content($$payload2, {
            class: "p-4",
            children: ($$payload3) => {
              $$payload3.out.push(`<p class="text-destructive">Failed to load featured events. Please try again.</p>`);
            },
            $$slots: { default: true }
          });
          $$payload2.out.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    } else {
      $$payload.out.push("<!--[!-->");
      if ((store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).data || []).length > 0) {
        $$payload.out.push("<!--[-->");
        EventList($$payload, {
          events: store_get($$store_subs ??= {}, "$featuredEventsQuery", featuredEventsQuery).data || [],
          venueData: store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data || [],
          brandData: store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data || [],
          onEventClick: goToEvent
        });
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<div class="text-center py-8 space-y-4"><p class="text-muted-foreground">No featured events available right now</p> <!---->`);
        Button($$payload, {
          variant: "outline",
          onclick: () => handleNavigate(),
          children: ($$payload2) => {
            $$payload2.out.push(`<!---->Browse All Events`);
          },
          $$slots: { default: true }
        });
        $$payload.out.push(`<!----></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> <nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-3 gap-4 pt-4 pb-8"><!---->`);
  Button($$payload, {
    variant: "outline",
    size: "sm",
    onclick: () => handleNavigate(),
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->Events`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----> <!---->`);
  Button($$payload, {
    variant: "outline",
    size: "sm",
    onclick: () => handleNavigate(),
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->Venues`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----> <!---->`);
  Button($$payload, {
    variant: "outline",
    size: "sm",
    onclick: () => handleNavigate(),
    children: ($$payload2) => {
      $$payload2.out.push(`<!---->Brands`);
    },
    $$slots: { default: true }
  });
  $$payload.out.push(`<!----></div></div></nav>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Events($$payload, $$props) {
  push();
  var $$store_subs;
  const viewMode = store_get($$store_subs ??= {}, "$appStore", appStore).currentView === "events-detail" ? "detail" : "list";
  const selectedEventId = store_get($$store_subs ??= {}, "$appStore", appStore).selectedEventId;
  const eventsQuery = createQuery({
    queryKey: [
      "events",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/events.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  });
  const venuesQuery = createQuery({
    queryKey: [
      "venues",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/venues.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    }
  });
  const brandsQuery = createQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch(`/api/brands.php`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    }
  });
  const events = store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).data || [];
  function goToEvent(eventId) {
  }
  function goHome() {
  }
  function goToList() {
  }
  function startBooking(event) {
    store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data?.find((v) => v.venueid === event.venueid) || null;
  }
  $$payload.out.push(`<div class="space-y-8">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="space-y-4"><h1 class="text-4xl font-bold text-center">Events</h1></div> <div class="grid gap-8">`);
    if (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).isLoading) {
      $$payload.out.push("<!--[-->");
      Loading($$payload, { variant: "list" });
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).error) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<!---->`);
        Card($$payload, {
          children: ($$payload2) => {
            $$payload2.out.push(`<!---->`);
            Card_content($$payload2, {
              class: "p-4",
              children: ($$payload3) => {
                $$payload3.out.push(`<p class="text-destructive">Failed to load events. Please try again.</p>`);
              },
              $$slots: { default: true }
            });
            $$payload2.out.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$payload.out.push(`<!---->`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (events.length === 0) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">No events available for this location.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        } else {
          $$payload.out.push("<!--[!-->");
          EventList($$payload, {
            events,
            venueData: store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data || [],
            brandData: store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data || [],
            onEventClick: goToEvent
          });
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (viewMode === "detail" && selectedEventId) {
      $$payload.out.push("<!--[-->");
      const selectedEvent = events.find((e) => e.eventid.toString() === selectedEventId);
      if (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).isLoading) {
        $$payload.out.push("<!--[-->");
        Loading($$payload, { variant: "detail" });
      } else {
        $$payload.out.push("<!--[!-->");
        if (selectedEvent) {
          $$payload.out.push("<!--[-->");
          const venue = store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data?.find((v) => v.venueid === selectedEvent.venueid);
          const eventBrandIds = selectedEvent.brandid.split(",").map((id) => id.replace(/\^/g, ""));
          const eventBrands = store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data?.filter((b) => eventBrandIds.includes(b.brandid.toString())) || [];
          $$payload.out.push(`<div class="space-y-8">`);
          Aspect_ratio($$payload, {
            class: "pb-2",
            ratio: 4 / 5,
            children: ($$payload2) => {
              $$payload2.out.push(`<img${attr("src", `/pic/event/${stringify(selectedEvent.eventpic)}`)}${attr("alt", selectedEvent.eventtitle)} class="w-full h-full object-cover"/>`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!----> <!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_header($$payload2, {
                class: "pb-2",
                children: ($$payload3) => {
                  $$payload3.out.push(`<div class="space-y-2"><!---->`);
                  Card_title($$payload3, {
                    class: "text-3xl font-bold",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->${escape_html(selectedEvent.eventtitle)}`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> <div class="flex gap-2">`);
                  if (selectedEvent.eventfeatured) {
                    $$payload3.out.push("<!--[-->");
                    Badge($$payload3, {
                      children: ($$payload4) => {
                        Star($$payload4, {});
                        $$payload4.out.push(`<!----> Featured`);
                      },
                      $$slots: { default: true }
                    });
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--></div></div>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!----> <!---->`);
              Card_content($$payload2, {
                class: "p-6 py-0 space-y-4",
                children: ($$payload3) => {
                  const each_array = ensure_array_like(eventBrands);
                  $$payload3.out.push(`<div class="text-sm text-muted-foreground">📅 ${escape_html(new Date(selectedEvent.eventdate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}</div> `);
                  if (venue) {
                    $$payload3.out.push("<!--[-->");
                    $$payload3.out.push(`<div class="text-sm">📍 ${escape_html(venue.venuename)} <a${attr("href", venue.venuelink)} target="_blank" rel="noopener noreferrer">🔗</a></div>`);
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--> <div class="text-sm">🎵 ${escape_html(selectedEvent.eventartist)}</div> <div class="flex gap-2 items-center"><!--[-->`);
                  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                    let brand = each_array[$$index];
                    $$payload3.out.push(`<!---->`);
                    Avatar($$payload3, {
                      class: "w-8 h-8 rounded-lg",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->`);
                        Avatar_image($$payload4, {
                          src: `/pic/brand/${stringify(brand.brandpic1)}`,
                          alt: brand.brandname,
                          class: "rounded-lg"
                        });
                        $$payload4.out.push(`<!----> <!---->`);
                        Avatar_fallback($$payload4, { class: "rounded-lg bg-muted" });
                        $$payload4.out.push(`<!---->`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!---->`);
                  }
                  $$payload3.out.push(`<!--]--> `);
                  if (selectedEvent.eventschema) {
                    $$payload3.out.push("<!--[-->");
                    $$payload3.out.push(`<span class="text-sm text-muted-foreground mr-2">💰 ${escape_html(selectedEvent.eventschema)}</span>`);
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--></div> `);
                  if (selectedEvent.eventdesc) {
                    $$payload3.out.push("<!--[-->");
                    $$payload3.out.push(`<p>${escape_html(selectedEvent.eventdesc)}</p>`);
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--> <!---->`);
                  Button($$payload3, {
                    onclick: () => startBooking(selectedEvent),
                    class: "w-full mt-4",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->Book This Event`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!---->`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!----></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">Event not found.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> <nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8"><div class="flex items-center justify-start">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goHome,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->Home`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goToList,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->← Back`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  }
  $$payload.out.push(`<!--]--></div> <div class="flex items-center justify-center"></div> <div class="flex items-center justify-end"></div></div></div></nav>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Venues($$payload, $$props) {
  push();
  var $$store_subs;
  const viewMode = store_get($$store_subs ??= {}, "$appStore", appStore).currentView === "venues-detail" ? "detail" : "list";
  const selectedVenueId = store_get($$store_subs ??= {}, "$appStore", appStore).selectedVenueId || null;
  const venuesQuery = createQuery({
    queryKey: [
      "venues",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/venues.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    }
  });
  const eventsQuery = createQuery({
    queryKey: [
      "events",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/events.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  });
  const brandsQuery = createQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch(`/api/brands.php`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    },
    enabled: () => viewMode === "detail"
  });
  const venues = store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data || [];
  const getVenueEventCount = (venueId) => {
    return (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).data || []).filter((event) => event.venueid === venueId).length;
  };
  const getVenueEvents = (venueId) => {
    return (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).data || []).filter((event) => event.venueid === venueId).sort((a, b) => {
      if (a.eventfeatured !== b.eventfeatured) return Number(b.eventfeatured) - Number(a.eventfeatured);
      return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
    });
  };
  function selectVenue(venueId) {
    window.scrollTo(0, 0);
  }
  function goHome() {
  }
  function goToList() {
  }
  function goToEvent(eventId) {
  }
  $$payload.out.push(`<div class="space-y-8">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="space-y-4"><h1 class="text-4xl font-bold text-center">Venues</h1></div> <div class="grid gap-8">`);
    if (store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).isLoading) {
      $$payload.out.push("<!--[-->");
      Loading($$payload, { variant: "list" });
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).error) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<!---->`);
        Card($$payload, {
          children: ($$payload2) => {
            $$payload2.out.push(`<!---->`);
            Card_content($$payload2, {
              class: "p-4",
              children: ($$payload3) => {
                $$payload3.out.push(`<p class="text-destructive">Failed to load venues. Please try again.</p>`);
              },
              $$slots: { default: true }
            });
            $$payload2.out.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$payload.out.push(`<!---->`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (venues.length === 0) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">No venues available for this location.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        } else {
          $$payload.out.push("<!--[!-->");
          const each_array = ensure_array_like(venues);
          $$payload.out.push(`<!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let venue = each_array[$$index];
            $$payload.out.push(`<!---->`);
            Card($$payload, {
              class: "py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
              onclick: () => selectVenue(venue.venueid.toString()),
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->`);
                Card_header($$payload2, {
                  class: "gap-0 pb-4",
                  children: ($$payload3) => {
                    $$payload3.out.push(`<div class="flex justify-between items-center"><div class="flex items-center gap-4"><!---->`);
                    Avatar($$payload3, {
                      class: "w-16 h-16 rounded-lg",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->`);
                        Avatar_image($$payload4, {
                          src: `/pic/venue/${stringify(venue.venuepic1)}`,
                          alt: venue.venuename,
                          class: "rounded-lg"
                        });
                        $$payload4.out.push(`<!----> <!---->`);
                        Avatar_fallback($$payload4, {
                          class: "rounded-lg bg-muted",
                          children: ($$payload5) => {
                            $$payload5.out.push(`<!---->${escape_html(venue.venuename.charAt(0))}`);
                          },
                          $$slots: { default: true }
                        });
                        $$payload4.out.push(`<!---->`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!----> <div class="space-y-1"><!---->`);
                    Card_title($$payload3, {
                      class: "text-xl font-semibold",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->${escape_html(venue.venuename)}`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!----> <div class="flex gap-2">`);
                    Badge($$payload3, {
                      variant: "secondary",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->${escape_html(venue.venuetype.toUpperCase())}`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!----> `);
                    if (venue.venuefeatured) {
                      $$payload3.out.push("<!--[-->");
                      Badge($$payload3, {
                        children: ($$payload4) => {
                          Star($$payload4, {});
                          $$payload4.out.push(`<!----> Featured`);
                        },
                        $$slots: { default: true }
                      });
                    } else {
                      $$payload3.out.push("<!--[!-->");
                    }
                    $$payload3.out.push(`<!--]--></div></div></div></div>`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----> `);
                if (venue.venuefeatured) {
                  $$payload2.out.push("<!--[-->");
                  Aspect_ratio($$payload2, {
                    ratio: 16 / 9,
                    children: ($$payload3) => {
                      $$payload3.out.push(`<img${attr("src", `/pic/venue/${stringify(venue.venuepic2)}`)}${attr("alt", venue.venuename)} class="w-full h-full object-cover"/>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$payload2.out.push("<!--[!-->");
                }
                $$payload2.out.push(`<!--]--> <!---->`);
                Card_content($$payload2, {
                  class: "p-4 px-6 pb-4 space-y-4",
                  children: ($$payload3) => {
                    $$payload3.out.push(`<p class="text-md text-muted-foreground">${escape_html(getVenueEventCount(venue.venueid))} upcoming events</p>`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!---->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (viewMode === "detail" && selectedVenueId) {
      $$payload.out.push("<!--[-->");
      const selectedVenue = venues.find((v) => v.venueid.toString() === selectedVenueId);
      if (store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).isLoading) {
        $$payload.out.push("<!--[-->");
        Loading($$payload, { variant: "detail" });
      } else {
        $$payload.out.push("<!--[!-->");
        if (selectedVenue) {
          $$payload.out.push("<!--[-->");
          const venueEvents = getVenueEvents(selectedVenue.venueid);
          $$payload.out.push(`<div class="space-y-8">`);
          if (selectedVenue.venuefeatured) {
            $$payload.out.push("<!--[-->");
            Aspect_ratio($$payload, {
              class: "pb-2",
              ratio: 16 / 9,
              children: ($$payload2) => {
                $$payload2.out.push(`<img${attr("src", `/pic/venue/${stringify(selectedVenue.venuepic2)}`)}${attr("alt", `${stringify(selectedVenue.venuename)} Banner`)} class="w-full h-full object-cover"/>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$payload.out.push("<!--[!-->");
          }
          $$payload.out.push(`<!--]--> <!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_header($$payload2, {
                class: "gap-0",
                children: ($$payload3) => {
                  $$payload3.out.push(`<div class="flex items-center gap-6"><!---->`);
                  Avatar($$payload3, {
                    class: "w-32 h-32 rounded-lg",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->`);
                      Avatar_image($$payload4, {
                        src: `/pic/venue/${stringify(selectedVenue.venuepic1)}`,
                        alt: selectedVenue.venuename,
                        class: "rounded-lg"
                      });
                      $$payload4.out.push(`<!----> <!---->`);
                      Avatar_fallback($$payload4, {
                        class: "rounded-lg bg-muted text-lg",
                        children: ($$payload5) => {
                          $$payload5.out.push(`<!---->${escape_html(selectedVenue.venuename.charAt(0))}`);
                        },
                        $$slots: { default: true }
                      });
                      $$payload4.out.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> <div class="space-y-1"><!---->`);
                  Card_title($$payload3, {
                    class: "text-3xl font-bold",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->${escape_html(selectedVenue.venuename)}`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> <div class="flex gap-2">`);
                  Badge($$payload3, {
                    variant: "secondary",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->${escape_html(selectedVenue.venuetype.toUpperCase())}`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> `);
                  if (selectedVenue.venuefeatured) {
                    $$payload3.out.push("<!--[-->");
                    Badge($$payload3, {
                      children: ($$payload4) => {
                        Star($$payload4, {});
                        $$payload4.out.push(`<!----> Featured`);
                      },
                      $$slots: { default: true }
                    });
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--></div> <p class="pt-3 text-md text-muted-foreground">${escape_html(venueEvents.length)} upcoming events</p></div></div>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!----> <!---->`);
              Card_content($$payload2, {
                class: "pt-3 px-6",
                children: ($$payload3) => {
                  $$payload3.out.push(`<div class="text-sm text-muted-foreground">📍 <a${attr("href", selectedVenue.venuelink)} target="_blank" rel="noopener noreferrer" class="hover:underline">${escape_html(selectedVenue.cityname)}</a></div>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!----> <h3 class="text-3xl font-semibold mt-10 mb-4 text-center">Upcoming Events</h3> `);
          if (venueEvents.length > 0) {
            $$payload.out.push("<!--[-->");
            EventList($$payload, {
              events: venueEvents,
              venueData: store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data || [],
              brandData: store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data || [],
              onEventClick: goToEvent
            });
          } else {
            $$payload.out.push("<!--[!-->");
            $$payload.out.push(`<div class="text-center py-6"><!---->`);
            Button($$payload, {
              variant: "default",
              size: "lg",
              class: "bg-primary text-primary-foreground hover:bg-primary/90",
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->Notify me`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!----></div>`);
          }
          $$payload.out.push(`<!--]--></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">Venue not found.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> <nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8"><div class="flex items-center justify-start">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goHome,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->Home`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goToList,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->← Back`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  }
  $$payload.out.push(`<!--]--></div> <div class="flex items-center justify-center"></div> <div class="flex items-center justify-end"></div></div></div></nav>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Brands($$payload, $$props) {
  push();
  var $$store_subs;
  const viewMode = store_get($$store_subs ??= {}, "$appStore", appStore).currentView === "brands-detail" ? "detail" : "list";
  const selectedBrandId = store_get($$store_subs ??= {}, "$appStore", appStore).selectedBrandId || null;
  const brandsQuery = createQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch(`/api/brands.php`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    }
  });
  const eventsQuery = createQuery({
    queryKey: [
      "events",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/events.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    }
  });
  const venuesQuery = createQuery({
    queryKey: [
      "venues",
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage,
      store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity
    ],
    queryFn: async () => {
      const response = await fetch(`/api/venues.php?lang=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedLanguage}&city=${store_get($$store_subs ??= {}, "$userStore", userStore).selectedCity}`);
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    }
  });
  const brands = store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data || [];
  const getBrandEventCount = (brandId) => {
    return (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).data || []).filter((event) => {
      const brandIds = event.brandid.split(",").map((id) => id.replace(/\^/g, ""));
      return brandIds.includes(brandId.toString());
    }).length;
  };
  const getBrandEvents = (brandId) => {
    const brandEvents = (store_get($$store_subs ??= {}, "$eventsQuery", eventsQuery).data || []).filter((event) => {
      const brandIds = event.brandid.split(",").map((id) => id.replace(/\^/g, ""));
      return brandIds.includes(brandId.toString());
    });
    return brandEvents.sort((a, b) => {
      if (a.eventfeatured !== b.eventfeatured) return Number(b.eventfeatured) - Number(a.eventfeatured);
      return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
    });
  };
  function selectBrand(brandId) {
    window.scrollTo(0, 0);
  }
  function goHome() {
  }
  function goToList() {
  }
  function goToEvent(eventId) {
  }
  $$payload.out.push(`<div class="space-y-8">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="space-y-4"><h1 class="text-4xl font-bold text-center">Brands</h1></div> <div class="grid gap-8">`);
    if (store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).isLoading) {
      $$payload.out.push("<!--[-->");
      Loading($$payload, { variant: "list" });
    } else {
      $$payload.out.push("<!--[!-->");
      if (store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).error) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<!---->`);
        Card($$payload, {
          children: ($$payload2) => {
            $$payload2.out.push(`<!---->`);
            Card_content($$payload2, {
              class: "p-4",
              children: ($$payload3) => {
                $$payload3.out.push(`<p class="text-destructive">Failed to load brands. Please try again.</p>`);
              },
              $$slots: { default: true }
            });
            $$payload2.out.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$payload.out.push(`<!---->`);
      } else {
        $$payload.out.push("<!--[!-->");
        if (brands.length === 0) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">No brands available.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        } else {
          $$payload.out.push("<!--[!-->");
          const each_array = ensure_array_like(brands);
          $$payload.out.push(`<!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let brand = each_array[$$index];
            $$payload.out.push(`<!---->`);
            Card($$payload, {
              class: "py-4 pb-0 gap-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
              onclick: () => selectBrand(brand.brandid.toString()),
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->`);
                Card_header($$payload2, {
                  class: "gap-0 pb-4",
                  children: ($$payload3) => {
                    $$payload3.out.push(`<div class="flex justify-between items-center"><div class="flex items-center gap-4"><!---->`);
                    Avatar($$payload3, {
                      class: "w-16 h-16 rounded-lg",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->`);
                        Avatar_image($$payload4, {
                          src: `/pic/brand/${stringify(brand.brandpic1)}`,
                          alt: brand.brandname,
                          class: "rounded-lg"
                        });
                        $$payload4.out.push(`<!----> <!---->`);
                        Avatar_fallback($$payload4, {
                          class: "rounded-lg bg-muted",
                          children: ($$payload5) => {
                            $$payload5.out.push(`<!---->${escape_html(brand.brandname.charAt(0))}`);
                          },
                          $$slots: { default: true }
                        });
                        $$payload4.out.push(`<!---->`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!----> <div class="space-y-1"><!---->`);
                    Card_title($$payload3, {
                      class: "text-xl font-semibold",
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->${escape_html(brand.brandname)}`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!----> <div class="flex gap-2">`);
                    if (brand.brandfeatured) {
                      $$payload3.out.push("<!--[-->");
                      Badge($$payload3, {
                        children: ($$payload4) => {
                          Star($$payload4, {});
                          $$payload4.out.push(`<!----> Featured`);
                        },
                        $$slots: { default: true }
                      });
                    } else {
                      $$payload3.out.push("<!--[!-->");
                    }
                    $$payload3.out.push(`<!--]--></div></div></div></div>`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----> `);
                if (brand.brandfeatured) {
                  $$payload2.out.push("<!--[-->");
                  Aspect_ratio($$payload2, {
                    ratio: 16 / 9,
                    children: ($$payload3) => {
                      $$payload3.out.push(`<img${attr("src", `/pic/brand/${stringify(brand.brandpic2)}`)}${attr("alt", brand.brandname)} class="w-full h-full object-cover"/>`);
                    },
                    $$slots: { default: true }
                  });
                } else {
                  $$payload2.out.push("<!--[!-->");
                }
                $$payload2.out.push(`<!--]--> <!---->`);
                Card_content($$payload2, {
                  class: "p-4 px-6 pb-4 space-y-4",
                  children: ($$payload3) => {
                    $$payload3.out.push(`<p class="text-md text-muted-foreground">${escape_html(getBrandEventCount(brand.brandid))} upcoming events</p>`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!---->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (viewMode === "detail" && selectedBrandId) {
      $$payload.out.push("<!--[-->");
      const selectedBrand = brands.find((b) => b.brandid.toString() === selectedBrandId);
      if (store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).isLoading) {
        $$payload.out.push("<!--[-->");
        Loading($$payload, { variant: "detail" });
      } else {
        $$payload.out.push("<!--[!-->");
        if (selectedBrand) {
          $$payload.out.push("<!--[-->");
          const brandEvents = getBrandEvents(selectedBrand.brandid);
          $$payload.out.push(`<div class="space-y-8">`);
          if (selectedBrand.brandfeatured) {
            $$payload.out.push("<!--[-->");
            Aspect_ratio($$payload, {
              class: "pb-2",
              ratio: 16 / 9,
              children: ($$payload2) => {
                $$payload2.out.push(`<img${attr("src", `/pic/brand/${stringify(selectedBrand.brandpic2)}`)}${attr("alt", `${stringify(selectedBrand.brandname)} Banner`)} class="w-full h-full object-cover"/>`);
              },
              $$slots: { default: true }
            });
          } else {
            $$payload.out.push("<!--[!-->");
          }
          $$payload.out.push(`<!--]--> <!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_header($$payload2, {
                class: "gap-0",
                children: ($$payload3) => {
                  $$payload3.out.push(`<div class="flex items-center gap-6"><!---->`);
                  Avatar($$payload3, {
                    class: "w-32 h-32 rounded-lg",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->`);
                      Avatar_image($$payload4, {
                        src: `/pic/brand/${stringify(selectedBrand.brandpic1)}`,
                        alt: selectedBrand.brandname,
                        class: "rounded-lg"
                      });
                      $$payload4.out.push(`<!----> <!---->`);
                      Avatar_fallback($$payload4, {
                        class: "rounded-lg bg-muted text-lg",
                        children: ($$payload5) => {
                          $$payload5.out.push(`<!---->${escape_html(selectedBrand.brandname.charAt(0))}`);
                        },
                        $$slots: { default: true }
                      });
                      $$payload4.out.push(`<!---->`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> <div class="space-y-1"><!---->`);
                  Card_title($$payload3, {
                    class: "text-3xl font-bold",
                    children: ($$payload4) => {
                      $$payload4.out.push(`<!---->${escape_html(selectedBrand.brandname)}`);
                    },
                    $$slots: { default: true }
                  });
                  $$payload3.out.push(`<!----> <div class="flex gap-2">`);
                  if (selectedBrand.brandfeatured) {
                    $$payload3.out.push("<!--[-->");
                    Badge($$payload3, {
                      children: ($$payload4) => {
                        Star($$payload4, {});
                        $$payload4.out.push(`<!----> Featured`);
                      },
                      $$slots: { default: true }
                    });
                  } else {
                    $$payload3.out.push("<!--[!-->");
                  }
                  $$payload3.out.push(`<!--]--></div> <p class="pt-3 text-md text-muted-foreground">${escape_html(brandEvents.length)} upcoming events</p></div></div>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!----> <h3 class="text-3xl font-semibold mt-10 mb-4 text-center">Upcoming Events</h3> `);
          if (brandEvents.length > 0) {
            $$payload.out.push("<!--[-->");
            EventList($$payload, {
              events: brandEvents,
              venueData: store_get($$store_subs ??= {}, "$venuesQuery", venuesQuery).data || [],
              brandData: store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data || [],
              onEventClick: goToEvent
            });
          } else {
            $$payload.out.push("<!--[!-->");
            $$payload.out.push(`<div class="text-center py-6"><!---->`);
            Button($$payload, {
              variant: "default",
              size: "lg",
              class: "bg-primary text-primary-foreground hover:bg-primary/90",
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->Notify me`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!----></div>`);
          }
          $$payload.out.push(`<!--]--></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          $$payload.out.push(`<!---->`);
          Card($$payload, {
            children: ($$payload2) => {
              $$payload2.out.push(`<!---->`);
              Card_content($$payload2, {
                class: "p-4",
                children: ($$payload3) => {
                  $$payload3.out.push(`<p class="text-muted-foreground">Brand not found.</p>`);
                },
                $$slots: { default: true }
              });
              $$payload2.out.push(`<!---->`);
            },
            $$slots: { default: true }
          });
          $$payload.out.push(`<!---->`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> <nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8"><div class="flex items-center justify-start">`);
  if (viewMode === "list") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goHome,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->Home`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<!---->`);
    Button($$payload, {
      variant: "outline",
      size: "sm",
      onclick: goToList,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->← Back`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!---->`);
  }
  $$payload.out.push(`<!--]--></div> <div class="flex items-center justify-center"></div> <div class="flex items-center justify-end"></div></div></div></nav>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function Input($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    type,
    files = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  if (type === "file") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<input${spread_attributes(
      {
        "data-slot": "input",
        class: clsx$1(cn("selection:bg-primary dark:bg-input/30 selection:text-primary-foreground border-input ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 pt-1.5 text-sm font-medium outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className)),
        type: "file",
        ...restProps
      },
      null,
      void 0,
      void 0,
      4
    )}/>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<input${spread_attributes(
      {
        "data-slot": "input",
        class: clsx$1(cn("border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", className)),
        type,
        value,
        ...restProps
      },
      null,
      void 0,
      void 0,
      4
    )}/>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { ref, value, files });
  pop();
}
function Label($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Label$1($$payload2, spread_props([
      {
        "data-slot": "label",
        class: cn("flex select-none items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Textarea($$payload, $$props) {
  push();
  let {
    ref = null,
    value = void 0,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  $$payload.out.push(`<textarea${spread_attributes(
    {
      "data-slot": "textarea",
      class: clsx$1(cn("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content shadow-xs flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)),
      ...restProps
    }
  )}>`);
  const $$body = escape_html(value);
  if ($$body) {
    $$payload.out.push(`${$$body}`);
  }
  $$payload.out.push(`</textarea>`);
  bind_props($$props, { ref, value });
  pop();
}
function Radio_group($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    value = "",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Radio_group$1($$payload2, spread_props([
      {
        "data-slot": "radio-group",
        class: cn("grid gap-3", className)
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        get value() {
          return value;
        },
        set value($$value) {
          value = $$value;
          $$settled = false;
        }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref, value });
  pop();
}
function Radio_group_item($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    {
      let children = function($$payload3, { checked }) {
        $$payload3.out.push(`<div data-slot="radio-group-indicator" class="relative flex items-center justify-center">`);
        if (checked) {
          $$payload3.out.push("<!--[-->");
          Circle($$payload3, {
            class: "fill-primary absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
          });
        } else {
          $$payload3.out.push("<!--[!-->");
        }
        $$payload3.out.push(`<!--]--></div>`);
      };
      Radio_group_item$1($$payload2, spread_props([
        {
          "data-slot": "radio-group-item",
          class: cn("border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 shadow-xs aspect-square size-4 shrink-0 rounded-full border outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className)
        },
        restProps,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children,
          $$slots: { default: true }
        }
      ]));
    }
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
function Progress($$payload, $$props) {
  push();
  let {
    ref = null,
    class: className,
    max = 100,
    value,
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<!---->`);
    Progress$1($$payload2, spread_props([
      {
        "data-slot": "progress",
        class: cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className),
        value,
        max
      },
      restProps,
      {
        get ref() {
          return ref;
        },
        set ref($$value) {
          ref = $$value;
          $$settled = false;
        },
        children: ($$payload3) => {
          $$payload3.out.push(`<div data-slot="progress-indicator" class="bg-primary h-full w-full flex-1 transition-all"${attr_style(`transform: translateX(-${stringify(100 - 100 * (value ?? 0) / (max ?? 1))}%)`)}></div>`);
        },
        $$slots: { default: true }
      }
    ]));
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { ref });
  pop();
}
class BookingValidator {
  constants;
  constructor(constants) {
    this.constants = constants;
  }
  get phoneSchema() {
    return z.string().regex(/^\+[1-9]\d{7,14}$/, "Invalid international phone format");
  }
  get commentSchema() {
    return z.string().max(this.constants.MAX_COMMENT_LENGTH, `Comment must be ${this.constants.MAX_COMMENT_LENGTH} characters or less`);
  }
  get guestsSchema() {
    return z.number().min(1, "At least 1 guest required").max(this.constants.MAX_GUESTS, `Maximum ${this.constants.MAX_GUESTS} guests allowed`);
  }
  get brandQuantitySchema() {
    return z.number().min(1, "Minimum 1 item").max(this.constants.MAX_QTY_PER_BRAND, `Maximum ${this.constants.MAX_QTY_PER_BRAND} items per brand`);
  }
  get paymentMethodSchema() {
    return z.enum(["aba", "ipay88", "stars"], { errorMap: () => ({ message: "Please select a payment method" }) });
  }
  get bookingSchema() {
    return z.object({
      eventId: z.string().min(1, "Event ID required"),
      selectedBrands: z.record(this.brandQuantitySchema),
      guests: this.guestsSchema,
      phone: this.phoneSchema,
      comment: this.commentSchema.optional(),
      paymentMethod: this.paymentMethodSchema
    });
  }
}
function Booking($$payload, $$props) {
  push();
  var $$store_subs;
  const { event, venue } = $$props;
  let footerVisible = true;
  let isProcessing = false;
  let phoneInputTouched = false;
  const brandsQuery = createQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await fetch(`/api/brands.php`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    }
  });
  const currentStep = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.currentStep || 1;
  const selectedBrands = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.selectedBrands || {};
  const guests = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.guests || 1;
  const phone = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.phone || store_get($$store_subs ??= {}, "$userStore", userStore).userData?.user?.phone || "+855";
  const comment = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.comment || "";
  const paymentMethod = store_get($$store_subs ??= {}, "$appStore", appStore).bookingState?.paymentMethod || "";
  const constants = store_get($$store_subs ??= {}, "$userStore", userStore).userData?.constants;
  const validator = constants ? new BookingValidator(constants) : null;
  const eventBrandIds = event.brandid.split(",").map((id) => id.replace(/\^/g, ""));
  const eventBrands = store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).data?.filter((b) => eventBrandIds.includes(b.brandid.toString())) || [];
  const totalItems = Object.values(selectedBrands).reduce((sum, qty) => sum + qty, 0);
  const estimatedTotal = totalItems * (event.eventschemaprice || 0);
  const formattedTotal = constants ? `${constants.CURRENCY_SYMBOL}${estimatedTotal.toFixed(constants.CURRENCY_PRECISION)}` : `${estimatedTotal}`;
  const phoneValidation = (() => {
    return validator.phoneSchema.safeParse(phone).success;
  })();
  const commentValidation = (() => {
    return validator.commentSchema.safeParse(comment).success;
  })();
  const canProceedFromStep1 = totalItems > 0;
  const canProceedFromStep2 = phoneValidation;
  const canProceedFromStep3 = commentValidation;
  const canCompleteBooking = paymentMethod !== "";
  const progressPercentage = currentStep / 4 * 100;
  function toggleFooter(show) {
    if (!show) {
      setTimeout(() => footerVisible = false, 300);
    } else {
      footerVisible = true;
    }
  }
  function updateBrandQuantity(brandId, quantity) {
    const newBrands = { ...selectedBrands };
    if (quantity === 0) {
      delete newBrands[brandId];
    } else {
      newBrands[brandId] = quantity;
    }
    appActions.updateBookingState({ selectedBrands: newBrands });
  }
  function updateGuests(value) {
    const guestCount = parseInt(value);
    if (!isNaN(guestCount)) {
      appActions.updateBookingState({ guests: guestCount });
    }
  }
  function updatePhone(value) {
    phoneInputTouched = true;
    appActions.updateBookingState({ phone: value });
  }
  function updateComment(value) {
    appActions.updateBookingState({ comment: value });
  }
  function updatePaymentMethod(value) {
    appActions.updateBookingState({ paymentMethod: value });
  }
  function nextStep() {
    if (currentStep < 4) {
      appActions.updateBookingState({ currentStep: currentStep + 1 });
    }
  }
  function prevStep() {
    if (currentStep > 1) {
      appActions.updateBookingState({ currentStep: currentStep - 1 });
    }
  }
  function handleCancel() {
    appActions.clearBooking();
  }
  async function handleCompleteBooking() {
    isProcessing = true;
    await new Promise((resolve) => setTimeout(resolve, 2e3));
    isProcessing = false;
  }
  const stepTitles = ["Drinks", "Guests", "Details", "Payment"];
  $$payload.out.push(`<div class="space-y-8"><div class="text-center space-y-4 pt-6"><h1 class="text-2xl font-bold">Book Your Event</h1> <p class="text-muted-foreground">${escape_html(event.eventtitle)} at ${escape_html(venue.venuename)}</p></div> `);
  if (store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).isLoading) {
    $$payload.out.push("<!--[-->");
    Loading($$payload, { variant: "booking" });
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$brandsQuery", brandsQuery).error) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<!---->`);
      Card($$payload, {
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->`);
          Card_content($$payload2, {
            class: "p-4",
            children: ($$payload3) => {
              $$payload3.out.push(`<p class="text-destructive">Failed to load drink options. Please try again.</p>`);
            },
            $$slots: { default: true }
          });
          $$payload2.out.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (!constants) {
        $$payload.out.push("<!--[-->");
        Loading($$payload, { variant: "booking" });
      } else {
        $$payload.out.push("<!--[!-->");
        const each_array = ensure_array_like(stepTitles);
        $$payload.out.push(`<div class="space-y-6"><div class="space-y-3"><div class="flex justify-between items-center"><!--[-->`);
        for (let index = 0, $$length = each_array.length; index < $$length; index++) {
          let title = each_array[index];
          $$payload.out.push(`<div class="flex flex-col items-center gap-2 flex-1"><div${attr_class(`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${stringify(currentStep > index + 1 ? "bg-primary text-primary-foreground" : currentStep === index + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}`)}>${escape_html(index + 1)}</div> <span${attr_class(`text-xs text-center ${stringify(currentStep === index + 1 ? "text-primary font-medium" : "text-muted-foreground")}`)}>${escape_html(title)}</span></div>`);
        }
        $$payload.out.push(`<!--]--></div> <!---->`);
        Progress($$payload, { value: progressPercentage, class: "w-full" });
        $$payload.out.push(`<!----></div> `);
        if (currentStep === 1) {
          $$payload.out.push("<!--[-->");
          const each_array_1 = ensure_array_like(eventBrands);
          $$payload.out.push(`<div class="space-y-4"><h3 class="text-lg font-semibold">Select Your Drinks</h3> <div class="grid gap-4"><!--[-->`);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let brand = each_array_1[$$index_1];
            $$payload.out.push(`<!---->`);
            Card($$payload, {
              class: "p-4",
              children: ($$payload2) => {
                $$payload2.out.push(`<div class="flex justify-between items-center"><div class="flex items-center gap-3"><!---->`);
                Avatar($$payload2, {
                  class: "w-8 h-8 rounded-lg",
                  children: ($$payload3) => {
                    $$payload3.out.push(`<!---->`);
                    Avatar_image($$payload3, {
                      src: `/pic/brand/${stringify(brand.brandpic1)}`,
                      alt: brand.brandname,
                      class: "rounded-lg"
                    });
                    $$payload3.out.push(`<!----> <!---->`);
                    Avatar_fallback($$payload3, {
                      children: ($$payload4) => {
                        $$payload4.out.push(`<!---->${escape_html(brand.brandname.charAt(0))}`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload3.out.push(`<!---->`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----> <h4 class="font-medium">${escape_html(brand.brandname)}</h4></div> <div class="flex items-center gap-2"><!---->`);
                Button($$payload2, {
                  variant: "outline",
                  size: "sm",
                  onclick: () => updateBrandQuantity(brand.brandid.toString(), Math.max(0, (selectedBrands[brand.brandid.toString()] || 0) - 1)),
                  children: ($$payload3) => {
                    $$payload3.out.push(`<!---->-`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----> <span class="w-8 text-center">${escape_html(selectedBrands[brand.brandid.toString()] || 0)}</span> <!---->`);
                Button($$payload2, {
                  variant: "outline",
                  size: "sm",
                  onclick: () => updateBrandQuantity(brand.brandid.toString(), (selectedBrands[brand.brandid.toString()] || 0) + 1),
                  children: ($$payload3) => {
                    $$payload3.out.push(`<!---->+`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----></div></div>`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!---->`);
          }
          $$payload.out.push(`<!--]--></div> `);
          if (totalItems > 0) {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<div class="p-4 bg-muted rounded-lg"><p class="font-medium">Items: ${escape_html(totalItems)}</p> <p class="text-sm text-muted-foreground">Estimated Total: ${escape_html(formattedTotal)}</p></div>`);
          } else {
            $$payload.out.push("<!--[!-->");
          }
          $$payload.out.push(`<!--]--></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (currentStep === 2) {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`<div class="space-y-4"><h3 class="text-lg font-semibold">Guest Information</h3> <div class="space-y-4"><div class="space-y-2"><!---->`);
            Label($$payload, {
              for: "guestCount",
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->Number of Guests`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!----> <!---->`);
            Root($$payload, {
              type: "single",
              value: guests.toString(),
              onValueChange: updateGuests,
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->`);
                Select_trigger($$payload2, {
                  children: ($$payload3) => {
                    $$payload3.out.push(`<!---->${escape_html(guests)} Guest${escape_html(guests > 1 ? "s" : "")}`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!----> <!---->`);
                Select_content($$payload2, {
                  children: ($$payload3) => {
                    const each_array_2 = ensure_array_like(Array(constants.MAX_GUESTS));
                    $$payload3.out.push(`<!--[-->`);
                    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
                      each_array_2[i];
                      $$payload3.out.push(`<!---->`);
                      Select_item($$payload3, {
                        value: (i + 1).toString(),
                        children: ($$payload4) => {
                          $$payload4.out.push(`<!---->${escape_html(i + 1)} Guest${escape_html(i > 0 ? "s" : "")}`);
                        },
                        $$slots: { default: true }
                      });
                      $$payload3.out.push(`<!---->`);
                    }
                    $$payload3.out.push(`<!--]-->`);
                  },
                  $$slots: { default: true }
                });
                $$payload2.out.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!----></div> <div class="space-y-2"><!---->`);
            Label($$payload, {
              for: "phone",
              children: ($$payload2) => {
                $$payload2.out.push(`<!---->Phone Number`);
              },
              $$slots: { default: true }
            });
            $$payload.out.push(`<!----> <!---->`);
            Input($$payload, {
              id: "phone",
              type: "tel",
              value: phone,
              oninput: (e) => updatePhone(e.target.value),
              placeholder: "+855 12 345 678",
              onfocus: () => toggleFooter(false),
              onblur: () => {
                phoneInputTouched = true;
                toggleFooter(true);
              }
            });
            $$payload.out.push(`<!----> `);
            if (phoneInputTouched && !phoneValidation && phone.length > 0) {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<p class="text-xs text-destructive">Please enter a valid international phone number</p>`);
            } else {
              $$payload.out.push("<!--[!-->");
            }
            $$payload.out.push(`<!--]--></div></div></div>`);
          } else {
            $$payload.out.push("<!--[!-->");
            if (currentStep === 3) {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<div class="space-y-4"><h3 class="text-lg font-semibold">Additional Details</h3> <div class="space-y-4"><div class="space-y-2"><!---->`);
              Label($$payload, {
                for: "comment",
                children: ($$payload2) => {
                  $$payload2.out.push(`<!---->Special Requests (Optional)`);
                },
                $$slots: { default: true }
              });
              $$payload.out.push(`<!----> <!---->`);
              Textarea($$payload, {
                id: "comment",
                value: comment,
                oninput: (e) => updateComment(e.target.value),
                placeholder: "Any special requests or notes...",
                maxlength: constants.MAX_COMMENT_LENGTH,
                onfocus: () => toggleFooter(false),
                onblur: () => toggleFooter(true)
              });
              $$payload.out.push(`<!----> <p${attr_class(`text-xs ${stringify(commentValidation ? "text-muted-foreground" : "text-destructive")}`)}>${escape_html(comment.length)}/${escape_html(constants.MAX_COMMENT_LENGTH)} characters</p></div></div> <div class="p-4 bg-muted rounded-lg space-y-2"><h4 class="font-medium">Booking Summary</h4> <p class="text-sm">Items: ${escape_html(totalItems)}</p> <p class="text-sm">Estimated Total: ${escape_html(formattedTotal)}</p></div></div>`);
            } else {
              $$payload.out.push("<!--[!-->");
              if (currentStep === 4) {
                $$payload.out.push("<!--[-->");
                $$payload.out.push(`<div class="space-y-4"><h3 class="text-lg font-semibold">Payment Method</h3> <!---->`);
                Radio_group($$payload, {
                  value: paymentMethod,
                  onValueChange: updatePaymentMethod,
                  class: "space-y-3",
                  children: ($$payload2) => {
                    $$payload2.out.push(`<div class="flex items-center space-x-2"><!---->`);
                    Radio_group_item($$payload2, { value: "aba" });
                    $$payload2.out.push(`<!----> <!---->`);
                    Label($$payload2, {
                      for: "aba",
                      class: "flex items-center gap-2",
                      children: ($$payload3) => {
                        $$payload3.out.push(`<span>🏦 ABA QR Pay</span> <span class="text-xs text-muted-foreground">- Scan QR code with ABA Mobile</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload2.out.push(`<!----></div> <div class="flex items-center space-x-2"><!---->`);
                    Radio_group_item($$payload2, { value: "ipay88" });
                    $$payload2.out.push(`<!----> <!---->`);
                    Label($$payload2, {
                      for: "ipay88",
                      class: "flex items-center gap-2",
                      children: ($$payload3) => {
                        $$payload3.out.push(`<span>💳 Credit/Debit Card</span> <span class="text-xs text-muted-foreground">- Visa, MasterCard, Local Banks</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload2.out.push(`<!----></div> <div class="flex items-center space-x-2"><!---->`);
                    Radio_group_item($$payload2, { value: "telegram_stars" });
                    $$payload2.out.push(`<!----> <!---->`);
                    Label($$payload2, {
                      for: "telegram_stars",
                      class: "flex items-center gap-2",
                      children: ($$payload3) => {
                        $$payload3.out.push(`<span>⭐ Telegram Stars</span> <span class="text-xs text-muted-foreground">- Pay with Telegram Stars</span>`);
                      },
                      $$slots: { default: true }
                    });
                    $$payload2.out.push(`<!----></div>`);
                  },
                  $$slots: { default: true }
                });
                $$payload.out.push(`<!----> <div class="p-4 bg-muted rounded-lg space-y-2"><h4 class="font-medium">Final Summary</h4> <p class="text-sm">Event: ${escape_html(event.eventtitle)}</p> <p class="text-sm">Venue: ${escape_html(venue?.venuename)}</p> <p class="text-sm">Guests: ${escape_html(guests)}</p> <p class="text-sm">Total Amount: ${escape_html(formattedTotal)}</p></div></div>`);
              } else {
                $$payload.out.push("<!--[!-->");
              }
              $$payload.out.push(`<!--]-->`);
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]--></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> `);
  if (footerVisible) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<nav class="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-t z-50"><div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-[1fr_auto_1fr] items-center pt-4 pb-8"><div class="flex items-center justify-start">`);
    if (currentStep > 1) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<!---->`);
      Button($$payload, {
        variant: "outline",
        onclick: prevStep,
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->← Back`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div> <div class="flex items-center justify-center"><!---->`);
    Button($$payload, {
      variant: "outline",
      onclick: handleCancel,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->Cancel`);
      },
      $$slots: { default: true }
    });
    $$payload.out.push(`<!----></div> <div class="flex items-center justify-end">`);
    if (currentStep < 4) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<!---->`);
      Button($$payload, {
        onclick: nextStep,
        disabled: currentStep === 1 && !canProceedFromStep1 || currentStep === 2 && !canProceedFromStep2 || currentStep === 3 && !canProceedFromStep3,
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->Continue`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<!---->`);
      Button($$payload, {
        onclick: handleCompleteBooking,
        disabled: !canCompleteBooking || isProcessing,
        children: ($$payload2) => {
          $$payload2.out.push(`<!---->${escape_html(isProcessing ? "Processing..." : "Book")}`);
        },
        $$slots: { default: true }
      });
      $$payload.out.push(`<!---->`);
    }
    $$payload.out.push(`<!--]--></div></div></div></nav>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1e3, gcTime: 10 * 60 * 1e3 }
    }
  });
  QueryClientProvider($$payload, {
    client: queryClient,
    children: ($$payload2) => {
      $$payload2.out.push(`<div class="min-h-[100svh] bg-background" style="--app-footer-h: calc(var(--footer-h, 72px) + env(safe-area-inset-bottom, 0px));">`);
      if (store_get($$store_subs ??= {}, "$appStore", appStore).isLoading) {
        $$payload2.out.push("<!--[-->");
        Loading($$payload2, { message: "Loading Trojeak..." });
      } else {
        $$payload2.out.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$appStore", appStore).error) {
          $$payload2.out.push("<!--[-->");
          $$payload2.out.push(`<div class="flex items-center justify-center min-h-screen"><div class="w-full max-w-2xl mx-auto p-6 bg-card text-card-foreground shadow-sm border rounded-lg"><div class="text-center"><h2 class="text-xl font-semibold mb-2">Connection Error</h2> <p class="text-muted-foreground">${escape_html(store_get($$store_subs ??= {}, "$appStore", appStore).error)}</p></div></div></div>`);
        } else {
          $$payload2.out.push("<!--[!-->");
          if (store_get($$store_subs ??= {}, "$userStore", userStore).isUserDataLoaded) {
            $$payload2.out.push("<!--[-->");
            if (!store_get($$store_subs ??= {}, "$appStore", appStore).currentView.startsWith("booking-step-")) {
              $$payload2.out.push("<!--[-->");
              Header($$payload2);
            } else {
              $$payload2.out.push("<!--[!-->");
            }
            $$payload2.out.push(`<!--]--> <main class="mx-auto w-full max-w-2xl px-4 pt-0 pb-[var(--app-footer-h)] mb-8">`);
            if (store_get($$store_subs ??= {}, "$appStore", appStore).currentView === "home") {
              $$payload2.out.push("<!--[-->");
              Home($$payload2);
            } else {
              $$payload2.out.push("<!--[!-->");
              if (store_get($$store_subs ??= {}, "$appStore", appStore).currentView.startsWith("events-")) {
                $$payload2.out.push("<!--[-->");
                Events($$payload2, {
                  initialEventId: store_get($$store_subs ??= {}, "$appStore", appStore).selectedEventId
                });
              } else {
                $$payload2.out.push("<!--[!-->");
                if (store_get($$store_subs ??= {}, "$appStore", appStore).currentView.startsWith("venues-")) {
                  $$payload2.out.push("<!--[-->");
                  Venues($$payload2);
                } else {
                  $$payload2.out.push("<!--[!-->");
                  if (store_get($$store_subs ??= {}, "$appStore", appStore).currentView.startsWith("brands-")) {
                    $$payload2.out.push("<!--[-->");
                    Brands($$payload2);
                  } else {
                    $$payload2.out.push("<!--[!-->");
                    if (store_get($$store_subs ??= {}, "$appStore", appStore).currentView.startsWith("booking-step-")) {
                      $$payload2.out.push("<!--[-->");
                      if (store_get($$store_subs ??= {}, "$appStore", appStore).selectedEvent && store_get($$store_subs ??= {}, "$appStore", appStore).selectedVenue) {
                        $$payload2.out.push("<!--[-->");
                        Booking($$payload2, {
                          event: store_get($$store_subs ??= {}, "$appStore", appStore).selectedEvent,
                          venue: store_get($$store_subs ??= {}, "$appStore", appStore).selectedVenue
                        });
                      } else {
                        $$payload2.out.push("<!--[!-->");
                      }
                      $$payload2.out.push(`<!--]-->`);
                    } else {
                      $$payload2.out.push("<!--[!-->");
                    }
                    $$payload2.out.push(`<!--]-->`);
                  }
                  $$payload2.out.push(`<!--]-->`);
                }
                $$payload2.out.push(`<!--]-->`);
              }
              $$payload2.out.push(`<!--]-->`);
            }
            $$payload2.out.push(`<!--]--></main>`);
          } else {
            $$payload2.out.push("<!--[!-->");
            Loading($$payload2, { message: "Loading user preferences..." });
          }
          $$payload2.out.push(`<!--]-->`);
        }
        $$payload2.out.push(`<!--]-->`);
      }
      $$payload2.out.push(`<!--]--></div>`);
    },
    $$slots: { default: true }
  });
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
