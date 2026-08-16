#!/bin/bash
# Script para inicializar el repositorio de GitHub

echo "Inicializando repositorio Git..."
git init

echo "Agregando archivos..."
git add .

echo "Creando primer commit..."
git commit -m "feat: commit inicial del proyecto educativo para enfermería"

echo "Renombrando rama principal a main..."
git branch -M main

echo ""
echo "================================================================"
echo "Repositorio local inicializado con éxito."
echo "Para conectarlo con tu repositorio remoto de GitHub, ejecuta:"
echo "git remote add origin https://github.com/tu-usuario/app-enfermeria.git"
echo "git push -u origin main"
echo "================================================================"
