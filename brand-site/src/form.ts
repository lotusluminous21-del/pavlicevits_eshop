/**
 * Lead form: client-side validation with Greek messages.
 * TODO: wire the payload to a backend (Formspree / cloud function /
 * shop inbox) before go-live — for now a valid submit shows the
 * confirmation state and logs the payload.
 */
export function initLeadForm(): void {
  const form = document.getElementById('lead-form') as HTMLFormElement | null;
  if (!form) return;
  const success = document.getElementById('lead-form-success');

  const setError = (key: string, show: boolean, field?: HTMLElement | null) => {
    const msg = form.querySelector<HTMLElement>(`[data-error-for="${key}"]`);
    if (msg) msg.hidden = !show;
    field?.classList.toggle('is-invalid', show);
  };

  const validators: { key: string; valid: () => boolean; field: () => HTMLElement | null }[] = [
    {
      key: 'lf-name',
      field: () => form.querySelector('#lf-name'),
      valid: () => {
        const el = form.querySelector<HTMLInputElement>('#lf-name');
        return !!el && el.value.trim().length >= 2;
      },
    },
    {
      key: 'lf-email',
      field: () => form.querySelector('#lf-email'),
      valid: () => {
        const el = form.querySelector<HTMLInputElement>('#lf-email');
        return !!el && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      },
    },
    {
      key: 'lf-phone',
      field: () => form.querySelector('#lf-phone'),
      valid: () => {
        const el = form.querySelector<HTMLInputElement>('#lf-phone');
        return !!el && /^[+\d][\d\s\-()]{8,}$/.test(el.value.trim());
      },
    },
    {
      key: 'project-type',
      field: () => null,
      valid: () => !!form.querySelector<HTMLInputElement>('input[name="project-type"]:checked'),
    },
    {
      key: 'lf-message',
      field: () => form.querySelector('#lf-message'),
      valid: () => {
        const el = form.querySelector<HTMLTextAreaElement>('#lf-message');
        return !!el && el.value.trim().length >= 10;
      },
    },
  ];

  // clear a field's error as soon as it becomes valid again
  form.addEventListener('input', () => {
    validators.forEach((v) => {
      if (v.valid()) setError(v.key, false, v.field());
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid: HTMLElement | null = null;
    validators.forEach((v) => {
      const ok = v.valid();
      setError(v.key, !ok, v.field());
      if (!ok && !firstInvalid) {
        firstInvalid = v.field() ?? form.querySelector(`[data-error-for="${v.key}"]`);
      }
    });

    if (firstInvalid) {
      (firstInvalid as HTMLElement).focus?.();
      (firstInvalid as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());
    console.info('[lead-form] valid submission', payload);

    form.querySelectorAll<HTMLElement>('input, textarea, button, fieldset').forEach((el) => {
      (el as HTMLInputElement).disabled = true;
    });
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}
