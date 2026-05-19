# 🏆 Quiniela Modumex · Mundial 2026

Quiniela interna del Grupo Modumex para el Mundial 2026.
App web estática alojada en GitHub Pages.

## 🌐 URL pública

Una vez activado GitHub Pages:
```
https://TU-USUARIO.github.io/quiniela-modumex/
```

## 📁 Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS en un solo archivo) |
| `data.json` | Los datos oficiales: participantes, quinielas, resultados |
| `README.md` | Este archivo |
| `.nojekyll` | Le dice a GitHub Pages que no procese con Jekyll |

## 🎯 Cómo funciona

- **Visitantes (empleados)**: ven la quiniela en modo lectura. La app descarga `data.json` del repositorio y muestra la tabla, resultados y eliminatoria.
- **Admin (capturista)**: inicia sesión desde la propia app, captura datos en su navegador, descarga el `data.json` actualizado y lo sube al repo.

## 🔄 Actualizar los datos (flujo del admin)

1. Abrir la app y hacer login como admin
2. Capturar resultados / quinielas / participantes
3. Ir a la pestaña **⚙️ Admin** → clic en **⬇️ Publicar**
4. Se descarga `data.json` a la carpeta de Descargas
5. Subirlo a este repo reemplazando el anterior (web, GitHub Desktop, o `git push`)
6. En 1–2 minutos los empleados ven la actualización

## ⚠️ Notas importantes

- **El repo es público**: cualquier persona con la URL puede ver los datos de la quiniela.
- **La contraseña admin está hardcodeada en `index.html`** (`ADMIN_PASS`). Cualquiera puede verla en el código fuente; sirve solo para evitar capturas accidentales, no como seguridad real. Lo que importa es lo que se sube a `data.json`.
- GitHub guarda historial de cada commit → funciona como respaldo automático.

## 🛠️ Desarrollo local

Para probar antes de subir cambios:

```bash
# Cualquier servidor estático sirve
python3 -m http.server 8080
# Luego abre http://localhost:8080
```

No funciona abriendo `index.html` directo desde el archivo (`file://`) porque el fetch del `data.json` lo bloquea el navegador por seguridad.

---

🇲🇽 ¡Arriba México!
