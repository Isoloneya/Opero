"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const session = await login(email, password);
      localStorage.setItem("opero_access_token", session.access_token);
      router.push("/dashboard");;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не вдалося виконати вхід";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Opero</p>
        <h1>Вхід до системи</h1>

        <label htmlFor="email">
          Email
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label htmlFor="password">
          Пароль
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Виконуємо вхід" : "Увійти"}
        </button>
      </form>
    </main>
  );
}