"use client";

import { type FormEvent, useId, useState } from "react";
import { emit } from "@/lib/bus";
import type { Lang } from "@/lib/i18n";
import { play } from "@/lib/sound";

const TEXT = {
  fr: {
    name: "Nom",
    email: "E-mail",
    message: "Message",
    placeholder: "Votre projet, une opportunité, une question…",
    send: "Envoyer le message",
    sending: "Envoi en cours…",
    success: "Message livré. Je vous réponds rapidement.",
    error: "L'envoi a échoué. Écrivez-moi directement :",
    invalidEmail: "Adresse e-mail invalide.",
    required: "Ce champ est requis.",
    privacy: "Vos nom, e-mail et message servent uniquement à vous répondre. Ils ne sont ni stockés sur ce site ni partagés.",
    fallback: "Écrire un e-mail",
    subject: "Nouveau message depuis le portfolio",
  },
  en: {
    name: "Name",
    email: "Email",
    message: "Message",
    placeholder: "Your project, an opportunity, a question…",
    send: "Send message",
    sending: "Sending…",
    success: "Message delivered. I will get back to you shortly.",
    error: "Sending failed. Write to me directly:",
    invalidEmail: "Invalid email address.",
    required: "This field is required.",
    privacy: "Your name, email and message are only used to reply to you. They are neither stored on this site nor shared.",
    fallback: "Write an email",
    subject: "New message from the portfolio",
  },
} as const;

type Status = "idle" | "sending" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

/**
 * Formulaire de contact : envoi via Web3Forms, le message arrive par e-mail.
 * Sans clé configurée, il laisse place à un lien e-mail classique.
 */
export function ContactForm({ lang, accessKey, email }: { lang: Lang; accessKey: string; email: string }) {
  const tx = TEXT[lang];
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});

  if (!accessKey) {
    return (
      <a className="btn btn--primary" href={`mailto:${email}`}>
        {tx.fallback}
      </a>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    const next: Errors = {};
    if (!values.name) next.name = tx.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = values.email ? tx.invalidEmail : tx.required;
    if (!values.message) next.message = tx.required;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    // Champ piège : rempli uniquement par les robots.
    if (data.get("botcheck")) return;

    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: tx.subject,
          from_name: "Portfolio Legma Parfait",
          ...values,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) throw new Error("send failed");
      setStatus("success");
      form.reset();
      play("copy");
      const box = form.getBoundingClientRect();
      emit("net:burst", { x: box.left + box.width / 2, y: box.top + box.height / 2 });
    } catch {
      setStatus("error");
    }
  };

  const field = (name: keyof Errors) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    onInput: () => errors[name] && setErrors((prev) => ({ ...prev, [name]: undefined })),
  });

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form__row">
        <div className="field">
          <label htmlFor={`${id}-name`}>{tx.name}</label>
          <input type="text" autoComplete="name" required {...field("name")} />
          {errors.name ? <p id={`${id}-name-error`} className="field__error">{errors.name}</p> : null}
        </div>
        <div className="field">
          <label htmlFor={`${id}-email`}>{tx.email}</label>
          <input type="email" autoComplete="email" inputMode="email" required {...field("email")} />
          {errors.email ? <p id={`${id}-email-error`} className="field__error">{errors.email}</p> : null}
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${id}-message`}>{tx.message}</label>
        <textarea rows={5} placeholder={tx.placeholder} required {...field("message")} />
        {errors.message ? <p id={`${id}-message-error`} className="field__error">{errors.message}</p> : null}
      </div>
      <input type="checkbox" name="botcheck" className="contact-form__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <div className="contact-form__foot">
        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? tx.sending : tx.send}
        </button>
        <p className="contact-form__status" role="status" data-status={status}>
          {status === "success" ? tx.success : null}
          {status === "error" ? (
            <>
              {tx.error} <a href={`mailto:${email}`}>{email}</a>
            </>
          ) : null}
        </p>
      </div>
      <p className="note">{tx.privacy}</p>
    </form>
  );
}
