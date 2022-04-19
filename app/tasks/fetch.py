from app import celery, utils

# 定義工作函數
@celery.task(name='fetch')
def fetch():
    utils.do_fetch_books()
    return True


@celery.task(name='show_borrow')
def show_borrow():
    utils.do_show_borrow()
    return True
