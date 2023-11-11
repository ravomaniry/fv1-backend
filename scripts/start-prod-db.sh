export $(cat .env | xargs);
docker run -p 3306:3306 \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    -v fv1-db:/var/lib/mysql \
    mysql:8.0.31
