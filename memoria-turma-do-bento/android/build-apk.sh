#!/usr/bin/env bash
# Gera o APK sem Android Studio/Gradle, usando as ferramentas de linha de comando
# (no Ubuntu: apt install aapt dalvik-exchange zipalign apksigner).
# Uso: ANDROID_JAR=/caminho/android.jar ./build-apk.sh
# O APK sai em android/build/memoria-turma-do-bento.apk, assinado com uma
# chave de debug (android/build/debug.keystore), suficiente para instalar e testar.
set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
JOGO="$(dirname "$AQUI")"
APP="$AQUI/app/src/main"
OUT="$AQUI/build"
: "${ANDROID_JAR:?defina ANDROID_JAR com o android.jar da plataforma (API 35)}"

rm -rf "$OUT/tmp"
mkdir -p "$OUT/tmp/gen" "$OUT/tmp/classes" "$OUT/tmp/assets/www" "$OUT/tmp/dex"

# Mesmos arquivos que o Gradle copia (tarefa copiarJogo em app/build.gradle).
cp "$JOGO/index.html" "$JOGO/jogo.js" "$JOGO/personagens.js" "$OUT/tmp/assets/www/"
cp -r "$JOGO/icons" "$JOGO/personagens" "$OUT/tmp/assets/www/"

# O AndroidManifest.xml do projeto deixa pacote e versões para o Gradle;
# aqui eles entram direto no manifesto.
sed -e 's#<manifest xmlns:android="http://schemas.android.com/apk/res/android">#<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.turmadobento.memoria" android:versionCode="1" android:versionName="0.1">\n    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="35" />#' \
  "$APP/AndroidManifest.xml" > "$OUT/tmp/AndroidManifest.xml"

aapt package -f -m -J "$OUT/tmp/gen" -M "$OUT/tmp/AndroidManifest.xml" -S "$APP/res" \
  -A "$OUT/tmp/assets" -I "$ANDROID_JAR" -F "$OUT/tmp/sem-dex.apk"

javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d "$OUT/tmp/classes" \
  $(find "$APP/java" "$OUT/tmp/gen" -name '*.java')

dalvik-exchange --dex --min-sdk-version=24 --output="$OUT/tmp/dex/classes.dex" "$OUT/tmp/classes"
(cd "$OUT/tmp/dex" && aapt add "$OUT/tmp/sem-dex.apk" classes.dex >/dev/null)

zipalign -f -p 4 "$OUT/tmp/sem-dex.apk" "$OUT/tmp/alinhado.apk"

if [ ! -f "$OUT/debug.keystore" ]; then
  keytool -genkeypair -keystore "$OUT/debug.keystore" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
fi
apksigner sign --ks "$OUT/debug.keystore" --ks-pass pass:android --key-pass pass:android \
  --out "$OUT/memoria-turma-do-bento.apk" "$OUT/tmp/alinhado.apk"
apksigner verify "$OUT/memoria-turma-do-bento.apk"
rm -rf "$OUT/tmp"
echo "APK: $OUT/memoria-turma-do-bento.apk"
