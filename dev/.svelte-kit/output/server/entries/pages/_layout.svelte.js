import { z as head, A as slot } from "../../chunks/index2.js";
function _layout($$payload, $$props) {
  head($$payload, ($$payload2) => {
    $$payload2.out.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>`);
  });
  $$payload.out.push(`<!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!---->`);
}
export {
  _layout as default
};
