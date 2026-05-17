import {Role} from "./roles.enum";

export class Usuario {
    private _id: number;
    private _nombre:string
    private _apellido:string
    private _correo: string;
    private _contrasena: string;
    private _rol: Role;
    private _telefono:string;


    constructor(id: number, nombre: string, apellido: string, correo: string, contrasena: string, rol: Role, telefono: string) {
        this._id = id;
        this._nombre = nombre;
        this._apellido = apellido;
        this._correo = correo;
        this._contrasena = contrasena;
        this._rol = rol;
        this._telefono = telefono;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get correo(): string {
        return this._correo;
    }

    set correo(value: string) {
        this._correo = value;
    }

    get contrasena(): string {
        return this._contrasena;
    }

    set contrasena(value: string) {
        this._contrasena = value;
    }

    get nombre(): string {
        return this._nombre;
    }

    set nombre(value: string) {
        this._nombre = value;
    }

    get apellido(): string {
        return this._apellido;
    }

    set apellido(value: string) {
        this._apellido = value;
    }

    get telefono(): string {
        return this._telefono;
    }

    set telefono(value: string) {
        this._telefono = value;
    }

    get rol(): Role {
        return this._rol;
    }

    set rol(value: Role) {
        this._rol = value;
    }
}

