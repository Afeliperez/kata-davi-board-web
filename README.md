# kata-davi-board-web

Estructura base Angular con arquitectura hexagonal y control de sesión por vigencia de token.

## Estructura de carpetas (Hexagonal)

```text
src/
	app/
		domain/
			entities/
			ports/
		application/
			use-cases/
		infrastructure/
			adapters/
			services/
		presentation/
			components/
			guards/
			interceptors/
			pages/
			services/
```

## Flujo de autenticación y sesión

- El login guarda token y expiración en `localStorage`.
- Las rutas protegidas (`/home`) validan token vigente mediante guard.
- Si el token no es válido:
	- se limpia la sesión,
	- se muestra pop-up de sesión expirada,
	- se redirige a pantalla de inicio (`/login`).
- El interceptor también controla expiración/401 en llamadas HTTP para forzar el mismo comportamiento.

## Ejecutar

1. `npm install`
2. `npm start`

> El repositorio de autenticación está mockeado en infraestructura (`HttpAuthRepository`) para facilitar la integración posterior con API real.
