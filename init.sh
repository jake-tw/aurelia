#!/bin/bash
# Aurelia 專案初始化腳本
# 依序執行所有初始化腳本

set -e

# 取得專案根目錄
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

# 依序執行所有以數字開頭的初始化腳本
for script in "$SCRIPT_DIR"/[0-9][0-9]-*.sh; do
  if [ -f "$script" ]; then
    echo "執行: $(basename "$script")"
    bash "$script"
    echo ""
  fi
done

echo "✓ 初始化完成"

