from datetime import datetime, timedelta
from enum import Enum
import getopt
import re
import sys
import requests
import json
import logging
from bs4 import BeautifulSoup

try:
    from line_chatbot import chatbot
except:
    print("Unable to import chatbot, did you set LINE token and channel secret correctly?")

class PersonalState():
    def __init__(self, id, rem, bor, req, ava) -> None:
        self.id = id
        self.remaining = rem
        self.borrow = bor
        self.request = req 
        self.available = ava


class RunMode(Enum):
    UNDEF = 0
    QUERY = 1
    EXTEND = 2

class Libtool():
    url_login = "https://ipac.library.taichung.gov.tw/webpac/login_iframe.cfm"
    url_logout = "https://ipac.library.taichung.gov.tw/webpac/ajax_page/doLogout.cfm"
    url_borrow = "https://ipac.library.taichung.gov.tw/webpac/shelf_borrow.cfm"
    url_search = "https://ipac.library.taichung.gov.tw/webpac/search.cfm"
    url_request = "https://ipac.library.taichung.gov.tw/webpac/shelf_request.cfm"
    url_available = "https://ipac.library.taichung.gov.tw/webpac/shelf_requset_desirable.cfm"
    url_set_book = "https://ipac.library.taichung.gov.tw/webpac/set_book_status.cfm"

    pat_token = re.compile(
        r'<input\s+name="token"\s+value="([0-9A-F]*)"\s+type="hidden"\s+>')
    pat_captcha = re.compile(
        r'<input\s+type="hidden"\s+name="hidcaptcha"\s+id="hidcaptcha"\s+value="(.*)">')

    def __init__(self) -> None:
        self.bLogin = False
        self.sess = None
        self.borrow_books = []
        self.request_books = []
        self.available_books = []
        self.overdue_books = []
        self.due_books = []

    def run(self, acc, pwd) -> bool:
        try:
            self.login(acc, pwd)
            self.borrow_books = self.peek_borrow()
            self.request_books = self.peek_request()
            self.available_books = self.peek_available()
            self.overdue_books = self.get_overdue()
            self.due_books = self.get_due()
        except Exception as e:
            logging.debug(str(e))
            return False

        return True

    def login(self, acc, pwd) -> None:
        """Login"""
        self.sess = requests.Session()
        r = self.sess.get(Libtool.url_login,
                          headers=self.sess.headers, cookies=self.sess.cookies)

        data = {
            'PostBack': 'true',
            'token': re.search(Libtool.pat_token, r.text).group(1),
            'cardtype': '2',
            'hidid': acc,
            'password': pwd,
            'code': '',
            'hidcaptcha': re.search(Libtool.pat_captcha, r.text).group(1)
        }

        r = self.sess.post("https://ipac.library.taichung.gov.tw/webpac/login_iframe.cfm",
                data=data, headers=self.sess.headers, cookies=self.sess.cookies, allow_redirects=True)

        """Check login status"""
        r = requests.get('https://ipac.library.taichung.gov.tw/webpac/search.cfm',
                        headers=self.sess.headers, cookies=self.sess.cookies)
        m = re.search(re.compile(
            r'class="loginBtn".*(title="(.*)")>', re.MULTILINE), r.text)
        assert m.group(2) == "登出"  # Check if login successfully.
        self.bLogin = True

    def logout(self) -> None:
        requests.get(Libtool.url_logout,
                     headers=self.sess.headers, cookies=self.sess.cookies)
        self.bLogin = False


    def peek_borrow(self) -> list():
        if not self.bLogin:
            raise Exception("Not login")
            
        """Get borrow books"""
        r = self.sess.get(Libtool.url_borrow, headers=self.sess.headers, cookies=self.sess.cookies)
        soup = BeautifulSoup(r.text, 'html.parser')
        listbox = soup.find_all('div', class_='list_box')
        data = []
        for lb in listbox:
            info = lb.find_all('p', class_='info_long')
            """
            info[0]: book id
            info[2]: people who are waiting
            info[3]: how many times we extend
            info[5]: date to return books
            """
            book = {'book_id': info[0].text.split('：')[1], 'name': lb.find_all('a', class_='bookname')[0].text, 'reservation': info[2].text.split(
                '：')[1], 'renew': info[3].text.split('：')[1], 'due': info[5].text.split('：')[1].strip()}
            data.append(book)

        return sorted(data, key=lambda k: k['due'])

    def peek_request(self) -> list():
        if not self.bLogin:
            raise Exception("Not login")

        """Get request books"""
        r = self.sess.get(Libtool.url_request, headers=self.sess.headers, cookies=self.sess.cookies)
        soup = BeautifulSoup(r.text, 'html.parser')
        listbox = soup.find_all('div', class_='list_box')
        data = []
        for lb in listbox:
            info = lb.find_all('div', class_='info_long')
            book = {'name': lb.find_all('a', class_='bookname')[0].text, 'date': info[4].text.split(
                '：')[1], 'queue': info[5].text.split('：')[1].rstrip()}
            data.append(book)

        return sorted(data, key=lambda k: k['queue'])

    def peek_available(self) -> list():
        if not self.bLogin:
            raise Exception("Not login")

        """Get available books"""
        r = self.sess.get(Libtool.url_available, headers=self.sess.headers, cookies=self.sess.cookies)
        soup = BeautifulSoup(r.text, 'html.parser')
        listbox = soup.find_all('div', class_='list_box')
        data = []
        for lb in listbox:
            info = lb.find_all('p')
            book = {'name': lb.find_all('div', class_='info_long')[
                0].text, 'due': info[5].text.split('：')[1]}
            data.append(book)

        return sorted(data, key=lambda k: k['due'])

    def peek_remaining(self) -> int:
        if not self.bLogin:
            raise Exception("Not login")

        r = self.sess.get(Libtool.url_request,
                          headers=self.sess.headers, cookies=self.sess.cookies)
        soup = BeautifulSoup(r.text, 'html.parser')
        p = soup.select('#menu > div.menu_box > div.menu_items_content > ul > li:nth-child(1) > div > div > p:nth-child(2) > span')
        return 6 - int(p[0].text.strip('()'))

    def get_overdue(self) -> list():
        if len(self.borrow_books) == 0:
            return []

        data = []
        for book in self.borrow_books:
            if datetime.strptime(book['due'], "%Y/%m/%d").date() < datetime.today().date():
                data.append(book)

        return data

    def get_due(self) -> list():
        if len(self.borrow_books) == 0:
            return []

        today = datetime.today().date()
        margin = timedelta(days=7)
        data = []
        for book in self.borrow_books:
            if today <= datetime.strptime(book['due'], "%Y/%m/%d").date() <= today+margin:
                data.append(book)

        return data

    def renew(self) -> bool:
        """
        path: set_book_status.cfm
        parameter:
            item=<book id>
            action=borrow_extend
        example:
            URL = https://ipac.library.taichung.gov.tw/webpac/set_book_status.cfm?item=31350003144138&action=borrow_extend
        """
        raise Exception("Need to get book ID first.")
        self.login(acc, pwd)
        return True

    def extend(self, book_id) -> bool:
        """
        path: set_book_status.cfm
        parameter:
            item=<book id>
            action=borrow_extend
        example:
            URL = https://ipac.library.taichung.gov.tw/webpac/set_book_status.cfm?item=31350003144138&action=borrow_extend
        """

        if not self.bLogin:
            raise Exception("Not login")
        
        url = "{}?item={}&action=borrow_extend".format(Libtool.url_set_book, book_id)
        r = self.sess.get(url, headers=self.sess.headers,
                          cookies=self.sess.cookies)

        return r.status_code == 200 and r.text.find("續借成功") != -1


    @staticmethod
    def pretty_msg_due(source) -> str:
        msg = u'即將到期：\n'
        for k, v in {k: v for k, v in source.items() if v}.items():
            msg += "{}:\n".format(k)
            for b in v:
                # msg += "{} 預約人數:{} 續借次數:{} 到期日:{}\n".format(b['name'][0:15], b['reservation'], b['renew'], b['due'])
                msg += f"{b['name'][0:15]}({b['book_id']}) 預約人數:{b['reservation']} 續借次數:{b['renew']} 到期日:{b['due']}\n"

            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg_overdue(source) -> str:
        msg = u'逾期：\n'
        for k, v in {k: v for k, v in source.items() if v}.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} 預約人數:{} 續借次數:{} 到期日:{}\n".format(
                    b['name'][0:15], b['reservation'], b['renew'], b['due'])

            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg_available(source) -> str:
        msg = u'預約可取：\n'
        for k, v in {k: v for k, v in source.items() if v}.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} {}\n".format(b['name'][0:15], b['due'])

            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg_remaining(source) -> str:
        msg = u'帳號剩餘數量：\n'
        for k, v in source.items():
            msg += "{}:{}\n".format(k, v)

        return msg

    @staticmethod
    def pretty_msg_borrow(source) -> str:
        msg = u'已借書籍：\n'
        for k, v in {k: v for k, v in source.items() if v}.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} 預約人數:{} 續借次數:{} 到期日:{}\n".format(
                    b['name'][0:15], b['reservation'], b['renew'], b['due'])

            msg += "-------------\n\n"

        return msg


    @staticmethod
    def pretty_msg(available=None, due=None, overdue=None, remaining=None, borrow=None) -> str:
        msg = ""
        if available:
            msg += Libtool.pretty_msg_available(available)

        if due:
            msg += Libtool.pretty_msg_due(due)

        if overdue:
            msg += Libtool.pretty_msg_overdue(overdue)

        if remaining:
            msg += Libtool.pretty_msg_remaining(remaining)

        if borrow:
            msg += Libtool.pretty_msg_borrow(borrow)

        return msg

