web: gunicorn wsgi:app
worker: celery -A app.celery worker -l info --without-gossip --without-mingle --without-heartbeat -Ofair --pool=solo
