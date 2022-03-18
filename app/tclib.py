from datetime import datetime, timedelta
import re
import requests
import json
import logging
from bs4 import BeautifulSoup

class PersonalState():
    def __init__(self, id, rem, bor, req, ava) -> None:
        self.id = id
        self.remaining = rem
        self.borrow = bor
        self.request = req 
        self.available = ava

class Libtool():
    url_login = "https://ipac.library.taichung.gov.tw/webpac/login_iframe.cfm"
    url_logout = "https://ipac.library.taichung.gov.tw/webpac/ajax_page/doLogout.cfm"
    url_borrow = "https://ipac.library.taichung.gov.tw/webpac/shelf_borrow.cfm"
    url_search = "https://ipac.library.taichung.gov.tw/webpac/search.cfm"
    url_request = "https://ipac.library.taichung.gov.tw/webpac/shelf_request.cfm"
    url_available = "https://ipac.library.taichung.gov.tw/webpac/shelf_requset_desirable.cfm"

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
            book = {'name': lb.find_all('a', class_='bookname')[0].text, 'reservation': info[2].text.split(
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


    @staticmethod
    def pretty_msg_due(source) -> str:
        msg = u'即將到期：\n'
        for k, v in source.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} 預約人數:{} 續借次數:{} 到期日:{}\n".format(b['name'][0:15], b['reservation'], b['renew'], b['due'])
            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg_overdue(source) -> str:
        msg = u'逾期：\n'
        for k, v in source.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} 預約人數:{} 續借次數:{} 到期日:{}\n".format(
                    b['name'][0:15], b['reservation'], b['renew'], b['due'])
            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg_available(source) -> str:
        msg = u'預約可取：\n'
        for k, v in source.items():
            msg += "{}:\n".format(k)
            for b in v:
                msg += "{} {}\n".format(b['name'][0:15], b['due'])
            msg += "-------------\n\n"

        return msg

    @staticmethod
    def pretty_msg(available=None, due=None, overdue=None) -> str:
        msg = ""
        if available:
            msg += Libtool.pretty_msg_available(available)

        if due:
            msg += Libtool.pretty_msg_due(due)

        if overdue:
            msg += Libtool.pretty_msg_overdue(overdue)

        return msg

if __name__ == "__main__":

    logging.basicConfig(filename='debug.log',
                        encoding='utf-8', level=logging.ERROR)

    ab = {}
    data = {}

    with open("credential.json") as f:
        credential = json.load(f)

        obj = Libtool()
        for c in credential["cred"]:
            obj.run(c['account'], c['password'])
            ab[c['account']] = obj.available_books

        del obj


    with open("result.txt", "w", encoding='utf-8') as f:
        f.write("Available\n=================\n")
        for k, v  in ab.items():
            f.write(k+"\n")
            for b in v:
                f.write("{} {}\n".format(b['name'][0:15], b['due']))

            f.write("\n")