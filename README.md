# kata-davi-board-web

Frontend Angular 19 (standalone components) para autenticación, gestión de usuarios/proyectos y tablero Scrum con control de acceso por rol.

## ¿Qué hace este repositorio?

- Implementa flujo de autenticación (login, sesión activa, logout).
- Protege rutas (`/home`, `/home/project-board/:pro`) con guard de sesión.
- Maneja expiración de token y errores `401` desde interceptor para cerrar sesión de forma consistente.
- Renderiza home según rol (`ADMIN`, `SM/SCRUM`, `PO`, `DEV`, `QA`) y habilita operaciones según políticas.
- Incluye tablero Scrum con drag & drop de HU y reglas de transición por rol.
- Integra loader global y modal de sesión expirada para feedback de estado.

## Arquitectura hexagonal aplicada

El proyecto está organizado por capas, con dependencias hacia adentro (presentación -> aplicación -> dominio) y adaptadores concretos en infraestructura.

```text
src/app/
	application/
		use-cases/
			auth/
			home/
	domain/
		ports/
		policies/
	infrastructure/
		adapters/
			auth/
			home/
		services/
			auth/
	presentation/
		features/
			auth/
			home/
		guards/
		interceptors/
		shared/
```

### Prácticas hexagonales implementadas

- **Puertos en dominio**: contratos en `domain/ports` (`auth-repository.port.ts`, `home-data-repository.port.ts`) desacoplan casos de uso de detalles HTTP.
- **Casos de uso en aplicación**: lógica de negocio en `application/use-cases/*` (login, logout, check-session, carga y gestión de datos).
- **Adaptadores en infraestructura**: implementaciones HTTP en `infrastructure/adapters/*` conectan APIs sin contaminar dominio/aplicación.
- **Políticas de negocio explícitas**: `domain/policies/project-role-policy.service.ts` centraliza permisos por rol y transiciones de estado.
- **Capa de presentación delgada**: componentes/guards/interceptor orquestan UI y delegan comportamiento a casos de uso/políticas.
- **Inversión de dependencias**: presentación y aplicación dependen de abstracciones (puertos), no de implementaciones concretas.

## Buenas prácticas UI aplicadas

- **Standalone components** para modularidad y carga diferida por ruta.
- **Reactive Forms con validaciones** (requeridos, patrones, mínimos) y control de errores de entrada.
- **Control de acceso en UI por rol** (habilitar/ocultar acciones según políticas de dominio).
- **Estados de carga y error explícitos** (`isLoading`, mensajes de error por sección).
- **Feedback global de navegación** con `GlobalLoaderComponent` + `GlobalLoaderService`.
- **Manejo de sesión consistente** con `SessionExpiredModalComponent` ante expiración/token inválido.
- **Optimización de render** en secciones de alto movimiento con `ChangeDetectionStrategy.OnPush`.
- **Estructura reusable de pantalla Home** en componentes (`header`, `body`, `footer`, secciones).

## Aliases de imports

Se usan aliases TypeScript para mejorar legibilidad y evitar rutas relativas largas:

- `@app/*`
- `@application/*`
- `@domain/*`
- `@infrastructure/*`
- `@presentation/*`

## Scripts

- `npm start`: inicia app en modo desarrollo.
- `npm run lint`: ejecuta ESLint sobre `src/**/*.ts`.
- `npm test`: ejecuta pruebas unitarias con Jest.
- `npm run test:coverage`: reporte de cobertura.
- `npm run test:e2e`: suite e2e (config Jest separada para Node/Supertest).
- `npm run build`: compila app con prevalidación automática (`lint` + `test` vía `prebuild`).

## Calidad y pruebas

- Suite de pruebas unitarias en capas de dominio, aplicación, infraestructura y presentación.
- Pruebas de guard/interceptor para reglas de seguridad de sesión.
- Pruebas de componentes de formularios, validaciones, permisos y drag & drop.
- Cobertura configurada para medir `src/app/**/*.ts`.

## Instalación rápida

1. `npm install`
2. `npm start`

Para validar calidad completa antes de publicar cambios:

1. `npm run lint`
2. `npm run test:coverage`
3. `npm run build`
