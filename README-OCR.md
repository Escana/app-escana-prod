# Configuración de OCR con OpenAI

Este documento explica cómo configurar y utilizar la funcionalidad de OCR con OpenAI en entornos locales y de producción.

## Requisitos

1. Una cuenta de OpenAI con API key
2. Una cuenta de Supabase con URL y clave anónima

## Variables de Entorno

Asegúrate de tener las siguientes variables de entorno configuradas:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

