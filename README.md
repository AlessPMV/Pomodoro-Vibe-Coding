# Pomodoro-Vibe-Coding

Aplicación web tipo **Pomodoro** construida únicamente con **HTML, CSS y JavaScript puros** (sin frameworks ni librerías externas), siguiendo una metodología de desarrollo asistido por prompts (Vibe Coding).

## Características

- **Temporizador funcional**: ciclos de trabajo y descanso con anillo de progreso SVG.
- **Selector de métodos Pomodoro**:
  | Método | Trabajo | Descanso corto | Descanso largo |
  |--------|---------|----------------|----------------|
  | Clásico | 25 min | 5 min | 15 min (cada 4 pomodoros) |
  | Regla 52/17 | 52 min | 17 min | 17 min (cada 2) |
  | Trabajo profundo | 90 min | 20 min | 30 min (cada 2) |
  | Extendido | 50 min | 10 min | 20 min (cada 3) |

  El descanso largo se sugiere automáticamente tras completar los pomodoros definidos por cada método.
- **Controles**: botones de **Iniciar**, **Pausar** y **Reiniciar**, con estados deshabilitados según el contexto.
- **Notificaciones al finalizar cada ciclo**:
  - Sonora: alerta generada con la **Web Audio API** (osciladores, sin archivos de audio).
  - Visual: parpadeo del título de la pestaña, animación de pulso en la tarjeta y cambio de tema de colores (rojo para trabajo, verde para descanso).
- **Contador de ciclos**: número de pomodoros completados durante la sesión.
- **UI/UX**:
  - HTML5 semántico (`header`, `main`, `section`, `footer`, `role="timer"`, `aria-live`, `aria-pressed`).
  - Responsive y adaptativo a móvil y escritorio (unidades fluidas, `clamp()`, `dvh`).
  - **Fondo colorido animado**: manchas de gradiente ("aurora") que se mueven lentamente y cambian de paleta según la fase (cálido para trabajo, verde para descanso corto, violeta para descanso largo), con tarjeta glassmorphism.
  - Modo claro/oscuro automático según `prefers-color-scheme`.
  - Soporte de `prefers-reduced-motion`.

## Cómo usarlo

No requiere build ni dependencias. Opciones:

1. Abrir `index.html` directamente en el navegador.
2. O servir la carpeta con un servidor estático:

```bash
# Python
python -m http.server 8080
# Node.js
npx serve .
```

Luego visitar `http://localhost:8080`.

> Nota: los navegadores exigen un gesto del usuario para reproducir audio; por eso el sonido se habilita al pulsar "Iniciar".

## Estructura del proyecto

```
Pomodoro-Vibe-Coding-main/
├── index.html        # Estructura semántica de la app
├── css/
│   └── styles.css    # Estilos responsive, temas por modo y modo oscuro
├── js/
│   └── app.js        # Lógica del temporizador, audio y estado
└── README.md         # Este archivo + registro de prompts
```

## Decisiones técnicas

- La cuenta regresiva se calcula contra `Date.now()` (timestamp objetivo) en lugar de decrementar un contador, lo que evita derivas aunque el navegador limite los intervalos en pestañas en segundo plano.
- El anillo de progreso es un `<circle>` SVG controlado con `stroke-dasharray` / `stroke-dashoffset`.
- La alarma sonora usa `OscillatorNode` + `GainNode` con envolvente exponencial; no hay archivos binarios.

---

## Registro de prompts (Vibe Coding)

Bitácora de la secuencia de prompts usada para construir esta aplicación. Cada nuevo prompt de la sesión se añadirá aquí.

| N.º | Fecha | Tema |
|-----|-------------|------|
| 1 | 2026-08-25 | MVP: temporizador 25/5, controles, notificaciones, contador de ciclos y UI responsive |
| 2 | 2026-08-25 | Fondo más colorido y selector de métodos Pomodoro |

### Prompt 1 — MVP Pomodoro (2026-08-25)

> Desarrolla una aplicación web tipo Pomodoro utilizando únicamente HTML, CSS y JavaScript, sin el uso de frameworks ni librerías externas de interfaz o lógica. Los requerimientos funcionales son los siguientes: Temporizador Funcional: Ciclos predefinidos de 25 minutos de trabajo (Work) y 5 minutos de descanso (Short Break). Controles del Temporizador: Botones de control para Iniciar, Pausar y Reiniciar la cuenta regresiva. Notificaciones: Alerta sonora (usando Audio API web) y/o visual (cambios de estado en la pestaña/interfaz) al finalizar cada ciclo. Contador de Ciclos: Contador persistente en memoria que indique la cantidad de Pomodoros completados en la sesión. Interfaz de Usuario (UI/UX): Diseño responsive, limpio, accesible (semántica HTML5) y adaptativo a dispositivos móviles y de escritorio. Adicionalmente quiero que la secuencia de este y los próximos prompts se quede registrado en el readme si es posible, o sino en otro archivo.

### Prompt 2 — Fondo colorido + métodos Pomodoro (2026-08-25)

> Quiero que la página tenga un fondo más colorido, además que permita elegir entre los diferentes métodos de pomodoro

<!-- Próximos prompts se agregarán debajo con su número, fecha y texto -->
