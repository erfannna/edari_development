#!/usr/bin/env bash
set -o errexit

export DJANGO_SUPERUSER_USERNAME="test"
export DJANGO_SUPERUSER_EMAIL="your_email@example.com"
export DJANGO_SUPERUSER_PASSWORD="test"

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

python manage.py createsuperuser --no-input
unset DJANGO_SUPERUSER_USERNAME
unset DJANGO_SUPERUSER_EMAIL
unset DJANGO_SUPERUSER_PASSWORD