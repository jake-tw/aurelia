#!/usr/bin/env bash
# 在遠端測試機器上執行：檢查 Docker、拉取映像、啟動 toolbox（host network）。
set -euo pipefail
cd "$(dirname "$0")"

set -a; source .env; set +a

command -v docker >/dev/null || { echo "需要安裝 Docker" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "需要 Docker Compose v2 (docker compose)" >&2; exit 1; }

echo "==> 連線檢查（TCP）"
check() { # name host port
  if (exec 3<>"/dev/tcp/$2/$3") 2>/dev/null; then echo "  OK   $1 $2:$3"; else echo "  FAIL $1 $2:$3" >&2; fi
}
check mysql "$MYSQL_HOST" "$MYSQL_PORT"
for v in ${!REDIS_ADDR_@}; do
  addr="${!v}"
  check "redis($v)" "${addr%%:*}" "${addr##*:}"
done

echo "==> 啟動 toolbox v${TOOLBOX_VERSION}"
docker compose pull
docker compose up -d --force-recreate
sleep 2
docker compose ps
docker compose logs --tail=15 toolbox

echo "==> 完成。服務監聽 ${TOOLBOX_ADDRESS}:${TOOLBOX_PORT}"
