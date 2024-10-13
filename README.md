# Verificador de Pedidos

**Versión:** 1.5

## Descripción

El **Verificador de Pedidos** es una extensión de Chrome diseñada para uso interno. Permite verificar rápidamente si un número seleccionado en una página web corresponde a un pedido que **no debe ser entregado**.

## Uso

1. **Activar la Extensión:**
   - Haz clic en el icono de la extensión en la barra de herramientas de Chrome.
   - Se te solicitará ingresar una lista de números de pedidos (de 4 a 6 dígitos) separados por espacios.

2. **Verificar Números:**
   - Navega por cualquier página web (modificable en `manifest.json`).
   - Selecciona un número de 4 a 6 dígitos.
   - La extensión mostrará un mensaje junto al número seleccionado indicando si el pedido está en la lista de pedidos que no deben ser entregados.

3. **Indicador de Estado:**
   - El icono de la extensión muestra la cantidad de pedidos cargados cuando está activa.
   - Si la extensión está desactivada o sin pedidos cargados, el icono aparece en escala de grises.

## Nota

Esta herramienta es una utilidad específica para verificación interna. Es pública para mostrar de ejemplo cómo realizar una extensión de Chrome.
