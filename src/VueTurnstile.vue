<script setup lang="ts">
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  defineExpose,
} from "vue";
import emitter from "tiny-emitter/instance";

import type { PropType } from "vue";

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: Function;
  }
}

type Styles = {
  position: string;
  bottom: string;
  zIndex: string;
  [key: string]: string;
};

const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
  theme: {
    type: String as PropType<"light" | "dark" | "auto">,
    required: false,
    default: "auto",
  },
  size: {
    type: String as PropType<"compact" | "normal">,
    required: false,
    default: "normal",
  },
  position: {
    type: String as PropType<"left" | "right">,
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
    type: String as PropType<"always" | "execute" | "interaction-only">,
    required: false,
    default: "always",
  },
});

const emit = defineEmits(["verified", "rendering", "rendered"]);

const widgetId = ref<string | null>(null);
const observer = ref<MutationObserver | null>(null);

const onReset = () => {
  if (window.turnstile) {
    window.turnstile.reset(widgetId.value);
  }
};

const onRemove = () => {
  if (widgetId.value) {
    window.turnstile.remove(widgetId.value);

    widgetId.value = null;
  }
};

const onLoadRender = () => {
  window.onloadTurnstileCallback = () => {
    onRender();
  };
};

const onExecute = async (): Promise<string> => {
  return new Promise((resolve) => {
    const verificationHandler = (token: string) => {
      emitter.off("verified", verificationHandler);

      resolve(token);
    };

    emitter.on("verified", verificationHandler);

    onRender();
  });
};

const onRender = () => {
  const options = {
    sitekey: props.siteKey,
    theme: props.theme,
    size: props.size,
    appearance: props.appearance,
    callback: (token: string) => {
      emit("verified", token);

      onRemove();

      if (props.autoReset) {
        setTimeout(() => {
          onReset();
        }, props.resetTimeout);
      }
    },
    expiredCallback: () => {
      onReset();
    },
    errorCallback: (error: any) => {
      console.error(`Error callback: ${error}`);
    },
  };

  widgetId.value = window.turnstile.render("#cf-turnstile", options);

  if (props.position !== undefined) initObserver();

  emit("rendered");
};

const initObserver = () => {
  const iframe = document.getElementById(
    widgetId.value as string,
  ) as HTMLIFrameElement;
  const turnstileBox: HTMLElement = iframe!.parentNode as HTMLElement;

  if (turnstileBox && iframe && !observer.value) {
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

      styles[props.position! as string] = "5px";

      Object.assign(iframe.style, styles);

      setTimeout(() => {
        iframe.style.display = "none";
      }, 5000);
    };

    observer.value = new MutationObserver(observerCallback);

    observer.value.observe(iframe, observerConfig);
  }
};

const initTurnstile = () => {
  const script: HTMLScriptElement = document.createElement("script");
  const turnstileSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  const callback = "onloadTurnstileCallback";
  const compat = props.recaptchaCompat ? "&compat=recaptcha" : "";
  const render = props.explicitRender ? "&render=explicit" : "";

  script.src = `${turnstileSrc}?onload=${callback}${compat}${render}`;
  script.async = true;
  script.defer = true;

  document.head.appendChild(script);
};

onBeforeMount(() => {
  if (window.turnstile === undefined || !window.turnstile) {
    initTurnstile();
  }
});

onMounted(() => {
  emit("rendering");

  if (window.turnstile === undefined || !window.turnstile) {
    onLoadRender();
  } else {
    onRender();
  }
});

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
  }

  onRemove();
});

defineExpose({
  onExecute,
  onReset,
  onRender,
  onRemove,
});
</script>

<template>
  <div id="cf-turnstile">
    <slot />
  </div>
</template>
