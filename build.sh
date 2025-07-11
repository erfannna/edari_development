#!/usr/bin/env bash
set -o errexit

export DJANGO_SUPERUSER_PASSWORD="1111"

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

python manage.py createsuperuser --id_number=1111 --phone_number=1111 --noinput

unset DJANGO_SUPERUSER_PASSWORD