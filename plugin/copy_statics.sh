#!/usr/bin/env bash

EXCLUDE='.*\.\(ts\|js\|tsx\|jsx\)$'

set_exclude() {
    EXCLUDE=${1:-$EXCLUDE}
}

copy_statics() {
    local source_dir=$1
    local target_dir=$2
    echo "[BASH] Run with pattern '$EXCLUDE'"

    find "$source_dir" -type f ! -regex $EXCLUDE | while read -r file; do
        dest="${file/#$source_dir/$target_dir}"
        mkdir -p $(dirname "$dest")

        cp "$file" "$dest"
        echo "Updated $file"
    done
}

watch_files() {
    local source_dir=$1
    local target_dir=$2
    declare -A files_hash
    echo "[BASH] Run with pattern '$EXCLUDE'"

    while true; do
        for file in $(find "$source_dir" -type f ! -regex $EXCLUDE); do
            hash_=$(sha256sum "$file" | cut -d' ' -f1)
            if [[ "${files_hash[$file]}" != "$hash_" ]]; then
                files_hash[$file]=$hash_
                dest="${file/#$source_dir/$target_dir}"
                mkdir -p $(dirname "$dest")
                cp "$file" "$dest"
                echo "Updated $file"
            fi
        done
    done
}

set_exclude
