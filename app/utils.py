import os
from app.line_chatbot import chatbot
from app.tclib import Libtool
from . import db

class ModelMixin(object):

    def save(self):
        # Save this model to the database.
        db.session.add(self)
        db.session.commit()
        return self

# Add your own utility classes and functions here.
def do_fetch_books():
    ab, ob, db, rem = {}, {}, {}, {}

    acc = os.environ.get('TCLIB_ACCOUNT').split(";")
    pwd = os.environ.get('TCLIB_PASSWORD').split(";")
    token = os.environ.get('LINE_TOKEN')
    secret = os.environ.get('LINE_SECRET')

    obj = Libtool()
    for ix in range(0, len(acc)):
        obj.run(acc[ix], pwd[ix])
        ab[acc[ix]] = obj.available_books
        ob[acc[ix]] = obj.overdue_books
        db[acc[ix]] = obj.due_books
        rem[acc[ix]] = obj.peek_remaining()

    msg_ab = Libtool.pretty_msg(available=ab)
    msg_db = Libtool.pretty_msg(due=db)
    msg_ob = Libtool.pretty_msg(overdue=ob)
    msg_rem = Libtool.pretty_msg(remaining=rem)

    cb = chatbot(token, secret)

    cb.brocast(msg_ab)
    cb.brocast(msg_db)
    cb.brocast(msg_ob)
    cb.brocast(msg_rem)
    del cb

    # cf = os.path.join(os.getcwd(), "credential.json")
    # with open(cf) as f:
    #     cred = json.load(f)

    #     obj = Libtool()
    #     for c in cred["cred"]:
    #         obj.run(c['account'], c['password'])
    #         ab[c['account']] = obj.available_books
    #         bb[c['account']] = obj.borrow_books
    #     del obj

    #     msg_ab = Libtool.pretty_msg(available=ab)
    #     msg_bb = Libtool.pretty_msg(borrow=bb)

    #     cb = chatbot(cred["line_chatbot"]["token"],
    #                  cred["line_chatbot"]["secret"])

    #     cb.brocast(msg_ab)
    #     cb.brocast(msg_bb)
    #     del cb
