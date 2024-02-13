<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

import type { Appearance, Position, Size, Styles, Theme } from "./types";

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: Function;
  }
}

export default defineComponent({
  name: "VueTurnstile",
  emits: ["rendering", "rendered", "verified"],
  props: {
    siteKey: {
      type: String,
      required: true,
    },
    theme: {
      type: String as PropType<Theme>,
      required: false,
      default: "auto",
    },
    size: {
      type: String as PropType<Size>,
      required: false,
      default: "normal",
    },
    position: {
      type: String as PropType<Position>,
      required: false,
      default: undefined,
    },
    autoReset: {
      type: Boolean,
      required: false,
      default: false,
    },
    resetTimeout: {
      type: Number,
      required: false,
      default: 295 * 1000,
    },
    recaptchaCompat: {
      type: Boolean,
      required: false,
      default: false,
    },
    explicitRender: {
      type: Boolean,
      required: false,
      default: false,
    },
    appearance: {
      type: String as PropType<Appearance>,
      required: false,
      default: "always",
    },
  },
  data() {
    return {
      widgetId: null as string | null,
      observer: null as MutationObserver | null,
    };
  },
  methods: {
    init() {
      const script: HTMLScriptElement = document.createElement("script");
      const turnstileSrc =
        "https://challenges.cloudflare.com/turnstile/v0/api.js";
      const callback = "onloadTurnstileCallback";
      const compat = this.recaptchaCompat ? "&compat=recaptcha" : "";
      const render = this.explicitRender ? "&render=explicit" : "";

      script.src = `${turnstileSrc}?onload=${callback}${compat}${render}`;
      script.async = true;
      script.defer = true;

      document.head.appendChild(script);
    },
    initObserver() {
      const iframe = document.getElementById(
        this.widgetId as string,
      ) as HTMLIFrameElement;
      const turnstileBox: HTMLElement = iframe!.parentNode as HTMLElement;

      if (turnstileBox && iframe && !this.observer) {
        const observerConfig = {
          attributes: true,
          attributeFilter: ["style"],
        };

        const observerCallback = () => {
          const styles: Styles = {
            position: "fixed",
            bottom: "5px",
            zIndex: "1000",
          };

          styles[this.position! as string] = "5px";

          Object.assign(iframe.style, styles);

          setTimeout(() => {
            iframe.style.display = "none";
          }, 5000);
        };

        this.observer = new MutationObserver(observerCallback);

        this.observer.observe(iframe, observerConfig);
      }
    },
    reset() {
      if (window.turnstile) {
        window.turnstile.reset(this.widgetId as string);
      }
    },
    remove() {
      if (this.widgetId) {
        window.turnstile.remove(this.widgetId as string);

        this.widgetId = null;
      }
    },
    render() {
      this.widgetId = window.turnstile.render("#cf-turnstile", {
        sitekey: this.siteKey,
        theme: this.theme,
        size: this.size,
        appearance: this.appearance,
        callback: (token: string) => {
          this.$emit("verified", token);

          this.remove();

          if (this.autoReset) {
            setTimeout(() => {
              this.reset();
            }, this.resetTimeout);
          }
        },
        expiredCallback: (): void => {
          this.reset();
        },
        errorCallback: (error: any): void => {
          console.error(`Error callback: ${error}`);
        },
      });

      if (this.position !== undefined) {
        this.initObserver();
      }

      this.$emit("rendered");
    },
    async execute() {
      await new Promise((resolve, reject) => {
        if (!this.widgetId || !window.turnstile) {
          reject(new Error("Turnstile widget is not initialized."));

          return;
        }

        const tempCallbackName = `tempCallback_${String(Date.now())}`;

        (window as any)[tempCallbackName as string] = (token: string) => {
          resolve(token);

          delete (window as any)[tempCallbackName as string];
        };
      });
    },
  },
  beforeMount() {
    if (window.turnstile === undefined || !window.turnstile) {
      this.init();
    }
  },
  mounted() {
    this.$emit("rendering");

    if (window.turnstile === undefined || !window.turnstile) {
      window.onloadTurnstileCallback = () => {
        this.render();
      };
    } else {
      this.render();
    }
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.remove();
  },
});
</script>

<template>
  <div id="cf-turnstile">
    <slot />
  </div>
</template>
