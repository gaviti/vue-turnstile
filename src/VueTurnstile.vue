<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

import type { Appearance, Size, Theme } from "./types";
import Emitter from "./emitter";

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: Function;
  }
}

export default defineComponent({
  name: "VueTurnstile",
  emits: ["rendering", "rendered", "verified", "error"],
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
    language: {
      type: String,
      required: false,
      default: "auto",
    },
  },
  data() {
    return {
      widgetId: null as string | null,
    };
  },
  methods: {
    initTurnstile() {
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
    async execute() {
      return new Promise((resolve, reject) => {
        try {
          const verificationHandler = (token: string) => {
            Emitter.off("verified", verificationHandler);

            resolve(token);
          };

          Emitter.on("verified", verificationHandler);

          this.render();
        } catch (error) {
          reject(error);
        }
      });
    },
    render() {
      this.widgetId = window.turnstile.render("#cf-turnstile", {
        sitekey: this.siteKey,
        theme: this.theme,
        size: this.size,
        appearance: this.appearance,
        language: this.language,
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

          this.$emit("error", error);
        },
      });

      this.$emit("rendered");
    },
    onloadTurnstileCallback() {
      window.onloadTurnstileCallback = () => {
        this.render();
      };
    },
  },
  beforeMount() {
    if (window.turnstile === undefined || !window.turnstile) {
      this.initTurnstile();
    }
  },
  mounted() {
    this.$emit("rendering");

    if (window.turnstile === undefined || !window.turnstile) {
      this.onloadTurnstileCallback();
    } else {
      this.render();
    }
  },
  beforeUnmount() {
    this.remove();
  },
});
</script>

<template>
  <div id="cf-turnstile">
    <slot />
  </div>
</template>
