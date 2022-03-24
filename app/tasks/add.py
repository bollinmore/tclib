from app import celery

# 定義工作函數
@celery.task(name='add')
def add(x, y):
    return x + y


@celery.task(name='multiply')
def multiply(x, y):
    return x * y

