import { defineStore } from 'pinia';

export const useConfirmStore = defineStore('confirm', {
  state: () => ({
    confirmDialogActive: false,
    confirmDialogText: '',
    confirmDialogConfirmText: 'Confirm',

    _resolve: null as null | (() => void),
    _reject: null as null | (() => void)
  }),

  actions: {
    open(text: string, confirmText = 'Confirm') {
      this.confirmDialogActive = true;
      this.confirmDialogText = text;
      this.confirmDialogConfirmText = confirmText;

      return new Promise<void>((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
      });
    },

    confirm() {
      this.confirmDialogActive = false;
      this._resolve?.();
      this._cleanup();
    },

    cancel() {
      this.confirmDialogActive = false;
      this._reject?.();
      this._cleanup();
    },

    _cleanup() {
      this._resolve = null;
      this._reject = null;
    }
  }
});
