export $(cat .env | xargs);
docker run -p 3306:3306 \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    -v fv1-db:/var/lib/mysql \
    mysql:8.0.31 \
    --innodb-buffer-pool-size=5M \
    --innodb-log-buffer-size=256K \
    --key-buffer-size=8 \
    --thread-cache-size=0 \
    --host-cache-size=0 \
    --innodb-ft-cache-size=1600000 \
    --innodb-ft-total-cache-size=32000000 \
    --performance-schema=off \
    --thread-stack=131072 \
    --sort-buffer-size=32K \
    --read-buffer-size=8200 \
    --read-rnd-buffer-size=8200 \
    --max-heap-table-size=16K \
    --tmp-table-size=1K \
    --bulk-insert-buffer-size=0 \
    --join-buffer-size=128 \
    --net-buffer-length=1K \
    --innodb-sort-buffer-size=64K \
    --binlog-cache-size=4K \
    --binlog-stmt-cache-size=4K
