from app import celery, utils

# 定義工作函數
@celery.task(name='fetch')
def fetch():
    utils.do_fetch_books()
    return True
