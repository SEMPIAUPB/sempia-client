# SEMPIA Client (Frontend SPA Web)

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white&style=for-the-badge" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Monaco_Editor-VS_Code_Core-007ACC?logo=visual-studio-code&logoColor=white&style=for-the-badge" alt="Monaco Editor" />
</p>

---

## 📖 Descripción

**`sempia-client`** es la interfaz de usuario web (*Single Page Application*) de la plataforma SEMPIA. Proporciona una experiencia de programación interactiva, reactiva y libre de recargas de página, combinando un editor de código profesional, visualización dinámica de grafos cognitivos, acompañamiento socrático asistido por Inteligencia Artificial y un sistema de gamificación en tiempo real.

---

## ✨ Características Principales

* **Editor de Código en Tres Columnas (`CodeEditorView.tsx`):**
  * **Columna Izquierda:** Enunciado del problema con renderizado de Markdown, fórmulas LaTeX, restricciones algorítmicas y casos de prueba de ejemplo (`VISIBLE`).
  * **Columna Central:** Editor profesional integrado con `@monaco-editor/react` (el núcleo de VS Code) con resaltado sintáctico, atajos estándar, selector de lenguaje (Python 3.10, C++ 11, Java) y consola dinámica de veredictos (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, etc.) con métricas de tiempo de CPU (ms) y memoria (KB).
  * **Columna Derecha:** Panel del Asistente Pedagógico IA con historial de pistas progresivas (1/5 a 5/5) y botón socrático condicionado a veredictos erróneos.
* **Visualizador Interactivo de Habilidades (`SkillGraphView.tsx`):**
  * Renderizado del Grafo Acíclico Dirigido (DAG) mediante `react-force-graph-2d`.
  * Nodos con físicas 2D interactivos codificados por colores según el porcentaje de maestría calculado por el motor DKT (Verde $\ge 90\%$, Azul $50\text{-}89\%$, Gris $< 50\%$).
* **Ecosistema de Gamificación:**
  * **Leaderboard (`RankingView.tsx`):** Podio visual para los 3 primeros lugares y tabla paginada con niveles, puntos de experiencia ($XP$) y rachas activas (🔥).
  * **Retos y Competencias (`CompetitionsView.tsx`):** Listado y participación en desafíos semanales temporales.
  * **Vitrina de Logros (`AchievementsView.tsx`):** Muestra de insignias desbloqueadas con fecha de otorgamiento y motivo pedagógico.
* **Examen Diagnóstico Inicial (`DiagnosticExamView.tsx`):**
  * Flujo guiado de evaluación inicial que inicializa la posición del alumno en el grafo cognitivo con un tope máximo del 40% de maestría.
* **Historial de Envíos Estilo Juez Internacional (`SubmissionsHistoryView.tsx`):**
  * Tabla con filtrado por ejercicio, veredicto coloreado, tiempos de ejecución y modal para inspeccionar el código fuente histórico.

---

## 🛠️ Stack Tecnológico

* **Core:** React 18 & TypeScript 5
* **Bundler & Dev Server:** Vite 5
* **Estilos:** TailwindCSS & Lucide Icons
* **Editor:** `@monaco-editor/react`
* **Visualización de Grafos:** `react-force-graph-2d`
* **Manejo de Estado Global:** `zustand` (autenticación JWT y persistencia)
* **Gestión de Peticiones y Caché:** `@tanstack/react-query`
* **Formularios y Validación:** `react-hook-form` & `zod`
* **Enrutamiento:** `react-router-dom` v7

---

## 🚀 Instalación y Ejecución Local

### 1. Requisitos Previos
* Node.js v18.x o superior
* npm v9.x o superior

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Variables de Entorno (Opcional)
El cliente cuenta con resolución dinámica de URL. Por defecto, si no se especifica `VITE_API_BASE_URL`, calcula la dirección del backend automáticamente a partir del `hostname` del navegador (`http://${window.location.hostname}:8000/api/v1`).

Si deseas fijar una URL de API personalizada, crea un archivo `.env`:
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Servidor de Desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en:
* **Local:** `http://localhost:5173/`
* **Red Wi-Fi (LAN):** `http://<TU_IP_LOCAL>:5173/`

### 5. Compilación para Producción
```bash
npm run build
# Para previsualizar el build compilado:
npm run preview
```

---

## 🌐 Exposición a la Red Wi-Fi Local (Móviles y Tablets)

El servidor de desarrollo Vite y el cliente API están preconfigurados con `host: 0.0.0.0` y resolución dinámica de `apiClient.ts`. Para probar el sistema desde un celular o tablet en la misma red Wi-Fi:
1. Conecta ambos dispositivos a la misma red Wi-Fi.
2. Identifica la IP local de tu computador (ej. `192.168.1.5`).
3. Abre el navegador en tu teléfono e ingresa a: `http://192.168.1.5:5173/`.
4. El cliente se comunicará automáticamente con el backend en `http://192.168.1.5:8000/api/v1`.

---

## 🐳 Despliegue con Docker (Nginx Reverso)

El repositorio incluye un `Dockerfile` multietapa optimizado:
* **Etapa 1:** Compilación estática con Node 20 Alpine.
* **Etapa 2:** Servidor Nginx ligero con compresión gzip y proxy reverso hacia el backend Django en `/api/`.

```bash
docker build -t sempia-client .
docker run -d -p 80:80 sempia-client
```

---

## 📂 Estructura del Proyecto

```
sempia-client/
├── src/
│   ├── app/                 # Configuración principal de la app y providers
│   ├── features/            # Módulos basados en dominio
│   │   ├── auth/            # Login, Registro y Layout de autenticación
│   │   ├── dashboard/       # Vista principal y resumen de actividad
│   │   ├── diagnostic/      # Evaluación diagnóstica inicial
│   │   ├── exercises/       # Catálogo y buscador de problemas
│   │   ├── gamification/    # Leaderboard, Logros y Retos semanales
│   │   ├── skills/          # Grafo ForceGraph 2D y Ruta ZDP
│   │   └── submissions/     # Editor Monaco en 3 columnas e Historial
│   ├── layouts/             # Layouts estructurales (DashboardLayout con Sidebar)
│   ├── routes/              # Configuración de React Router
│   ├── services/            # Clientes API (apiClient con interceptores JWT)
│   ├── store/               # Stores de Zustand (authStore, etc.)
│   └── types/               # Definiciones de tipos TypeScript
├── nginx.conf               # Configuración de proxy para despliegue en producción
├── vite.config.ts           # Configuración de Vite (host 0.0.0.0, plugins)
└── package.json
```
