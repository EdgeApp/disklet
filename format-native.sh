#!/usr/bin/env sh

formatJava() {
  tool="google-java-format-1.7-all-deps.jar"
  url="https://github.com/google/google-java-format/releases/download/google-java-format-1.7/$tool"

  # If the tool is missing, grab it from GitHub:
  if [ ! -e "./$tool" ]; then
    curl -L -o "./$tool" "$url"
  fi

  java -jar "./$tool" --replace ./android/src/main/java/com/reactlibrary/*.java
}

formatObjectiveC() {
  if ! which -s clang-format; then
    echo "Please install clang-format using your system's package manager,"
    echo "like 'brew install clang-format' on OS X."
  fi

  clang-format -i ./ios/*.{h,m}
}

# Pass --java or --objc to just check one or the other:
if [ "$1" = "--java" ]; then
  formatJava
elif [ "$1" = "--objc" ]; then
  formatObjectiveC
else
  formatJava
  formatObjectiveC
fi
