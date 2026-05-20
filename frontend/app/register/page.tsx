"use client";

import { useState } from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordconf, setPasswordconf] = useState("");
    const [name, setName] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const rol = "user";

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setMessage("");

        if (password !== passwordconf) {
            setMessage("LAS CONTRASEÑAS NO COINCIDEN");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    apellido: apellido,
                    email: email,
                    password: password,
                    telefono: telefono,
                    rol: rol
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Usuario creado con éxito");
                console.log("Usuario:", data.user);
                setSuccess(true);
            } else {
                if (Array.isArray(data.message)) {
                    setMessage(data.message.join(", ").toUpperCase());
                } else {
                    setMessage((data.message || "Error al crear el usuario").toUpperCase());
                }
                setLoading(false);
            }
        } catch (error) {
            setMessage("No se pudo conectar con el servidor");
            console.error("Error al registrarse:", error);
            setLoading(false);
        }

    }


    return (
        <main className="min-h-screen flex items-center justify-center bg-linear-to-r from-emerald-800 via-emerald-500 to-emerald-300 px-4">
            <section className="w-full max-w-sm rounded-2xl bg-emerald-400 p-8">
                <div className="mb-8">
                    <Link href="/login" className="font-semibold text-left text-xs underline">
                        Volver a login
                    </Link>
                    <h1 className="text-3xl text-center font-bold text-white">
                        Registro
                    </h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Nombre
                        </label>

                        <input
                            id="nombre"
                            type="text"
                            placeholder="Ingresa tu nombre"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Apellido
                        </label>

                        <input
                            id="apellido"
                            type="text"
                            placeholder="Ingresa tu apellido"
                            value={apellido}
                            onChange={(event) => setApellido(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Telefono
                        </label>

                        <input
                            id="telefono"
                            type="tel"
                            placeholder="Ej: 0412-1234567"
                            value={telefono}
                            onChange={(event) => setTelefono(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

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
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
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
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white-700 mb-1"
                        >
                            Confirmar Contraseña
                        </label>

                        <input
                            id="passwordconf"
                            type="password"
                            placeholder="Confirma tu contraseña"
                            value={passwordconf}
                            onChange={(event) => setPasswordconf(event.target.value)}
                            className="w-full rounded-lg border text-black border-gray-300 px-4 py-1 bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-emerald-300"
                    >
                        {loading ? "Creando usuario..." : "Crear Cuenta"}
                    </button>
                </form>
                {message && (
                    <p className="mt-5 text-center text-sm font-medium text-red-700">
                        {message}
                    </p>
                )}
            </section>
            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                        <h2 className="text-2xl font-bold text-emerald-700">
                            Usuario creado con éxito
                        </h2>

                        <p className="mt-4 text-gray-600">
                            Tu cuenta fue registrada correctamente.
                        </p>

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Presiona para ir a Iniciar Sesión
                        </button>
                    </div>
                </div>
            )}
        </main>
            );
}