if __name__ == "__main__":

    logging.basicConfig(filename='debug.log',
                        encoding='utf-8', level=logging.ERROR)

    mode = RunMode.UNDEF
    usr = ""
    pwd = ""
    bid = ""

    try:
        """
          Parameters:
           -q => Query book status
           -e => Extend book
           -u <user> => User account
           -p <password> => Password
           -b <book ID> => Book ID
        """
        opts, args = getopt.getopt(sys.argv[1:], "qeu:p:b:")
    except getopt.GetoptError:
        print(sys.argv[0], 'usage: -q or -e -u <user> -p <pwd> -b <bid>')
        sys.exit(2)

    for opt, arg in opts:
        if opt == "-q":
            mode = RunMode.QUERY
        elif opt == "-e":
            mode = RunMode.EXTEND
        elif opt == "-u":
            usr = arg
        elif opt == "-p":
            pwd = arg
        elif opt == "-b":
            bid = arg
        else:
            assert False, "unhandled option"

    if mode == RunMode.UNDEF:
        raise ValueError("Unknown behavior.")

    if mode == RunMode.QUERY:
        ab = {}
        data = {}

        with open("credential.json") as f:
            credential = json.load(f)

            obj = Libtool()
            for c in credential["cred"]:
                obj.run(c['account'], c['password'])
                ab[c['account']] = obj.available_books

            del obj

            ab, ob, db, rem = {}, {}, {}, {}
            obj = Libtool()
            for c in credential["cred"]:
                obj.run(c['account'], c['password'])
                ab[c['account']] = obj.available_books
                ob[c['account']] = obj.overdue_books
                db[c['account']] = obj.due_books
                rem[c['account']] = obj.peek_remaining()

            msg_ab = Libtool.pretty_msg(available=ab)
            msg_db = Libtool.pretty_msg(due=db)
            msg_ob = Libtool.pretty_msg(overdue=ob)
            msg_rem = Libtool.pretty_msg(remaining=rem)

            print(msg_ab)
            print(msg_db)
            print(msg_ob)
            print(msg_rem)

            try:
                cb = chatbot()
                cb.brocast(msg_ab)
                cb.brocast(msg_db)
                cb.brocast(msg_ob)
                cb.brocast(msg_rem)
            except Exception as e:
                print(str(e))
                print("Unable to send data to Line chatbot, did you set SECRET and TOKEN correctly?")

        with open("result.txt", "w", encoding='utf-8') as f:
            f.write("Available\n=================\n")
            for k, v  in ab.items():
                f.write(k+"\n")
                for b in v:
                    f.write("{} {}\n".format(b['name'][0:15], b['due']))

                f.write("\n")
    elif mode == RunMode.EXTEND:
        if usr == "" or pwd == "" or bid == "":
            raise ValueError("Need account/password/bookID")

        """
        Test to extend books
        """
        obj = Libtool()
        obj.login(usr, pwd)
        r = obj.extend(bid)
        if not r:
            print(f"Fail to extend book:{bid}")
        obj.logout()