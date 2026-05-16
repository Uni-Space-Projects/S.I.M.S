
export class Usuario {
    private _id: number;
    private _nombre:string
    private _apellido:string
    private _correo: string;
    private _contrasena: string;
    //Al agregarle un ? despues de la variable el sistema lo trata como opcional
    private _rol?: "administrador" | "usuario" | undefined;
    private _telefono:string;


    constructor(id: number, nombre: string, apellido: string, correo: string, contrasena: string, telefono: string, rol?: "administrador" | "usuario" | undefined) {
        this._id = id;
        this._nombre = nombre;
        this._apellido = apellido;
        this._correo = correo;
        this._contrasena = contrasena;
        if (rol !== undefined){
            this._rol = rol;
        }
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


    get rol(): "administrador" | "usuario" | undefined {
        return this._rol;
    }

    set rol(value: "administrador" | "usuario" | undefined) {
        this._rol = value;
    }
}