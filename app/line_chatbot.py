import logging
import os

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import TextSendMessage, MessageEvent, TextMessage, ButtonsTemplate, URIAction, TemplateSendMessage
from flask import abort, request

line_bot_api = LineBotApi(os.environ.get('LINE_TOKEN'))
handler = WebhookHandler(os.environ.get('LINE_SECRET'))

class chatbot():

    def __init__(self, token, secret) -> None:
        self.line_bot_api = LineBotApi(token)
        self.handler = WebhookHandler(secret)

    def send(self, uid, msg) -> bool:
        try:
            self.line_bot_api.push_message(
                uid, [
                    TextSendMessage(text=msg),
                ]
            )
        except Exception as e:
            logging.debug(str(e))

    def brocast(self, msg) -> bool:
        try:
            self.line_bot_api.broadcast([
                TextSendMessage(text=msg),
            ]
            )
        except Exception as e:
            logging.debug(str(e))
            return False

        return True

def callback_handler(body, signature):
    try:
        handler.handle(body, signature)  # handle webhook body
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)

    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    text = event.message.text

    if text == '/refresh':
        from app.tasks.fetch import fetch
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text="Scanning"))
        fetch.delay()
    elif text == '/show_borrow':
        from app.tasks.fetch import fetch
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text="Scanning"))
        fetch.delay()
    elif text == '/card':
        url = "{}/barcode".format(request.root_url)
        buttons_template = ButtonsTemplate(
            title='行動借閱證', text='...', actions=[
                URIAction(label=u'陳文昇', uri='{}/L123728869'.format(url)),
                URIAction(label=u'林佳嬅', uri='{}/M222033097'.format(url)),
                URIAction(label=u'陳祈安', uri='{}/F132168386'.format(url)),
                URIAction(label=u'陳怡安', uri='{}/F231624332'.format(url)),
                # URIAction(label=u'家庭卡', uri='{}/BC275509'.format(url)),
                # PostbackAction(label='ping', data='ping'),
                # PostbackAction(label='ping with text', data='ping', text='ping'),
                # MessageAction(label='Translate Rice', text='米')
            ])
        template_message = TemplateSendMessage(
            alt_text='Buttons alt text', template=buttons_template)
        line_bot_api.reply_message(event.reply_token, template_message)
    else:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text=event.message.text))
        
