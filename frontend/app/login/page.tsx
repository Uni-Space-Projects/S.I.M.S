"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Inicio de sesión exitoso");
                console.log("Usuario:", data.user);
                setTimeout(() => {
                    router.push("/publications");
                }, 1500);
            } else {
                setMessage(data.message || "Error al iniciar sesión");
                setLoading(false);
            }
        } catch (error) {
            setMessage("No se pudo conectar con el servidor");
            console.error("Error en login:", error);
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-linear-to-r from-emerald-800 via-emerald-500 to-emerald-300 px-4">
            <section className="w-full max-w-sm rounded-2xl bg-emerald-400 p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white">
                        Iniciar sesión
                    </h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Correo electrónico
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-3 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-3 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-300"
                    >
                        {loading ? "Ingresando..." : "Entrar"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                        Regístrate aquí
                    </Link>
                </p>

                {message && (
                    <p className="mt-5 text-center text-sm font-medium text-gray-700">
                        {message}
                    </p>
                )}
            </section>
        </main>
    );
}