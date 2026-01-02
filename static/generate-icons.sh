#!/bin/bash
# Script pour générer les icônes PWA à partir du SVG

if ! command -v convert &> /dev/null; then
    echo "ImageMagick n'est pas installé. Installation..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y imagemagick
    elif command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "Veuillez installer ImageMagick manuellement"
        exit 1
    fi
fi

echo "Génération des icônes PWA..."
convert -background none -resize 192x192 static/icon.svg static/icon-192.png
convert -background none -resize 512x512 static/icon.svg static/icon-512.png
echo "✅ Icônes générées: icon-192.png et icon-512.png"
